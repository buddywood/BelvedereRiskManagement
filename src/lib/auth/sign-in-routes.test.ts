import { describe, expect, it } from "vitest";
import {
  buildSignInHref,
  CLIENT_MAGIC_LINK_SIGN_IN_PATH,
  enterpriseTeamJoinTokenFromCallback,
  getSignInPathForWorkspace,
  isEnterpriseTeamJoinCallback,
  resolveSignInRole,
  sanitizeMagicLinkRedirectTo,
  shouldRedirectCredentialsSignInToMagicLink,
  SIGN_IN_HUB_PATH,
  STAFF_CREDENTIALS_SIGN_IN_PATH,
} from "@/lib/auth/sign-in-routes";

describe("sign-in routes", () => {
  it("routes client workspaces to the hub client tab", () => {
    expect(getSignInPathForWorkspace("/dashboard")).toBe(
      "/signin/client?callbackUrl=%2Fdashboard"
    );
    expect(getSignInPathForWorkspace("/assessment/governance")).toBe(
      "/signin/client?callbackUrl=%2Fassessment%2Fgovernance"
    );
  });

  it("routes advisor workspace to the hub advisor tab", () => {
    expect(getSignInPathForWorkspace("/advisor")).toBe(
      "/signin/advisor?callbackUrl=%2Fadvisor"
    );
  });

  it("routes admin workspace to the hub admin tab", () => {
    expect(getSignInPathForWorkspace("/admin")).toBe(
      "/signin?role=admin&callbackUrl=%2Fadmin"
    );
  });

  it("builds href with callbackUrl and role", () => {
    expect(buildSignInHref({ callbackUrl: "/dashboard" })).toBe(
      "/signin/client?callbackUrl=%2Fdashboard"
    );
    expect(buildSignInHref({ callbackUrl: "/advisor" })).toBe(
      "/signin/advisor?callbackUrl=%2Fadvisor"
    );
    expect(
      buildSignInHref({ callbackUrl: "/advisor?error=unauthorized" }),
    ).toBe("/signin/advisor?callbackUrl=%2Fadvisor");
  });

  it("supports explicit role and legacy magic-link constant", () => {
    expect(buildSignInHref({ role: "client" })).toBe("/signin/client");
    expect(buildSignInHref({ role: "advisor" })).toBe("/signin/advisor");
    expect(CLIENT_MAGIC_LINK_SIGN_IN_PATH).toBe("/signin/magic-link");
    expect(STAFF_CREDENTIALS_SIGN_IN_PATH).toBe(SIGN_IN_HUB_PATH);
  });

  it("detects client callbacks that should open the client tab", () => {
    expect(shouldRedirectCredentialsSignInToMagicLink("/intake")).toBe(true);
    expect(shouldRedirectCredentialsSignInToMagicLink("/admin")).toBe(false);
  });

  it("resolves role from legacy portal param and callbackUrl", () => {
    expect(resolveSignInRole({ pathname: "/signin/client" })).toBe("client");
    expect(resolveSignInRole({ pathname: "/signin/advisor" })).toBe("advisor");
    expect(resolveSignInRole({ portal: "advisor" })).toBe("advisor");
    expect(resolveSignInRole({ callbackUrl: "/dashboard" })).toBe("client");
    expect(resolveSignInRole({ callbackUrl: "/admin/leads" })).toBe("admin");
  });

  it("sanitizes magic-link redirect targets to client workspaces", () => {
    expect(sanitizeMagicLinkRedirectTo("/assessment")).toBe("/assessment");
    expect(sanitizeMagicLinkRedirectTo("/t/belvedere/assessment")).toBe(
      "/t/belvedere/assessment",
    );
    expect(sanitizeMagicLinkRedirectTo("//evil.example")).toBe("/dashboard");
    expect(sanitizeMagicLinkRedirectTo("/advisor")).toBe("/dashboard");
    expect(sanitizeMagicLinkRedirectTo(null, "/assessment")).toBe("/assessment");
  });

  it("detects enterprise team join callbacks and extracts invite tokens", () => {
    expect(isEnterpriseTeamJoinCallback("/enterprise/join?token=ent.abc.1.sig")).toBe(
      true
    );
    expect(isEnterpriseTeamJoinCallback("/advisor")).toBe(false);
    expect(
      enterpriseTeamJoinTokenFromCallback("/enterprise/join?token=ent.abc.1.sig")
    ).toBe("ent.abc.1.sig");
    expect(enterpriseTeamJoinTokenFromCallback("/enterprise/join")).toBeNull();
    expect(enterpriseTeamJoinTokenFromCallback("/advisor")).toBeNull();
  });

  it("routes enterprise join callbacks to the advisor sign-in tab", () => {
    expect(
      buildSignInHref({
        role: "advisor",
        callbackUrl: "/enterprise/join?token=ent.abc.1.sig",
        email: "member@firm.com",
      })
    ).toBe(
      "/signin/advisor?callbackUrl=%2Fenterprise%2Fjoin%3Ftoken%3Dent.abc.1.sig&email=member%40firm.com"
    );
    expect(
      resolveSignInRole({ callbackUrl: "/enterprise/join?token=ent.abc.1.sig" })
    ).toBe("advisor");
  });
});
