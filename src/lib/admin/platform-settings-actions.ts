"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { requireAdminRole } from "@/lib/admin/auth";

const updateFlagsSchema = z.object({
  advisorGovernanceDashboardEnabled: z.boolean(),
  advisorRiskIntelligenceEnabled: z.boolean(),
});

export async function updatePlatformAdvisorFeatureFlags(input: unknown) {
  try {
    await requireAdminRole();
    const parsed = updateFlagsSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false as const,
        error: "Invalid feature flag payload",
      };
    }

    await prisma.platformSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        advisorGovernanceDashboardEnabled: parsed.data.advisorGovernanceDashboardEnabled,
        advisorRiskIntelligenceEnabled: parsed.data.advisorRiskIntelligenceEnabled,
      },
      update: {
        advisorGovernanceDashboardEnabled: parsed.data.advisorGovernanceDashboardEnabled,
        advisorRiskIntelligenceEnabled: parsed.data.advisorRiskIntelligenceEnabled,
      },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/advisor");
    revalidatePath("/advisor/dashboard");
    revalidatePath("/advisor/intelligence");

    return { success: true as const };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update settings";
    return { success: false as const, error: message };
  }
}

export async function getPlatformAdvisorFeatureFlagsForAdmin() {
  try {
    await requireAdminRole();
    const row = await prisma.platformSettings.findUnique({
      where: { id: "default" },
    });
    if (!row) {
      return {
        success: true as const,
        data: {
          advisorGovernanceDashboardEnabled: true,
          advisorRiskIntelligenceEnabled: true,
        },
      };
    }
    return {
      success: true as const,
      data: {
        advisorGovernanceDashboardEnabled: row.advisorGovernanceDashboardEnabled,
        advisorRiskIntelligenceEnabled: row.advisorRiskIntelligenceEnabled,
      },
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load settings";
    return { success: false as const, error: message };
  }
}
