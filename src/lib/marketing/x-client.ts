/**
 * X (Twitter) API Client for AkiliRisk Social Media Marketing
 *
 * This module provides a typed wrapper around the twitter-api-v2 library
 * for posting tweets, threads, and managing the X account programmatically.
 *
 * Prerequisites:
 * 1. X Developer Account with Basic tier ($200/mo) or higher for write access
 * 2. App with Read and Write permissions
 * 3. OAuth 1.0a credentials (API Key, API Secret, Access Token, Access Secret)
 *
 * @see docs/marketing/x-api-setup.md for detailed setup instructions
 */

import { TwitterApi, type SendTweetV2Params, type TweetV2PostTweetResult } from "twitter-api-v2";

export type XClientConfig = {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessSecret: string;
};

export type PostTweetOptions = {
  text: string;
  replyToTweetId?: string;
  quoteTweetId?: string;
  mediaIds?: string[];
};

export type TweetResult = {
  id: string;
  text: string;
  url: string;
};

export type ThreadResult = {
  tweets: TweetResult[];
  threadUrl: string;
};

/**
 * Get X client configuration from environment variables
 */
export function getXClientConfig(): XClientConfig | null {
  const apiKey = process.env.X_API_KEY;
  const apiSecret = process.env.X_API_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessSecret = process.env.X_ACCESS_TOKEN_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    return null;
  }

  return { apiKey, apiSecret, accessToken, accessSecret };
}

/**
 * Validate that all required X API credentials are configured
 */
export function validateXConfig(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  if (!process.env.X_API_KEY) missing.push("X_API_KEY");
  if (!process.env.X_API_SECRET) missing.push("X_API_SECRET");
  if (!process.env.X_ACCESS_TOKEN) missing.push("X_ACCESS_TOKEN");
  if (!process.env.X_ACCESS_TOKEN_SECRET) missing.push("X_ACCESS_TOKEN_SECRET");

  return { valid: missing.length === 0, missing };
}

/**
 * Create an authenticated X API client
 */
export function createXClient(config?: XClientConfig): TwitterApi {
  const resolvedConfig = config ?? getXClientConfig();

  if (!resolvedConfig) {
    const { missing } = validateXConfig();
    throw new Error(
      `X API credentials not configured. Missing: ${missing.join(", ")}. ` +
        "See docs/marketing/x-api-setup.md for setup instructions."
    );
  }

  return new TwitterApi({
    appKey: resolvedConfig.apiKey,
    appSecret: resolvedConfig.apiSecret,
    accessToken: resolvedConfig.accessToken,
    accessSecret: resolvedConfig.accessSecret,
  });
}

/**
 * Get the X handle from environment or fall back to discovery
 */
export function getXHandle(): string {
  return process.env.X_HANDLE ?? "akilirisk";
}

/**
 * Build the URL for a tweet
 */
export function buildTweetUrl(tweetId: string, handle?: string): string {
  const resolvedHandle = handle ?? getXHandle();
  return `https://x.com/${resolvedHandle}/status/${tweetId}`;
}

/**
 * Post a single tweet to X
 */
export async function postTweet(options: PostTweetOptions): Promise<TweetResult> {
  const client = createXClient();

  const params: SendTweetV2Params = {
    text: options.text,
  };

  if (options.replyToTweetId) {
    params.reply = { in_reply_to_tweet_id: options.replyToTweetId };
  }

  if (options.quoteTweetId) {
    params.quote_tweet_id = options.quoteTweetId;
  }

  if (options.mediaIds && options.mediaIds.length > 0 && options.mediaIds.length <= 4) {
    // X API expects exactly 1-4 media IDs; type assertion satisfies the tuple type
    params.media = {
      media_ids: options.mediaIds.slice(0, 4) as
        | [string]
        | [string, string]
        | [string, string, string]
        | [string, string, string, string],
    };
  }

  const result: TweetV2PostTweetResult = await client.v2.tweet(params);

  return {
    id: result.data.id,
    text: result.data.text,
    url: buildTweetUrl(result.data.id),
  };
}

/**
 * Post a thread (multiple tweets in reply chain)
 */
export async function postThread(tweets: string[]): Promise<ThreadResult> {
  if (tweets.length === 0) {
    throw new Error("Thread must contain at least one tweet");
  }

  const client = createXClient();
  const results: TweetResult[] = [];
  let previousTweetId: string | undefined;

  for (const text of tweets) {
    const params: SendTweetV2Params = { text };

    if (previousTweetId) {
      params.reply = { in_reply_to_tweet_id: previousTweetId };
    }

    const result = await client.v2.tweet(params);

    const tweetResult: TweetResult = {
      id: result.data.id,
      text: result.data.text,
      url: buildTweetUrl(result.data.id),
    };

    results.push(tweetResult);
    previousTweetId = result.data.id;
  }

  return {
    tweets: results,
    threadUrl: results[0].url,
  };
}

/**
 * Delete a tweet by ID
 */
export async function deleteTweet(tweetId: string): Promise<boolean> {
  const client = createXClient();
  const result = await client.v2.deleteTweet(tweetId);
  return result.data.deleted;
}

/**
 * Upload media and get the media ID for attaching to tweets
 * Note: Media upload uses v1.1 API
 */
export async function uploadMedia(
  filePath: string,
  mimeType?: string
): Promise<string> {
  const client = createXClient();
  const mediaId = await client.v1.uploadMedia(filePath, { mimeType });
  return mediaId;
}

/**
 * Verify credentials and return account info
 */
export async function verifyCredentials(): Promise<{
  id: string;
  username: string;
  name: string;
}> {
  const client = createXClient();
  const me = await client.v2.me();

  return {
    id: me.data.id,
    username: me.data.username,
    name: me.data.name,
  };
}

/**
 * X API rate limit info (Free tier: 1,500 posts/month)
 */
export const X_RATE_LIMITS = {
  FREE_TIER_MONTHLY_POSTS: 1500,
  BASIC_TIER_MONTHLY_POSTS: 3000,
  PRO_TIER_MONTHLY_POSTS: 100000,
  MAX_TWEET_LENGTH: 280,
  MAX_THREAD_LENGTH: 25,
  MAX_MEDIA_PER_TWEET: 4,
} as const;

/**
 * Validate tweet text length
 */
export function validateTweetLength(text: string): {
  valid: boolean;
  length: number;
  remaining: number;
} {
  const length = text.length;
  return {
    valid: length <= X_RATE_LIMITS.MAX_TWEET_LENGTH,
    length,
    remaining: X_RATE_LIMITS.MAX_TWEET_LENGTH - length,
  };
}

/**
 * Split long text into thread-appropriate chunks
 */
export function splitIntoThread(
  text: string,
  maxLength: number = X_RATE_LIMITS.MAX_TWEET_LENGTH - 10 // Reserve space for numbering
): string[] {
  const words = text.split(/\s+/);
  const tweets: string[] = [];
  let currentTweet = "";

  for (const word of words) {
    const testTweet = currentTweet ? `${currentTweet} ${word}` : word;

    if (testTweet.length <= maxLength) {
      currentTweet = testTweet;
    } else {
      if (currentTweet) {
        tweets.push(currentTweet);
      }
      currentTweet = word;
    }
  }

  if (currentTweet) {
    tweets.push(currentTweet);
  }

  // Add thread numbering if multiple tweets
  if (tweets.length > 1) {
    return tweets.map((tweet, index) => `${index + 1}/${tweets.length} ${tweet}`);
  }

  return tweets;
}
