"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";
import { approvePost, rejectPost } from "@/lib/actions/social-post-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SocialPostReviewActionsProps = {
  postId: string;
};

export function SocialPostReviewActions({ postId }: SocialPostReviewActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  async function handleApprove() {
    setError(null);
    startTransition(async () => {
      const result = await approvePost(postId);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      setError("Please provide a rejection reason");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await rejectPost({ postId, reason: rejectReason.trim() });
      if (result.success) {
        setShowRejectDialog(false);
        setRejectReason("");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row">
        <Button
          onClick={handleApprove}
          disabled={isPending}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Approve
        </Button>
        <Button
          variant="destructive"
          onClick={() => setShowRejectDialog(true)}
          disabled={isPending}
          className="flex-1"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Reject
        </Button>
      </div>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Post</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection. This will help the author improve the content.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Rejection reason..."
            rows={3}
          />

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectReason("");
                setError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isPending || !rejectReason.trim()}
            >
              {isPending ? "Rejecting..." : "Reject Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
