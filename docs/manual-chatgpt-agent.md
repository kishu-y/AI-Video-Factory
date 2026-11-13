# Manual ChatGPT agent mode (experimental)

This optional mode allows AI Video Factory to obtain its **structured agent outputs**
from an external assistant rather than Claude Code. It uses local JSON files, not a
ChatGPT API endpoint, and adds no paid AI agent calls. The original Claude backend
remains the default.

> This changes only the structured text agents. It does not provide image generation,
> voice-over, video generation or image-based quality review. Those still require
> configured media services or separate integrations. The end-to-end animation pipeline
> has **not** been validated with this mode yet.

## Windows Command Prompt

From the project root:

```cmd
set YS_AGENT_BACKEND=manual
set YS_MANUAL_DIR=.data\manual-agents
pnpm ys episode new --topic "The noise behind the door" --lang en --minutes 0.5 --motion vector --style-pack kids-cartoon --clips 0 --budget 1 --manual
```

Copy the printed episode ID. Then:

```cmd
pnpm ys episode run YOUR_EPISODE_ID --until story
```

At the first uncached structured agent call, the command stops and shows two
paths:

- `.data/manual-agents/requests/<agent>-<hash>.json` contains the system prompt,
  user prompt, and JSON output schema.
- `.data/manual-agents/responses/<agent>-<hash>.json` is the response file to
  create. Use the exact filename from the error, and write a **JSON object** without
  Markdown fences, matching the request's `outputSchema`.

Send the request file's content to ChatGPT and ask it to produce JSON satisfying
`outputSchema`. Paste its JSON response into the response file. Rerun the same
`pnpm ys episode run ...` command. Repeat for each later agent request.

The filename contains a fingerprint of the prompt and schema, so a different
prompt produces a different response file. Existing responses are validated with
the agent's Zod schema on every use. A malformed or incomplete response fails
with a clear error rather than silently continuing.

Some stages use image inputs: the manual JSON backend **intentionally rejects**
them instead of pretending to have reviewed visual content. Start by testing
the style/story/script stages only; do not expect the complete video pipeline
to work without further media and voice adapters.

## Run tests

```cmd
pnpm exec vitest run packages/agents/test/manual.test.ts
pnpm typecheck
```

Remove `YS_AGENT_BACKEND` to return to the original Claude agent backend.
The `.data/` directory is intended for local episode and response data; do not
commit responses containing personal or confidential information.
