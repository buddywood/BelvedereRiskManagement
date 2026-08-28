# AkiliRisk Social Media Marketing

This module provides automated X (Twitter) posting with a human-approval workflow for AkiliRisk's go-to-market campaigns.

## Quick Start

### 1. Configure X API Credentials

Add to your `.env.local`:

```bash
X_API_KEY="your_api_key"
X_API_SECRET="your_api_secret"
X_ACCESS_TOKEN="your_access_token"
X_ACCESS_TOKEN_SECRET="your_access_token_secret"
```

> **Note:** X API Basic tier ($200/mo) is required for write access. The free tier is read-only.

### 2. Run Database Migration

```bash
npx prisma migrate deploy
```

### 3. Configure Cron Job

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/social-publish",
      "schedule": "*/10 * * * *"
    }
  ]
}
```

Or use an external scheduler:

```bash
curl -X GET "https://your-domain.com/api/cron/social-publish" \
  -H "Authorization: Bearer $CRON_SECRET"
```

## Publishing Workflow

```
┌─────────┐    ┌────────────────┐    ┌──────────┐    ┌───────────┐
│  DRAFT  │───▶│ PENDING_REVIEW │───▶│ APPROVED │───▶│ PUBLISHED │
└─────────┘    └────────────────┘    └──────────┘    └───────────┘
     │                │                    │
     │                │                    │
     ▼                ▼                    ▼
  (edit)          REJECTED            (auto-publish
                     │                 via cron)
                     │
                     ▼
                (revise & resubmit)
```

### Workflow Steps

1. **Create Draft** - Write content or use a template at `/admin/social/drafts`
2. **Submit for Review** - Send to the approval queue
3. **Review & Approve** - Reviewers approve or reject at `/admin/social/pending`
4. **Schedule** - Set a specific publish time or publish immediately
5. **Auto-Publish** - Cron job publishes when the scheduled time arrives
6. **Track Results** - View post URL, engagement, and errors at `/admin/social/published`

## Admin UI Pages

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/admin/social` | Overview stats, quick actions |
| Drafts | `/admin/social/drafts` | Create/edit posts, templates |
| Review Queue | `/admin/social/pending` | Approve or reject posts |
| Calendar | `/admin/social/calendar` | Visual content calendar |
| Published | `/admin/social/published` | History with X links |

## Content Themes

Posts are organized by theme for analytics and content planning:

| Theme | Description | Suggested Frequency |
|-------|-------------|---------------------|
| `CYBER_SECURITY` | Digital security tips | 3x/week |
| `IDENTITY_PROTECTION` | Privacy & identity theft | 2x/week |
| `FAMILY_SAFETY` | Household security | 2x/week |
| `RISK_ASSESSMENT` | General risk insights | 1x/week |
| `PRODUCT_UPDATE` | AkiliRisk features | 1x/week |
| `INDUSTRY_NEWS` | Risk industry commentary | 2x/week |
| `THOUGHT_LEADERSHIP` | Executive insights | 1x/week |
| `ENGAGEMENT` | Questions & polls | 2x/week |
| `PROMOTIONAL` | Direct promotional content | 1x/week |

## Content Templates

Pre-built templates are available for each theme. When creating a post:

1. Select a theme from the dropdown
2. Click "Use template" to see available templates
3. Click a template to auto-fill the content
4. Customize as needed before saving

## CLI Tools (Advanced)

For direct posting without the admin UI:

```bash
# Verify API credentials
npm run x:verify

# Post a single tweet
npm run x:post "Your tweet text here"

# Post a thread (auto-splits long content)
npm run x:post -- --thread "Long content that will be split..."

# Dry run (test without posting)
npm run x:post -- --dry-run "Test tweet"
```

Campaign management:

```bash
# Add a scheduled post
npm run x:campaign -- --add "Tweet text" --at "2024-01-15T09:00:00"

# List scheduled posts
npm run x:campaign -- --list

# Publish all due posts
npm run x:campaign -- --post-due

# View content calendar
npm run x:campaign -- --preview
```

