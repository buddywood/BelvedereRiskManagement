"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSocialPost, type CreatePostInput } from "@/lib/actions/social-post-actions";
import {
  CONTENT_TEMPLATES,
  THEME_DISPLAY_NAMES,
  type ContentTemplate,
} from "@/lib/marketing/content-templates";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SocialContentTheme } from "@prisma/client";

const MAX_TWEET_LENGTH = 280;

const THEMES: SocialContentTheme[] = [
  "CYBER_SECURITY",
  "IDENTITY_PROTECTION",
  "FAMILY_SAFETY",
  "RISK_ASSESSMENT",
  "PRODUCT_UPDATE",
  "INDUSTRY_NEWS",
  "THOUGHT_LEADERSHIP",
  "ENGAGEMENT",
  "PROMOTIONAL",
  "OTHER",
];

export function SocialPostCreateForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [content, setContent] = useState("");
  const [theme, setTheme] = useState<SocialContentTheme>("CYBER_SECURITY");
  const [scheduledAt, setScheduledAt] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);

  const charCount = content.length;
  const isOverLimit = charCount > MAX_TWEET_LENGTH;

  const filteredTemplates = CONTENT_TEMPLATES.filter((t) => t.theme === theme);

  function applyTemplate(template: ContentTemplate) {
    setContent(template.content);
    setShowTemplates(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (isOverLimit) {
      setError(`Content exceeds ${MAX_TWEET_LENGTH} characters`);
      return;
    }

    const input: CreatePostInput = {
      content,
      theme,
      scheduledAt: scheduledAt || undefined,
    };

    startTransition(async () => {
      const result = await createSocialPost(input);
      if (result.success) {
        router.push("/admin/social/drafts");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="theme">Theme</Label>
          <Select value={theme} onValueChange={(v) => setTheme(v as SocialContentTheme)}>
            <SelectTrigger id="theme">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {THEMES.map((t) => (
                <SelectItem key={t} value={t}>
                  {THEME_DISPLAY_NAMES[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="scheduledAt">Schedule (optional)</Label>
          <Input
            id="scheduledAt"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Leave empty to publish immediately after approval
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="content">Content</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowTemplates(!showTemplates)}
          >
            {showTemplates ? "Hide templates" : "Use template"}
          </Button>
        </div>

        {showTemplates && filteredTemplates.length > 0 && (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                Templates for {THEME_DISPLAY_NAMES[theme]}
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-64 space-y-2 overflow-y-auto">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className="w-full rounded-lg border p-3 text-left text-sm hover:bg-muted/50 transition-colors"
                >
                  <p className="font-medium">{template.title}</p>
                  <p className="text-muted-foreground line-clamp-2">{template.content}</p>
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening?"
          rows={4}
          className={isOverLimit ? "border-destructive" : ""}
        />
        <div className="flex items-center justify-between text-xs">
          <div className="flex gap-2">
            {content && (
              <Badge variant={isOverLimit ? "destructive" : "secondary"}>
                {charCount}/{MAX_TWEET_LENGTH}
              </Badge>
            )}
          </div>
          {isOverLimit && (
            <span className="text-destructive">
              {charCount - MAX_TWEET_LENGTH} characters over limit
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/social/drafts")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending || !content || isOverLimit}>
          {isPending ? "Creating..." : "Create Draft"}
        </Button>
      </div>
    </form>
  );
}
