"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { AuthPanel } from "@/components/auth/AuthPanel";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { broadcastAuthSessionChange } from "@/lib/auth/session-sync";
import { scopePostAuthPath } from "@/lib/client/tenant-path-prefix-client";

type EnterpriseTeamInviteSignInFormProps = {
  joinPath: string;
  enterpriseName: string;
  inviteeEmail: string;
};

/**
 * Credentials sign-in for invitees who already have an advisor password.
 * Stays on /enterprise/join so they never bounce through the generic SignInHub.
 */
export function EnterpriseTeamInviteSignInForm({
  joinPath,
  enterpriseName,
  inviteeEmail,
}: EnterpriseTeamInviteSignInFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const signInResult = await signIn("credentials", {
        email: inviteeEmail,
        password,
        redirect: false,
      });

      if (signInResult?.error || signInResult?.ok === false) {
        setError("Invalid password. Try again or reset your password.");
        setIsLoading(false);
        return;
      }

      broadcastAuthSessionChange();
      router.push(joinPath);
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <AuthPanel
      eyebrow="Team invitation"
      title={`Join ${enterpriseName}`}
      description="Sign in with the invited email to accept this invitation."
      footer={
        <p className="text-sm text-muted-foreground">
          Forgot your password?{" "}
          <Link
            href={scopePostAuthPath(
              `/forgot-password?email=${encodeURIComponent(inviteeEmail)}`
            )}
            className="font-semibold text-foreground hover:underline"
          >
            Reset it
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="enterprise-invite-signin-email">Work email</Label>
          <Input
            id="enterprise-invite-signin-email"
            type="email"
            value={inviteeEmail}
            readOnly
            disabled
            className="bg-muted/40"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="enterprise-invite-signin-password">Password</Label>
          <PasswordInput
            id="enterprise-invite-signin-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
            autoFocus
          />
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in…" : "Sign in and continue"}
        </Button>
      </form>
    </AuthPanel>
  );
}
