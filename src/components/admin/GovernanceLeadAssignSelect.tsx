"use client";

import { useState, useTransition } from "react";
import { assignGovernanceReviewLeadAction } from "@/lib/admin/governance-lead-actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type LeadAssignmentAdvisorOption = {
  id: string;
  label: string;
};

const UNASSIGNED = "__unassigned";

export function GovernanceLeadAssignSelect({
  leadId,
  assignedAdvisorId,
  advisors,
}: {
  leadId: string;
  assignedAdvisorId: string | null;
  advisors: LeadAssignmentAdvisorOption[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const selectValue = assignedAdvisorId ?? UNASSIGNED;

  return (
    <div className="flex min-w-[220px] flex-col gap-1 sm:min-w-[260px]">
      <Select
        value={selectValue}
        disabled={pending}
        onValueChange={(v) => {
          setError(null);
          const advisorProfileId = v === UNASSIGNED ? "" : v;
          startTransition(async () => {
            const result = await assignGovernanceReviewLeadAction({
              leadId,
              advisorProfileId,
            });
            if (!result.success) {
              setError(result.error);
            }
          });
        }}
      >
        <SelectTrigger className="w-full" aria-label="Assign lead to advisor">
          <SelectValue placeholder="Assign advisor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
          {advisors.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
