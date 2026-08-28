import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Edit, Send, Trash2 } from "lucide-react";
import { requireAdminRole } from "@/lib/admin/auth";
import { getSocialPosts } from "@/lib/actions/social-post-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { THEME_DISPLAY_NAMES } from "@/lib/marketing/content-templates";
import { SocialPostCreateForm } from "@/components/admin/social/SocialPostCreateForm";
import { SocialPostActions } from "@/components/admin/social/SocialPostActions";

type SearchParams = {
  new?: string;
};

export default async function DraftsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdminRole();
  const sp = await searchParams;
  const showNewForm = sp.new === "true";

  const result = await getSocialPosts({ status: ["DRAFT", "REJECTED"] });
  if (!result.success) {
    notFound();
  }

  const drafts = result.posts;
  const rejectedCount = drafts.filter((p) => p.status === "REJECTED").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/social">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Drafts</h1>
          <p className="text-muted-foreground">
            Create and edit draft posts before submitting for review.
          </p>
        </div>
        {!showNewForm && (
          <Button asChild>
            <Link href="/admin/social/drafts?new=true">New Post</Link>
          </Button>
        )}
      </div>

      {showNewForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
          </CardHeader>
          <CardContent>
            <SocialPostCreateForm />
          </CardContent>
        </Card>
      )}

      {rejectedCount > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">
            <strong>{rejectedCount}</strong> post(s) were rejected and need revision.
          </p>
        </div>
      )}

      {drafts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No drafts yet.</p>
            {!showNewForm && (
              <Button asChild className="mt-4">
                <Link href="/admin/social/drafts?new=true">Create your first post</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {drafts.map((post) => (
            <Card key={post.id} className={post.status === "REJECTED" ? "border-destructive/50" : ""}>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={post.status === "REJECTED" ? "destructive" : "secondary"}>
                        {post.status === "REJECTED" ? "Rejected" : "Draft"}
                      </Badge>
                      <Badge variant="outline">
                        {THEME_DISPLAY_NAMES[post.theme] ?? post.theme}
                      </Badge>
                      {post.scheduledAt && (
                        <Badge variant="outline" className="font-mono text-xs">
                          Scheduled: {new Date(post.scheduledAt).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm">{post.content}</p>
                    {post.rejectionReason && (
                      <p className="text-sm text-destructive">
                        <strong>Rejection reason:</strong> {post.rejectionReason}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(post.createdAt).toLocaleDateString()} by{" "}
                      {post.createdBy?.name ?? "Unknown"}
                    </p>
                  </div>
                  <SocialPostActions
                    postId={post.id}
                    status={post.status}
                    showSubmit
                    showEdit
                    showDelete
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
