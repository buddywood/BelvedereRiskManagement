"use server";

import type { BillingCycle, SubscriptionTier } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdvisorRole, getAdvisorProfileOrThrow } from "@/lib/advisor/auth";
import { isBillingEnabled } from "@/lib/billing/config";
import { TIER_LIMITS } from "@/lib/billing/constants";
import {
  checkClientLimitForAdvisorProfile,
  upsertSubscriptionFromStripe,
  validateCheckoutPrice,
} from "@/lib/billing/subscription-service";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

const checkoutSchema = z.object({
  tier: z.enum(["STARTER", "GROWTH", "PROFESSIONAL"]),
  billingCycle: z.enum(["MONTHLY", "ANNUAL"]),
});

function appBaseUrl(): string {
  const base =
    process.env.AUTH_URL ||
    process.env.NEXT_PUBLIC_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";
  return base.replace(/\/$/, "");
}

export type BillingActionError = { success: false; error: string };
export type BillingCheckoutResult =
  | { success: true; url: string }
  | BillingActionError;
export type BillingPortalResult =
  | { success: true; url: string }
  | BillingActionError;

export type SwitchPlanResult = { success: true } | BillingActionError;

/**
 * Change an existing Stripe subscription's price (upgrade, downgrade, or monthly/annual switch).
 * Uses proration; does not apply when there is no active Stripe subscription (use Checkout instead).
 */
export async function switchSubscriptionPlan(
  input: unknown
): Promise<SwitchPlanResult> {
  try {
    if (!isBillingEnabled()) {
      return { success: false, error: "Billing is disabled." };
    }
    const { userId } = await requireAdvisorRole();
    await getAdvisorProfileOrThrow(userId);

    const parsed = checkoutSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Invalid plan selection." };
    }

    const { tier, billingCycle } = parsed.data;
    const tierEnum = tier as SubscriptionTier;
    const cycleEnum = billingCycle as BillingCycle;

    const row = await prisma.subscription.findUnique({
      where: { userId },
    });
    if (!row?.stripeSubscriptionId || !row.stripeCustomerId) {
      return {
        success: false,
        error: "No active Stripe subscription to update. Use Subscribe to add a plan.",
      };
    }

    const priceId = validateCheckoutPrice(tierEnum, cycleEnum);
    const stripe = getStripe();

    const stripeSub = await stripe.subscriptions.retrieve(row.stripeSubscriptionId, {
      expand: ["items.data"],
    });

    if (stripeSub.status === "canceled") {
      return {
        success: false,
        error: "This subscription has ended. Choose a plan to subscribe again.",
      };
    }

    const itemId = stripeSub.items.data[0]?.id;
    if (!itemId) {
      return { success: false, error: "Could not read subscription items from Stripe." };
    }

    const nextMeta: Record<string, string> = {
      ...(stripeSub.metadata ?? {}),
    };
    nextMeta.userId = userId;
    nextMeta.tier = tierEnum;
    nextMeta.billing_cycle = cycleEnum;

    const updated = await stripe.subscriptions.update(row.stripeSubscriptionId, {
      items: [{ id: itemId, price: priceId }],
      proration_behavior: "create_prorations",
      metadata: nextMeta,
    });

    await upsertSubscriptionFromStripe(userId, updated, row.stripeCustomerId);
    revalidatePath("/advisor/billing");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Plan change failed";
    return { success: false, error: message };
  }
}

