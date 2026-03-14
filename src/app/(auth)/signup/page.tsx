"use client";

import { useState, FormEvent, Suspense } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      // Register user
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to create account");
        setIsLoading(false);
        return;
      }

      // Auto sign in after successful registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created but sign in failed. Please try signing in.");
        setIsLoading(false);
        return;
      }

      console.info("Account created and sign in successful", { email, callbackUrl });

      // Redirect to callback destination after successful account creation
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      console.error("Sign up error:", err);
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <AuthPanel
      eyebrow="Secure Onboarding"
      title="Create account"
      description="Set up a secure workspace for governance assessments, recommendations, and account controls."
      footer={
        <span>
          Already have an account?{" "}
          <Link
            href={callbackUrl ? `/signin?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/signin"}
            className="font-semibold text-foreground hover:underline"
          >
            Sign in
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="name@familyoffice.com"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <PasswordInput
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="Repeat password"
            />
          </div>
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Create Account"}
        </Button>
      </form>
    </AuthPanel>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">Loading sign-up experience...</div>}>
      <SignUpForm />
    </Suspense>
  );
}
