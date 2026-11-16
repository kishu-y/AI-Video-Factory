/**
 * Opt-in manual agent backend.
 *
 * Allows an external assistant (for example, ChatGPT in a conversation) to
 * supply schema-validated agent results without a Claude Code subscription.
 * It does not replace media, voice, image or video providers.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { modelFor } from "@ys/core";
import { z } from "zod";
import type { AgentCall, AgentDeps, AgentResult } from "./runner.ts";

/** Write one request per unique prompt and wait for a matching JSON response. */
export async function runManualStructured<T>(call: AgentCall<T>, deps: AgentDeps = {}): Promise<AgentResult<T>> {
  const started = Date.now();
  const model = modelFor(call.name, call.model, deps.models);
  const { $schema: _ignored, ...outputSchema } = z.toJSONSchema(call.schema, { target: "draft-7", io: "input" }) as Record<string, unknown>;
  const hash = createHash("sha256")
    .update(JSON.stringify([
      call.name, call.system, call.prompt, outputSchema,
      ...(call.images?.length ? [call.images.map((img) => ({
        mimeType: img.mimeType,
        sha256: createHash("sha256").update(img.data).digest("hex"),
      }))] : []),
    ]))
    .digest("hex")
    .slice(0, 16);
  const safeName = call.name.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 64) || "agent";
  const filename = `${safeName}-${hash}.json`;
  const root = resolve(process.env.YS_MANUAL_DIR || ".data/manual-agents");
  const requestDir = join(root, "requests");
  const responseDir = join(root, "responses");
  await mkdir(requestDir, { recursive: true });
  await mkdir(responseDir, { recursive: true });

  const requestFile = join(requestDir, filename);
  const responseFile = join(responseDir, filename);

  // Preserve vision inputs for a human reviewer without embedding megabytes of
  // base64 in the request JSON. Image bytes are part of the request hash above,
  // so a changed drawing always gets its own review response file.
  const imageFiles: { path: string; mimeType: string }[] = [];
  if (call.images?.length) {
    const imageDir = join(requestDir, "images");
    await mkdir(imageDir, { recursive: true });
    for (const [index, img] of call.images.entries()) {
      const extension = {
        "image/png": "png",
        "image/jpeg": "jpg",
        "image/webp": "webp",
        "image/gif": "gif",
      }[img.mimeType];
      if (!extension) throw new Error(`Unsupported manual agent image type: ${img.mimeType}`);
      const path = join(imageDir, `${safeName}-${hash}-${index + 1}.${extension}`);
      try {
        await writeFile(path, img.data, { flag: "wx" });
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e;
      }
      imageFiles.push({ path, mimeType: img.mimeType });
    }
  }

  const request = {
    agent: call.name,
    modelHint: model,
    system: call.system,
    prompt: call.prompt,
    outputSchema,
    ...(imageFiles.length ? { images: imageFiles } : {}),
    responseFile,
    note: imageFiles.length
      ? "Inspect every listed image before evaluating; create JSON matching outputSchema and save it as responseFile. No Markdown fences."
      : "Create a JSON object matching outputSchema and save it as responseFile. No Markdown fences.",
  };

  // Keep existing request files intact so they can be reviewed or resumed.
  try {
    await writeFile(requestFile, JSON.stringify(request, null, 2) + "\n", { flag: "wx" });
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e;
  }

  let raw: string;
  try {
    raw = await readFile(responseFile, "utf8");
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(
        `Manual agent response needed for "${call.name}". Read: ${requestFile}; save matching JSON to: ${responseFile}; then rerun the command.`,
      );
    }
    throw e;
  }

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error(`Manual agent response is not valid JSON: ${responseFile}`);
  }

  const validated = call.schema.safeParse(value);
  if (!validated.success) {
    throw new Error(`Manual agent response failed schema validation (${responseFile}):\n${z.prettifyError(validated.error)}`);
  }
  deps.log?.(`manual agent: ${call.name} accepted from ${responseFile} ($0 API charge)`);
  return {
    data: validated.data,
    name: call.name,
    model: "manual",
    costUsd: 0,
    durationMs: Date.now() - started,
  };
}