export async function createCheckoutSession(
  input: unknown
): Promise<BillingCheckoutResult> {
  try {
    if (!isBillingEnabled()) {
      return { success: false, error: "Billing is disabled." };
    }
    const { userId } = await requireAdvisorRole();
    const profile = await getAdvisorProfileOrThrow(userId);

    const parsed = checkoutSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Invalid plan selection." };
    }

    const { tier, billingCycle } = parsed.data;
    const priceId = validateCheckoutPrice(
      tier as SubscriptionTier,
      billingCycle as BillingCycle
    );

    const existing = await prisma.subscription.findUnique({
      where: { userId },
    });

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appBaseUrl()}/advisor/billing?checkout=success`,
      cancel_url: `${appBaseUrl()}/advisor/billing?checkout=cancel`,
      client_reference_id: userId,
      metadata: {
        userId,
        tier,
        billing_cycle: billingCycle,
      },
      subscription_data: {
        metadata: {
          userId,
          tier,
          billing_cycle: billingCycle,
        },
      },
      ...(existing?.stripeCustomerId
        ? { customer: existing.stripeCustomerId }
        : { customer_email: profile.user.email ?? undefined }),
    });

    if (!session.url) {
      return { success: false, error: "Could not start checkout session." };
    }

    return { success: true, url: session.url };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Checkout failed";
    return { success: false, error: message };
  }
}

export async function createPortalSession(): Promise<BillingPortalResult> {
  try {
    if (!isBillingEnabled()) {
      return { success: false, error: "Billing is disabled." };
    }
    const { userId } = await requireAdvisorRole();
    await getAdvisorProfileOrThrow(userId);

    const sub = await prisma.subscription.findUnique({
      where: { userId },
      select: { stripeCustomerId: true },
    });
    if (!sub?.stripeCustomerId) {
      return {
        success: false,
        error: "No Stripe customer on file. Subscribe first to manage billing.",
      };
    }

    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${appBaseUrl()}/advisor/billing`,
    });

    return { success: true, url: session.url };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Portal session failed";
    return { success: false, error: message };
  }
}

export type SubscriptionDetailsDTO = {
  tier: SubscriptionTier;
  status: string;
  clientLimit: number;
  billingCycle: BillingCycle;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentClientCount: number;
  canAddClient: boolean;
};

export async function getSubscriptionDetails(): Promise<
  | { success: true; data: SubscriptionDetailsDTO | null }
  | BillingActionError
> {
  try {
    const { userId } = await requireAdvisorRole();
    const profile = await getAdvisorProfileOrThrow(userId);

    const sub = await prisma.subscription.findUnique({
      where: { userId },
    });

    const limitCheck = await checkClientLimitForAdvisorProfile(profile.id);

    if (!sub) {
      return {
        success: true,
        data: {
          tier: "STARTER",
          status: "NONE",
          clientLimit: TIER_LIMITS.STARTER,
          billingCycle: "MONTHLY",
          currentPeriodEnd: new Date().toISOString(),
          cancelAtPeriodEnd: false,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          currentClientCount: limitCheck.currentCount,
          canAddClient: limitCheck.canAddClient,
        },
      };
    }

    return {
      success: true,
      data: {
        tier: sub.tier,
        status: sub.status,
        clientLimit: sub.clientLimit,
        billingCycle: sub.billingCycle,
        currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
        stripeCustomerId: sub.stripeCustomerId,
        stripeSubscriptionId: sub.stripeSubscriptionId,
        currentClientCount: limitCheck.currentCount,
        canAddClient: limitCheck.canAddClient,
      },
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load subscription";
    return { success: false, error: message };
  }
}

export type BillingInvoiceDTO = {
  id: string;
  number: string | null;
  status: string | null;
  amountPaid: number;
  currency: string;
  created: string;
  pdfUrl: string | null;
  hostedUrl: string | null;
};

export async function getBillingHistory(): Promise<
  { success: true; data: BillingInvoiceDTO[] } | BillingActionError
> {
  try {
    if (!isBillingEnabled()) {
      return { success: true, data: [] };
    }
    const { userId } = await requireAdvisorRole();
    await getAdvisorProfileOrThrow(userId);

    const sub = await prisma.subscription.findUnique({
      where: { userId },
      select: { stripeCustomerId: true },
    });
    if (!sub?.stripeCustomerId) {
      return { success: true, data: [] };
    }

    const stripe = getStripe();
    const invoices = await stripe.invoices.list({
      customer: sub.stripeCustomerId,
      limit: 24,
    });

    const data: BillingInvoiceDTO[] = invoices.data.map((inv) => ({
      id: inv.id,
      number: inv.number,
      status: inv.status,
      amountPaid: inv.amount_paid,
      currency: inv.currency,
      created: new Date((inv.created ?? 0) * 1000).toISOString(),
      pdfUrl: inv.invoice_pdf ?? null,
      hostedUrl: inv.hosted_invoice_url ?? null,
    }));

    return { success: true, data };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load invoices";
    return { success: false, error: message };
  }
}
