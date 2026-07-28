import { describe, expect, it } from "vitest";
import { invitationFirmDisplayName } from "./invitation-email-branding";

describe("invitationFirmDisplayName", () => {
  it("prefers resolved branding public brand name", () => {
    expect(
      invitationFirmDisplayName(
        { firmName: "Test Advisor Firm", brandName: null },
        { brandName: "Buddy Wealth", advisorFirmName: "Test Advisor Firm" },
      ),
    ).toBe("Buddy Wealth");
  });

  it("falls back to profile brandName then firmName", () => {
    expect(
      invitationFirmDisplayName({
        firmName: "Test Advisor Firm",
        brandName: "Updated Brand",
      }),
    ).toBe("Updated Brand");

    expect(
      invitationFirmDisplayName({
        firmName: "Solo Firm",
        brandName: null,
      }),
    ).toBe("Solo Firm");
  });
});
