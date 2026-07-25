import "server-only";

import { headers } from "next/headers";

/** Strip BOM, CRLF, wrapping quotes — common when pasting into Vercel env UI. */
function sanitizeUrlEnv(value: string | undefined): string | undefined {
  if (value == null) return undefined;
  let s = value
    .trim()
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "")
    .trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s === "" ? undefined : s;
}

/**
 * Normalize a public site origin for redirects (Stripe Checkout, Billing Portal).
 * Stripe requires absolute http(s) URLs; env values often omit the scheme.
 */
function normalizeOrigin(raw: string | undefined): string | null {
  const s0 = sanitizeUrlEnv(raw);
  if (s0 == null) return null;
  let s = s0.replace(/\/$/, "");
  if (!/^https?:\/\//i.test(s)) {
    s = `https://${s.replace(/^\/+/, "")}`;
  }
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.origin;
  } catch {
    return null;
  }
}

function isLocalhostOrigin(origin: string): boolean {
  try {
    const host = new URL(origin).hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch {
    return false;
  }
}

function vercelDeploymentOrigin(): string | null {
  const vercel = sanitizeUrlEnv(process.env.VERCEL_URL);
  if (!vercel) return null;
  const host = vercel.replace(/^https?:\/\//i, "").split("/")[0]?.trim();
  if (!host) return null;
  return normalizeOrigin(host);
}

/**
 * Env / deployment origin candidates for outbound links.
 * Prefer non-localhost values so a local `.env` NEXT_PUBLIC_URL does not
 * poison Preview/Production invite emails when AUTH_URL or VERCEL_URL is set.
 */
function publicAppOriginCandidates(): string[] {
  const candidates = [
    normalizeOrigin(process.env.AUTH_URL),
    normalizeOrigin(process.env.NEXT_PUBLIC_URL),
    normalizeOrigin(process.env.NEXTAUTH_URL),
    vercelDeploymentOrigin(),
  ].filter((value): value is string => Boolean(value));

  const seen = new Set<string>();
  return candidates.filter((origin) => {
    if (seen.has(origin)) return false;
    seen.add(origin);
    return true;
  });
}

function pickPublicAppOrigin(candidates: string[]): string | null {
  return candidates.find((origin) => !isLocalhostOrigin(origin)) ?? candidates[0] ?? null;
}

function localDevOrigin(): string {
  const port = sanitizeUrlEnv(process.env.PORT) || "3000";
  return `http://localhost:${port}`;
}

/**
 * Fallback when no request is available: env vars + VERCEL_URL + localhost.
 * Skips localhost when any deployed/public origin is configured.
 */
export function getPublicAppUrlFromEnv(): string {
  return pickPublicAppOrigin(publicAppOriginCandidates()) ?? localDevOrigin();
}

/**
 * Best URL for Stripe redirects: derive from the **incoming request** (host + proto)
 * so production matches the domain the user actually opened (custom domain, www, etc.),
 * then fall back to env / VERCEL_URL.
 *
 * Fixes production "Not a valid URL" when AUTH_URL is missing a scheme, has hidden
 * characters, or does not match the live hostname Stripe expects.
 */
export async function resolvePublicAppUrl(): Promise<string> {
  try {
    const h = await headers();
    const hostCombined = h.get("x-forwarded-host") ?? h.get("host") ?? "";
    const hostRaw = hostCombined.split(",")[0]?.trim();
    if (hostRaw) {
      const protoHeader = h.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase() ?? "";
      // Local hosts default to http when the proxy omits x-forwarded-proto so
      // invite links keep the correct port (e.g. http://localhost:3001).
      const hostLower = hostRaw.toLowerCase();
      const isLocalHost =
        hostLower.startsWith("localhost") ||
        hostLower.startsWith("127.0.0.1") ||
        hostLower.startsWith("[::1]");
      const scheme =
        protoHeader === "http" || protoHeader === "https"
          ? protoHeader
          : isLocalHost
            ? "http"
            : "https";
      const origin = normalizeOrigin(`${scheme}://${hostRaw}`);
      // Always prefer the incoming request origin (including localhost:PORT)
      // so local invite emails match the port you're actually testing on.
      if (origin) {
        return origin;
      }
    }
  } catch {
    /* headers() unavailable outside a request */
  }

  return getPublicAppUrlFromEnv();
}

/** @deprecated Use resolvePublicAppUrl() in server actions or getPublicAppUrlFromEnv() elsewhere */
export function getPublicAppUrl(): string {
  return getPublicAppUrlFromEnv();
}

/**
 * Strict env-only resolver for emails / outbound notifications where we
 * compose a URL with no incoming request to lean on. Prefers non-localhost
 * origins. In production / on Vercel we refuse localhost — a wrong link in a
 * recovery email or advisor notification is worse than no link at all.
 * Caller decides what to do with `null` (typically: log and skip the send).
 */
export function getPublicAppUrlStrict(): string | null {
  const candidates = publicAppOriginCandidates();
  const nonLocal = candidates.find((origin) => !isLocalhostOrigin(origin));
  if (nonLocal) return nonLocal;

  const onVercel = Boolean(sanitizeUrlEnv(process.env.VERCEL) || sanitizeUrlEnv(process.env.VERCEL_URL));
  if (process.env.NODE_ENV === "production" || onVercel) {
    return null;
  }
  return candidates[0] ?? localDevOrigin();
}
