import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { runWhisperSmokeProbe } from "./whisper-smoke-probe";

const envBackup = { ...process.env };

beforeEach(() => {
  vi.restoreAllMocks();
  process.env = { ...envBackup };
});

afterEach(() => {
  process.env = { ...envBackup };
});

describe("runWhisperSmokeProbe", () => {
  it("throws when OPENAI_API_KEY is not configured", async () => {
    delete process.env.OPENAI_API_KEY;
    await expect(runWhisperSmokeProbe()).rejects.toThrow(
      "OPENAI_API_KEY is not configured"
    );
  });

  it("returns transcription result on success", async () => {
    process.env.OPENAI_API_KEY = "sk-test";

    const mockAudioBuffer = new ArrayBuffer(100);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("/audio/speech")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            arrayBuffer: () => Promise.resolve(mockAudioBuffer),
          });
        }
        if (url.includes("/audio/transcriptions")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ text: "Hello, this is a test." }),
          });
        }
        throw new Error(`Unexpected URL: ${url}`);
      })
    );

    const result = await runWhisperSmokeProbe();
    expect(result.ok).toBe(true);
    expect(result.originalText).toBe("Hello, this is a test.");
    expect(result.transcription).toBe("Hello, this is a test.");
    expect(result.ttsModel).toBe("gpt-4o-mini-tts");
    expect(result.whisperModel).toBe("whisper-1");
    expect(typeof result.ttsLatencyMs).toBe("number");
    expect(typeof result.whisperLatencyMs).toBe("number");
  });

  it("throws on TTS API failure", async () => {
    process.env.OPENAI_API_KEY = "sk-test";

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        text: () => Promise.resolve("Rate limit exceeded"),
      })
    );

    await expect(runWhisperSmokeProbe()).rejects.toThrow("TTS API returned 429");
  });

  it("throws on Whisper API failure", async () => {
    process.env.OPENAI_API_KEY = "sk-test";

    const mockAudioBuffer = new ArrayBuffer(100);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("/audio/speech")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            arrayBuffer: () => Promise.resolve(mockAudioBuffer),
          });
        }
        if (url.includes("/audio/transcriptions")) {
          return Promise.resolve({
            ok: false,
            status: 500,
            text: () => Promise.resolve("Internal server error"),
          });
        }
        throw new Error(`Unexpected URL: ${url}`);
      })
    );

    await expect(runWhisperSmokeProbe()).rejects.toThrow(
      "Whisper API returned 500"
    );
  });
});
