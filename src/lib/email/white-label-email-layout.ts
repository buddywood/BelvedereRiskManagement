import { escapeHtml } from "@/lib/escape-html";
import {
  PLATFORM_EMAIL_BRAND_BLUE,
  PLATFORM_EMAIL_BRAND_NAME,
  PLATFORM_EMAIL_CTA_BG,
  PLATFORM_EMAIL_HEADER_FALLBACK,
  PLATFORM_EMAIL_HEADER_GRADIENT,
  PLATFORM_EMAIL_TAGLINE,
  platformEmailCopyrightYear,
} from "@/lib/email/platform-brand";
import { PLATFORM_EMAIL_LOGO_CID } from "@/lib/email/platform-email-logo";

export type WhiteLabelEmailBranding = {
  brandName?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  tagline?: string | null;
  logoUrl?: string | null;
};

export type WhiteLabelEmailOptions = {
  documentTitle: string;
  bodyHtml: string;
  branding?: WhiteLabelEmailBranding | null;
  footerHtml?: string;
};

function renderBrandedInitialMark(brandName: string, primaryColor: string): string {
  const initial = brandName.trim().charAt(0).toUpperCase() || "A";
  return `<div style="margin:0 auto 14px;width:52px;height:52px;line-height:52px;border-radius:14px;background:${primaryColor};color:#ffffff;font-size:22px;font-weight:700;text-align:center;">${escapeHtml(initial)}</div>`;
}

function renderPlatformLogoBlock(): string {
  return `<img src="cid:${PLATFORM_EMAIL_LOGO_CID}" alt="${escapeHtml(PLATFORM_EMAIL_BRAND_NAME)}" width="220" height="74" style="display:block;margin:0 auto 12px;max-width:220px;height:auto;border:0;" />`;
}

function renderBrandedHeader(branding: WhiteLabelEmailBranding): string {
  const brandName = branding.brandName || PLATFORM_EMAIL_BRAND_NAME;
  const primaryColor = branding.primaryColor || "#1a1a2e";
  const secondaryColor = branding.secondaryColor || "#f5f5f5";

  return `
    <td style="background:${secondaryColor};padding:28px 20px 24px;text-align:center;border-radius:8px 8px 0 0;border-top:4px solid ${primaryColor};">
      ${renderBrandedInitialMark(brandName, primaryColor)}
      <h1 style="color:${primaryColor};margin:0;font-size:24px;font-weight:600;letter-spacing:-0.02em;">${escapeHtml(brandName)}</h1>
      ${branding.tagline ? `<p style="color:${primaryColor};margin:10px auto 0;font-size:15px;font-style:italic;opacity:0.82;max-width:28em;">${escapeHtml(branding.tagline)}</p>` : ""}
    </td>
  `;
}

function renderPlatformHeader(): string {
  return `
    <td style="background-color:${PLATFORM_EMAIL_HEADER_FALLBACK};background-image:${PLATFORM_EMAIL_HEADER_GRADIENT};padding:28px 28px 24px;text-align:center;border-bottom:3px solid ${PLATFORM_EMAIL_BRAND_BLUE};">
      ${renderPlatformLogoBlock()}
      <div style="color:#94a3b8;font-size:13px;margin-top:4px;line-height:1.45;max-width:28em;margin-left:auto;margin-right:auto;">${escapeHtml(PLATFORM_EMAIL_TAGLINE)}</div>
    </td>
  `;
}

export function wrapWhiteLabelEmailContent(options: WhiteLabelEmailOptions): string {
  const { documentTitle, bodyHtml, branding, footerHtml } = options;
  const title = escapeHtml(documentTitle);
  const isBranded = branding?.brandName || branding?.primaryColor;
  const brandName = branding?.brandName || PLATFORM_EMAIL_BRAND_NAME;
  
  const defaultFooter = `<p style="margin:0;font-size:12px;line-height:1.55;color:#64748b;text-align:center;">© ${platformEmailCopyrightYear()} ${escapeHtml(brandName)}. All rights reserved.</p>`;
  const footer = footerHtml ?? defaultFooter;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="x-ua-compatible" content="ie=edge" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#e8ecf1;font-family:'Segoe UI',system-ui,-apple-system,BlinkMacSystemFont,Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#e8ecf1;padding:36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 12px 40px rgba(15,23,42,0.12);border:1px solid #e2e8f0;">
          <tr>
            ${isBranded ? renderBrandedHeader(branding!) : renderPlatformHeader()}
          </tr>
          <tr>
            <td style="padding:32px 28px 28px;color:#334155;font-size:15px;line-height:1.65;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:22px 28px;background:#f1f5f9;border-top:1px solid #e2e8f0;">
              ${footer}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

export function renderWhiteLabelEmailHeadline(text: string, branding?: WhiteLabelEmailBranding | null): string {
  const color = branding?.primaryColor || "#0f172a";
  return `<h1 style="margin:0 0 16px;font-size:20px;line-height:1.35;color:${color};font-weight:700;">${escapeHtml(text)}</h1>`;
}

export function renderWhiteLabelEmailCta(label: string, href: string, branding?: WhiteLabelEmailBranding | null): string {
  const bgColor = branding?.primaryColor || PLATFORM_EMAIL_CTA_BG;
  const safeHref = escapeHtml(href);
  const safeLabel = escapeHtml(label);
  return `<div style="text-align:center;margin:28px 0 8px;">
    <a href="${safeHref}" style="display:inline-block;padding:14px 28px;border-radius:10px;background:${bgColor};color:#ffffff;font-weight:600;font-size:15px;text-decoration:none;">${safeLabel}</a>
  </div>`;
}

export function renderWhiteLabelEmailUrlFallback(url: string): string {
  const safe = escapeHtml(url);
  return `<p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#94a3b8;text-align:center;">Or paste this link into your browser:<br /><span style="word-break:break-all;color:#64748b;">${safe}</span></p>`;
}
