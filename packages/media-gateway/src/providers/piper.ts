/**
 * Offline Piper TTS adapter. Enable with PIPER_MODEL=<path to .onnx>
 * and optionally PIPER_EXE=<path to piper.exe>.
 *
 * Piper does not return word alignment; the pipeline aligns the WAV locally.
 */
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type {
  GenerateContext, GenerationRequest, GenerationResult,
  ProviderAdapter, ProviderLimits, PriceRule,
} from "../types.ts";

export type PiperSynthesizer = (
  executable: string, modelPath: string, text: string, signal?: AbortSignal,
) => Promise<Uint8Array>;

const synthesizePiper: PiperSynthesizer = async (executable, modelPath, text, signal) => {
  const directory = await mkdtemp(join(tmpdir(), "ys-piper-"));
  const wavFile = join(directory, "narration.wav");
  try {
    const child = spawn(executable, ["--model", modelPath, "--output_file", wavFile], {
      stdio: ["pipe", "ignore", "pipe"],
      windowsHide: true,
      signal,
    });
    let errors = "";
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk: string) => { errors = (errors + chunk).slice(-4000); });
    const done = new Promise<void>((resolve, reject) => {
      child.once("error", reject);
      child.once("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Piper exited with code ${code}: ${errors.trim() || "no stderr"}`));
      });
    });
    // Explicitly handle early exits to avoid an unhandled EPIPE.
    child.stdin.on("error", () => {});
    child.stdin.end(text.trim() + "\n", "utf8");
    await done;
    return new Uint8Array(await readFile(wavFile));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
};

/** Local audio output with no API use or voiceId requirement. */
export class PiperTtsAdapter implements ProviderAdapter {
  readonly id = "piper:local";
  readonly local = true;
  readonly capabilities = ["tts"] as const;
  readonly limits: ProviderLimits = {};
  readonly qualityPrior = 0.7;
  readonly price: PriceRule = { unit: "free" };

  constructor(
    private readonly modelPath: string,
    private readonly executable = "piper",
    private readonly synth: PiperSynthesizer = synthesizePiper,
  ) {}

  async generate(req: GenerationRequest, ctx: GenerateContext): Promise<GenerationResult> {
    if (!req.text?.trim()) throw new Error("Piper requires nonempty TTS text.");
    const bytes = await this.synth(this.executable, this.modelPath, req.text, ctx.signal);
    // Do not silently forward corrupt/missing audio into the timeline.
    if (bytes.length < 44 || String.fromCharCode(...bytes.subarray(0, 4)) !== "RIFF" ||
        String.fromCharCode(...bytes.subarray(8, 12)) !== "WAVE") {
      throw new Error("Piper did not produce a valid WAV file.");
    }
    return { files: [{ bytes, mimeType: "audio/wav" }] };
  }
}
