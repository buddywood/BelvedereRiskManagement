import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaSpies = vi.hoisted(() => ({
  enterpriseMembership: { findUnique: vi.fn() },
}));

vi.mock("@/lib/db", () => ({ prisma: prismaSpies }));
vi.mock("@/lib/auth/user-email-crypto", () => ({
  decryptUserEmail: vi.fn(() => "member@firm.com"),
}));

import { createEnterpriseTeamInviteToken } from "./team-invite-token";
import {
  inviteeNeedsRegistration,
  resolveEnterpriseTeamInvite,
} from "./team-invite";

const MEMBERSHIP_ID = "membership-invited";
const INVITED_AT = new Date("2026-07-25T03:00:00.000Z");

describe("inviteeNeedsRegistration", () => {
  it("requires create-account when there is no password", () => {
    expect(
      inviteeNeedsRegistration({
        hasPassword: false,
        emailVerified: null,
      })
    ).toBe(true);
  });

  it("requires create-account when email is not verified", () => {
    expect(
      inviteeNeedsRegistration({
        hasPassword: true,
        emailVerified: null,
      })
    ).toBe(true);
  });

  it("allows sign-in when user has password and verified email", () => {
    expect(
      inviteeNeedsRegistration({
        hasPassword: true,
        emailVerified: new Date("2026-07-25T03:00:30.000Z"),
      })
    ).toBe(false);
  });
});

describe("resolveEnterpriseTeamInvite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AUTH_SECRET = "test-auth-secret-for-enterprise-team-invites";
  });

  it("returns invite context for a legacy invite without credentials", async () => {
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

  it("allows sign-in when user has temp password (new invite flow)", async () => {
    prismaSpies.enterpriseMembership.findUnique.mockResolvedValue({
      status: "INVITED",
      invitedEmail: "member@firm.com",
      invitedAt: INVITED_AT,
      createdAt: INVITED_AT,
      user: {
        password: "hashed-temp-password",
        emailVerified: new Date("2026-07-25T03:00:00.000Z"),
        emailCiphertext: "cipher",
        createdAt: INVITED_AT,
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

  it("allows sign-in for pre-existing verified advisor", async () => {
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
});
