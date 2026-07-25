import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaSpies = vi.hoisted(() => ({
  user: { create: vi.fn() },
  enterpriseMembership: {
    create: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
}));

const teamAccess = vi.hoisted(() => ({
  requireEnterpriseTeamManager: vi.fn(),
}));

const findUserByEmail = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db", () => ({ prisma: prismaSpies }));
vi.mock("@/lib/enterprise/team-access", () => teamAccess);
vi.mock("@/lib/auth/user-email", () => ({
  findUserByEmail,
  userEmailWriteData: (email: string) => ({ email }),
}));
vi.mock("@/lib/auth/user-email-crypto", () => ({
  decryptUserEmail: vi.fn(() => "advisor@firm.com"),
}));
vi.mock("@/lib/public-app-url", () => ({
  resolvePublicAppUrl: vi.fn(async () => "https://preview.akilirisk.com"),
}));

import {
  changeEnterpriseMemberRole,
  inviteEnterpriseMember,
  suspendEnterpriseMember,
} from "./team-invite";

const OWNER_USER_ID = "owner-user";
const ADMIN_USER_ID = "admin-user";
const ENTERPRISE_ID = "ent-1";
const MEMBERSHIP_ID = "membership-1";

describe("enterprise team invite roles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AUTH_SECRET = "test-auth-secret-for-enterprise-team-invites";
  });

  it("invites a firm administrator when role is ADMIN", async () => {
    teamAccess.requireEnterpriseTeamManager.mockResolvedValue({
      enterpriseId: ENTERPRISE_ID,
      enterpriseName: "Northbridge Elite",
      role: "OWNER",
    });
    findUserByEmail.mockResolvedValue(null);
    prismaSpies.user.create.mockResolvedValue({ id: "invitee-1" });
    prismaSpies.enterpriseMembership.create.mockResolvedValue({
      id: MEMBERSHIP_ID,
    });

    const result = await inviteEnterpriseMember(OWNER_USER_ID, {
      email: "admin2@firm.com",
      role: "ADMIN",
    });

    expect(result.role).toBe("ADMIN");
    expect(result.inviteUrl).toContain(
      "https://preview.akilirisk.com/enterprise/join?token="
    );
    expect(prismaSpies.enterpriseMembership.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        enterpriseId: ENTERPRISE_ID,
        userId: "invitee-1",
        role: "ADMIN",
        status: "INVITED",
        invitedEmail: "admin2@firm.com",
      }),
    });
  });

  it("defaults invites to ADVISOR when role is omitted", async () => {
    teamAccess.requireEnterpriseTeamManager.mockResolvedValue({
      enterpriseId: ENTERPRISE_ID,
      enterpriseName: "Northbridge Elite",
      role: "ADMIN",
    });
    findUserByEmail.mockResolvedValue(null);
    prismaSpies.user.create.mockResolvedValue({ id: "invitee-2" });
    prismaSpies.enterpriseMembership.create.mockResolvedValue({
      id: "membership-2",
    });

    const result = await inviteEnterpriseMember(ADMIN_USER_ID, {
      email: "member@firm.com",
    });

    expect(result.role).toBe("ADVISOR");
    expect(prismaSpies.enterpriseMembership.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ role: "ADVISOR" }),
    });
  });
});

