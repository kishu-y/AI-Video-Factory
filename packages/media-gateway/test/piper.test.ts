import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createProvidersFromEnv, PiperTtsAdapter } from "../src/index.ts";

function wav(): Uint8Array {
  const bytes = new Uint8Array(44);
  bytes.set([82, 73, 70, 70], 0); // RIFF
  bytes.set([87, 65, 86, 69], 8); // WAVE
  return bytes;
}

describe("Piper TTS", () => {
  it("registers only with a real PIPER_MODEL file", () => {
    const dir = mkdtempSync(join(tmpdir(), "ys-piper-test-"));
    const model = join(dir, "en_US-lessac-medium.onnx");
    writeFileSync(model, "test-model");

    const enabled = createProvidersFromEnv({ NODE_ENV: "test", PIPER_MODEL: model, PIPER_EXE: "piper.exe" }, dir);
    expect(enabled.providers.map((p) => p.id)).toEqual(["piper:local"]);
    expect(enabled.providers[0]).toMatchObject({
      local: true,
      capabilities: ["tts"],
      limits: {},
      price: { unit: "free" },
    });

    const absent = createProvidersFromEnv({ NODE_ENV: "test", PIPER_MODEL: join(dir, "missing.onnx") }, dir);
    expect(absent.providers).toHaveLength(0);
    expect(absent.skipped).toHaveLength(5);
  });

  it("provides local WAV narration without timestamp claims or API cost", async () => {
    const calls: Array<{ exe: string; model: string; text: string }> = [];
    const tts = new PiperTtsAdapter("voice.onnx", "piper.exe", async (exe, model, text) => {
      calls.push({ exe, model, text });
      return wav();
    });
    const result = await tts.generate({ capability: "tts", quality: "standard", text: "Hello Pip." }, { fetch });
    expect(calls).toEqual([{ exe: "piper.exe", model: "voice.onnx", text: "Hello Pip." }]);
    expect(result).toEqual({ files: [{ bytes: wav(), mimeType: "audio/wav" }] });
    expect(result.words).toBeUndefined();
  });

  it("rejects empty narration or a corrupt WAV", async () => {
    const tts = new PiperTtsAdapter("voice.onnx", "piper", async () => new Uint8Array(44));
    await expect(tts.generate({ capability: "tts", quality: "standard", text: "" }, { fetch })).rejects.toThrow(/nonempty/);
    await expect(tts.generate({ capability: "tts", quality: "standard", text: "Hello" }, { fetch })).rejects.toThrow(/valid WAV/);
  });
});
