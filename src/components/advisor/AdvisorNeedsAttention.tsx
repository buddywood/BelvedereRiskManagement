import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { getStageLabel } from "@/lib/pipeline/status";
import {
  formatAttentionReason,
  getNeedsAttentionClients,
} from "@/lib/pipeline/needs-attention";
import type { PipelineClient } from "@/lib/pipeline/types";

interface AdvisorNeedsAttentionProps {
  clients: PipelineClient[];
}

export function AdvisorNeedsAttention({ clients }: AdvisorNeedsAttentionProps) {
  const attention = getNeedsAttentionClients(clients, 8);

  if (attention.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
        Nothing urgent right now.{" "}
        <Link href="/advisor/pipeline" className="font-medium text-primary underline-offset-2 hover:underline">
          View pipeline
        </Link>{" "}
        for the full client list.
      </div>
    );
  }

  return (
    <ul className="divide-y rounded-lg border bg-card">
      {attention.map((client) => {
        const reason = formatAttentionReason(client.stage, client.lastActivity);
        const stageLabel = getStageLabel(client.stage);
        const displayName = client.name || "Unnamed client";

        return (
          <li key={client.id}>
            <Link
              href={`/advisor/pipeline/${client.id}`}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{displayName}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/80">{reason}</span>
                  <span className="text-muted-foreground"> · {stageLabel}</span>
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
