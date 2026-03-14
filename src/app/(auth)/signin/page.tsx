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

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setIsLoading(false);
        return;
      }

      // Temporary auth logging while the sign-in flow is being validated.
      const redirectTo = callbackUrl || "/dashboard";
      console.info("Sign in successful", { email, callbackUrl: redirectTo });

      // Redirect to callback URL or dashboard
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      console.error("Sign in error:", err);
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <AuthPanel
      eyebrow="Client Access"
      title="Sign in"
      description="Continue your assessment workspace with a streamlined, security-conscious sign-in flow."
      footer={
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Don&apos;t have an account?{" "}
            <Link
              href={callbackUrl ? `/signup?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/signup"}
              className="font-semibold text-foreground hover:underline"
            >
              Sign up
            </Link>
          </span>
          <Link
            href={
              callbackUrl
                ? `/forgot-password?callbackUrl=${encodeURIComponent(callbackUrl)}`
                : "/forgot-password"
            }
            className="font-semibold text-foreground hover:underline"
          >
            Forgot password?
          </Link>
        </div>
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

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="Enter your password"
          />
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </AuthPanel>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">Loading sign-in experience...</div>}>
      <SignInForm />
    </Suspense>
  );
}
