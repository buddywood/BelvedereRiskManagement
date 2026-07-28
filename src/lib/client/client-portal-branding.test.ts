import { describe, expect, it } from "vitest";
import {
  CLIENT_ADVISOR_LOGO_PATH,
  clientPortalBrandingDisplayTitle,
  clientPortalLogoImgSrc,
} from "./client-portal-branding";
import type { AdvisorBrandingData } from "@/lib/validation/branding";

function branding(
  overrides: Partial<AdvisorBrandingData> = {},
): AdvisorBrandingData {
  return {
    brandName: "Test Firm",
    brandingEnabled: true,
    ...overrides,
  } as AdvisorBrandingData;
}

describe("clientPortalLogoImgSrc", () => {
  it("proxies when logoS3Key is set", () => {
    expect(
      clientPortalLogoImgSrc(
        branding({ logoS3Key: "advisors/abc/logos/logo.png" }),
      ),
    ).toBe(CLIENT_ADVISOR_LOGO_PATH);
  });

  it("proxies private S3 logoUrl without logoS3Key", () => {
    expect(
      clientPortalLogoImgSrc(
        branding({
          logoUrl:
            "https://akili-advisor-assets.s3.us-east-2.amazonaws.com/advisors/abc/logos/x.png",
        }),
      ),
    ).toBe(CLIENT_ADVISOR_LOGO_PATH);
  });

  it("passes through public https URLs", () => {
    const url = "https://cdn.example.com/logo.png";
    expect(clientPortalLogoImgSrc(branding({ logoUrl: url }))).toBe(url);
  });

  it("returns null for empty branding", () => {
    expect(clientPortalLogoImgSrc(branding({}))).toBeNull();
  });
});

describe("clientPortalBrandingDisplayTitle", () => {
  it("prefers public brandName over stale firmName", () => {
    expect(
      clientPortalBrandingDisplayTitle(
        branding({
          brandName: "eBilly Wealth",
          advisorFirmName: "Test Advisor Firm",
        }),
      ),
    ).toBe("eBilly Wealth");
  });

  it("falls back to firmName when brandName is empty", () => {
    expect(
      clientPortalBrandingDisplayTitle(
        branding({
          brandName: null,
          advisorFirmName: "Solo Practice",
        }),
      ),
    ).toBe("Solo Practice");
  });
});
