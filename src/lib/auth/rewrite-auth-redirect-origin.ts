/**
 * next-auth's `reqWithEnvURL` rewrites the request origin to `AUTH_URL` /
 * `NEXTAUTH_URL` when either is set. Relative Auth.js redirects (sign-out,
 * sign-in) then land on that env origin — often `http://localhost:3000` —
 * even when the app is running on another port.
 *
 * After Auth.js handles the request, rewrite redirect targets that still
 * point at the env origin back to the actual request origin.
 */
export async function rewriteAuthRedirectToRequestOrigin(
  request: Request,
  response: Response,
): Promise<Response> {
  const envUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
  if (!envUrl) return response;

  let envOrigin: string;
  try {
    envOrigin = new URL(envUrl).origin;
  } catch {
    return response;
  }

  let requestOrigin: string;
  try {
    requestOrigin = new URL(request.url).origin;
  } catch {
    return response;
  }

  if (envOrigin === requestOrigin) return response;

  const location = response.headers.get("Location");
  if (location?.startsWith(envOrigin)) {
    const headers = new Headers(response.headers);
    headers.set("Location", swapOrigin(location, envOrigin, requestOrigin));
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  const wantsJsonRedirect =
    request.headers.get("X-Auth-Return-Redirect") === "1" ||
    request.headers.get("x-auth-return-redirect") === "1";
  if (!wantsJsonRedirect) return response;

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  try {
    const data = (await response.clone().json()) as { url?: unknown };
    if (typeof data.url !== "string" || !data.url.startsWith(envOrigin)) {
      return response;
    }

    const headers = new Headers(response.headers);
    headers.delete("content-length");
    return new Response(
      JSON.stringify({ ...data, url: swapOrigin(data.url, envOrigin, requestOrigin) }),
      {
        status: response.status,
        statusText: response.statusText,
        headers,
      },
    );
  } catch {
    return response;
  }
}

function swapOrigin(url: string, fromOrigin: string, toOrigin: string): string {
  return `${toOrigin}${url.slice(fromOrigin.length)}`;
}
