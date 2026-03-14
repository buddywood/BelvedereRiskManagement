"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  markIntakeInReview,
  approveClientIntake,
  rejectClientIntake,
} from "@/lib/actions/advisor-actions";

interface ApprovalActionsProps {
  interviewId: string;
  approvalId?: string;
  currentStatus?: string;
  selectedFocusAreas: string[];
  notes: string;
  onNotesChange: (notes: string) => void;
  disabled?: boolean;
}

export function ApprovalActions({
  interviewId,
  approvalId,
  currentStatus,
  selectedFocusAreas,
  notes,
  onNotesChange,
  disabled = false
}: ApprovalActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showConfirmation, setShowConfirmation] = useState<'approve' | 'reject' | null>(null);

  const handleBeginReview = async () => {
    startTransition(async () => {
      try {
        const result = await markIntakeInReview(interviewId);
        if (result.success) {
          toast.success("Review started");
        } else {
          toast.error(result.error || "Failed to start review");
        }
      } catch (error) {
        toast.error("Failed to start review");
      }
    });
  };

  const handleApprove = async () => {
    if (selectedFocusAreas.length === 0) {
      toast.error("Please select at least one focus area before approving");
      return;
    }

    startTransition(async () => {
      try {
        const result = await approveClientIntake({
          interviewId,
          focusAreas: selectedFocusAreas,
          notes: notes.trim() || undefined,
        });

        if (result.success) {
          toast.success("Client approved for assessment");
          setShowConfirmation(null);
        } else {
          toast.error(result.error || "Failed to approve client");
        }
      } catch (error) {
        toast.error("Failed to approve client");
      }
    });
  };

  const handleReject = async () => {
    if (!approvalId) {
      toast.error("Cannot reject - no approval record found");
      return;
    }

    startTransition(async () => {
      try {
        const result = await rejectClientIntake(approvalId, notes.trim() || undefined);

        if (result.success) {
          toast.success("Client intake rejected");
          setShowConfirmation(null);
        } else {
          toast.error(result.error || "Failed to reject client");
        }
      } catch (error) {
        toast.error("Failed to reject client");
      }
    });
  };

  const handleRevokeApproval = async () => {
    if (!approvalId) return;

    startTransition(async () => {
      try {
        const result = await markIntakeInReview(interviewId);
        if (result.success) {
          toast.success("Approval revoked - back to review");
        } else {
          toast.error(result.error || "Failed to revoke approval");
        }
      } catch (error) {
        toast.error("Failed to revoke approval");
      }
    });
  };

  const handleReopenFromReject = async () => {
    startTransition(async () => {
      try {
        const result = await markIntakeInReview(interviewId);
        if (result.success) {
          toast.success("Intake reopened for review");
        } else {
          toast.error(result.error || "Failed to reopen intake");
        }
      } catch (error) {
        toast.error("Failed to reopen intake");
      }
    });
  };

  // Render confirmation dialog
  if (showConfirmation) {
    return (
      <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          <h4 className="font-medium">
            {showConfirmation === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
          </h4>
        </div>

        <p className="text-sm text-muted-foreground">
          {showConfirmation === 'approve'
            ? `This will approve the client for a customized assessment focusing on ${selectedFocusAreas.length} selected risk areas. The client will be able to begin their assessment.`
            : 'This will reject the client intake. They will need to resubmit their responses to be reconsidered for assessment.'
          }
        </p>

        <div className="flex gap-2">
          <Button
            onClick={showConfirmation === 'approve' ? handleApprove : handleReject}
            variant={showConfirmation === 'approve' ? 'default' : 'destructive'}
            disabled={isPending || disabled}
            size="sm"
          >
            {showConfirmation === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
          </Button>
          <Button
            onClick={() => setShowConfirmation(null)}
            variant="outline"
            disabled={isPending}
            size="sm"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Notes section */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Review Notes</h4>
        <Textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Add notes about your review of this client intake..."
          className="min-h-20"
          disabled={disabled || currentStatus === 'APPROVED' || currentStatus === 'REJECTED'}
        />
      </div>

      {/* Status-specific actions */}
      {(!currentStatus || currentStatus === 'PENDING') && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Client intake is pending review. Begin reviewing to make approval decisions.
          </p>
          <Button
            onClick={handleBeginReview}
            disabled={isPending || disabled}
            className="w-full"
          >
            <Clock className="h-4 w-4 mr-2" />
            Begin Review
          </Button>
        </div>
      )}

      {currentStatus === 'IN_REVIEW' && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Review the client's responses and select focus areas for their customized assessment.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowConfirmation('approve')}
              disabled={isPending || disabled || selectedFocusAreas.length === 0}
              className="flex-1"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve for Assessment
            </Button>
            <Button
              onClick={() => setShowConfirmation('reject')}
              disabled={isPending || disabled}
              variant="destructive"
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
          {selectedFocusAreas.length === 0 && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
              Select at least one focus area to enable approval.
            </p>
          )}
        </div>
      )}

      {currentStatus === 'APPROVED' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="success" className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Approved
            </Badge>
            <span className="text-sm text-muted-foreground">
              Client approved for customized assessment
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Client can now access their customized assessment focusing on {selectedFocusAreas.length} selected risk areas.
          </p>
          <Button
            onClick={handleRevokeApproval}
            disabled={isPending || disabled}
            variant="outline"
            size="sm"
          >
            Revoke Approval
          </Button>
        </div>
      )}

      {currentStatus === 'REJECTED' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="warning" className="flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              Rejected
            </Badge>
            <span className="text-sm text-muted-foreground">
              Intake has been rejected
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            This client intake was rejected and requires resubmission for reconsideration.
          </p>
          <Button
            onClick={handleReopenFromReject}
            disabled={isPending || disabled}
            variant="outline"
            size="sm"
          >
            Reopen for Review
          </Button>
        </div>
      )}
    </div>
  );
}