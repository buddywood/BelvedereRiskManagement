/**
 * Fixed-input OpenAI Whisper transcription probe.
 *
 * Generates a tiny TTS audio sample, transcribes it via Whisper, and verifies
 * the round-trip. Intended for the scheduled `@smoke` canary and operator
 * health checks — not for client-facing transcription.
 */

const SMOKE_TEXT = "Hello, this is a test.";
const TTS_MODEL = "gpt-4o-mini-tts";
const WHISPER_MODEL = "whisper-1";
const TIMEOUT_MS = 30_000;

export interface WhisperSmokeProbeResult {
  ok: true;
  originalText: string;
  transcription: string;
  ttsModel: string;
  whisperModel: string;
  ttsLatencyMs: number;
  whisperLatencyMs: number;
}

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);

  try {
    const result = await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        controller.signal.addEventListener("abort", () =>
          reject(new Error(`${label} timed out after ${ms}ms`))
        );
      }),
    ]);
    clearTimeout(timer);
    return result;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

async function generateTtsAudio(
  apiKey: string
): Promise<{ audioBuffer: ArrayBuffer; latencyMs: number }> {
  const start = Date.now();
  const response = await withTimeout(
    fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: TTS_MODEL,
        input: SMOKE_TEXT,
        voice: "alloy",
        response_format: "mp3",
      }),
    }),
    TIMEOUT_MS,
    "TTS"
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`TTS API returned ${response.status}: ${errorText}`);
  }

  const audioBuffer = await response.arrayBuffer();
  return { audioBuffer, latencyMs: Date.now() - start };
}

async function transcribeAudio(
  apiKey: string,
  audioBuffer: ArrayBuffer
): Promise<{ transcription: string; latencyMs: number }> {
  const start = Date.now();
  const formData = new FormData();
  const audioBlob = new Blob([audioBuffer], { type: "audio/mpeg" });
  formData.append("file", audioBlob, "smoke-probe.mp3");
  formData.append("model", WHISPER_MODEL);

  const response = await withTimeout(
    fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    }),
    TIMEOUT_MS,
    "Whisper"
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Whisper API returned ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as { text: string };
  return { transcription: data.text, latencyMs: Date.now() - start };
}

/**
 * Run a round-trip TTS → Whisper smoke probe.
 * Throws on provider/runtime failure; never persists.
 */
export async function runWhisperSmokeProbe(): Promise<WhisperSmokeProbeResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const ttsResult = await generateTtsAudio(apiKey);
  const whisperResult = await transcribeAudio(apiKey, ttsResult.audioBuffer);

  return {
    ok: true,
    originalText: SMOKE_TEXT,
    transcription: whisperResult.transcription,
    ttsModel: TTS_MODEL,
    whisperModel: WHISPER_MODEL,
    ttsLatencyMs: ttsResult.latencyMs,
    whisperLatencyMs: whisperResult.latencyMs,
  };
}
