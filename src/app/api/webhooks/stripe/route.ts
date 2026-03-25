import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { getInvoiceSubscriptionId } from "@/lib/billing/stripe-invoice";
import {
  appendSubscriptionAuditLog,
  upsertSubscriptionFromStripe,
} from "@/lib/billing/subscription-service";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

async function resolveUserIdForSubscription(
  sub: Stripe.Subscription
): Promise<string | null> {
  if (typeof sub.metadata?.userId === "string" && sub.metadata.userId.length > 0) {
    return sub.metadata.userId;
  }
  const row = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: sub.id },
    select: { userId: true },
  });
  return row?.userId ?? null;
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;
        const userId = session.client_reference_id ?? session.metadata?.userId;
        const customerIdRaw = session.customer;
        const customerId =
          typeof customerIdRaw === "string"
            ? customerIdRaw
            : customerIdRaw && typeof customerIdRaw === "object" && "id" in customerIdRaw
              ? (customerIdRaw as { id: string }).id
              : null;
        const subRef = session.subscription;
        const subId =
          typeof subRef === "string"
            ? subRef
            : subRef && typeof subRef === "object" && "id" in subRef
              ? (subRef as { id: string }).id
              : null;
        if (!userId || !customerId || !subId) break;

        const stripe = getStripe();
        const sub = await stripe.subscriptions.retrieve(subId, {
          expand: ["latest_invoice"],
        });
        await upsertSubscriptionFromStripe(userId, sub, customerId);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerIdRaw = sub.customer;
        const customerId =
          typeof customerIdRaw === "string"
            ? customerIdRaw
            : customerIdRaw && typeof customerIdRaw === "object" && "id" in customerIdRaw
              ? (customerIdRaw as { id: string }).id
              : null;
        if (!customerId) break;

        const userId = await resolveUserIdForSubscription(sub);
        if (!userId) break;

        await upsertSubscriptionFromStripe(userId, sub, customerId);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = getInvoiceSubscriptionId(invoice);
        if (!subId) break;

        const stripe = getStripe();
        const sub = await stripe.subscriptions.retrieve(subId, {
          expand: ["latest_invoice"],
        });
        const customerIdRaw = sub.customer;
        const customerId =
          typeof customerIdRaw === "string"
            ? customerIdRaw
            : customerIdRaw && typeof customerIdRaw === "object" && "id" in customerIdRaw
              ? (customerIdRaw as { id: string }).id
              : null;
        if (!customerId) break;

        const userId = await resolveUserIdForSubscription(sub);
        if (!userId) break;

        const row = await upsertSubscriptionFromStripe(userId, sub, customerId);
        await appendSubscriptionAuditLog(prisma, row.id, "payment_failed", {
          metadata: {
            invoiceId: invoice.id,
            amountDue: invoice.amount_due,
          },
        });
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = getInvoiceSubscriptionId(invoice);
        if (!subId) break;

        const stripe = getStripe();
        const sub = await stripe.subscriptions.retrieve(subId, {
          expand: ["latest_invoice"],
        });
        const customerIdRaw = sub.customer;
        const customerId =
          typeof customerIdRaw === "string"
            ? customerIdRaw
            : customerIdRaw && typeof customerIdRaw === "object" && "id" in customerIdRaw
              ? (customerIdRaw as { id: string }).id
              : null;
        if (!customerId) break;

        const userId = await resolveUserIdForSubscription(sub);
        if (!userId) break;

        await upsertSubscriptionFromStripe(userId, sub, customerId);
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error("Stripe webhook handler error:", e);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
