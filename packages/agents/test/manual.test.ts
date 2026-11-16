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

  it("exports image inputs and schema for manual visual review", async () => {
    const dir = await setup();
    const call = { ...exampleCall, images: [{ mimeType: "image/png", data: new Uint8Array([1, 2, 3]) }] };
    await expect(runStructured(call)).rejects.toThrow(/Manual agent response needed/);

    const requests = (await readdir(join(dir, "requests"))).filter((name) => name.endsWith(".json"));
    expect(requests).toHaveLength(1);
    const request = JSON.parse(await readFile(join(dir, "requests", requests[0]!), "utf8"));
    expect(request.images).toHaveLength(1);
    expect(request.images[0].mimeType).toBe("image/png");
    expect(Array.from(await readFile(request.images[0].path))).toEqual([1, 2, 3]);

    await writeFile(request.responseFile, JSON.stringify({ title: "Reviewed", scenes: ["All good"] }));
    const result = await runStructured(call);
    expect(result.data.title).toBe("Reviewed");
  });

  it("does not reuse an image-review answer for a changed image", async () => {
    const dir = await setup();
    const first = { ...exampleCall, images: [{ mimeType: "image/png", data: new Uint8Array([1]) }] };
    const second = { ...exampleCall, images: [{ mimeType: "image/png", data: new Uint8Array([2]) }] };

    await expect(runStructured(first)).rejects.toThrow(/response needed/);
    const firstFile = (await readdir(join(dir, "requests"))).find((name) => name.endsWith(".json"))!;
    await writeFile(join(dir, "responses", firstFile), JSON.stringify({ title: "Old drawing", scenes: ["Checked"] }));

    await expect(runStructured(second)).rejects.toThrow(/response needed/);
    const files = (await readdir(join(dir, "requests"))).filter((name) => name.endsWith(".json"));
    expect(files).toHaveLength(2);
    expect(files).toContain(firstFile);
  });

  it("rejects unsupported image MIME types", async () => {
    await setup();
    await expect(runStructured({ ...exampleCall, images: [{ mimeType: "image/bmp", data: new Uint8Array([1]) }] }))
      .rejects.toThrow(/Unsupported manual agent image type/);
  });
});