describe("changeEnterpriseMemberRole", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lets the owner promote a team member to admin", async () => {
    teamAccess.requireEnterpriseTeamManager.mockResolvedValue({
      enterpriseId: ENTERPRISE_ID,
      enterpriseName: "Northbridge Elite",
      role: "OWNER",
    });
    prismaSpies.enterpriseMembership.findFirst.mockResolvedValue({
      id: MEMBERSHIP_ID,
      role: "ADVISOR",
      status: "ACTIVE",
      userId: "member-user",
    });
    prismaSpies.enterpriseMembership.update.mockResolvedValue({});

    const result = await changeEnterpriseMemberRole(
      OWNER_USER_ID,
      MEMBERSHIP_ID,
      "ADMIN"
    );

    expect(result).toEqual({ role: "ADMIN" });
    expect(prismaSpies.enterpriseMembership.update).toHaveBeenCalledWith({
      where: { id: MEMBERSHIP_ID },
      data: { role: "ADMIN" },
    });
  });

  it("lets the owner demote an admin to team member", async () => {
    teamAccess.requireEnterpriseTeamManager.mockResolvedValue({
      enterpriseId: ENTERPRISE_ID,
      enterpriseName: "Northbridge Elite",
      role: "OWNER",
    });
    prismaSpies.enterpriseMembership.findFirst.mockResolvedValue({
      id: MEMBERSHIP_ID,
      role: "ADMIN",
      status: "ACTIVE",
      userId: "admin-member",
    });
    prismaSpies.enterpriseMembership.update.mockResolvedValue({});

    const result = await changeEnterpriseMemberRole(
      OWNER_USER_ID,
      MEMBERSHIP_ID,
      "ADVISOR"
    );

    expect(result).toEqual({ role: "ADVISOR" });
  });

  it("lets an admin promote a team member to admin", async () => {
    teamAccess.requireEnterpriseTeamManager.mockResolvedValue({
      enterpriseId: ENTERPRISE_ID,
      enterpriseName: "Northbridge Elite",
      role: "ADMIN",
    });
    prismaSpies.enterpriseMembership.findFirst.mockResolvedValue({
      id: MEMBERSHIP_ID,
      role: "ADVISOR",
      status: "ACTIVE",
      userId: "member-user",
    });
    prismaSpies.enterpriseMembership.update.mockResolvedValue({});

    await expect(
      changeEnterpriseMemberRole(ADMIN_USER_ID, MEMBERSHIP_ID, "ADMIN")
    ).resolves.toEqual({ role: "ADMIN" });
  });

  it("blocks admins from changing peer admin roles", async () => {
    teamAccess.requireEnterpriseTeamManager.mockResolvedValue({
      enterpriseId: ENTERPRISE_ID,
      enterpriseName: "Northbridge Elite",
      role: "ADMIN",
    });
    prismaSpies.enterpriseMembership.findFirst.mockResolvedValue({
      id: MEMBERSHIP_ID,
      role: "ADMIN",
      status: "ACTIVE",
      userId: "other-admin",
    });

    await expect(
      changeEnterpriseMemberRole(ADMIN_USER_ID, MEMBERSHIP_ID, "ADVISOR")
    ).rejects.toThrow("Only the firm owner can change an administrator's role.");
    expect(prismaSpies.enterpriseMembership.update).not.toHaveBeenCalled();
  });

  it("blocks changing the owner role", async () => {
    teamAccess.requireEnterpriseTeamManager.mockResolvedValue({
      enterpriseId: ENTERPRISE_ID,
      enterpriseName: "Northbridge Elite",
      role: "OWNER",
    });
    prismaSpies.enterpriseMembership.findFirst.mockResolvedValue({
      id: MEMBERSHIP_ID,
      role: "OWNER",
      status: "ACTIVE",
      userId: "owner-member",
    });

    await expect(
      changeEnterpriseMemberRole(ADMIN_USER_ID, MEMBERSHIP_ID, "ADMIN")
    ).rejects.toThrow("The firm owner role cannot be changed here.");
  });

  it("blocks self role changes", async () => {
    teamAccess.requireEnterpriseTeamManager.mockResolvedValue({
      enterpriseId: ENTERPRISE_ID,
      enterpriseName: "Northbridge Elite",
      role: "OWNER",
    });
    prismaSpies.enterpriseMembership.findFirst.mockResolvedValue({
      id: MEMBERSHIP_ID,
      role: "ADVISOR",
      status: "ACTIVE",
      userId: OWNER_USER_ID,
    });

    await expect(
      changeEnterpriseMemberRole(OWNER_USER_ID, MEMBERSHIP_ID, "ADMIN")
    ).rejects.toThrow("You cannot change your own role.");
  });
});

describe("suspendEnterpriseMember peer-admin guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blocks admins from suspending peer admins", async () => {
    teamAccess.requireEnterpriseTeamManager.mockResolvedValue({
      enterpriseId: ENTERPRISE_ID,
      enterpriseName: "Northbridge Elite",
      role: "ADMIN",
    });
    prismaSpies.enterpriseMembership.findFirst.mockResolvedValue({
      id: MEMBERSHIP_ID,
      role: "ADMIN",
      status: "ACTIVE",
    });

    await expect(
      suspendEnterpriseMember(ADMIN_USER_ID, MEMBERSHIP_ID)
    ).rejects.toThrow("Only the firm owner can manage administrators.");
    expect(prismaSpies.enterpriseMembership.update).not.toHaveBeenCalled();
  });
});
