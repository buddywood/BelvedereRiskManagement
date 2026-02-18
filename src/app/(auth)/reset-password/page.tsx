"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validate URL parameters
  if (!token || !email) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8 max-w-md">
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
          Invalid Reset Link
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          This password reset link is invalid or incomplete. Please request a
          new reset link.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block text-sm text-zinc-900 dark:text-zinc-50 font-medium hover:underline"
        >
          Request new reset link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to reset password");
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
    } catch (err) {
      console.error("Reset password error:", err);
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8 max-w-md">
        <h1 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">
          Password Reset Successfully
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Your password has been reset. You can now sign in with your new
          password.
        </p>
        <Link
          href="/signin"
          className="inline-block px-6 py-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8 max-w-md">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
        Reset Password
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6">
        Enter your new password below.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
          >
            New Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Must be at least 8 characters with uppercase, lowercase, number, and
            special character
          </p>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
        </div>

        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <Link
          href="/signin"
          className="text-sm text-zinc-900 dark:text-zinc-50 font-medium hover:underline"
        >
          Return to sign in
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
