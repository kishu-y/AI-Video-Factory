import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { z } from "zod";
import { runStructured } from "../src/runner.ts";

const dirs: string[] = [];
afterEach(async () => {
  vi.unstubAllEnvs();
  await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

const exampleCall = {
  name: "story-architect",
  model: "ignored",
  system: "Generate an original story.",
  prompt: "A short story about a hallway.",
  schema: z.object({ title: z.string(), scenes: z.array(z.string()).min(1) }),
};

async function setup() {
  const dir = await mkdtemp(join(tmpdir(), "ys-manual-agent-"));
  dirs.push(dir);
  vi.stubEnv("YS_AGENT_BACKEND", "manual");
  vi.stubEnv("YS_MANUAL_DIR", dir);
  return dir;
}

describe("manual agent backend", () => {
  it("exports the schema and accepts a validated response on retry", async () => {
    const dir = await setup();
    await expect(runStructured(exampleCall)).rejects.toThrow(/Manual agent response needed/);
    const files = await readdir(join(dir, "requests"));
    expect(files).toHaveLength(1);
    const file = files[0]!;
    const request = JSON.parse(await readFile(join(dir, "requests", file), "utf8"));
    expect(request.agent).toBe("story-architect");
    expect(request.outputSchema.type).toBe("object");
    expect(request.prompt).toBe(exampleCall.prompt);
    await writeFile(join(dir, "responses", file), JSON.stringify({ title: "The Sound", scenes: ["Scene one"] }));
    const response = await runStructured(exampleCall);
    expect(response.data).toEqual({ title: "The Sound", scenes: ["Scene one"] });
    expect(response.costUsd).toBe(0);
    expect(response.model).toBe("manual");
  });

  it("rejects invalid JSON and schema violations", async () => {
    const dir = await setup();
    await expect(runStructured(exampleCall)).rejects.toThrow(/response needed/);
    const [filename] = await readdir(join(dir, "requests"));
    const responsePath = join(dir, "responses", filename!);
    await writeFile(responsePath, "{invalid");
    await expect(runStructured(exampleCall)).rejects.toThrow(/not valid JSON/);
    await writeFile(responsePath, JSON.stringify({ title: 42, scenes: [] }));
    await expect(runStructured(exampleCall)).rejects.toThrow(/schema validation/);
  });

  it("does not silently drop image input", async () => {
    await setup();
    await expect(runStructured({ ...exampleCall, images: [{ mimeType: "image/png", data: new Uint8Array([1]) }] }))
      .rejects.toThrow(/does not support/);
  });
});
