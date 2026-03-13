"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function MFAVerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [useRecovery, setUseRecovery] = useState(false);
  const [token, setToken] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);

  async function handleTOTPSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setVerifying(true);

    try {
      const res = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          action: "login",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      // Redirect to original destination
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  }

  async function handleRecoverySubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setVerifying(true);

    try {
      const res = await fetch("/api/auth/mfa/recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: recoveryCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Recovery code verification failed");
      }

      // Show remaining codes warning if low
      if (data.remainingCodes <= 2) {
        alert(
          `Warning: You have ${data.remainingCodes} recovery code${
            data.remainingCodes === 1 ? "" : "s"
          } remaining. Consider generating new codes in settings.`
        );
      }

      // Redirect to original destination
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-2">Two-Factor Authentication</h1>
        <p className="text-sm text-gray-600 mb-6">
          Enter the code from your authenticator app to continue
        </p>

        {!useRecovery ? (
          <form onSubmit={handleTOTPSubmit}>
            <div className="mb-4">
              <label htmlFor="token" className="block text-sm font-medium mb-2">
                Authentication Code
              </label>
              <input
                type="text"
                id="token"
                value={token}
                onChange={(e) =>
                  setToken(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                maxLength={6}
                required
                autoFocus
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
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 mb-3"
            >
              {verifying ? "Verifying..." : "Verify"}
            </button>

            <button
              type="button"
              onClick={() => setUseRecovery(true)}
              className="w-full text-sm text-gray-600 hover:text-gray-900"
            >
              Use a recovery code instead
            </button>
          </form>
        ) : (
          <form onSubmit={handleRecoverySubmit}>
            <div className="mb-4">
              <label htmlFor="recovery" className="block text-sm font-medium mb-2">
                Recovery Code
              </label>
              <input
                type="text"
                id="recovery"
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value.toLowerCase())}
                placeholder="Enter recovery code"
                required
                autoFocus
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <p className="mt-2 text-xs text-gray-500">
                Recovery codes are single-use and will be consumed after verification
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={verifying || !recoveryCode}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 mb-3"
            >
              {verifying ? "Verifying..." : "Verify Recovery Code"}
            </button>

            <button
              type="button"
              onClick={() => setUseRecovery(false)}
              className="w-full text-sm text-gray-600 hover:text-gray-900"
            >
              Use authenticator app instead
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            Sign out
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function MFAVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      }
    >
      <MFAVerifyForm />
    </Suspense>
  );
}
