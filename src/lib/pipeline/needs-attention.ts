import type { ClientWorkflowStage } from "@prisma/client";

import type { PipelineClient } from "./types";
import { isStalled } from "./status";

/**
 * Lower = higher priority for advisor follow-up.
 * Excludes clients who need no action (COMPLETE, or not stalled early stages).
 */
function attentionPriority(client: PipelineClient): number | null {
  const { stage, lastActivity } = client;

  if (stage === "COMPLETE") return null;

  if (stage === "DOCUMENTS_REQUIRED") return 0;
  if (stage === "INTAKE_COMPLETE") return 1;

  const stalled = isStalled(lastActivity, stage);
  if (stalled) return 2;

  return null;
}

/** Clients that need advisor attention: missing docs, review queue, or stalled. */
export function getNeedsAttentionClients(
  clients: PipelineClient[],
  max = 8,
): PipelineClient[] {
  const ranked = clients
    .map((c) => ({ client: c, p: attentionPriority(c) }))
    .filter((x): x is { client: PipelineClient; p: number } => x.p !== null)
    .sort((a, b) => {
      if (a.p !== b.p) return a.p - b.p;
      return a.client.lastActivity.getTime() - b.client.lastActivity.getTime();
    });

  return ranked.slice(0, max).map((x) => x.client);
}

export function formatAttentionReason(
  stage: ClientWorkflowStage,
  lastActivity: Date,
): string {
  if (stage === "DOCUMENTS_REQUIRED") return "Documents required";
  if (stage === "INTAKE_COMPLETE") return "Awaiting your review";
  if (isStalled(lastActivity, stage)) return "No activity in 7+ days";
  return "";
}
