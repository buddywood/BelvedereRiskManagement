import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db";
import { writeAudit, AUDIT_ACTIONS } from "@/lib/audit/audit-log";
import {
  postTweet,
  postThread,
  validateXConfig,
} from "@/lib/marketing/x-client";

/**
 * Social Post Publishing Cron Endpoint
 *
 * Publishes approved social media posts whose scheduled time has arrived.
 * Run every 5-15 minutes via Vercel Cron or external scheduler.
 *
 * Workflow:
 * 1. Find posts with status = APPROVED and scheduledAt <= now (or null)
 * 2. Attempt to publish each post to the X platform
 * 3. Update post status to PUBLISHED or FAILED
 * 4. Record publish result (platform post ID, URL, response, error)
 *
 * Auth: Bearer token with CRON_SECRET (same as other cron endpoints)
 *
 * Example cron schedule (vercel.json):
 * { "schedule": "0/10 * * * *" }  // Every 10 minutes
 */

const MAX_POSTS_PER_RUN = 5;
const MAX_RETRIES = 3;

type PublishResult = {
  postId: string;
  success: boolean;
  platformPostId?: string;
  platformPostUrl?: string;
  error?: string;
};

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret) {
      console.error("CRON_SECRET environment variable is not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error:
            "Missing or invalid authorization header. Include 'Authorization: Bearer <CRON_SECRET>'",
        },
        { status: 401 }
      );
    }

    const providedSecret = authHeader.substring(7);
    const providedBuf = Buffer.from(providedSecret, "utf8");
    const expectedBuf = Buffer.from(expectedSecret, "utf8");
    if (
      providedBuf.length !== expectedBuf.length ||
      !timingSafeEqual(providedBuf, expectedBuf)
    ) {
      return NextResponse.json(
        { error: "Invalid cron secret" },
        { status: 401 }
      );
    }

    // Check if X API is configured
    const xConfig = validateXConfig();
    if (!xConfig.valid) {
      console.warn(
        `Social publish cron: X API not configured. Missing: ${xConfig.missing.join(", ")}`
      );
      return NextResponse.json({
        success: true,
        message: "X API not configured - skipping publish",
        missingConfig: xConfig.missing,
        timestamp: new Date().toISOString(),
      });
    }

    // Find approved posts ready to publish
    const now = new Date();
    const postsToPublish = await prisma.socialPost.findMany({
      where: {
        status: "APPROVED",
        OR: [
          { scheduledAt: { lte: now } },
          { scheduledAt: null },
        ],
        publishAttempts: { lt: MAX_RETRIES },
      },
      orderBy: [
        { scheduledAt: "asc" },
        { createdAt: "asc" },
      ],
      take: MAX_POSTS_PER_RUN,
    });

    if (postsToPublish.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No posts ready to publish",
        publishedCount: 0,
        timestamp: new Date().toISOString(),
      });
    }

    const results: PublishResult[] = [];

    for (const post of postsToPublish) {
      const result = await publishPost(post);
      results.push(result);

      // Brief delay between posts to respect rate limits
      if (postsToPublish.indexOf(post) < postsToPublish.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      publishedCount: successCount,
      failedCount: failCount,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in social publish cron:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

async function publishPost(post: {
  id: string;
  content: string;
  isThread: boolean;
  threadContent: unknown;
  publishAttempts: number;
}): Promise<PublishResult> {
  const attemptNumber = post.publishAttempts + 1;

  try {
    // Update attempt tracking
    await prisma.socialPost.update({
      where: { id: post.id },
      data: {
        publishAttempts: attemptNumber,
        lastAttemptAt: new Date(),
      },
    });

    let platformPostId: string;
    let platformPostUrl: string;

    if (post.isThread && Array.isArray(post.threadContent)) {
      // Post as thread
      const threadResult = await postThread(post.threadContent as string[]);
      platformPostId = threadResult.tweets[0].id;
      platformPostUrl = threadResult.threadUrl;
    } else {
      // Post single tweet
      const tweetResult = await postTweet({ text: post.content });
      platformPostId = tweetResult.id;
      platformPostUrl = tweetResult.url;
    }

    // Update post as published
    await prisma.socialPost.update({
      where: { id: post.id },
      data: {
        status: "PUBLISHED",
        platformPostId,
        platformPostUrl,
        publishedAt: new Date(),
        publishResponse: {
          platformPostId,
          platformPostUrl,
          publishedAt: new Date().toISOString(),
        },
        publishError: null,
      },
    });

    // Audit log
    void writeAudit({
      actor: { userId: null },
      action: AUDIT_ACTIONS.SYSTEM_SOCIAL_POST_PUBLISHED,
      entityType: "SocialPost",
      entityId: post.id,
      metadata: {
        platformPostId,
        platformPostUrl,
        attemptNumber,
      },
    });

    return {
      postId: post.id,
      success: true,
      platformPostId,
      platformPostUrl,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // Determine if we should mark as FAILED (max retries) or keep as APPROVED
    const newStatus = attemptNumber >= MAX_RETRIES ? "FAILED" : "APPROVED";

    await prisma.socialPost.update({
      where: { id: post.id },
      data: {
        status: newStatus,
        publishError: errorMessage,
      },
    });

    // Audit log failure
    void writeAudit({
      actor: { userId: null },
      action: AUDIT_ACTIONS.SYSTEM_SOCIAL_POST_FAILED,
      entityType: "SocialPost",
      entityId: post.id,
      metadata: {
        error: errorMessage,
        attemptNumber,
        markedAsFailed: newStatus === "FAILED",
      },
    });

    console.error(`Failed to publish post ${post.id}:`, errorMessage);

    return {
      postId: post.id,
      success: false,
      error: errorMessage,
    };
  }
}
