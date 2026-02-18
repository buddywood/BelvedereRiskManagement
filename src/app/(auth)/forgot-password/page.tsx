"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // Always show success state to prevent email enumeration
      // regardless of API response
      setIsSubmitted(true);
      setIsLoading(false);
    } catch (err) {
      console.error("Forgot password error:", err);
      // Still show success to prevent enumeration
      setIsSubmitted(true);
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8 max-w-md">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Check Your Email
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          If an account exists with that email, we&apos;ve sent a reset link.
          Check your inbox and follow the instructions.
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-6">
          The link will expire in 15 minutes. If you don&apos;t see the email,
          check your spam folder.
        </p>
        <Link
          href="/signin"
          className="inline-block text-sm text-zinc-900 dark:text-zinc-50 font-medium hover:underline"
        >
          Return to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8 max-w-md">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
        Forgot Password
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6">
        Enter your email address and we&apos;ll send you a link to reset your
        password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          {isLoading ? "Sending..." : "Send Reset Link"}
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
