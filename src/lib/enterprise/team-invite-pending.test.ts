import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaSpies = vi.hoisted(() => ({
  enterpriseMembership: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  user: {
    update: vi.fn(),
  },
  $transaction: vi.fn((ops: unknown[]) => Promise.all(ops)),
}));

const teamAccess = vi.hoisted(() => ({
  requireEnterpriseTeamManager: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ prisma: prismaSpies }));
vi.mock("@/lib/enterprise/team-access", () => teamAccess);
vi.mock("@/lib/auth/user-email-crypto", () => ({
  decryptUserEmail: vi.fn(() => "advisor@firm.com"),
}));
vi.mock("@/lib/public-app-url", () => ({
  resolvePublicAppUrl: vi.fn(async () => "https://preview.akilirisk.com"),
}));
vi.mock("@/lib/auth/password-update", () => ({
  hashPasswordForStorage: vi.fn(async () => "$2a$12$mockhash"),
}));
vi.mock("@/lib/auth/temp-password", () => ({
  generateTempPassword: vi.fn(() => "TempPass123"),
}));
vi.mock("@/lib/platform/password-policy-settings", () => ({
  getPasswordPolicy: vi.fn(async () => ({
    minLength: 8,
    requireUppercase: true,
    requireNumber: true,
    requireSpecialCharacter: false,
    revision: 1,
    complianceNotice: null,
  })),
}));

import {
  resendEnterpriseTeamInvite,
  revokeEnterpriseTeamInvite,
} from "./team-invite";

const MEMBERSHIP_ID = "membership-invited";
const ACTOR_USER_ID = "owner-user";
const ENTERPRISE_ID = "ent-1";

const INVITEE_USER_ID = "invitee-user-1";

function mockPendingInvite() {
  teamAccess.requireEnterpriseTeamManager.mockResolvedValue({
    enterpriseId: ENTERPRISE_ID,
    enterpriseName: "Northbridge Elite",
    role: "OWNER",
  });
  prismaSpies.enterpriseMembership.findFirst.mockResolvedValue({
    id: MEMBERSHIP_ID,
    status: "INVITED",
    role: "ADVISOR",
    invitedEmail: "advisor@firm.com",
    user: { emailCiphertext: "cipher" },
    enterprise: { name: "Northbridge Elite" },
  });
  prismaSpies.enterpriseMembership.findUnique.mockResolvedValue({
    userId: INVITEE_USER_ID,
  });
  prismaSpies.enterpriseMembership.update.mockResolvedValue({});
  prismaSpies.user.update.mockResolvedValue({});
}

describe("pending enterprise team invites", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AUTH_SECRET = "test-auth-secret-for-enterprise-team-invites";
  });

  it("resends a pending invite with a fresh temp password", async () => {
    mockPendingInvite();

    const result = await resendEnterpriseTeamInvite(ACTOR_USER_ID, MEMBERSHIP_ID);

    expect(result.inviteeEmail).toBe("advisor@firm.com");
    expect(result.role).toBe("ADVISOR");
    expect(result.loginUrl).toBe("https://preview.akilirisk.com/signin");
    expect(result.tempPassword).toBe("TempPass123");
    expect(prismaSpies.$transaction).toHaveBeenCalled();
  });

  it("removes a pending invite", async () => {
    mockPendingInvite();
    prismaSpies.enterpriseMembership.delete.mockResolvedValue({});

    await revokeEnterpriseTeamInvite(ACTOR_USER_ID, MEMBERSHIP_ID);

    expect(prismaSpies.enterpriseMembership.delete).toHaveBeenCalledWith({
      where: { id: MEMBERSHIP_ID },
    });
  });

  it("rejects resend for active members", async () => {
    mockPendingInvite();
    prismaSpies.enterpriseMembership.findFirst.mockResolvedValue({
      id: MEMBERSHIP_ID,
      status: "ACTIVE",
      role: "ADVISOR",
      invitedEmail: "advisor@firm.com",
      user: { emailCiphertext: "cipher" },
      enterprise: { name: "Northbridge Elite" },
    });

    await expect(resendEnterpriseTeamInvite(ACTOR_USER_ID, MEMBERSHIP_ID)).rejects.toThrow(
      "Only pending invitations can be resent or removed."
    );
  });
});
