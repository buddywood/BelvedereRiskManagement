import { test, expect, type APIRequestContext } from "@playwright/test";
import { SignInPage } from "../page-objects/SignInPage";

/**
 * AI Whisper transcription canary.
 *
 * Exercises the real OpenAI Whisper API via a round-trip probe: generates a
 * tiny TTS sample, transcribes it, and verifies the output. Uses a fixed
 * synthetic input — no interview reads, no DB writes.
 *
 * Canary contract (same as intake TTS):
 *   - Advisor password login only (no client magic-link).
 *   - Fails loudly on quota / credential / transcription failures so the
 *     scheduled preview run surfaces OpenAI outages.
 *   - Skips only when OPENAI_API_KEY is missing on the deployment.
 */

const PROBE_PATH = "/api/ai-transcription/smoke-probe";

async function cookieHeaderFromPage(page: import("@playwright/test").Page) {
  const cookies = await page.context().cookies();
  return cookies.map((c) => `${c.name}=${c.value}`).join("; ");
}

async function postTranscriptionProbe(
  request: APIRequestContext,
  cookies: string | undefined
) {
  return request.post(PROBE_PATH, {
    headers: {
      ...(cookies ? { cookie: cookies } : {}),
    },
  });
}

function skipWhenOpenAiKeyMissing(status: number, payload: { error?: string }) {
  if (status === 503 && payload.error?.includes("OPENAI_API_KEY")) {
    test.skip(
      true,
      "OPENAI_API_KEY is not configured on the target deployment"
    );
  }
}

function probeFailureHint(
  status: number,
  payload: { error?: string },
  rawBody: string
): string {
  return [
    "AI Whisper transcription probe failed",
    `status=${status}`,
    payload.error ? `error=${payload.error}` : null,
    "If preview recently exhausted OpenAI quota, replenish credits and rerun smoke.",
    rawBody ? `body=${rawBody.slice(0, 240)}` : null,
  ]
    .filter(Boolean)
    .join(" — ");
}

test.describe("AI Whisper transcription", () => {
  test("unauthenticated POST returns 401", async ({ request }) => {
    const response = await postTranscriptionProbe(request, undefined);
    expect(response.status()).toBe(401);
  });

  test(
    "advisor receives transcription round-trip result (quota canary)",
    { tag: "@smoke" },
    async ({ page, request }) => {
      test.setTimeout(120_000);

      await new SignInPage(page).signInAs("advisor");
      const cookies = await cookieHeaderFromPage(page);

      const response = await postTranscriptionProbe(request, cookies);
      const status = response.status();
      const rawBody = await response.text();
      let payload: {
        error?: string;
        ok?: boolean;
        originalText?: string;
        transcription?: string;
        ttsLatencyMs?: number;
        whisperLatencyMs?: number;
      } = {};
      try {
        payload = JSON.parse(rawBody) as typeof payload;
      } catch {
        // non-JSON error body
      }

      if (status !== 200) {
        skipWhenOpenAiKeyMissing(status, payload);
        expect(status, probeFailureHint(status, payload, rawBody)).toBe(200);
        return;
      }

      expect(payload.ok).toBe(true);
      expect(payload.originalText).toBe("Hello, this is a test.");
      expect(payload.transcription?.toLowerCase()).toContain("hello");
      expect(payload.ttsLatencyMs).toBeGreaterThan(0);
      expect(payload.whisperLatencyMs).toBeGreaterThan(0);
    }
  );
});
