#!/usr/bin/env npx tsx
/**
 * X (Twitter) Campaign Scheduler
 *
 * Schedule and manage social media campaigns for AkiliRisk marketing.
 * Posts are stored in a JSON file and can be scheduled via cron or run manually.
 *
 * Usage:
 *   npx tsx scripts/x-campaign.ts --list                    # List scheduled posts
 *   npx tsx scripts/x-campaign.ts --add "Tweet text"        # Add a new post
 *   npx tsx scripts/x-campaign.ts --add "Text" --at "2024-01-15T10:00:00"
 *   npx tsx scripts/x-campaign.ts --post-next               # Post the next scheduled item
 *   npx tsx scripts/x-campaign.ts --post-due                # Post all due items
 *   npx tsx scripts/x-campaign.ts --delete <id>             # Delete a scheduled post
 *   npx tsx scripts/x-campaign.ts --preview                 # Preview content calendar
 *
 * @see docs/marketing/x-api-setup.md for setup instructions
 */

import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load environment variables
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

import {
  postTweet,
  postThread,
  validateXConfig,
  splitIntoThread,
  X_RATE_LIMITS,
} from "../src/lib/marketing/x-client";

// Campaign data file location
const CAMPAIGN_FILE = path.resolve(process.cwd(), "data/x-campaign.json");

type PostStatus = "scheduled" | "posted" | "failed" | "cancelled";

type ScheduledPost = {
  id: string;
  text: string;
  scheduledAt: string | null; // ISO date string, null = post immediately
  isThread: boolean;
  replyToTweetId?: string;
  quoteTweetId?: string;
  status: PostStatus;
  postedAt?: string;
  tweetId?: string;
  tweetUrl?: string;
  error?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
};

type CampaignData = {
  posts: ScheduledPost[];
  stats: {
    totalPosted: number;
    totalFailed: number;
    lastPostAt?: string;
  };
};

