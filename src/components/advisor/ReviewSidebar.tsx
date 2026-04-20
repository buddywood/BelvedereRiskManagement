"use client";

import { useState, useEffect } from "react";
import { RiskAreaSelector } from "./RiskAreaSelector";
import { ApprovalActions } from "./ApprovalActions";
import type { IntakeReviewData } from "@/lib/advisor/types";

interface ReviewSidebarProps {
  interviewId: string;
  approval: IntakeReviewData['approval'];
  householdProfileCount: number;
}

export function ReviewSidebar({ interviewId, approval, householdProfileCount }: ReviewSidebarProps) {
  // Initialize state from existing approval data
  const [selectedAreas, setSelectedAreas] = useState<string[]>(
    approval?.focusAreas || []
  );
  const [notes, setNotes] = useState(approval?.notes || "");

  // Update state when approval changes (after status transitions)
  useEffect(() => {
    queueMicrotask(() => {
      setSelectedAreas(approval?.focusAreas || []);
      setNotes(approval?.notes || "");
    });
  }, [approval]);

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 rounded-lg border border-border/60 bg-muted/25 p-3 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground">Household directory</p>
        {householdProfileCount > 0 ? (
          <p className="leading-relaxed">
            <a
              href="#household-directory"
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              {householdProfileCount} {householdProfileCount === 1 ? 'profile' : 'profiles'}
            </a>
            <span className="text-muted-foreground"> — in the main column beside this panel.</span>
          </p>
        ) : (
          <p>No household profiles on file yet.</p>
        )}
        {householdProfileCount > 0 ? (
          <p className="text-[0.7rem] leading-snug text-muted-foreground lg:hidden">
            On your phone, jump there and tap &quot;Household directory&quot; to expand.
          </p>
        ) : null}
      </div>

      {/* Risk Area Selection */}
      <RiskAreaSelector
        selectedAreas={selectedAreas}
        onChange={setSelectedAreas}
        disabled={approval?.status === 'APPROVED' || approval?.status === 'REJECTED'}
      />

      {/* Approval Actions */}
      <ApprovalActions
        interviewId={interviewId}
        approvalId={approval?.id}
        currentStatus={approval?.status}
        selectedFocusAreas={selectedAreas}
        notes={notes}
        onNotesChange={setNotes}
        disabled={false}
      />
    </div>
  );
}