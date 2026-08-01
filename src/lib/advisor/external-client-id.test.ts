import { describe, it, expect, vi, beforeEach } from "vitest";

const { prismaSpies } = vi.hoisted(() => ({
  prismaSpies: {
    clientAdvisorAssignment: { findFirst: vi.fn() },
    inviteCode: { findFirst: vi.fn() },
  },
}));

vi.mock("@/lib/db", () => ({ prisma: prismaSpies }));

import {
  DUPLICATE_EXTERNAL_CLIENT_ID_MESSAGE,
  parseExternalClientId,
} from "./external-client-id";
import { assertExternalClientIdAvailable } from "./external-client-id.server";

describe("parseExternalClientId", () => {
  it("trims and accepts CRM-style IDs", () => {
    expect(parseExternalClientId("  ACME-1042  ")).toBe("ACME-1042");
    expect(parseExternalClientId("acct/1042#a")).toBe("acct/1042#a");
  });

  it("treats blank as null", () => {
    expect(parseExternalClientId("")).toBeNull();
    expect(parseExternalClientId("   ")).toBeNull();
    expect(parseExternalClientId(null)).toBeNull();
  });

  it("rejects invalid characters", () => {
    expect(() => parseExternalClientId("bad@id")).toThrow();
  });
});

describe("assertExternalClientIdAvailable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaSpies.clientAdvisorAssignment.findFirst.mockResolvedValue(null);
    prismaSpies.inviteCode.findFirst.mockResolvedValue(null);
  });

  it("no-ops when id is null", async () => {
    await assertExternalClientIdAvailable("adv-1", null);
    expect(prismaSpies.clientAdvisorAssignment.findFirst).not.toHaveBeenCalled();
  });

  it("rejects when another assignment already uses the id", async () => {
    prismaSpies.clientAdvisorAssignment.findFirst.mockResolvedValueOnce({ id: "asg-2" });
    await expect(
      assertExternalClientIdAvailable("adv-1", "ACME-1", { excludeAssignmentId: "asg-1" }),
    ).rejects.toThrow(DUPLICATE_EXTERNAL_CLIENT_ID_MESSAGE);
  });

  it("rejects when a pending invite already uses the id", async () => {
    prismaSpies.inviteCode.findFirst.mockResolvedValueOnce({ id: "inv-2" });
    await expect(assertExternalClientIdAvailable("adv-1", "ACME-1")).rejects.toThrow(
      DUPLICATE_EXTERNAL_CLIENT_ID_MESSAGE,
    );
  });

  it("allows an unused id", async () => {
    await expect(assertExternalClientIdAvailable("adv-1", "ACME-1")).resolves.toBeUndefined();
  });
});
