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
  if (call.images?.length) {
    throw new Error(
      `Manual agent "${call.name}" requires ${call.images.length} image input(s), which the JSON file backend does not support. Use a supported visual provider for image-review stages.`,
    );
  }

  const started = Date.now();
  const model = modelFor(call.name, call.model, deps.models);
  const { $schema: _ignored, ...outputSchema } = z.toJSONSchema(call.schema, { target: "draft-7", io: "input" }) as Record<string, unknown>;
  const hash = createHash("sha256")
    .update(JSON.stringify([call.name, call.system, call.prompt, outputSchema]))
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
  const request = {
    agent: call.name,
    modelHint: model,
    system: call.system,
    prompt: call.prompt,
    outputSchema,
    responseFile,
    note: "Create a JSON object matching outputSchema and save it as responseFile. No Markdown fences.",
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
