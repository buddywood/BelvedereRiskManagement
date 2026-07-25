import "server-only";

import { prisma } from "@/lib/db";
import { decryptUserEmail } from "@/lib/auth/user-email";
import type { FirmAdvisorFilterOption } from "./types";

function advisorDisplayLabel(input: {
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  emailCiphertext: string | null;
}): string {
  const fullName = [input.firstName, input.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
  const name = input.name?.trim() || fullName;
  if (name) return name;
  if (input.emailCiphertext) {
    try {
      return decryptUserEmail(input.emailCiphertext);
    } catch {
      return "Advisor";
    }
  }
  return "Advisor";
}

/**
 * Advisors in a firm who can appear in the pipeline "Assigned advisor" filter.
 * Includes active enterprise members (owner/admin/advisor).
 */
export async function listFirmAdvisorFilterOptions(
  enterpriseId: string,
): Promise<FirmAdvisorFilterOption[]> {
  const memberships = await prisma.enterpriseMembership.findMany({
    where: {
      enterpriseId,
      status: "ACTIVE",
      advisorProfileId: { not: null },
      advisorProfile: {
        user: { deletedAt: null, role: "ADVISOR" },
      },
    },
    select: {
      advisorProfile: {
        select: {
          id: true,
          user: {
            select: {
              name: true,
              firstName: true,
              lastName: true,
              emailCiphertext: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const options = memberships
    .filter((m): m is typeof m & { advisorProfile: NonNullable<typeof m.advisorProfile> } =>
      m.advisorProfile != null,
    )
    .map((m) => ({
      id: m.advisorProfile.id,
      label: advisorDisplayLabel(m.advisorProfile.user),
    }));

  options.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
  return options;
}

export function formatAssignedAdvisorLabel(input: {
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  emailCiphertext: string | null;
}): string {
  return advisorDisplayLabel(input);
}
