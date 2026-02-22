import { TOTP } from "@otplib/totp";
import { NobleCryptoPlugin } from "@otplib/plugin-crypto-noble";
import { ScureBase32Plugin } from "@otplib/plugin-base32-scure";
import { toDataURL } from "qrcode";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/encryption";

// Initialize TOTP with Noble crypto and Scure Base32 plugins
const totp = new TOTP({
  crypto: new NobleCryptoPlugin(),
  base32: new ScureBase32Plugin(),
  issuer: "Belvedere",
  digits: 6,
  period: 30,
  algorithm: "sha1",
});

/**
 * Enroll user in MFA by generating TOTP secret and QR code
 * Does NOT enable MFA yet - user must verify TOTP first
 */
export async function enrollMFA(userId: string) {
  // Generate TOTP secret using built-in method
  const secret = totp.generateSecret();

  // Encrypt secret before storing
  const encryptedSecret = encrypt(secret);

  // Get user email for QR code label
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Store encrypted secret (but don't enable MFA yet)
  await prisma.user.update({
    where: { id: userId },
    data: { mfaSecret: encryptedSecret },
  });

  // Generate otpauth URI using built-in method
  const otpauthUrl = totp.toURI({
    secret,
    label: user.email,
    issuer: "Belvedere",
  });

  // Generate QR code data URL
  const qrCodeUrl = await toDataURL(otpauthUrl);

  return {
    qrCodeUrl,
    secret, // Return plaintext for manual entry
  };
}

/**
 * Verify TOTP token against user's MFA secret
 * Allows 1 time-step window (30s drift)
 */
export async function verifyMFAToken(
  userId: string,
  token: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { mfaSecret: true },
  });

  if (!user?.mfaSecret) {
    return false;
  }

  // Decrypt secret
  const secret = decrypt(user.mfaSecret);

  // Verify token with 30-second tolerance window
  try {
    const result = await totp.verify(token, {
      secret,
      epochTolerance: 30,
    });
    return result.valid;
  } catch (error) {
    console.error("TOTP verification error:", error);
    return false;
  }
}

/**
 * Enable MFA after verifying TOTP token
 * Generates recovery codes and returns them
 */
export async function enableMFA(userId: string, token: string) {
  // Verify token first
  const isValid = await verifyMFAToken(userId, token);

  if (!isValid) {
    throw new Error("Invalid TOTP token");
  }

  // Generate 10 recovery codes (8-char hex)
  const recoveryCodes: string[] = [];
  const hashedCodes: string[] = [];

  for (let i = 0; i < 10; i++) {
    const code = crypto.randomBytes(4).toString("hex");
    recoveryCodes.push(code);

    // Hash with SHA-256 before storing
    const hash = crypto.createHash("sha256").update(code).digest("hex");
    hashedCodes.push(hash);
  }

  // Enable MFA and store hashed recovery codes
  await prisma.user.update({
    where: { id: userId },
    data: {
      mfaEnabled: true,
      mfaRecoveryCodes: hashedCodes,
    },
  });

  // Return plaintext codes (shown ONCE to user)
  return recoveryCodes;
}

/**
 * Verify and consume a recovery code
 * Recovery codes are single-use
 */
export async function verifyRecoveryCode(
  userId: string,
  code: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { mfaRecoveryCodes: true },
  });

  if (!user?.mfaRecoveryCodes) {
    return false;
  }

  // Hash provided code
  const hash = crypto.createHash("sha256").update(code).digest("hex");

  // Check if hash exists in recovery codes array
  const codes = user.mfaRecoveryCodes as string[];
  const index = codes.indexOf(hash);

  if (index === -1) {
    return false;
  }

  // Remove used code (single-use)
  const updatedCodes = codes.filter((_, i) => i !== index);

  await prisma.user.update({
    where: { id: userId },
    data: { mfaRecoveryCodes: updatedCodes },
  });

  return true;
}
