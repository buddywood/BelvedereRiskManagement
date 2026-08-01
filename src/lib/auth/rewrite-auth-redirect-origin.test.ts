import { afterEach, describe, expect, it } from "vitest";

import { rewriteAuthRedirectToRequestOrigin } from "@/lib/auth/rewrite-auth-redirect-origin";

describe("rewriteAuthRedirectToRequestOrigin", () => {
  const originalAuthUrl = process.env.AUTH_URL;
  const originalNextAuthUrl = process.env.NEXTAUTH_URL;

  afterEach(() => {
    if (originalAuthUrl === undefined) delete process.env.AUTH_URL;
    else process.env.AUTH_URL = originalAuthUrl;
    if (originalNextAuthUrl === undefined) delete process.env.NEXTAUTH_URL;
    else process.env.NEXTAUTH_URL = originalNextAuthUrl;
  });

  it("rewrites Location headers from AUTH_URL origin to the request origin", async () => {
    process.env.AUTH_URL = "http://localhost:3000";
    delete process.env.NEXTAUTH_URL;

    const request = new Request("http://localhost:3001/api/auth/signout");
    const response = new Response(null, {
      status: 302,
      headers: { Location: "http://localhost:3000/" },
    });

    const rewritten = await rewriteAuthRedirectToRequestOrigin(request, response);

    expect(rewritten.headers.get("Location")).toBe("http://localhost:3001/");
  });

  it("rewrites JSON redirect urls for X-Auth-Return-Redirect clients", async () => {
    process.env.AUTH_URL = "http://localhost:3000";
    delete process.env.NEXTAUTH_URL;

    const request = new Request("http://localhost:3001/api/auth/signout", {
      method: "POST",
      headers: { "X-Auth-Return-Redirect": "1" },
    });
    const response = Response.json({ url: "http://localhost:3000/pricing" });

    const rewritten = await rewriteAuthRedirectToRequestOrigin(request, response);
    const data = (await rewritten.json()) as { url: string };

    expect(data.url).toBe("http://localhost:3001/pricing");
  });

  it("leaves responses alone when AUTH_URL matches the request origin", async () => {
    process.env.AUTH_URL = "http://localhost:3000";
    delete process.env.NEXTAUTH_URL;

    const request = new Request("http://localhost:3000/api/auth/signout");
    const response = new Response(null, {
      status: 302,
      headers: { Location: "http://localhost:3000/" },
    });

    const rewritten = await rewriteAuthRedirectToRequestOrigin(request, response);

    expect(rewritten.headers.get("Location")).toBe("http://localhost:3000/");
    expect(rewritten).toBe(response);
  });

  it("leaves responses alone when AUTH_URL is unset", async () => {
    delete process.env.AUTH_URL;
    delete process.env.NEXTAUTH_URL;

    const request = new Request("http://localhost:3001/api/auth/signout");
    const response = new Response(null, {
      status: 302,
      headers: { Location: "http://localhost:3000/" },
    });

    const rewritten = await rewriteAuthRedirectToRequestOrigin(request, response);

    expect(rewritten).toBe(response);
  });
});
