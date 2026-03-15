"use server";

import { prisma } from "@/lib/db";
import { createNotification } from "@/lib/data/advisor";
import type { FamilyComplexity } from "@prisma/client";

export type SubmitGovernanceReviewLeadParams = {
  name: string;
  email: string;
  familyOfficeName: string;
  primaryAdvisor?: string | null;
  familyComplexity: FamilyComplexity;
  promptedInterest?: string | null;
};

export async function submitGovernanceReviewLead(
  params: SubmitGovernanceReviewLeadParams
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const lead = await prisma.governanceReviewLead.create({
      data: {
        name: params.name.trim(),
        email: params.email.trim().toLowerCase(),
        familyOfficeName: params.familyOfficeName.trim(),
        primaryAdvisor: params.primaryAdvisor?.trim() || null,
        familyComplexity: params.familyComplexity,
        promptedInterest: params.promptedInterest?.trim() || null,
      },
    });

    const advisors = await prisma.advisorProfile.findMany({
      select: { id: true },
    });

    const title = "New governance review request";
    const message = `${lead.name} (${lead.email}) from ${lead.familyOfficeName} requested a governance review. Complexity: ${lead.familyComplexity.replace(/_/g, " ").toLowerCase()}.`;

    for (const advisor of advisors) {
      await createNotification(
        advisor.id,
        "NEW_LEAD",
        title,
        message,
        lead.id
      );
    }

    return { success: true };
  } catch (e) {
    console.error("submitGovernanceReviewLead:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to submit request",
    };
  }
}
