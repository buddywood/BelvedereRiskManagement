import crypto from "crypto";

/**
 * AES-256-GCM encryption for sensitive data (e.g., MFA secrets)
 * Returns format: iv:authTag:ciphertext (all hex encoded)
 */
export function encrypt(plaintext: string): string {
  const encryptionKey = process.env.ENCRYPTION_KEY;

  if (!encryptionKey) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }

  // Derive 32-byte key from ENCRYPTION_KEY using scrypt
  const key = crypto.scryptSync(encryptionKey, "salt", 32);

  // Generate random IV (16 bytes for AES)
  const iv = crypto.randomBytes(16);

  // Create cipher with AES-256-GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  // Encrypt plaintext
  let ciphertext = cipher.update(plaintext, "utf8", "hex");
  ciphertext += cipher.final("hex");

  // Get authentication tag
  const authTag = cipher.getAuthTag();

  // Return concatenated: iv:authTag:ciphertext
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${ciphertext}`;
}

/**
 * Decrypt AES-256-GCM encrypted data
 * Expects format: iv:authTag:ciphertext (all hex encoded)
 */
export function decrypt(encrypted: string): string {
  const encryptionKey = process.env.ENCRYPTION_KEY;

  if (!encryptionKey) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }

  // Derive same 32-byte key
  const key = crypto.scryptSync(encryptionKey, "salt", 32);

  // Split the encrypted string
  const parts = encrypted.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted data format");
  }

  const iv = Buffer.from(parts[0], "hex");
  const authTag = Buffer.from(parts[1], "hex");
  const ciphertext = parts[2];

  // Create decipher
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  // Decrypt
  let plaintext = decipher.update(ciphertext, "hex", "utf8");
  plaintext += decipher.final("utf8");

  return plaintext;
}