## Database Schema

The `SocialPost` model tracks:

| Field | Description |
|-------|-------------|
| `content` | Tweet text (max 280 chars) |
| `theme` | Content category |
| `status` | Workflow state |
| `scheduledAt` | When to publish |
| `createdById` | Who created the draft |
| `approvedById` | Who approved it |
| `rejectionReason` | Feedback if rejected |
| `platformPostId` | X tweet ID after publish |
| `platformPostUrl` | Link to the tweet |
| `publishError` | Error message if failed |
| `publishAttempts` | Retry count |

## Cron Job Details

The `/api/cron/social-publish` endpoint:

- **Frequency:** Every 5-15 minutes (configurable)
- **Batch size:** Up to 5 posts per run
- **Retry logic:** Failed posts retry up to 3 times
- **Auth:** Bearer token with `CRON_SECRET`
- **Audit:** All publish events are logged

### Cron Response

```json
{
  "success": true,
  "publishedCount": 2,
  "failedCount": 0,
  "results": [
    {
      "postId": "clx...",
      "success": true,
      "platformPostId": "1234567890",
      "platformPostUrl": "https://x.com/akilirisk/status/1234567890"
    }
  ],
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

## Rate Limits

| Tier | Monthly Posts | Cost |
|------|---------------|------|
| Free | Read-only | $0 |
| Basic | 3,000 | $200/mo |
| Pro | 100,000 | $5,000/mo |

Additional limits:
- Max tweet length: 280 characters
- Max media per tweet: 4 images
- Recommended thread length: 25 tweets

## Audit Trail

All actions are logged to the audit system:

- `social_post.created` - Draft created
- `social_post.updated` - Draft edited
- `social_post.submitted` - Submitted for review
- `social_post.approved` - Approved for publishing
- `social_post.rejected` - Rejected with reason
- `social_post.cancelled` - Post cancelled
- `social_post.deleted` - Post deleted
- `social_post.published` - Successfully posted to X
- `social_post.failed` - Publish attempt failed

## Troubleshooting

### "X API not configured"

Ensure all four environment variables are set:
- `X_API_KEY`
- `X_API_SECRET`
- `X_ACCESS_TOKEN`
- `X_ACCESS_TOKEN_SECRET`

### "Forbidden" or "401" errors

1. Verify your X app has **Read and Write** permissions
2. Regenerate tokens after changing permissions
3. Ensure you're on Basic tier or higher

### Posts stuck in APPROVED

Check that the cron job is running:
1. Verify `CRON_SECRET` is set
2. Check cron job logs for errors
3. Manually trigger: `curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain.com/api/cron/social-publish`

### Posts failing repeatedly

After 3 failed attempts, posts are marked as FAILED. Check:
1. `/admin/social/published?status=FAILED` for error details
2. Common issues: rate limits, duplicate content, API outages

## Best Practices

### Content Strategy (80/20 Rule)

- 80% educational, valuable content
- 20% promotional content

### Optimal Posting Times (B2B)

- **Days:** Tuesday - Thursday
- **Time:** 10 AM - 12 PM local time
- **Frequency:** 1-3 posts per day

### Writing Tips

1. Keep tweets under 280 characters
2. Use 1-2 hashtags per tweet
3. Include calls-to-action when appropriate
4. Mix content types (tips, questions, news)

## Files Reference

| Path | Description |
|------|-------------|
| `src/lib/marketing/x-client.ts` | X API client |
| `src/lib/marketing/content-templates.ts` | Pre-built templates |
| `src/lib/actions/social-post-actions.ts` | Server actions |
| `src/app/(protected)/admin/social/` | Admin UI pages |
| `src/app/api/cron/social-publish/route.ts` | Cron endpoint |
| `scripts/x-post.ts` | CLI posting tool |
| `scripts/x-campaign.ts` | CLI campaign manager |
| `docs/marketing/x-api-setup.md` | Detailed setup guide |
