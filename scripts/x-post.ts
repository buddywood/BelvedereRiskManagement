#!/usr/bin/env npx tsx
/**
 * X (Twitter) Post CLI
 *
 * Post tweets to X from the command line for AkiliRisk marketing campaigns.
 *
 * Usage:
 *   npx tsx scripts/x-post.ts "Your tweet text here"
 *   npx tsx scripts/x-post.ts --thread "Long text that will be split into a thread"
 *   npx tsx scripts/x-post.ts --reply <tweet-id> "Reply text"
 *   npx tsx scripts/x-post.ts --quote <tweet-id> "Quote tweet text"
 *   npx tsx scripts/x-post.ts --verify  # Verify credentials
 *   npx tsx scripts/x-post.ts --dry-run "Test without posting"
 *   echo "Tweet text" | npx tsx scripts/x-post.ts --stdin
 *
 * Environment variables (required):
 *   X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET
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
  verifyCredentials,
  validateXConfig,
  validateTweetLength,
  splitIntoThread,
  X_RATE_LIMITS,
  buildTweetUrl,
} from "../src/lib/marketing/x-client";

type CliOptions = {
  text: string;
  thread: boolean;
  replyTo?: string;
  quoteTweet?: string;
  verify: boolean;
  dryRun: boolean;
  stdin: boolean;
  help: boolean;
};

function printHelp(): void {
  console.log(`
AkiliRisk X (Twitter) Post CLI

USAGE:
  npx tsx scripts/x-post.ts [OPTIONS] [TEXT]

OPTIONS:
  --thread          Split long text into a thread automatically
  --reply <id>      Post as a reply to the specified tweet ID
  --quote <id>      Post as a quote tweet of the specified ID
  --verify          Verify API credentials and print account info
  --dry-run         Validate without actually posting
  --stdin           Read tweet text from stdin
  --help, -h        Show this help message

EXAMPLES:
  # Post a simple tweet
  npx tsx scripts/x-post.ts "Excited to announce our new risk assessment feature!"

  # Post a thread
  npx tsx scripts/x-post.ts --thread "This is a long message about risk management that will be automatically split into multiple tweets..."

  # Reply to a tweet
  npx tsx scripts/x-post.ts --reply 1234567890 "Thanks for the feedback!"

  # Quote tweet
  npx tsx scripts/x-post.ts --quote 1234567890 "Great insights on cyber risk!"

  # Dry run (validate without posting)
  npx tsx scripts/x-post.ts --dry-run "Test tweet content"

  # Verify credentials
  npx tsx scripts/x-post.ts --verify

  # Read from stdin (useful for piping)
  echo "Tweet from pipe" | npx tsx scripts/x-post.ts --stdin

ENVIRONMENT:
  X_API_KEY              Your X API Key (Consumer Key)
  X_API_SECRET           Your X API Secret (Consumer Secret)
  X_ACCESS_TOKEN         Your X Access Token
  X_ACCESS_TOKEN_SECRET  Your X Access Token Secret
  X_HANDLE               Your X handle (default: akilirisk)

RATE LIMITS:
  Free tier:  ${X_RATE_LIMITS.FREE_TIER_MONTHLY_POSTS.toLocaleString()} posts/month
  Basic tier: ${X_RATE_LIMITS.BASIC_TIER_MONTHLY_POSTS.toLocaleString()} posts/month
  Max tweet:  ${X_RATE_LIMITS.MAX_TWEET_LENGTH} characters
`);
}

function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    text: "",
    thread: false,
    replyTo: undefined,
    quoteTweet: undefined,
    verify: false,
    dryRun: false,
    stdin: false,
    help: false,
  };

  const textParts: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--thread":
        options.thread = true;
        break;
      case "--reply":
        options.replyTo = args[++i];
        break;
      case "--quote":
        options.quoteTweet = args[++i];
        break;
      case "--verify":
        options.verify = true;
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--stdin":
        options.stdin = true;
        break;
      case "--help":
      case "-h":
        options.help = true;
        break;
      default:
        if (!arg.startsWith("--")) {
          textParts.push(arg);
        }
    }
  }

  options.text = textParts.join(" ");
  return options;
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8").trim();
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  // Verify credentials mode
  if (options.verify) {
    const { valid, missing } = validateXConfig();
    if (!valid) {
      console.error("❌ Missing credentials:", missing.join(", "));
      console.error("   Set these in .env.local or as environment variables.");
      process.exit(1);
    }

    try {
      console.log("🔍 Verifying X API credentials...");
      const account = await verifyCredentials();
      console.log("✅ Credentials verified!");
      console.log(`   Account: @${account.username}`);
      console.log(`   Name: ${account.name}`);
      console.log(`   ID: ${account.id}`);
      console.log(`   Profile: https://x.com/${account.username}`);
    } catch (error) {
      console.error("❌ Verification failed:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
    return;
  }

  // Read text from stdin if requested
  let text = options.text;
  if (options.stdin) {
    text = await readStdin();
  }

  if (!text) {
    console.error("❌ No tweet text provided.");
    console.error("   Usage: npx tsx scripts/x-post.ts \"Your tweet text\"");
    console.error("   Run with --help for more options.");
    process.exit(1);
  }

  // Validate credentials
  const { valid, missing } = validateXConfig();
  if (!valid) {
    console.error("❌ Missing X API credentials:", missing.join(", "));
    console.error("   See docs/marketing/x-api-setup.md for setup instructions.");
    process.exit(1);
  }

  // Handle thread mode
  if (options.thread) {
    const tweets = splitIntoThread(text);
    console.log(`📝 Thread will have ${tweets.length} tweet(s):`);
    tweets.forEach((tweet, i) => {
      const { length, remaining } = validateTweetLength(tweet);
      console.log(`   ${i + 1}. [${length}/${X_RATE_LIMITS.MAX_TWEET_LENGTH}] ${tweet.substring(0, 50)}...`);
      if (remaining < 0) {
        console.error(`   ⚠️  Tweet ${i + 1} exceeds limit by ${Math.abs(remaining)} characters`);
      }
    });

    if (options.dryRun) {
      console.log("\n🧪 Dry run - thread not posted.");
      return;
    }

    try {
      console.log("\n🚀 Posting thread...");
      const result = await postThread(tweets);
      console.log("✅ Thread posted successfully!");
      console.log(`   Thread URL: ${result.threadUrl}`);
      result.tweets.forEach((tweet, i) => {
        console.log(`   ${i + 1}. ${tweet.url}`);
      });
    } catch (error) {
      console.error("❌ Failed to post thread:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
    return;
  }

  // Single tweet mode
  const { valid: lengthValid, length, remaining } = validateTweetLength(text);
  console.log(`📝 Tweet: "${text.substring(0, 100)}${text.length > 100 ? "..." : ""}"`);
  console.log(`   Length: ${length}/${X_RATE_LIMITS.MAX_TWEET_LENGTH} (${remaining} remaining)`);

  if (!lengthValid) {
    console.error(`❌ Tweet exceeds ${X_RATE_LIMITS.MAX_TWEET_LENGTH} characters.`);
    console.error("   Use --thread to split into multiple tweets.");
    process.exit(1);
  }

  if (options.replyTo) {
    console.log(`   Reply to: ${buildTweetUrl(options.replyTo)}`);
  }

  if (options.quoteTweet) {
    console.log(`   Quote: ${buildTweetUrl(options.quoteTweet)}`);
  }

  if (options.dryRun) {
    console.log("\n🧪 Dry run - tweet not posted.");
    return;
  }

  try {
    console.log("\n🚀 Posting tweet...");
    const result = await postTweet({
      text,
      replyToTweetId: options.replyTo,
      quoteTweetId: options.quoteTweet,
    });
    console.log("✅ Tweet posted successfully!");
    console.log(`   URL: ${result.url}`);
    console.log(`   ID: ${result.id}`);
  } catch (error) {
    console.error("❌ Failed to post tweet:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
