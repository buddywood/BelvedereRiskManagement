import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaSpies = vi.hoisted(() => ({
  enterpriseMembership: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
}));

const writeAudit = vi.hoisted(() => vi.fn(async () => undefined));
const revalidatePath = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db", () => ({ prisma: prismaSpies }));
vi.mock("@/lib/admin/auth", () => ({
  requireAdminRole: vi.fn(async () => ({
    userId: "admin-1",
    email: "admin@test.com",
    role: "ADMIN",
  })),
  requireSuperAdminRole: vi.fn(),
}));
vi.mock("@/lib/audit/audit-log", () => ({
  writeAudit,
  AUDIT_ACTIONS: {
    ENTERPRISE_ADMIN_ROLE_CHANGE: "enterprise.admin_role_change",
  },
}));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/lib/enterprise/notify-owner-change", () => ({
  notifyEnterpriseOwnerChanged: vi.fn(),
}));
vi.mock("@/lib/enterprise/notify-subdomain-change", () => ({
  notifyEnterpriseSubdomainChanged: vi.fn(),
}));
vi.mock("@/lib/advisor/subdomain", () => ({
  clearSubdomainCache: vi.fn(),
  isSubdomainReserved: vi.fn(),
  validateSubdomainFormat: vi.fn(),
}));
vi.mock("@/lib/audit/branding-audit", () => ({
  auditSubdomainClaim: vi.fn(),
}));
vi.mock("@/lib/enterprise/firm-lifecycle", () => ({
  deleteEnterpriseFirmByAdmin: vi.fn(),
  EnterpriseLifecycleError: class extends Error {},
  reactivateEnterpriseFirmByAdmin: vi.fn(),
  suspendEnterpriseFirmByAdmin: vi.fn(),
}));
vi.mock("@/lib/enterprise/schedule-enterprise-provision", () => ({
  scheduleEnterpriseProvision: vi.fn(),
  queueEnterpriseProvision: vi.fn(),
}));
vi.mock("@/lib/enterprise/cancel-solo-subscription", () => ({
  cancelSoloSubscriptionForEnterprise: vi.fn(),
}));
vi.mock("@/lib/admin/queries", () => ({
  getAdvisorForAdmin: vi.fn(),
}));
vi.mock("@/lib/notifications/service", () => ({
  sendNotification: vi.fn(),
}));
vi.mock("@/lib/auth/send-advisor-email-verification-invite", () => ({
  sendAdvisorEmailVerificationInvite: vi.fn(),
}));
vi.mock("@/lib/auth/user-email", () => ({
  findUserByEmail: vi.fn(),
  userEmailWriteData: vi.fn(),
}));
vi.mock("@/lib/platform/password-policy-settings", () => ({
  getPasswordPolicy: vi.fn(),
}));
vi.mock("@/lib/auth/password-update", () => ({
  hashPasswordForStorage: vi.fn(),
}));
vi.mock("@/lib/billing/new-advisor-grace", () => ({
  buildNewAdvisorWelcomeEmailHtml: vi.fn(),
  formatUtcCalendarDate: vi.fn(),
  newAdvisorGracePeriodEndsAt: vi.fn(),
  newAdvisorPaidSignupDeadline: vi.fn(),
}));

import { changeEnterpriseAdminRoleByAdmin } from "./actions";

const ENTERPRISE_ID = "ent-1";
const MEMBERSHIP_ID = "clp8v0abc12345678901234567";

describe("changeEnterpriseAdminRoleByAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("promotes an active team member to ADMIN", async () => {
    prismaSpies.enterpriseMembership.findFirst.mockResolvedValue({
      id: MEMBERSHIP_ID,
      userId: "member-1",
      role: "ADVISOR",
      status: "ACTIVE",
    });
    prismaSpies.enterpriseMembership.update.mockResolvedValue({});

    const result = await changeEnterpriseAdminRoleByAdmin({
      enterpriseId: ENTERPRISE_ID,
      membershipId: MEMBERSHIP_ID,
      role: "ADMIN",
    });

    expect(result).toEqual({ success: true, data: { role: "ADMIN" } });
    expect(prismaSpies.enterpriseMembership.update).toHaveBeenCalledWith({
      where: { id: MEMBERSHIP_ID },
      data: { role: "ADMIN" },
    });
    expect(writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "enterprise.admin_role_change",
        beforeData: { role: "ADVISOR", userId: "member-1" },
        afterData: { role: "ADMIN", userId: "member-1" },
      })
    );
  });

  it("demotes an ADMIN back to ADVISOR", async () => {
    prismaSpies.enterpriseMembership.findFirst.mockResolvedValue({
      id: MEMBERSHIP_ID,
      userId: "admin-member",
      role: "ADMIN",
      status: "ACTIVE",
    });
    prismaSpies.enterpriseMembership.update.mockResolvedValue({});

    const result = await changeEnterpriseAdminRoleByAdmin({
      enterpriseId: ENTERPRISE_ID,
      membershipId: MEMBERSHIP_ID,
      role: "ADVISOR",
    });

    expect(result).toEqual({ success: true, data: { role: "ADVISOR" } });
  });

  it("rejects changing the OWNER via this action", async () => {
    prismaSpies.enterpriseMembership.findFirst.mockResolvedValue({
      id: MEMBERSHIP_ID,
      userId: "owner-1",
      role: "OWNER",
      status: "ACTIVE",
    });

    const result = await changeEnterpriseAdminRoleByAdmin({
      enterpriseId: ENTERPRISE_ID,
      membershipId: MEMBERSHIP_ID,
      role: "ADMIN",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/Transfer ownership/i);
    }
    expect(prismaSpies.enterpriseMembership.update).not.toHaveBeenCalled();
  });

  it("rejects suspended members", async () => {
    prismaSpies.enterpriseMembership.findFirst.mockResolvedValue({
      id: MEMBERSHIP_ID,
      userId: "member-1",
      role: "ADVISOR",
      status: "SUSPENDED",
    });

    const result = await changeEnterpriseAdminRoleByAdmin({
      enterpriseId: ENTERPRISE_ID,
      membershipId: MEMBERSHIP_ID,
      role: "ADMIN",
    });

    expect(result.success).toBe(false);
    expect(prismaSpies.enterpriseMembership.update).not.toHaveBeenCalled();
  });
});
