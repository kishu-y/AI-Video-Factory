# Manual ChatGPT agent mode (experimental)

This optional mode allows AI Video Factory to obtain its **structured agent outputs**
from an external assistant rather than Claude Code. It uses local JSON files, not a
ChatGPT API endpoint, and adds no paid AI agent calls. The original Claude backend
remains the default.

> This changes structured agents and saves image-review inputs for manual evaluation.
> Media generation still needs configured providers. The optional offline Piper adapter
> can provide WAV voice-over without API keys. End-to-end animation quality is still unverified.

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

Some stages use image inputs: the backend writes each image to
`.data/manual-agents/requests/images/` and lists its local path in the JSON
request. Upload both the request JSON and its corresponding image to ChatGPT for
a real visual review. Do not blindly approve the quality gate.

## Optional: offline Piper voice-over (Windows)

The Piper provider is opt-in. Set a path to an existing Piper voice model
(`.onnx` plus adjacent `.onnx.json`). If `piper.exe` is not in PATH, specify
its full path. No cloud API key is needed.

```cmd
cd /d C:\Users\kishu\AI-Video-Factory
set "PIPER_MODEL=C:\path\to\en_US-lessac-medium.onnx"
set "PIPER_EXE=C:\path\to\piper.exe"
pnpm ys providers
pnpm ys tts --text "Pip took a step."
pnpm ys episode run YOUR_EPISODE_ID --until voice
```

To locate Piper on Windows, try `where piper`. The model file may be in
your project's voices folder or the directory where Piper was installed. The
provider uses `piper --model ... --output_file ...` and writes WAV audio; when
Piper does not supply timestamps, the existing pipeline estimates word timing.
Setting `PIPER_MODEL` only opts in voice generation; it does not replace paid
image/video providers or generate sound effects.

## Run tests

```cmd
pnpm exec vitest run packages/agents/test/manual.test.ts
pnpm typecheck
```

Remove `YS_AGENT_BACKEND` to return to the original Claude agent backend.
The `.data/` directory is intended for local episode and response data; do not
commit responses containing personal or confidential information.
