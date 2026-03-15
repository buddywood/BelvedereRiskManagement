import "server-only";

import { Resend } from "resend";

const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";

interface AdvisorInfo {
  advisorName: string;
  advisorJobTitle: string;
  advisorFirmName: string;
  advisorEmail: string;
  advisorPhone: string;
  advisorLicenseNumber: string;
  advisorLogoUrl?: string;
}

interface InvitationTemplateData {
  advisorName: string;
  advisorJobTitle: string;
  advisorFirmName: string;
  advisorEmail: string;
  advisorPhone: string;
  advisorLicenseNumber: string;
  advisorLogoUrl?: string;
  personalMessage: string;
  invitationUrl: string;
  clientName?: string;
}

interface SendInvitationData {
  clientEmail: string;
  advisorInfo: AdvisorInfo;
  personalMessage: string;
  invitationUrl: string;
  clientName?: string;
}

/**
 * Escapes HTML special characters to prevent XSS
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Validates logo URL (must be HTTPS)
 */
function isValidLogoUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Renders the branded invitation email template
 */
export function renderInvitationTemplate(data: InvitationTemplateData): string {
  const {
    advisorName,
    advisorJobTitle,
    advisorFirmName,
    advisorEmail,
    advisorPhone,
    advisorLicenseNumber,
    advisorLogoUrl,
    personalMessage,
    invitationUrl,
    clientName,
  } = data;

  // Sanitize user inputs
  const safeAdvisorName = escapeHtml(advisorName);
  const safeAdvisorJobTitle = escapeHtml(advisorJobTitle);
  const safeAdvisorFirmName = escapeHtml(advisorFirmName);
  const safeAdvisorEmail = escapeHtml(advisorEmail);
  const safeAdvisorPhone = escapeHtml(advisorPhone);
  const safeAdvisorLicenseNumber = escapeHtml(advisorLicenseNumber);
  const safePersonalMessage = escapeHtml(personalMessage);
  const safeClientName = clientName ? escapeHtml(clientName) : null;

  // Validate and sanitize logo URL
  const logoHtml = advisorLogoUrl && isValidLogoUrl(advisorLogoUrl)
    ? `<img src="${escapeHtml(advisorLogoUrl)}" alt="${safeAdvisorFirmName} Logo" style="max-height: 60px; display: block;">`
    : '';

  const greeting = safeClientName ? `Dear ${safeClientName},` : 'Dear there,';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
          <!-- Header with Logo -->
          ${logoHtml ? `<div style="margin-bottom: 24px;">${logoHtml}</div>` : ''}

          <!-- Greeting -->
          <p style="margin: 16px 0; font-size: 16px;">
            ${greeting}
          </p>

          <!-- Personal Message -->
          <div style="margin: 24px 0; padding: 16px; background: white; border-radius: 6px; border-left: 4px solid #18181b;">
            <p style="margin: 0; font-style: italic;">
              ${safePersonalMessage}
            </p>
          </div>

          <!-- Call to Action -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${invitationUrl}" style="display: inline-block; background: #18181b; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 500;">
              Get Started
            </a>
          </div>

          <!-- Fallback URL -->
          <p style="margin: 16px 0; font-size: 14px; color: #666;">
            Or copy and paste this URL into your browser:
          </p>
          <p style="margin: 8px 0; font-size: 14px; word-break: break-all;">
            <a href="${invitationUrl}" style="color: #18181b;">${invitationUrl}</a>
          </p>

          <!-- Divider -->
          <hr style="border: none; border-top: 1px solid #ddd; margin: 32px 0;">

          <!-- Advisor Signature Block -->
          <div style="margin: 24px 0;">
            <p style="margin: 8px 0; font-size: 16px;">
              <strong>${safeAdvisorName}</strong>
            </p>
            <p style="margin: 4px 0; color: #666;">
              ${safeAdvisorJobTitle} at ${safeAdvisorFirmName}
            </p>
            <p style="margin: 4px 0; color: #666;">
              <a href="mailto:${safeAdvisorEmail}" style="color: #18181b;">${safeAdvisorEmail}</a>
            </p>
            <p style="margin: 4px 0; color: #666;">
              ${safeAdvisorPhone}
            </p>
            <p style="margin: 4px 0; color: #666; font-size: 14px;">
              License: ${safeAdvisorLicenseNumber}
            </p>
          </div>

          <!-- Footer -->
          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #ddd;">
            ${logoHtml ? `<div style="margin-bottom: 12px;">${logoHtml}</div>` : ''}
            <p style="margin: 8px 0; font-size: 12px; color: #666;">
              This invitation link will expire in 7 days. If you have any questions, please contact ${safeAdvisorName} directly.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Sends branded advisor invitation email via Resend
 */
export async function sendAdvisorInvitationEmail(data: SendInvitationData): Promise<void> {
  try {
    // Initialize Resend client at runtime (not module load time)
    // to avoid build-time errors when RESEND_API_KEY is not set
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY not configured - email will not be sent");
      return;
    }

    const resend = new Resend(apiKey);

    // Render the email template
    const htmlContent = renderInvitationTemplate({
      ...data.advisorInfo,
      personalMessage: data.personalMessage,
      invitationUrl: data.invitationUrl,
      clientName: data.clientName,
    });

    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.clientEmail,
      subject: `Invitation from ${data.advisorInfo.advisorName} - Family Governance Assessment`,
      html: htmlContent,
    });
  } catch (error) {
    // Log error but don't throw - prevents blocking the invitation flow
    // In production, use proper logging service (e.g., Sentry)
    console.error("Failed to send advisor invitation email:", error);
  }
}