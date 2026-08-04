import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db";
import {
  isTestEmailPattern,
  isTestAccountByUserId,
  shouldFilterTestAccountEmail,
  checkTestAccountFilter,
} from "./test-account-filter";

describe("test-account-filter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("isTestEmailPattern", () => {
    it("returns true for @test.com emails", () => {
      expect(isTestEmailPattern("user@test.com")).toBe(true);
      expect(isTestEmailPattern("advisor@test.com")).toBe(true);
      expect(isTestEmailPattern("client-fresh@test.com")).toBe(true);
    });

    it("handles case insensitivity", () => {
      expect(isTestEmailPattern("USER@TEST.COM")).toBe(true);
      expect(isTestEmailPattern("User@Test.Com")).toBe(true);
    });

    it("handles whitespace", () => {
      expect(isTestEmailPattern("  user@test.com  ")).toBe(true);
    });

    it("returns false for non-test emails", () => {
      expect(isTestEmailPattern("user@gmail.com")).toBe(false);
      expect(isTestEmailPattern("user@company.com")).toBe(false);
      expect(isTestEmailPattern("test@gmail.com")).toBe(false);
    });

    it("returns false for emails that contain but don't end with @test.com", () => {
      expect(isTestEmailPattern("user@test.company.com")).toBe(false);
      expect(isTestEmailPattern("user@nottest.com")).toBe(false);
    });
  });

  describe("isTestAccountByUserId", () => {
    it("returns true when user has isTestAccount flag set", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        isTestAccount: true,
      } as never);

      const result = await isTestAccountByUserId("user-123");

      expect(result).toBe(true);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user-123" },
        select: { isTestAccount: true },
      });
    });

    it("returns false when user does not have isTestAccount flag set", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        isTestAccount: false,
      } as never);

      const result = await isTestAccountByUserId("user-123");

      expect(result).toBe(false);
    });

    it("returns false when user is not found", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const result = await isTestAccountByUserId("nonexistent-user");

      expect(result).toBe(false);
    });
  });

  describe("shouldFilterTestAccountEmail", () => {
    it("returns true for test email pattern", async () => {
      const result = await shouldFilterTestAccountEmail("user@test.com");
      expect(result).toBe(true);
    });

    it("returns true when user has isTestAccount flag", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        isTestAccount: true,
      } as never);

      const result = await shouldFilterTestAccountEmail(
        "user@example.com",
        "user-123",
      );

      expect(result).toBe(true);
    });

    it("returns false for non-test email without userId", async () => {
      const result = await shouldFilterTestAccountEmail("user@example.com");
      expect(result).toBe(false);
    });

    it("returns false for non-test email with non-test user", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        isTestAccount: false,
      } as never);

      const result = await shouldFilterTestAccountEmail(
        "user@example.com",
        "user-123",
      );

      expect(result).toBe(false);
    });

    it("skips database lookup for test email pattern", async () => {
      const result = await shouldFilterTestAccountEmail(
        "user@test.com",
        "user-123",
      );

      expect(result).toBe(true);
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });
  });

  describe("checkTestAccountFilter", () => {
    it("returns test_email_pattern reason for test emails", async () => {
      const result = await checkTestAccountFilter("user@test.com");

      expect(result).toEqual({
        filtered: true,
        reason: "test_email_pattern",
      });
    });

    it("returns test_account_flag reason for database flag", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        isTestAccount: true,
      } as never);

      const result = await checkTestAccountFilter("user@example.com", "user-123");

      expect(result).toEqual({
        filtered: true,
        reason: "test_account_flag",
      });
    });

    it("returns null for non-test accounts", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        isTestAccount: false,
      } as never);

      const result = await checkTestAccountFilter("user@example.com", "user-123");

      expect(result).toBeNull();
    });

    it("returns null for non-test email without userId", async () => {
      const result = await checkTestAccountFilter("user@example.com");
      expect(result).toBeNull();
    });
  });
});
