"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit, Send, Trash2, MoreVertical } from "lucide-react";
import type { SocialPostStatus } from "@prisma/client";
import {
  submitPostForReview,
  deleteSocialPost,
  cancelPost,
} from "@/lib/actions/social-post-actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type SocialPostActionsProps = {
  postId: string;
  status: SocialPostStatus;
  showSubmit?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showCancel?: boolean;
};

export function SocialPostActions({
  postId,
  status,
  showSubmit,
  showEdit,
  showDelete,
  showCancel,
}: SocialPostActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = status === "DRAFT" || status === "REJECTED";
  const canEdit = status === "DRAFT" || status === "PENDING_REVIEW" || status === "REJECTED";
  const canDelete = status !== "PUBLISHED";
  const canCancel = status === "APPROVED" || status === "PENDING_REVIEW";

  async function handleSubmitForReview() {
    setError(null);
    startTransition(async () => {
      const result = await submitPostForReview(postId);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  async function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteSocialPost(postId);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
    setShowDeleteDialog(false);
  }

  async function handleCancel() {
    setError(null);
    startTransition(async () => {
      const result = await cancelPost(postId);
      if (result.success) {
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

      <div className="flex items-center gap-2">
        {showSubmit && canSubmit && (
          <Button
            size="sm"
            onClick={handleSubmitForReview}
            disabled={isPending}
          >
            <Send className="mr-2 h-4 w-4" />
            Submit for Review
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isPending}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {showEdit && canEdit && (
              <DropdownMenuItem asChild>
                <Link href={`/admin/social/${postId}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
            )}

            {showCancel && canCancel && (
              <DropdownMenuItem onClick={handleCancel}>
                Cancel Post
              </DropdownMenuItem>
            )}

            {(showDelete || showCancel) && <DropdownMenuSeparator />}

            {showDelete && canDelete && (
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The post will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
