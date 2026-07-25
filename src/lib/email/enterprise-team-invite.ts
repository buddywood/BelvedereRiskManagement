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
  loginUrl: string;
  tempPassword: string;
  /** Optional custom "from" email address from enterprise branding. */
  clientEmailFromAddress?: string | null;
  /** Optional branding for white-label email styling. */
  branding?: WhiteLabelEmailBranding | null;
};

function renderCredentialsPanel(email: string, tempPassword: string): string {
  const safeEmail = escapeHtml(email);
  const safePassword = escapeHtml(tempPassword);

  return `
    <div style="margin:24px 0;padding:20px;background-color:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
      <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Your login credentials</p>
      <p style="margin:12px 0 6px;font-size:14px;color:#334155;"><strong style="color:#0f172a;">Email:</strong><br />
        <span style="font-family:Monaco,Menlo,monospace;font-size:14px;color:#0f172a;">${safeEmail}</span></p>
      <p style="margin:0;font-size:14px;color:#334155;"><strong style="color:#0f172a;">Temporary Password:</strong><br />
        <span style="font-family:Monaco,Menlo,monospace;font-size:14px;color:#0f172a;">${safePassword}</span></p>
    </div>`;
}

function renderSecurityNotice(): string {
  return `
    <div style="margin:24px 0;padding:16px;background-color:#fef3c7;border-radius:8px;border:1px solid #fbbf24;">
      <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#92400e;text-transform:uppercase;letter-spacing:0.05em;">Security Notice</p>
      <p style="margin:8px 0 0;font-size:14px;color:#78350f;">You will be required to change your password when you first sign in. This temporary password is valid for 7 days.</p>
    </div>`;
}

export async function sendEnterpriseTeamInviteEmail(
  input: SendEnterpriseTeamInviteEmailInput
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.info("[enterprise-team] invite email skipped (RESEND_API_KEY missing)", {
      inviteeEmail: input.inviteeEmail,
      loginUrl: input.loginUrl,
    });
    return { success: true };
  }

  const branding: WhiteLabelEmailBranding | null = input.branding ?? (input.enterpriseName ? { brandName: input.enterpriseName } : null);
  
  const subject = formatEmailSubject(`Welcome to ${input.enterpriseName} - Your Account is Ready`);
  const bodyHtml = `
    ${renderWhiteLabelEmailHeadline("You're invited to join the team", branding)}
    <p style="margin:0 0 16px;">Hello,</p>
    <p style="margin:0 0 16px;">You have been invited to join <strong>${escapeHtml(input.enterpriseName)}</strong> as ${escapeHtml(input.roleLabel)}.</p>
    <p style="margin:0 0 8px;">${escapeHtml(input.inviterName)} sent this invitation. Your account is ready — sign in using the credentials below to get started.</p>
    ${renderCredentialsPanel(input.inviteeEmail, input.tempPassword)}
    <p style="margin:0 0 8px;font-size:14px;color:#334155;"><strong>How to get started:</strong></p>
    <ol style="margin:0 0 24px;padding-left:20px;color:#334155;font-size:14px;">
      <li style="margin-bottom:8px;">Click the button below to go to the sign-in page</li>
      <li style="margin-bottom:8px;">Enter your email and temporary password</li>
      <li style="margin-bottom:8px;">Create a new secure password when prompted</li>
      <li>Start using your firm workspace</li>
    </ol>
    ${renderWhiteLabelEmailCta("Sign In Now", input.loginUrl, branding)}
    ${renderWhiteLabelEmailUrlFallback(input.loginUrl)}
    ${renderSecurityNotice()}
  `;

  const html = wrapWhiteLabelEmailContent({
    documentTitle: `Welcome to ${input.enterpriseName}`,
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
