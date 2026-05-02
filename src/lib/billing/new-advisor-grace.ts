import { addDays } from "date-fns";

/** Policy window for completing paid signup after admin creates an advisor account. */
export const NEW_ADVISOR_PAID_SIGNUP_DEADLINE_DAYS = 30;

/**
 * Built-in grace for an admin-created advisor: entitlement ends at the **first instant of the next
 * UTC calendar day** after `from` (00:00:00 UTC on the following date).
 */
export function newAdvisorGracePeriodEndsAt(from: Date = new Date()): Date {
  const y = from.getUTCFullYear();
  const m = from.getUTCMonth();
  const d = from.getUTCDate();
  return new Date(Date.UTC(y, m, d + 1, 0, 0, 0, 0));
}

export function newAdvisorPaidSignupDeadline(from: Date = new Date()): Date {
  return addDays(from, NEW_ADVISOR_PAID_SIGNUP_DEADLINE_DAYS);
}

/** Calendar fields in UTC (avoids server-local shifting grace / deadline labels). */
export function formatUtcCalendarDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatGracePeriodEndUtcLabel(date: Date): string {
  const datePart = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
  const hm = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  return `${datePart} at ${hm} UTC`;
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function buildNewAdvisorWelcomeEmailHtml(opts: {
  displayName: string;
  graceEndsAt: Date;
  paidSignupDeadline: Date;
  signInUrl: string;
  billingUrl: string;
  billingEnabled: boolean;
}): string {
  const name = escapeHtml(opts.displayName.trim() || "Advisor");
  const graceStr = formatGracePeriodEndUtcLabel(opts.graceEndsAt);
  const deadlineStr = formatUtcCalendarDate(opts.paidSignupDeadline);
  const signIn = escapeHtml(opts.signInUrl);
  const billing = escapeHtml(opts.billingUrl);
  const billingParagraph = opts.billingEnabled
    ? `<p style="margin:16px 0 0 0;line-height:1.5;">You must complete subscription checkout within <strong>${NEW_ADVISOR_PAID_SIGNUP_DEADLINE_DAYS} days</strong> (by <strong>${escapeHtml(deadlineStr)}</strong>). Use <a href="${billing}" style="color:#2563eb;">Billing</a> after you sign in.</p>`
    : `<p style="margin:16px 0 0 0;line-height:1.5;">When billing is enabled for your organization, you must complete subscription checkout within <strong>${NEW_ADVISOR_PAID_SIGNUP_DEADLINE_DAYS} days</strong> (by <strong>${escapeHtml(deadlineStr)}</strong>).</p>`;

  return `
<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;color:#111827;max-width:36rem;">
  <p style="margin:0 0 12px 0;">Hello ${name},</p>
  <p style="margin:0;line-height:1.5;">Your advisor account is ready. You are in a <strong>grace period</strong> for hub access until the start of the next UTC calendar day: <strong>${escapeHtml(graceStr)}</strong>.</p>
  ${billingParagraph}
  <p style="margin:16px 0 0 0;line-height:1.5;">Sign in: <a href="${signIn}" style="color:#2563eb;">${signIn}</a></p>
</body>
</html>`.trim();
}
