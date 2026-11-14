# AI Video Factory agent workflow

Read `CLAUDE.md` for repository conventions and `docs/PROJE_PLANI.md` before changing architecture. Preserve unrelated working-tree changes. Project documentation and agent instructions are English; narration follows the episode language.

## Original story development and retention

For a new animated story, a weak hook, a reference-video analysis or a script rewrite, read `.agents/skills/story-retention/SKILL.md` **before** drawing assets or producing voice. Its priority is an original premise, immediate visual hook, escalating causal changes, meaningful character stakes, planted reversal and earned payoff. Treat uploaded films as examples of abstract craft, never plot templates. Prefer user approval of the story/beat map before costly media generation. Scores are editorial heuristics, not actual retention metrics.

The three tool-free runtime story agents receive the compact version from `packages/agents/src/story-retention.ts`; a coding-agent skill install alone cannot affect those JSON-only runtime agents. Keep both policies aligned. A `REJECT_STORY:` script-doctor note flags a structural problem for human review; it is **not** a new blocking pipeline stage. The 9:16/60–120 s story target is guidance for narrative shorts, not a renderer or 3D capability change.

## Scene planning, animation and effects

Use the installed HyperFrames skills as production runbooks whenever authoring or improving video scenes. Read only the relevant references rather than loading the entire skill catalog:

| Task | Skills |
| --- | --- |
| Plan or author a HyperFrames scene | `hyperframes`, then its motion/type references |
| Select a transition, title, effect, chart, camera move or 3D block | `hyperframes-registry` before hand-building |
| Scaffold, inspect, preview, check or render | `hyperframes-cli` |
| Reuse Remotion, Three.js, PixiJS, Lottie or other animation code | `remotion-to-hyperframes`; state native / hosted / media editability |
| Footage, images, fonts, voice, sound or colour treatment | `media-use` |
| A new episode in a supported reference style | `style-sampling` when requested |
| Figma input or a supplied video to reconstruct | `figma` or `reverse-any-video` when requested |

Resolve skills through the session catalog. For standalone installations, the usual roots are the user's `.agents/skills` and `.codex/skills`; plugin installations use the plugin's own rules. Do not hardcode a developer's home directory into application code. Follow the installed skill version. Keep this repository's checked-in instructions usable when a developer does not have an optional skill installed: report the missing skill and continue independent work.

Search the HyperFrames registry by the visual's narrative purpose, in English, before writing a named effect. Record the selected item and why it fits. Keep its editable source and dependencies with the scene. Do not select an item just because it looks impressive. Maintain the episode's style pack, palette, identity, narration timing and factual accuracy. Use only the selected runtime's supported schema; a HyperFrames block name is not a Remotion `SceneEffect.kind`.

For motion, define a subject, a narrated action, its reveal/payoff and a readable hold. Prefer a motivated camera move and a clear hero over repeated orbit, pulse and float decoration. Titles should land and remain readable. Use seeded randomness and absolute frame time; preserve seekability. Follow `docs/SCENE_MOTION.md` for the implemented Three.js/PixiJS contract and the HyperFrames fixture.

For HyperFrames output, follow its scene/template, stable-id, asset and paused-timeline contracts. Register asynchronous setup through its readiness protocol. Run `check --json`, inspect the relevant snapshots and review transition boundaries before claiming visual success. Report enabled/skipped audits separately. Render delivery files when the user's task authorizes delivery; a development check or preview is not delivery proof.

## Runtime boundary

The application's `runStructured` agents are tool-free JSON producers with settings, plugins and skills isolated. Installing a skill in this coding environment does not load it into those agents. Keep that isolation. Runtime directing/reviewing uses the compact, project-owned policies in `packages/agents/src/motion-design.ts`, adapted from the runbooks above. Update their prompt-wiring tests when changing those policies.

Do not claim that a runtime agent searched the registry, executed HyperFrames, read a skill or rendered an external project unless that operation actually ran. Automatic external-engine production requires explicit pipeline jobs, staged media, caching, cost/error handling and integration evidence. The existing HyperFrames exporter is a development fixture.