function generateId(): string {
  return `post_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

function loadCampaignData(): CampaignData {
  const dir = path.dirname(CAMPAIGN_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(CAMPAIGN_FILE)) {
    const initial: CampaignData = {
      posts: [],
      stats: { totalPosted: 0, totalFailed: 0 },
    };
    fs.writeFileSync(CAMPAIGN_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }

  return JSON.parse(fs.readFileSync(CAMPAIGN_FILE, "utf-8"));
}

function saveCampaignData(data: CampaignData): void {
  const dir = path.dirname(CAMPAIGN_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CAMPAIGN_FILE, JSON.stringify(data, null, 2));
}

function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return "Immediate";
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusEmoji(status: PostStatus): string {
  switch (status) {
    case "scheduled":
      return "📅";
    case "posted":
      return "✅";
    case "failed":
      return "❌";
    case "cancelled":
      return "🚫";
    default:
      return "❓";
  }
}

async function listPosts(filter?: PostStatus): Promise<void> {
  const data = loadCampaignData();
  const posts = filter ? data.posts.filter((p) => p.status === filter) : data.posts;

  if (posts.length === 0) {
    console.log("📭 No posts found.");
    return;
  }

  console.log(`\n📋 Campaign Posts (${posts.length} total)\n`);
  console.log("─".repeat(80));

  for (const post of posts) {
    const emoji = getStatusEmoji(post.status);
    const preview = post.text.substring(0, 50) + (post.text.length > 50 ? "..." : "");
    const scheduled = formatDate(post.scheduledAt);

    console.log(`${emoji} [${post.id.substring(0, 12)}] ${post.status.toUpperCase()}`);
    console.log(`   📝 ${preview}`);
    console.log(`   📆 Scheduled: ${scheduled}`);
    if (post.isThread) console.log("   🧵 Thread");
    if (post.tweetUrl) console.log(`   🔗 ${post.tweetUrl}`);
    if (post.error) console.log(`   ⚠️  Error: ${post.error}`);
    console.log("─".repeat(80));
  }

  console.log(`\n📊 Stats: ${data.stats.totalPosted} posted, ${data.stats.totalFailed} failed`);
  if (data.stats.lastPostAt) {
    console.log(`   Last post: ${formatDate(data.stats.lastPostAt)}`);
  }
}

async function addPost(
  text: string,
  options: {
    scheduledAt?: string;
    isThread?: boolean;
    replyTo?: string;
    quote?: string;
    tags?: string[];
  }
): Promise<void> {
  const data = loadCampaignData();
  const now = new Date().toISOString();

  const post: ScheduledPost = {
    id: generateId(),
    text,
    scheduledAt: options.scheduledAt ?? null,
    isThread: options.isThread ?? false,
    replyToTweetId: options.replyTo,
    quoteTweetId: options.quote,
    status: "scheduled",
    tags: options.tags,
    createdAt: now,
    updatedAt: now,
  };

  data.posts.push(post);
  saveCampaignData(data);

  console.log("✅ Post scheduled successfully!");
  console.log(`   ID: ${post.id}`);
  console.log(`   Text: "${text.substring(0, 50)}${text.length > 50 ? "..." : ""}"`);
  console.log(`   When: ${formatDate(post.scheduledAt)}`);
  if (post.isThread) {
    const tweets = splitIntoThread(text);
    console.log(`   Thread: ${tweets.length} tweets`);
  }
}

async function deletePost(id: string): Promise<void> {
  const data = loadCampaignData();
  const index = data.posts.findIndex((p) => p.id === id || p.id.startsWith(id));

  if (index === -1) {
    console.error(`❌ Post not found: ${id}`);
    process.exit(1);
  }

  const post = data.posts[index];
  data.posts.splice(index, 1);
  saveCampaignData(data);

  console.log(`🗑️  Post deleted: ${post.id}`);
}

async function postScheduledItem(post: ScheduledPost, data: CampaignData): Promise<boolean> {
  console.log(`\n📤 Posting: "${post.text.substring(0, 50)}..."`);

  try {
    if (post.isThread) {
      const tweets = splitIntoThread(post.text);
      const result = await postThread(tweets);
      post.tweetId = result.tweets[0].id;
      post.tweetUrl = result.threadUrl;
    } else {
      const result = await postTweet({
        text: post.text,
        replyToTweetId: post.replyToTweetId,
        quoteTweetId: post.quoteTweetId,
      });
      post.tweetId = result.id;
      post.tweetUrl = result.url;
    }

    post.status = "posted";
    post.postedAt = new Date().toISOString();
    post.updatedAt = post.postedAt;
    data.stats.totalPosted++;
    data.stats.lastPostAt = post.postedAt;

    console.log(`✅ Posted: ${post.tweetUrl}`);
    return true;
  } catch (error) {
    post.status = "failed";
    post.error = error instanceof Error ? error.message : String(error);
    post.updatedAt = new Date().toISOString();
    data.stats.totalFailed++;

    console.error(`❌ Failed: ${post.error}`);
    return false;
  }
}

async function postNext(): Promise<void> {
  const { valid, missing } = validateXConfig();
  if (!valid) {
    console.error("❌ Missing X API credentials:", missing.join(", "));
    process.exit(1);
  }

  const data = loadCampaignData();
  const now = new Date();

  // Find the next scheduled post that's due
  const nextPost = data.posts
    .filter((p) => p.status === "scheduled")
    .filter((p) => !p.scheduledAt || new Date(p.scheduledAt) <= now)
    .sort((a, b) => {
      if (!a.scheduledAt) return -1;
      if (!b.scheduledAt) return 1;
      return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    })[0];

  if (!nextPost) {
    console.log("📭 No posts ready to publish.");
    return;
  }

  await postScheduledItem(nextPost, data);
  saveCampaignData(data);
}

async function postDue(): Promise<void> {
  const { valid, missing } = validateXConfig();
  if (!valid) {
    console.error("❌ Missing X API credentials:", missing.join(", "));
    process.exit(1);
  }

  const data = loadCampaignData();
  const now = new Date();

  const duePosts = data.posts
    .filter((p) => p.status === "scheduled")
    .filter((p) => !p.scheduledAt || new Date(p.scheduledAt) <= now);

  if (duePosts.length === 0) {
    console.log("📭 No posts due.");
    return;
  }

  console.log(`📤 ${duePosts.length} post(s) due for publishing...\n`);

  let success = 0;
  let failed = 0;

  for (const post of duePosts) {
    const result = await postScheduledItem(post, data);
    if (result) {
      success++;
    } else {
      failed++;
    }
    // Rate limit protection: wait 1 second between posts
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  saveCampaignData(data);

  console.log(`\n📊 Results: ${success} posted, ${failed} failed`);
}

function previewCalendar(): void {
  const data = loadCampaignData();
  const scheduled = data.posts.filter((p) => p.status === "scheduled" && p.scheduledAt);

  if (scheduled.length === 0) {
    console.log("📭 No scheduled posts with dates.");
    return;
  }

  // Group by date
  const byDate = new Map<string, ScheduledPost[]>();
  for (const post of scheduled) {
    const date = new Date(post.scheduledAt!).toDateString();
    if (!byDate.has(date)) {
      byDate.set(date, []);
    }
    byDate.get(date)!.push(post);
  }

  console.log("\n📅 Content Calendar\n");

  const sortedDates = Array.from(byDate.keys()).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  for (const date of sortedDates) {
    console.log(`━━━ ${date} ━━━`);
    for (const post of byDate.get(date)!) {
      const time = new Date(post.scheduledAt!).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const preview = post.text.substring(0, 60) + (post.text.length > 60 ? "..." : "");
      console.log(`  ${time} │ ${preview}`);
    }
    console.log();
  }
}

function printHelp(): void {
  console.log(`
AkiliRisk X Campaign Scheduler

USAGE:
  npx tsx scripts/x-campaign.ts [COMMAND] [OPTIONS]

COMMANDS:
  --list [status]       List all posts (optionally filter by status)
  --add "text"          Add a new scheduled post
  --delete <id>         Delete a scheduled post
  --post-next           Post the next due item
  --post-due            Post all due items
  --preview             Show content calendar
  --help                Show this help

ADD OPTIONS:
  --at "ISO-DATE"       Schedule for specific time (e.g., "2024-01-15T10:00:00")
  --thread              Auto-split long text into thread
  --reply <id>          Reply to existing tweet
  --quote <id>          Quote existing tweet
  --tags "tag1,tag2"    Add tags for organization

EXAMPLES:
  # Add a post for immediate publishing
  npx tsx scripts/x-campaign.ts --add "Check out our new risk assessment!"

  # Schedule for a specific time
  npx tsx scripts/x-campaign.ts --add "Morning security tip!" --at "2024-01-15T09:00:00"

  # Add a thread
  npx tsx scripts/x-campaign.ts --add "Long content here..." --thread

  # List scheduled posts
  npx tsx scripts/x-campaign.ts --list scheduled

  # Publish next due post
  npx tsx scripts/x-campaign.ts --post-next

  # Publish all due posts (use with cron)
  npx tsx scripts/x-campaign.ts --post-due

CRON EXAMPLE:
  # Post due content every hour
  0 * * * * cd /path/to/project && npx tsx scripts/x-campaign.ts --post-due >> /var/log/x-campaign.log 2>&1

DATA:
  Campaign data stored in: ${CAMPAIGN_FILE}

RATE LIMITS:
  Free tier:  ${X_RATE_LIMITS.FREE_TIER_MONTHLY_POSTS.toLocaleString()} posts/month
  Max tweet:  ${X_RATE_LIMITS.MAX_TWEET_LENGTH} characters
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printHelp();
    return;
  }

  // Parse commands
  if (args.includes("--list")) {
    const statusIndex = args.indexOf("--list") + 1;
    const status = args[statusIndex] as PostStatus | undefined;
    await listPosts(status);
    return;
  }

  if (args.includes("--add")) {
    const textIndex = args.indexOf("--add") + 1;
    const text = args[textIndex];

    if (!text || text.startsWith("--")) {
      console.error("❌ No text provided for --add");
      process.exit(1);
    }

    const atIndex = args.indexOf("--at");
    const scheduledAt = atIndex !== -1 ? args[atIndex + 1] : undefined;

    const isThread = args.includes("--thread");

    const replyIndex = args.indexOf("--reply");
    const replyTo = replyIndex !== -1 ? args[replyIndex + 1] : undefined;

    const quoteIndex = args.indexOf("--quote");
    const quote = quoteIndex !== -1 ? args[quoteIndex + 1] : undefined;

    const tagsIndex = args.indexOf("--tags");
    const tags = tagsIndex !== -1 ? args[tagsIndex + 1]?.split(",") : undefined;

    await addPost(text, { scheduledAt, isThread, replyTo, quote, tags });
    return;
  }

  if (args.includes("--delete")) {
    const idIndex = args.indexOf("--delete") + 1;
    const id = args[idIndex];

    if (!id) {
      console.error("❌ No ID provided for --delete");
      process.exit(1);
    }

    await deletePost(id);
    return;
  }

  if (args.includes("--post-next")) {
    await postNext();
    return;
  }

  if (args.includes("--post-due")) {
    await postDue();
    return;
  }

  if (args.includes("--preview")) {
    previewCalendar();
    return;
  }

  console.error("❌ Unknown command. Use --help for usage information.");
  process.exit(1);
}

main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
