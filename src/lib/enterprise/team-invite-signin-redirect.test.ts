import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaSpies = vi.hoisted(() => ({
  enterpriseMembership: { findUnique: vi.fn() },
}));

const redirect = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db", () => ({ prisma: prismaSpies }));
vi.mock("@/lib/auth/user-email-crypto", () => ({
  decryptUserEmail: vi.fn(() => "member@firm.com"),
}));
vi.mock("next/navigation", () => ({ redirect }));

import { createEnterpriseTeamInviteToken } from "./team-invite-token";
import { redirectIfEnterpriseTeamJoinNeedsRegistration } from "./team-invite";

const MEMBERSHIP_ID = "membership-invited";

describe("redirectIfEnterpriseTeamJoinNeedsRegistration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AUTH_SECRET = "test-auth-secret-for-enterprise-team-invites";
  });

  it("redirects passwordless invitees back to the join signup page", async () => {
    const invitedAt = new Date("2026-07-25T03:00:00.000Z");
    prismaSpies.enterpriseMembership.findUnique.mockResolvedValue({
      status: "INVITED",
      invitedEmail: "member@firm.com",
      invitedAt,
      createdAt: invitedAt,
      user: {
        password: null,
        emailVerified: null,
        emailCiphertext: "cipher",
        createdAt: invitedAt,
      },
      enterprise: { name: "Northbridge Elite" },
    });

    const token = createEnterpriseTeamInviteToken(MEMBERSHIP_ID);
    await redirectIfEnterpriseTeamJoinNeedsRegistration(
      `/enterprise/join?token=${encodeURIComponent(token)}`
    );

    expect(redirect).toHaveBeenCalledWith(
      `/enterprise/join?token=${encodeURIComponent(token)}`
    );
  });

  it("does not redirect invitees who already have a verified account", async () => {
    const invitedAt = new Date("2026-07-25T03:00:00.000Z");
    prismaSpies.enterpriseMembership.findUnique.mockResolvedValue({
      status: "INVITED",
      invitedEmail: "member@firm.com",
      invitedAt,
      createdAt: invitedAt,
      user: {
        password: "hashed",
        emailVerified: new Date("2026-01-01"),
        emailCiphertext: "cipher",
        createdAt: new Date("2025-12-01"),
      },
      enterprise: { name: "Northbridge Elite" },
    });

    const token = createEnterpriseTeamInviteToken(MEMBERSHIP_ID);
    await redirectIfEnterpriseTeamJoinNeedsRegistration(
      `/enterprise/join?token=${encodeURIComponent(token)}`
    );

    expect(redirect).not.toHaveBeenCalled();
  });

  it("ignores non-invite sign-in callbacks", async () => {
    await redirectIfEnterpriseTeamJoinNeedsRegistration("/advisor");
    expect(redirect).not.toHaveBeenCalled();
    expect(prismaSpies.enterpriseMembership.findUnique).not.toHaveBeenCalled();
  });
});
