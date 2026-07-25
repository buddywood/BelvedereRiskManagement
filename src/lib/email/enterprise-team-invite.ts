import "server-only";

import { Resend } from "resend";

import { escapeHtml } from "@/lib/escape-html";
import { resolveFromEmail, resolveWhiteLabelFromEmail } from "@/lib/email/resolve-from-email";
import { formatEmailSubject } from "@/lib/email/format-email-subject";
import {
  wrapWhiteLabelEmailContent,
  renderWhiteLabelEmailHeadline,
  renderWhiteLabelEmailCta,
  renderWhiteLabelEmailUrlFallback,
  type WhiteLabelEmailBranding,
} from "@/lib/email/white-label-email-layout";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export type SendEnterpriseTeamInviteEmailInput = {
  inviteeEmail: string;
  enterpriseName: string;
  inviterName: string;
  roleLabel: string;
  inviteUrl: string;
  /** Optional custom "from" email address from enterprise branding. */
  clientEmailFromAddress?: string | null;
  /** Optional branding for white-label email styling. */
  branding?: WhiteLabelEmailBranding | null;
};

export async function sendEnterpriseTeamInviteEmail(
  input: SendEnterpriseTeamInviteEmailInput
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.info("[enterprise-team] invite email skipped (RESEND_API_KEY missing)", {
      inviteeEmail: input.inviteeEmail,
      inviteUrl: input.inviteUrl,
    });
    return { success: true };
  }

  const branding: WhiteLabelEmailBranding | null = input.branding ?? (input.enterpriseName ? { brandName: input.enterpriseName } : null);
  
  const subject = formatEmailSubject(`Join ${input.enterpriseName} on AkiliRisk`);
  const bodyHtml = `
    ${renderWhiteLabelEmailHeadline("You're invited to join the team", branding)}
    <p style="margin:0 0 16px;">Hello,</p>
    <p style="margin:0 0 16px;">You have been invited to join <strong>${escapeHtml(input.enterpriseName)}</strong> as ${escapeHtml(input.roleLabel)}.</p>
    <p style="margin:0 0 24px;">${escapeHtml(input.inviterName)} sent this invitation.</p>
    ${renderWhiteLabelEmailCta("Accept Invitation", input.inviteUrl, branding)}
    ${renderWhiteLabelEmailUrlFallback(input.inviteUrl)}
    <p style="margin:24px 0 0;font-size:14px;color:#64748b;">This invitation link expires in 7 days.</p>
  `;

  const html = wrapWhiteLabelEmailContent({
    documentTitle: `Join ${input.enterpriseName}`,
    bodyHtml,
    branding,
  });

  const fromAddress = input.clientEmailFromAddress
    ? resolveWhiteLabelFromEmail(
        { clientEmailFromAddress: input.clientEmailFromAddress, brandName: input.enterpriseName },
        input.enterpriseName,
      )
    : resolveFromEmail();

  try {
    await resend.emails.send({
      from: fromAddress,
      to: input.inviteeEmail,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("[enterprise-team] failed to send invite email", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send invitation email",
    };
  }
}
