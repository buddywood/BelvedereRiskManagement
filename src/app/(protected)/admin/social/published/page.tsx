import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, RefreshCw } from "lucide-react";
import { requireAdminRole } from "@/lib/admin/auth";
import { getSocialPosts } from "@/lib/actions/social-post-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { THEME_DISPLAY_NAMES } from "@/lib/marketing/content-templates";
import type { SocialPostStatus } from "@prisma/client";

type SearchParams = {
  status?: string;
};

export default async function PublishedPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdminRole();
  const sp = await searchParams;

  const statusFilter: SocialPostStatus[] =
    sp.status === "FAILED" ? ["FAILED"] : ["PUBLISHED", "FAILED"];

  const result = await getSocialPosts({ status: statusFilter, limit: 50 });
  if (!result.success) {
    notFound();
  }

  const posts = result.posts;
  const showingFailed = sp.status === "FAILED";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/social">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {showingFailed ? "Failed Posts" : "Published Posts"}
          </h1>
          <p className="text-muted-foreground">
            {showingFailed
              ? "Posts that failed to publish. Review errors and retry."
              : "History of published posts with performance tracking."}
          </p>
        </div>
        <div className="flex gap-2">
          {showingFailed ? (
            <Button variant="outline" asChild>
              <Link href="/admin/social/published">All Published</Link>
            </Button>
          ) : (
            <Button variant="outline" asChild>
              <Link href="/admin/social/published?status=FAILED">Failed Only</Link>
            </Button>
          )}
        </div>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {showingFailed ? "No failed posts." : "No published posts yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card
              key={post.id}
              className={post.status === "FAILED" ? "border-destructive/50" : ""}
            >
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={post.status === "FAILED" ? "destructive" : "default"}
                      >
                        {post.status}
                      </Badge>
                      <Badge variant="outline">
                        {THEME_DISPLAY_NAMES[post.theme] ?? post.theme}
                      </Badge>
                      {post.publishedAt && (
                        <span className="text-xs text-muted-foreground">
                          Published: {new Date(post.publishedAt).toLocaleString()}
                        </span>
                      )}
                    </div>

                    <p className="text-sm">{post.content}</p>

                    {post.publishError && (
                      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-2">
                        <p className="text-sm text-destructive">
                          <strong>Error:</strong> {post.publishError}
                        </p>
                      </div>
                    )}

                    {post.platformPostUrl && (
                      <a
                        href={post.platformPostUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View on X
                      </a>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        Created by {post.createdBy?.name ?? "Unknown"}
                      </span>
                      {post.approvedBy && (
                        <span>Approved by {post.approvedBy.name}</span>
                      )}
                    </div>
                  </div>

                  {post.status === "FAILED" && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/admin/social/${post.id}/edit`}>
                          Edit & Retry
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
