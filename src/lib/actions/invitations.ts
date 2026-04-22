"use server";

import { requireAdvisorRole, getAdvisorProfileOrThrow } from "@/lib/advisor/auth";
import {
  assertCanAddClientForAdvisorProfile,
  ClientLimitError,
} from "@/lib/billing/subscription-service";
import {
  createAdvisorInvitation,
  resendInvitation,
  expireInvitation,
  getAdvisorInvitations,
} from "@/lib/invitations/service";
import { sendAdvisorInvitationEmail } from "@/lib/invitations/email";
import { createInvitationSchema } from "@/lib/schemas/invitation";
import { InvitationListFilters, InvitationWithDetails } from "@/lib/invitations/types";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Server action to send a new invitation
 */
export async function sendInvitation(formData: FormData): Promise<ActionResult<InvitationWithDetails & { url: string; emailSent: boolean; emailNotSentReason?: string }>> {
  try {
    // Authenticate and get advisor role
    const { userId } = await requireAdvisorRole();

    // Get advisor profile with user info
    const profile = await getAdvisorProfileOrThrow(userId);

    // Parse and validate form data
    const rawData = {
      clientEmail: formData.get("clientEmail")?.toString() || "",
      clientName: formData.get("clientName")?.toString() || undefined,
      personalMessage: formData.get("personalMessage")?.toString() || undefined,
      intakeWaived: (() => {
        const v = formData.get("intakeWaived");
        if (v === null) return false;
        const s = String(v).toLowerCase();
        return s === "true" || s === "on" || s === "1";
      })(),
    };

    const validatedInput = createInvitationSchema.parse(rawData);

    await assertCanAddClientForAdvisorProfile(profile.id);

    // Create the invitation
    const invitation = await createAdvisorInvitation(profile.id, validatedInput);

    // Send the email
    const advisorInfo = {
      advisorName: profile.user.name || profile.user.firstName + " " + profile.user.lastName || "Advisor",
      advisorJobTitle: profile.jobTitle || "Financial Advisor",
      advisorFirmName: profile.firmName || "Advisory Firm",
      advisorEmail: profile.user.email,
      advisorPhone: profile.phone || "",
      advisorLicenseNumber: profile.licenseNumber || "",
      advisorLogoUrl: profile.logoUrl || undefined,
    };

    const emailResult = await sendAdvisorInvitationEmail({
      clientEmail: validatedInput.clientEmail,
      advisorInfo,
      personalMessage: validatedInput.personalMessage,
      invitationUrl: invitation.url,
      clientName: validatedInput.clientName,
    });

    return {
      success: true,
      data: {
        ...invitation,
        emailSent: emailResult.sent,
        emailNotSentReason: emailResult.sent ? undefined : emailResult.reason,
      },
    };
  } catch (error) {
    if (error instanceof ClientLimitError) {
      return { success: false, error: error.message };
    }
    // Handle duplicate email gracefully
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return { success: false, error: "An invitation has already been sent to this email address." };
      }
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred while sending the invitation." };
  }
}

/**
 * Server action to resend an existing invitation
 */
export async function resendInvitationAction(invitationId: string): Promise<ActionResult<InvitationWithDetails & { url: string; emailSent: boolean; emailNotSentReason?: string }>> {
  try {
    // Authenticate and get advisor role
    const { userId } = await requireAdvisorRole();

    // Get advisor profile with user info
    const profile = await getAdvisorProfileOrThrow(userId);

    // Resend the invitation (this validates ownership and limits)
    const invitation = await resendInvitation(profile.id, invitationId);

    // Send the new email
    const advisorInfo = {
      advisorName: profile.user.name || profile.user.firstName + " " + profile.user.lastName || "Advisor",
      advisorJobTitle: profile.jobTitle || "Financial Advisor",
      advisorFirmName: profile.firmName || "Advisory Firm",
      advisorEmail: profile.user.email,
      advisorPhone: profile.phone || "",
      advisorLicenseNumber: profile.licenseNumber || "",
      advisorLogoUrl: profile.logoUrl || undefined,
    };

    const emailResult = await sendAdvisorInvitationEmail({
      clientEmail: invitation.prefillEmail || "",
      advisorInfo,
      personalMessage: invitation.personalMessage || "I'd like to invite you to complete a family governance assessment.",
      invitationUrl: invitation.url,
      clientName: invitation.clientName || undefined,
    });

    return {
      success: true,
      data: {
        ...invitation,
        emailSent: emailResult.sent,
        emailNotSentReason: emailResult.sent ? undefined : emailResult.reason,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred while resending the invitation." };
  }
}

/**
 * Server action to manually expire an invitation
 */
export async function expireInvitationAction(invitationId: string): Promise<ActionResult<InvitationWithDetails>> {
  try {
    // Authenticate and get advisor role
    const { userId } = await requireAdvisorRole();

    // Get advisor profile
    const profile = await getAdvisorProfileOrThrow(userId);

    // Expire the invitation (this validates ownership)
    const invitation = await expireInvitation(profile.id, invitationId);

    return { success: true, data: invitation };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred while expiring the invitation." };
  }
}

/**
 * Server action to get advisor's invitations
 */
export async function getInvitationsAction(filters?: InvitationListFilters): Promise<ActionResult<InvitationWithDetails[]>> {
  try {
    // Authenticate and get advisor role
    const { userId } = await requireAdvisorRole();

    // Get advisor profile
    const profile = await getAdvisorProfileOrThrow(userId);

    // Get invitations for this advisor
    const invitations = await getAdvisorInvitations(profile.id, filters);

    return { success: true, data: invitations };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred while fetching invitations." };
  }
}