import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { requireAdminRole } from "@/lib/admin/auth";
import { getSocialPosts } from "@/lib/actions/social-post-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { THEME_DISPLAY_NAMES } from "@/lib/marketing/content-templates";
import { SocialPostReviewActions } from "@/components/admin/social/SocialPostReviewActions";

export default async function PendingReviewPage() {
  await requireAdminRole();

  const result = await getSocialPosts({ status: "PENDING_REVIEW" });
  if (!result.success) {
    notFound();
  }

  const pendingPosts = result.posts;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/social">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Review Queue</h1>
          <p className="text-muted-foreground">
            Approve or reject posts before they can be published.
          </p>
        </div>
      </div>

      {pendingPosts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No posts pending review.</p>
            <p className="text-sm text-muted-foreground">
              Posts submitted for review will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingPosts.map((post) => (
            <Card key={post.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="default">Pending Review</Badge>
                    <Badge variant="outline">
                      {THEME_DISPLAY_NAMES[post.theme] ?? post.theme}
                    </Badge>
                    {post.scheduledAt && (
                      <Badge variant="outline" className="font-mono text-xs">
                        Scheduled: {new Date(post.scheduledAt).toLocaleString()}
                      </Badge>
                    )}
                  </div>

                  {/* Post Preview */}
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {post.content.length}/280 characters
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      Created by <strong>{post.createdBy?.name ?? "Unknown"}</strong> on{" "}
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-right">
                      Platform: <strong>X (Twitter)</strong>
                    </div>
                  </div>

                  {/* Review Actions */}
                  <SocialPostReviewActions postId={post.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
