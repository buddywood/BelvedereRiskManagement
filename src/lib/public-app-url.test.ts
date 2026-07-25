import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const headersMock = vi.hoisted(() => vi.fn());

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

import {
  getPublicAppUrlFromEnv,
  getPublicAppUrlStrict,
  resolvePublicAppUrl,
} from "./public-app-url";

describe("public app URL resolvers", () => {
  const envKeys = [
    "AUTH_URL",
    "NEXT_PUBLIC_URL",
    "NEXTAUTH_URL",
    "VERCEL_URL",
    "VERCEL",
    "NODE_ENV",
    "PORT",
  ] as const;
  const previous = new Map<string, string | undefined>();

  beforeEach(() => {
    for (const key of envKeys) {
      previous.set(key, process.env[key]);
      delete process.env[key];
    }
    headersMock.mockReset();
    headersMock.mockRejectedValue(new Error("headers unavailable"));
  });

  afterEach(() => {
    for (const key of envKeys) {
      const value = previous.get(key);
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it("skips localhost NEXT_PUBLIC_URL when AUTH_URL is a public host", () => {
    process.env.NEXT_PUBLIC_URL = "http://localhost:3000";
    process.env.AUTH_URL = "https://preview.akilirisk.com";

    expect(getPublicAppUrlFromEnv()).toBe("https://preview.akilirisk.com");
    expect(getPublicAppUrlStrict()).toBe("https://preview.akilirisk.com");
  });

  it("prefers VERCEL_URL over localhost NEXT_PUBLIC_URL", () => {
    process.env.NEXT_PUBLIC_URL = "http://localhost:3000";
    process.env.VERCEL_URL = "akili-risk-git-staging-ebilly.vercel.app";

    expect(getPublicAppUrlFromEnv()).toBe(
      "https://akili-risk-git-staging-ebilly.vercel.app"
    );
  });

  it("refuses localhost on Vercel for strict email URLs", () => {
    process.env.NEXT_PUBLIC_URL = "http://localhost:3000";
    process.env.VERCEL = "1";

    expect(getPublicAppUrlStrict()).toBeNull();
  });

  it("allows localhost only in local non-Vercel development", () => {
    process.env.NEXT_PUBLIC_URL = "http://localhost:3000";
    process.env.NODE_ENV = "development";

    expect(getPublicAppUrlStrict()).toBe("http://localhost:3000");
  });

  it("uses PORT for the local fallback origin", () => {
    process.env.NODE_ENV = "development";
    process.env.PORT = "3001";

    expect(getPublicAppUrlFromEnv()).toBe("http://localhost:3001");
    expect(getPublicAppUrlStrict()).toBe("http://localhost:3001");
  });

  it("uses the localhost request host and port for local testing", async () => {
    process.env.AUTH_URL = "https://preview.akilirisk.com";
    process.env.NEXT_PUBLIC_URL = "http://localhost:3000";
    headersMock.mockResolvedValue(
      new Headers({
        host: "localhost:3001",
      })
    );

    await expect(resolvePublicAppUrl()).resolves.toBe("http://localhost:3001");
  });

  it("uses a public request host when present", async () => {
    process.env.NEXT_PUBLIC_URL = "http://localhost:3000";
    headersMock.mockResolvedValue(
      new Headers({
        host: "preview.akilirisk.com",
        "x-forwarded-proto": "https",
      })
    );

    await expect(resolvePublicAppUrl()).resolves.toBe(
      "https://preview.akilirisk.com"
    );
  });
});
