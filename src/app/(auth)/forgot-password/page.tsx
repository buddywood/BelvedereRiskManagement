"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      await fetch("/api/auth/forgot-password", {
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
      <AuthPanel
        eyebrow="Password Recovery"
        title="Check your email"
        description="If an account exists with that email, we have sent a reset link. Check your inbox and follow the instructions."
        footer={
          <Link href="/signin" className="font-semibold text-foreground hover:underline">
            Return to sign in
          </Link>
        }
      >
        <Alert variant="info">
          <AlertDescription>
            The reset link expires in 15 minutes. If you do not see the email,
            check your spam folder or request another link.
          </AlertDescription>
        </Alert>
      </AuthPanel>
    );
  }

  return (
    <AuthPanel
      eyebrow="Password Recovery"
      title="Forgot password"
      description="Enter the email address associated with your account and we will send a secure reset link."
      footer={
        <Link href="/signin" className="font-semibold text-foreground hover:underline">
          Return to sign in
        </Link>
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

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>
    </AuthPanel>
  );
}
