import Link from "next/link";
import {
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  FileText,
  PlusCircle,
  Send,
  XCircle,
} from "lucide-react";
import { requireAdminRole } from "@/lib/admin/auth";
import { getPostStats } from "@/lib/actions/social-post-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { THEME_DISPLAY_NAMES } from "@/lib/marketing/content-templates";

export default async function SocialMediaPage() {
  await requireAdminRole();
  const statsResult = await getPostStats();
  const stats = statsResult.success ? statsResult.stats : null;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Social Media</h1>
          <p className="text-muted-foreground">
            Manage and schedule social media content with human-approved publishing workflow.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/social/drafts?new=true">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Post
          </Link>
        </Button>
      </header>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.byStatus.DRAFT ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Posts in draft</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.byStatus.PENDING_REVIEW ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.scheduledUpcoming ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Approved & scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.publishedThisMonth ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:border-primary/50 transition-colors">
          <Link href="/admin/social/drafts">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Drafts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create and edit draft posts. Use templates or write custom content.
              </p>
              {(stats?.byStatus.DRAFT ?? 0) > 0 && (
                <Badge variant="secondary" className="mt-3">
                  {stats?.byStatus.DRAFT} drafts
                </Badge>
              )}
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <Link href="/admin/social/pending">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5" />
                Review Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Approve or reject posts pending review before publishing.
              </p>
              {(stats?.byStatus.PENDING_REVIEW ?? 0) > 0 && (
                <Badge variant="default" className="mt-3">
                  {stats?.byStatus.PENDING_REVIEW} pending
                </Badge>
              )}
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <Link href="/admin/social/calendar">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                Content Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View scheduled posts and plan your content strategy.
              </p>
              {(stats?.scheduledUpcoming ?? 0) > 0 && (
                <Badge variant="outline" className="mt-3">
                  {stats?.scheduledUpcoming} scheduled
                </Badge>
              )}
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <Link href="/admin/social/published">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="h-5 w-5" />
                Published
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View published posts and track performance metrics.
              </p>
              {(stats?.byStatus.PUBLISHED ?? 0) > 0 && (
                <Badge variant="secondary" className="mt-3">
                  {stats?.byStatus.PUBLISHED} published
                </Badge>
              )}
            </CardContent>
          </Link>
        </Card>

        {(stats?.byStatus.FAILED ?? 0) > 0 && (
          <Card className="border-destructive/50 hover:border-destructive transition-colors">
            <Link href="/admin/social/published?status=FAILED">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-destructive">
                  <XCircle className="h-5 w-5" />
                  Failed Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Posts that failed to publish. Review errors and retry.
                </p>
                <Badge variant="destructive" className="mt-3">
                  {stats?.byStatus.FAILED} failed
                </Badge>
              </CardContent>
            </Link>
          </Card>
        )}
      </div>

      {/* Content by Theme */}
      {stats && Object.keys(stats.byTheme).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Content by Theme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.byTheme).map(([theme, count]) => (
                <Badge key={theme} variant="outline" className="text-sm">
                  {THEME_DISPLAY_NAMES[theme as keyof typeof THEME_DISPLAY_NAMES] ?? theme}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflow Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Publishing Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                1
              </div>
              <div>
                <p className="font-medium">Create Draft</p>
                <p className="text-xs text-muted-foreground">Write or use template</p>
              </div>
            </div>
            <div className="hidden h-px flex-1 bg-border sm:block" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                2
              </div>
              <div>
                <p className="font-medium">Submit for Review</p>
                <p className="text-xs text-muted-foreground">Request approval</p>
              </div>
            </div>
            <div className="hidden h-px flex-1 bg-border sm:block" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                3
              </div>
              <div>
                <p className="font-medium">Approve & Schedule</p>
                <p className="text-xs text-muted-foreground">Set publish time</p>
              </div>
            </div>
            <div className="hidden h-px flex-1 bg-border sm:block" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                4
              </div>
              <div>
                <p className="font-medium">Auto-Publish</p>
                <p className="text-xs text-muted-foreground">Cron job posts to X</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
