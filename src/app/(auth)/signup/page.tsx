"use client";

import { useState, FormEvent, Suspense, useEffect } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { safeAfterSignInPath } from "@/lib/auth-callback-path";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite") ?? "";
  const defaultAfterAuth = inviteToken ? "/intake" : "/dashboard";
  const callbackUrl = safeAfterSignInPath(
    searchParams.get("callbackUrl"),
    defaultAfterAuth,
  );
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [advisorName, setAdvisorName] = useState<string | null>(null);

  useEffect(() => {
    if (!inviteToken) router.replace("/start");
  }, [inviteToken, router]);

  // Prefill data from invite code lookup when token is present (runs once on load)
  useEffect(() => {
    if (!inviteToken) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/invite/prefill?token=${encodeURIComponent(inviteToken)}`);
        const data = await res.json();
        if (!cancelled) {
          if (data.prefillEmail) setEmail(String(data.prefillEmail));
          if (data.clientName) {
            // Parse clientName into firstName and lastName
            const nameParts = String(data.clientName).trim().split(/\s+/);
            if (nameParts.length >= 2) {
              setFirstName(nameParts[0]);
              setLastName(nameParts.slice(1).join(" "));
            } else if (nameParts.length === 1) {
              setFirstName(nameParts[0]);
            }
          }
          if (data.advisorName) setAdvisorName(String(data.advisorName));
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [inviteToken]);

  // Track OPENED status when invitation link is opened (runs once on load)
  useEffect(() => {
    if (!inviteToken) return;
    let cancelled = false;
    (async () => {
      try {
        // Decode the invite token to extract the inviteCodeId (first segment before the dot)
        const parts = inviteToken.split(".");
        if (parts.length >= 3) {
          const inviteCodeId = parts[0];
          // POST to track that invitation was opened (fire and forget)
          await fetch(`/api/invitations/${inviteCodeId}/opened`, {
            method: "POST",
          });
        }
      } catch {
        // ignore - this is fire and forget tracking
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [inviteToken]);

  if (!inviteToken) {
    return (
      <AuthPanel title="Create account" description="Redirecting to enter your invite code…">
        <p className="text-sm text-muted-foreground">If you are not redirected, <Link href="/start" className="font-semibold underline">go to enter your invite code</Link>.</p>
      </AuthPanel>
    );
  }

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
      // Register user (invite token required by API)
      const name = `${firstName} ${lastName}`.trim();
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          inviteToken,
          name: name || undefined,
        }),
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

      if (result?.error || result?.ok === false) {
        setError("Account created but sign in failed. Please try signing in.");
        setIsLoading(false);
        return;
      }

      window.location.assign(callbackUrl);
    } catch (err) {
      console.error("Sign up error:", err);
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const formDescription = advisorName
    ? `Your advisor ${advisorName} has invited you to complete a family governance assessment.`
    : "Set up a client account for governance assessments, recommendations, and account controls. This form creates user accounts only; advisors and admins are set up separately.";

  return (
    <AuthPanel
      eyebrow="Secure Onboarding"
      title="Create account"
      description={formDescription}
      footer={
        <span>
          Looking for an advisor?{" "}
          <Link
            href="/request-review"
            className="font-semibold text-foreground hover:underline"
          >
            Request a review here
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              autoComplete="given-name"
              placeholder="First name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              autoComplete="family-name"
              placeholder="Last name"
            />
          </div>
        </div>

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
