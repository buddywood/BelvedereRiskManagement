import { Resend } from "resend";

const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
): Promise<void> {
  try {
    // Initialize Resend client at runtime (not module load time)
    // to avoid build-time errors when RESEND_API_KEY is not set
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY not configured - email will not be sent");
      return;
    }

    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Reset your Belvedere password",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
              <h1 style="color: #18181b; margin-top: 0;">Reset Your Password</h1>

              <p style="margin: 16px 0;">
                You requested a password reset for your Belvedere Risk Management account.
              </p>

              <p style="margin: 16px 0;">
                Click the button below to reset your password. This link will expire in <strong>15 minutes</strong>.
              </p>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}" style="display: inline-block; background: #18181b; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                  Reset Password
                </a>
              </div>

              <p style="margin: 16px 0; font-size: 14px; color: #666;">
                Or copy and paste this URL into your browser:
              </p>
              <p style="margin: 8px 0; font-size: 14px; word-break: break-all;">
                <a href="${resetUrl}" style="color: #18181b;">${resetUrl}</a>
              </p>

              <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;">

              <p style="margin: 16px 0; font-size: 14px; color: #666;">
                If you didn't request this password reset, you can safely ignore this email. Your password will not be changed.
              </p>
            </div>
          </body>
        </html>
      `,
    });
  } catch (error) {
    // Log error but don't throw - prevents email enumeration attacks
    // In production, use proper logging service (e.g., Sentry)
    console.error("Failed to send password reset email:", error);
  }
}
