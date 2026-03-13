"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function MFASetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [showingCodes, setShowingCodes] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Enroll user on mount
  useEffect(() => {
    async function enroll() {
      try {
        const res = await fetch("/api/auth/mfa/enroll", {
          method: "POST",
        });

        if (!res.ok) {
          throw new Error("Failed to enroll in MFA");
        }

        const data = await res.json();
        setQrCodeUrl(data.qrCodeUrl);
        setSecret(data.secret);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to enroll");
      } finally {
        setLoading(false);
      }
    }

    enroll();
  }, []);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setVerifying(true);

    try {
      const res = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          action: "enable",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to verify TOTP");
      }

      // Show recovery codes
      setRecoveryCodes(data.recoveryCodes);
      setShowingCodes(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  }

  function handleConfirm() {
    setConfirmed(true);
    router.push("/dashboard");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Setting up MFA...</p>
        </div>
      </div>
    );
  }

  if (showingCodes) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Save Your Recovery Codes</h1>

          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 font-semibold mb-2">
              Important: Save these codes in a secure location
            </p>
            <p className="text-sm text-yellow-700">
              Each code can only be used once. You&apos;ll need these if you lose access to your authenticator app.
            </p>
          </div>

          <div className="mb-6 p-4 bg-gray-50 border rounded-lg font-mono text-sm">
            {recoveryCodes.map((code, i) => (
              <div key={i} className="mb-1">
                {code}
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(recoveryCodes.join("\n"));
              alert("Recovery codes copied to clipboard");
            }}
            className="w-full mb-3 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Copy to Clipboard
          </button>

          <button
            onClick={handleConfirm}
            disabled={!confirmed && recoveryCodes.length > 0}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            I&apos;ve Saved My Codes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Set Up Two-Factor Authentication</h1>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.)
          </p>

          {qrCodeUrl && (
            <div className="flex justify-center mb-4">
              <Image
                src={qrCodeUrl}
                alt="MFA QR Code"
                width={200}
                height={200}
                className="border rounded"
              />
            </div>
          )}

          <details className="mb-4">
            <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">
              Can&apos;t scan? Enter manually
            </summary>
            <div className="mt-2 p-3 bg-gray-50 border rounded">
              <p className="text-xs text-gray-500 mb-1">Secret Key:</p>
              <code className="text-sm font-mono break-all">{secret}</code>
            </div>
          </details>
        </div>

        <form onSubmit={handleVerify}>
          <div className="mb-4">
            <label htmlFor="token" className="block text-sm font-medium mb-2">
              Enter 6-digit code from your app
            </label>
            <input
              type="text"
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest font-mono"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={verifying || token.length !== 6}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {verifying ? "Verifying..." : "Verify and Enable MFA"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <a href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
            Cancel and return to dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
