import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaSpies = vi.hoisted(() => ({
  enterpriseMembership: { findUnique: vi.fn() },
}));

vi.mock("@/lib/db", () => ({ prisma: prismaSpies }));
vi.mock("@/lib/auth/user-email-crypto", () => ({
  decryptUserEmail: vi.fn(() => "member@firm.com"),
}));

import { createEnterpriseTeamInviteToken } from "./team-invite-token";
import { inviteeNeedsRegistration, resolveEnterpriseTeamInvite } from "./team-invite";

const MEMBERSHIP_ID = "membership-invited";
const INVITED_AT = new Date("2026-07-25T03:00:00.000Z");

describe("inviteeNeedsRegistration", () => {
  it("requires create-account when there is no password", () => {
    expect(
      inviteeNeedsRegistration({
        hasPassword: false,
        emailVerified: null,
        userCreatedAt: INVITED_AT,
        invitedAt: INVITED_AT,
      })
    ).toBe(true);
  });

  it("requires create-account for invite stubs even after a partial password set", () => {
    expect(
      inviteeNeedsRegistration({
        hasPassword: true,
        emailVerified: new Date("2026-07-25T03:00:30.000Z"),
        userCreatedAt: INVITED_AT,
        invitedAt: INVITED_AT,
      })
    ).toBe(true);
  });

  it("requires sign-in for pre-existing verified advisors", () => {
    expect(
      inviteeNeedsRegistration({
        hasPassword: true,
        emailVerified: new Date("2026-01-01T00:00:00.000Z"),
        userCreatedAt: new Date("2025-12-01T00:00:00.000Z"),
        invitedAt: INVITED_AT,
      })
    ).toBe(false);
  });
});

describe("resolveEnterpriseTeamInvite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AUTH_SECRET = "test-auth-secret-for-enterprise-team-invites";
  });

  it("returns invite context for a pending invite without credentials", async () => {
    prismaSpies.enterpriseMembership.findUnique.mockResolvedValue({
      status: "INVITED",
      invitedEmail: "member@firm.com",
      invitedAt: INVITED_AT,
      createdAt: INVITED_AT,
      user: {
        password: null,
        emailVerified: null,
        emailCiphertext: "cipher",
        createdAt: INVITED_AT,
      },
      enterprise: { name: "Northbridge Elite" },
    });

    const token = createEnterpriseTeamInviteToken(MEMBERSHIP_ID);
    const result = await resolveEnterpriseTeamInvite(token);

    expect(result).toEqual({
      ok: true,
      membershipId: MEMBERSHIP_ID,
      enterpriseName: "Northbridge Elite",
      inviteeEmail: "member@firm.com",
      needsRegistration: true,
    });
  });

  it("requires sign-in when a pre-existing verified advisor is invited", async () => {
    prismaSpies.enterpriseMembership.findUnique.mockResolvedValue({
      status: "INVITED",
      invitedEmail: "member@firm.com",
      invitedAt: INVITED_AT,
      createdAt: INVITED_AT,
      user: {
        password: "hashed",
        emailVerified: new Date("2026-01-01"),
        emailCiphertext: "cipher",
        createdAt: new Date("2025-12-01"),
      },
      enterprise: { name: "Northbridge Elite" },
    });

    const token = createEnterpriseTeamInviteToken(MEMBERSHIP_ID);
    const result = await resolveEnterpriseTeamInvite(token);

    expect(result).toMatchObject({
      ok: true,
      needsRegistration: false,
    });
  });

  it("keeps invite stubs on create-account after a failed earlier signup", async () => {
    prismaSpies.enterpriseMembership.findUnique.mockResolvedValue({
      status: "INVITED",
      invitedEmail: "member@firm.com",
      invitedAt: INVITED_AT,
      createdAt: INVITED_AT,
      user: {
        password: "partial-hash",
        emailVerified: new Date("2026-07-25T03:00:20.000Z"),
        emailCiphertext: "cipher",
        createdAt: INVITED_AT,
      },
      enterprise: { name: "Northbridge Elite" },
    });

    const token = createEnterpriseTeamInviteToken(MEMBERSHIP_ID);
    const result = await resolveEnterpriseTeamInvite(token);

    expect(result).toMatchObject({
      ok: true,
      needsRegistration: true,
    });
  });
});
