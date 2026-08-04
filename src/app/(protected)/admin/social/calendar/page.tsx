import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";
import { requireAdminRole } from "@/lib/admin/auth";
import { getCalendarPosts } from "@/lib/actions/social-post-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { THEME_DISPLAY_NAMES } from "@/lib/marketing/content-templates";

function getWeekDates(): { start: Date; end: Date; dates: Date[] } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - dayOfWeek);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 13); // 2 weeks
  end.setHours(23, 59, 59, 999);

  const dates: Date[] = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return { start, end, dates };
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const STATUS_COLORS = {
  APPROVED: "bg-green-500",
  PUBLISHED: "bg-blue-500",
  PENDING_REVIEW: "bg-yellow-500",
} as const;

export default async function CalendarPage() {
  await requireAdminRole();
  const { start, end, dates } = getWeekDates();

  const result = await getCalendarPosts(start, end);
  if (!result.success) {
    notFound();
  }

  const posts = result.posts;
  const today = new Date();

  function getPostsForDate(date: Date) {
    return posts.filter((post) => {
      const postDate = post.scheduledAt ?? post.publishedAt;
      return postDate && isSameDay(new Date(postDate), date);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/social">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Content Calendar</h1>
          <p className="text-muted-foreground">
            View scheduled and published posts across the next two weeks.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/social/drafts?new=true">New Post</Link>
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {dates.map((date) => {
          const datePosts = getPostsForDate(date);
          const isToday = isSameDay(date, today);

          return (
            <Card
              key={date.toISOString()}
              className={`min-h-[120px] ${isToday ? "border-primary" : ""}`}
            >
              <CardHeader className="p-2 pb-0">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span className={isToday ? "text-primary font-bold" : ""}>
                    {date.getDate()}
                  </span>
                  {isToday && (
                    <Badge variant="default" className="text-xs">
                      Today
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 p-2">
                {datePosts.length === 0 ? (
                  <p className="text-xs text-muted-foreground/50">No posts</p>
                ) : (
                  datePosts.map((post) => (
                    <div
                      key={post.id}
                      className="group relative rounded-md border p-1.5 hover:bg-muted/50"
                      title={post.content}
                    >
                      <div className="flex items-center gap-1">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            STATUS_COLORS[post.status as keyof typeof STATUS_COLORS] ?? "bg-gray-400"
                          }`}
                        />
                        <span className="truncate text-xs">
                          {THEME_DISPLAY_NAMES[post.theme]?.split(" ")[0] ?? "Post"}
                        </span>
                      </div>
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {post.content.substring(0, 30)}...
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="flex flex-wrap gap-4 pt-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-sm">Approved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span className="text-sm">Published</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <span className="text-sm">Pending Review</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
