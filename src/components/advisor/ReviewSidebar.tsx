"use client";

import { useState, useEffect } from "react";
import { RiskAreaSelector } from "./RiskAreaSelector";
import { ApprovalActions } from "./ApprovalActions";
import type { IntakeReviewData } from "@/lib/advisor/types";

interface ReviewSidebarProps {
  interviewId: string;
  approval: IntakeReviewData['approval'];
  onStatusChange: () => void;
}

export function ReviewSidebar({ interviewId, approval, onStatusChange }: ReviewSidebarProps) {
  // Initialize state from existing approval data
  const [selectedAreas, setSelectedAreas] = useState<string[]>(
    approval?.focusAreas || []
  );
  const [notes, setNotes] = useState(approval?.notes || "");

  // Update state when approval changes (after status transitions)
  useEffect(() => {
    setSelectedAreas(approval?.focusAreas || []);
    setNotes(approval?.notes || "");
  }, [approval]);

  return (
    <div className="space-y-6">
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
        onStatusChange={onStatusChange}
        disabled={false}
      />
    </div>
  );
}