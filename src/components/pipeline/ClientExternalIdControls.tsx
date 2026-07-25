"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { updateAdvisorExternalClientId } from "@/lib/actions/advisor-external-client-id-actions";
import { EXTERNAL_CLIENT_ID_MAX_LENGTH } from "@/lib/advisor/external-client-id";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SIDEBAR_ACTION_BTN_CENTER } from "@/components/pipeline/sidebar-action-button";

interface ClientExternalIdControlsProps {
  clientId: string;
  externalClientId: string | null;
}

type FeedbackMessage =
  | { kind: "ok"; title: string }
  | { kind: "err"; title: string };

function Feedback({ message }: { message: FeedbackMessage }) {
  const isOk = message.kind === "ok";
  return (
    <div
      role="status"
      className={
        isOk
          ? "rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-900 dark:text-emerald-100"
          : "rounded-lg border border-destructive/35 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
      }
    >
      <div className="flex gap-2">
        {isOk ? (
          <CheckCircle2
            className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
            aria-hidden
          />
        ) : (
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        )}
        <p className="font-medium leading-snug">{message.title}</p>
      </div>
    </div>
  );
}

/**
 * Advisor CRM / external client ID editor on the client detail sidebar.
 * Distinct from the system Client reference (CL-XXXX-XXXX).
 */
export function ClientExternalIdControls({
  clientId,
  externalClientId,
}: ClientExternalIdControlsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState(externalClientId ?? "");
  const [message, setMessage] = useState<FeedbackMessage | null>(null);

  useEffect(() => {
    setDraft(externalClientId ?? "");
  }, [externalClientId]);

  function submit() {
    setMessage(null);
    const next = draft.trim();
    const current = (externalClientId ?? "").trim();
    if (next === current) {
      setMessage({ kind: "ok", title: "Client ID unchanged." });
      return;
    }
    startTransition(async () => {
      const result = await updateAdvisorExternalClientId({
        clientId,
        externalClientId: next.length > 0 ? next : null,
      });
      if (result.success) {
        setDraft(result.data.externalClientId ?? "");
        setMessage({
          kind: "ok",
          title: result.data.externalClientId
            ? "Client ID saved."
            : "Client ID cleared.",
        });
        router.refresh();
      } else {
        setMessage({ kind: "err", title: result.error });
      }
    });
  }

  return (
    <Card data-tour="pipeline-external-client-id">
      <CardHeader className="px-4 sm:px-5">
        <CardTitle>Your client ID</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 sm:px-5">
        <p className="text-xs leading-5 text-muted-foreground">
          Optional CRM or account ID for your records. Separate from the system
          client reference shown in the header.
        </p>
        <div className="space-y-2">
          <Label htmlFor="external-client-id">Client ID</Label>
          <Input
            id="external-client-id"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. ACME-1042"
            maxLength={EXTERNAL_CLIENT_ID_MAX_LENGTH}
            disabled={pending}
            autoComplete="off"
          />
        </div>
        {message ? <Feedback message={message} /> : null}
        <Button
          type="button"
          variant="outline"
          className={SIDEBAR_ACTION_BTN_CENTER}
          disabled={pending}
          onClick={submit}
        >
          {pending ? "Saving…" : "Save client ID"}
        </Button>
      </CardContent>
    </Card>
  );
}
