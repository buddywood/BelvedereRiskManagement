"use client";

import { useState, FormEvent, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { submitInviteCode } from "@/lib/actions/invite";
import { cn } from "@/lib/utils";

const BOX_COUNT = 6;

export default function StartAssessmentPage() {
  const router = useRouter();
  const [values, setValues] = useState<string[]>(() => Array(BOX_COUNT).fill(""));
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const code = values.join("").trim();

  const setValueAt = useCallback((index: number, value: string) => {
    const char = value.replace(/[^A-Za-z0-9]/g, "").slice(-1).toUpperCase();
    setValues((prev) => {
      const next = [...prev];
      next[index] = char;
      return next;
    });
    if (char && index < BOX_COUNT - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !values[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [values]
  );

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const chars = e.clipboardData
      .getData("text")
      .replace(/[^A-Za-z0-9]/g, "")
      .toUpperCase()
      .slice(0, BOX_COUNT);
    setValues((prev) => {
      const next = [...prev];
      for (let i = 0; i < chars.length; i++) next[i] = chars[i];
      return next;
    });
    const nextFocus = Math.min(chars.length, BOX_COUNT - 1);
    inputRefs.current[nextFocus]?.focus();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!code) return;
    setIsLoading(true);
    const result = await submitInviteCode(code);
    setIsLoading(false);
    if (result.redirectUrl) {
      router.push(result.redirectUrl);
      return;
    }
    if (result.error) setError(result.error);
  };

  return (
    <AuthPanel
      eyebrow="Governance Assessment"
      title="Enter invite code"
      description="Your advisor has provided a 6-character invite code (letters and numbers) to start the assessment. Enter it below to create your account and begin."
      footer={
        <span>
          Already have an account?{" "}
          <a
            href="/signin"
            className="font-semibold text-foreground hover:underline"
          >
            Sign in
          </a>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <div className="space-y-2">
          <Label id="code-label">6-character invite code</Label>
          <div
            className="flex justify-center gap-2"
            role="group"
            aria-labelledby="code-label"
          >
            {Array.from({ length: BOX_COUNT }, (_, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="text"
                maxLength={1}
                value={values[i]}
                onChange={(e) => setValueAt(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                autoComplete="one-time-code"
                disabled={isLoading}
                className={cn(
                  "size-11 rounded-lg border border-input bg-background text-center text-lg font-mono font-semibold uppercase tracking-wider transition-all duration-200",
                  "focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/20",
                  "focus:bg-gradient-to-br focus:from-brand/15 focus:via-background focus:to-brand/5",
                  "disabled:pointer-events-none disabled:opacity-50"
                )}
                aria-label={`Character ${i + 1} of ${BOX_COUNT}`}
              />
            ))}
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading || !code}>
          {isLoading ? "Checking…" : "Continue to create account"}
        </Button>
      </form>
    </AuthPanel>
  );
}
