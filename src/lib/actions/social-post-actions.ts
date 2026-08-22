"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma, type SocialPostStatus, type SocialContentTheme, type SocialPlatform, type UserRole } from "@prisma/client";
import { requireAdminRole } from "@/lib/admin/auth";
import { prisma } from "@/lib/db";
import { writeAudit, AUDIT_ACTIONS } from "@/lib/audit/audit-log";

const SOCIAL_POSTS_PATH = "/admin/social";

function revalidateSocialPaths() {
  revalidatePath(SOCIAL_POSTS_PATH);
  revalidatePath(SOCIAL_POSTS_PATH, "layout");
  revalidatePath("/admin/social/calendar");
  revalidatePath("/admin/social/drafts");
  revalidatePath("/admin/social/pending");
  revalidatePath("/admin/social/published");
}

function formatActionError(e: unknown): string {
  if (e instanceof z.ZodError) {
    return e.issues.map((i) => `${i.path.join(".") || "field"}: ${i.message}`).join("; ");
  }
  if (e instanceof Error) {
    return e.message;
  }
  return "Something went wrong.";
}

const createPostSchema = z.object({
  content: z.string().min(1, "Content is required").max(280, "Content exceeds 280 characters"),
  theme: z.enum([
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
  ] as const),
  scheduledAt: z.string().optional(),
  isThread: z.boolean().optional(),
  threadContent: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isAiGenerated: z.boolean().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

export type CreatePostResult =
  | { success: true; postId: string }
  | { success: false; error: string };

export async function createSocialPost(input: CreatePostInput): Promise<CreatePostResult> {
  const { userId, email, role } = await requireAdminRole();

  try {
    const data = createPostSchema.parse(input);

    const post = await prisma.socialPost.create({
      data: {
        content: data.content,
        theme: data.theme as SocialContentTheme,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        isThread: data.isThread ?? false,
        threadContent: data.threadContent ?? undefined,
        tags: data.tags ?? undefined,
        isAiGenerated: data.isAiGenerated ?? false,
        createdById: userId,
        status: "DRAFT",
      },
    });

    await writeAudit({
      actor: { userId, email, role: role as UserRole },
      action: AUDIT_ACTIONS.ADMIN_SOCIAL_POST_CREATED,
      entityType: "SocialPost",
      entityId: post.id,
      metadata: { theme: data.theme, scheduledAt: data.scheduledAt },
    });

    revalidateSocialPaths();

    return { success: true, postId: post.id };
  } catch (e) {
    return { success: false, error: formatActionError(e) };
  }
}

const updatePostSchema = z.object({
  postId: z.string().min(1),
  content: z.string().min(1, "Content is required").max(280, "Content exceeds 280 characters").optional(),
  theme: z.enum([
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
  ] as const).optional(),
  scheduledAt: z.string().nullable().optional(),
  isThread: z.boolean().optional(),
  threadContent: z.array(z.string()).nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
});

export type UpdatePostInput = z.infer<typeof updatePostSchema>;

export type UpdatePostResult =
  | { success: true }
  | { success: false; error: string };

export async function updateSocialPost(input: UpdatePostInput): Promise<UpdatePostResult> {
  const { userId, email, role } = await requireAdminRole();

  try {
    const data = updatePostSchema.parse(input);

    const existingPost = await prisma.socialPost.findUnique({
      where: { id: data.postId },
      select: { status: true },
    });

    if (!existingPost) {
      return { success: false, error: "Post not found" };
    }

    if (!["DRAFT", "PENDING_REVIEW", "REJECTED"].includes(existingPost.status)) {
      return { success: false, error: "Cannot edit post in current status" };
    }

    const updateData: Prisma.SocialPostUpdateInput = {};
    if (data.content) updateData.content = data.content;
    if (data.theme) updateData.theme = data.theme as SocialContentTheme;
    if (data.scheduledAt !== undefined) {
      updateData.scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;
    }
    if (data.isThread !== undefined) updateData.isThread = data.isThread;
    if (data.threadContent !== undefined) {
      updateData.threadContent = data.threadContent ?? Prisma.JsonNull;
    }
    if (data.tags !== undefined) {
      updateData.tags = data.tags ?? Prisma.JsonNull;
    }

    await prisma.socialPost.update({
      where: { id: data.postId },
      data: updateData,
    });

    await writeAudit({
      actor: { userId, email, role: role as UserRole },
      action: AUDIT_ACTIONS.ADMIN_SOCIAL_POST_UPDATED,
      entityType: "SocialPost",
      entityId: data.postId,
    });

    revalidateSocialPaths();

    return { success: true };
  } catch (e) {
    return { success: false, error: formatActionError(e) };
  }
}

export type SubmitForReviewResult =
  | { success: true }
  | { success: false; error: string };

export async function submitPostForReview(postId: string): Promise<SubmitForReviewResult> {
  const { userId, email, role } = await requireAdminRole();

  try {
    const post = await prisma.socialPost.findUnique({
      where: { id: postId },
      select: { status: true, content: true },
    });

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    if (post.status !== "DRAFT" && post.status !== "REJECTED") {
      return { success: false, error: "Only draft or rejected posts can be submitted for review" };
    }

    await prisma.socialPost.update({
      where: { id: postId },
      data: {
        status: "PENDING_REVIEW",
        rejectionReason: null,
        rejectedById: null,
        rejectedAt: null,
      },
    });

    await writeAudit({
      actor: { userId, email, role: role as UserRole },
      action: AUDIT_ACTIONS.ADMIN_SOCIAL_POST_SUBMITTED,
      entityType: "SocialPost",
      entityId: postId,
    });

    revalidateSocialPaths();

    return { success: true };
  } catch (e) {
    return { success: false, error: formatActionError(e) };
  }
}

export type ApprovePostResult =
  | { success: true }
  | { success: false; error: string };

export async function approvePost(postId: string): Promise<ApprovePostResult> {
  const { userId, email, role } = await requireAdminRole();

  try {
    const post = await prisma.socialPost.findUnique({
      where: { id: postId },
      select: { status: true },
    });

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    if (post.status !== "PENDING_REVIEW") {
      return { success: false, error: "Only posts pending review can be approved" };
    }

    await prisma.socialPost.update({
      where: { id: postId },
      data: {
        status: "APPROVED",
        approvedById: userId,
        approvedAt: new Date(),
      },
    });

    await writeAudit({
      actor: { userId, email, role: role as UserRole },
      action: AUDIT_ACTIONS.ADMIN_SOCIAL_POST_APPROVED,
      entityType: "SocialPost",
      entityId: postId,
    });

    revalidateSocialPaths();

    return { success: true };
  } catch (e) {
    return { success: false, error: formatActionError(e) };
  }
}

const rejectPostSchema = z.object({
  postId: z.string().min(1),
  reason: z.string().min(1, "Rejection reason is required"),
});

export type RejectPostInput = z.infer<typeof rejectPostSchema>;

export type RejectPostResult =
  | { success: true }
  | { success: false; error: string };

export async function rejectPost(input: RejectPostInput): Promise<RejectPostResult> {
  const { userId, email, role } = await requireAdminRole();

  try {
    const data = rejectPostSchema.parse(input);

    const post = await prisma.socialPost.findUnique({
      where: { id: data.postId },
      select: { status: true },
    });

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    if (post.status !== "PENDING_REVIEW") {
      return { success: false, error: "Only posts pending review can be rejected" };
    }

    await prisma.socialPost.update({
      where: { id: data.postId },
      data: {
        status: "REJECTED",
        rejectionReason: data.reason,
        rejectedById: userId,
        rejectedAt: new Date(),
      },
    });

    await writeAudit({
      actor: { userId, email, role: role as UserRole },
      action: AUDIT_ACTIONS.ADMIN_SOCIAL_POST_REJECTED,
      entityType: "SocialPost",
      entityId: data.postId,
      metadata: { reason: data.reason },
    });

    revalidateSocialPaths();

    return { success: true };
  } catch (e) {
    return { success: false, error: formatActionError(e) };
  }
}

export type CancelPostResult =
  | { success: true }
  | { success: false; error: string };

export async function cancelPost(postId: string): Promise<CancelPostResult> {
  const { userId, email, role } = await requireAdminRole();

  try {
    const post = await prisma.socialPost.findUnique({
      where: { id: postId },
      select: { status: true },
    });

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    if (post.status === "PUBLISHED") {
      return { success: false, error: "Cannot cancel a published post" };
    }

    await prisma.socialPost.update({
      where: { id: postId },
      data: { status: "CANCELLED" },
    });

    await writeAudit({
      actor: { userId, email, role: role as UserRole },
      action: AUDIT_ACTIONS.ADMIN_SOCIAL_POST_CANCELLED,
      entityType: "SocialPost",
      entityId: postId,
    });

    revalidateSocialPaths();

    return { success: true };
  } catch (e) {
    return { success: false, error: formatActionError(e) };
  }
}

export type DeletePostResult =
  | { success: true }
  | { success: false; error: string };

export async function deleteSocialPost(postId: string): Promise<DeletePostResult> {
  const { userId, email, role } = await requireAdminRole();

  try {
    const post = await prisma.socialPost.findUnique({
      where: { id: postId },
      select: { status: true },
    });

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    if (post.status === "PUBLISHED") {
      return { success: false, error: "Cannot delete a published post" };
    }

    await prisma.socialPost.delete({
      where: { id: postId },
    });

    await writeAudit({
      actor: { userId, email, role: role as UserRole },
      action: AUDIT_ACTIONS.ADMIN_SOCIAL_POST_DELETED,
      entityType: "SocialPost",
      entityId: postId,
    });

    revalidateSocialPaths();

    return { success: true };
  } catch (e) {
    return { success: false, error: formatActionError(e) };
  }
}

export type SocialPostSummary = {
  id: string;
  content: string;
  status: SocialPostStatus;
  theme: SocialContentTheme;
  platform: SocialPlatform;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  platformPostUrl: string | null;
  publishError: string | null;
  createdAt: Date;
  createdBy: { id: string; name: string | null } | null;
  approvedBy: { id: string; name: string | null } | null;
  approvedAt: Date | null;
  rejectionReason: string | null;
};

export type GetPostsResult =
  | { success: true; posts: SocialPostSummary[] }
  | { success: false; error: string };

export async function getSocialPosts(filter?: {
  status?: SocialPostStatus | SocialPostStatus[];
  theme?: SocialContentTheme;
  limit?: number;
}): Promise<GetPostsResult> {
  await requireAdminRole();

  try {
    const whereClause: Prisma.SocialPostWhereInput = {};

    if (filter?.status) {
      whereClause.status = Array.isArray(filter.status)
        ? { in: filter.status }
        : filter.status;
    }

    if (filter?.theme) {
      whereClause.theme = filter.theme;
    }

    const posts = await prisma.socialPost.findMany({
      where: whereClause,
      orderBy: [
        { scheduledAt: "asc" },
        { createdAt: "desc" },
      ],
      take: filter?.limit ?? 100,
      select: {
        id: true,
        content: true,
        status: true,
        theme: true,
        platform: true,
        scheduledAt: true,
        publishedAt: true,
        platformPostUrl: true,
        publishError: true,
        createdAt: true,
        approvedAt: true,
        rejectionReason: true,
        createdBy: {
          select: { id: true, name: true },
        },
        approvedBy: {
          select: { id: true, name: true },
        },
      },
    });

    return { success: true, posts };
  } catch (e) {
    return { success: false, error: formatActionError(e) };
  }
}

export type GetPostResult =
  | { success: true; post: SocialPostSummary & { threadContent: string[] | null; tags: string[] | null; isThread: boolean } }
  | { success: false; error: string };

export async function getSocialPost(postId: string): Promise<GetPostResult> {
  await requireAdminRole();

  try {
    const post = await prisma.socialPost.findUnique({
      where: { id: postId },
      select: {
        id: true,
        content: true,
        status: true,
        theme: true,
        platform: true,
        scheduledAt: true,
        publishedAt: true,
        platformPostUrl: true,
        publishError: true,
        createdAt: true,
        approvedAt: true,
        rejectionReason: true,
        threadContent: true,
        tags: true,
        isThread: true,
        createdBy: {
          select: { id: true, name: true },
        },
        approvedBy: {
          select: { id: true, name: true },
        },
      },
    });

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    return {
      success: true,
      post: {
        ...post,
        threadContent: post.threadContent as string[] | null,
        tags: post.tags as string[] | null,
      },
    };
  } catch (e) {
    return { success: false, error: formatActionError(e) };
  }
}

export type CalendarPost = {
  id: string;
  content: string;
  status: SocialPostStatus;
  theme: SocialContentTheme;
  scheduledAt: Date | null;
  publishedAt: Date | null;
};

export type GetCalendarPostsResult =
  | { success: true; posts: CalendarPost[] }
  | { success: false; error: string };

export async function getCalendarPosts(
  startDate: Date,
  endDate: Date
): Promise<GetCalendarPostsResult> {
  await requireAdminRole();

  try {
    const posts = await prisma.socialPost.findMany({
      where: {
        OR: [
          {
            scheduledAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            publishedAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        ],
        status: {
          in: ["APPROVED", "PUBLISHED", "PENDING_REVIEW"],
        },
      },
      orderBy: { scheduledAt: "asc" },
      select: {
        id: true,
        content: true,
        status: true,
        theme: true,
        scheduledAt: true,
        publishedAt: true,
      },
    });

    return { success: true, posts };
  } catch (e) {
    return { success: false, error: formatActionError(e) };
  }
}

export type PostStats = {
  total: number;
  byStatus: Record<SocialPostStatus, number>;
  byTheme: Record<SocialContentTheme, number>;
  publishedThisMonth: number;
  scheduledUpcoming: number;
};

export type GetPostStatsResult =
  | { success: true; stats: PostStats }
  | { success: false; error: string };

export async function getPostStats(): Promise<GetPostStatsResult> {
  await requireAdminRole();

  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, byStatus, byTheme, publishedThisMonth, scheduledUpcoming] = await Promise.all([
      prisma.socialPost.count(),
      prisma.socialPost.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.socialPost.groupBy({
        by: ["theme"],
        _count: true,
      }),
      prisma.socialPost.count({
        where: {
          status: "PUBLISHED",
          publishedAt: { gte: monthStart },
        },
      }),
      prisma.socialPost.count({
        where: {
          status: "APPROVED",
          scheduledAt: { gte: now },
        },
      }),
    ]);

    const statusCounts = Object.fromEntries(
      byStatus.map((s) => [s.status, s._count])
    ) as Record<SocialPostStatus, number>;

    const themeCounts = Object.fromEntries(
      byTheme.map((t) => [t.theme, t._count])
    ) as Record<SocialContentTheme, number>;

    return {
      success: true,
      stats: {
        total,
        byStatus: statusCounts,
        byTheme: themeCounts,
        publishedThisMonth,
        scheduledUpcoming,
      },
    };
  } catch (e) {
    return { success: false, error: formatActionError(e) };
  }
}
