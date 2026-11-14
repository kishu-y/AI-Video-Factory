---
name: story-retention
description: Design and evaluate original, high-retention animated stories for short vertical videos. Use before story generation, when rewriting a weak hook, when reviewing scripts or reference videos, and before committing to costly asset generation.
---

# Story Retention and Originality

Use this skill for **storycraft**, not as a license to imitate an example video's plot. Read [AGENTS.md](../../../AGENTS.md) for runtime boundaries. The production agents cannot load skill files dynamically; a compact counterpart is wired into `packages/agents/src/story-retention.ts`.

## Reference and format decision

Two tested examples (local user footage; do not check source media into git):

- **Baseline:** "The Squeak That Followed": 1920×1080, 30 fps, 10.5 s. The robot hears a squeak, then discovers a duck. This proves rendering but has low narrative stakes and an obvious payoff.
- **Storytelling reference:** uploaded `saveinta.mp4`: 720×1280 portrait, 30 fps, 122.4 s. The story starts in an ordinary classroom, introduces an unsettling sound, escalates through a coded warning and a friend's messages, then creates a contradiction at a closed door. Learn only the *abstract mechanisms*: immediate anomaly, escalating evidence, personal stakes, conflicting information, consequential decision, open question.

**Do not copy** the classroom, lockdown, coded announcement, friend hiding in a closet, voice at the door, order of those beats, dialogue, characters or reversal. Do not use any existing movie or short as a plot template; reference media can teach craft only.

Default **creative target** for narrative Shorts: 9:16 portrait, 60–120 s (30 fps; 720×1280 is an acceptable draft reference), with cinematic shot variation, expressive acting and legible captions. This is a recommendation, **not** a claim the current vector renderer supplies 3D character animation. A 10–20 s short is valid for one crisp joke or visual reversal. Longer or horizontal episodes remain user-selectable. Set duration to story needs, not arbitrary padding.

## Current CLI workflow for the next story

The CLI supports `--vertical` and fractional `--minutes`; **portrait is not the default**. Draft the story and script before triggering expensive stages:

```cmd
pnpm ys episode new --topic "YOUR ORIGINAL PREMISE" --lang en --minutes 1.5 --motion vector --budget 1 --manual --vertical
pnpm ys episode run YOUR_NEW_EPISODE_ID --until script
pnpm ys episode show YOUR_NEW_EPISODE_ID
```

Inspect the returned story/script for hook, beats, originality, visual feasibility and the scorecard **before** approving the script or running concept/voice. Under the experimental manual ChatGPT backend this still creates JSON requests; this storytelling skill does **not** automate those file exchanges, nor does `--vertical` turn vector assets into 3D models.

## Process — BEFORE art, voices or rendering

1. **Premise:** Write a one-sentence want, obstacle and consequence. Specify *why the viewer cares* in ordinary words. Emotional, funny and wondrous stakes count; peril is not mandatory.
2. **Divergent concepts:** Propose 3 distinct original ideas differing in protagonist, setting, central mechanism, motivation and ending. Do not merely rename one template. Keep the strongest after comparison.
3. **Originality firewall:** Make a resemblance table against any supplied reference and recent channel episodes (when available): premise, role relationships, distinctive scenes, causal chain, twist and ending. Reject recognizable combinations and redesign from a new causal premise. No unverifiable claims of global originality.
4. **Opening-frame test (0–2 s):** Show a clear, unusual, *already happening* moment. The viewer should infer a pressing question with sound muted. Avoid greetings, logos, "one day", generic walking, exposition and threats without stakes.
5. **Escalation map:** For ~60–120 s, plan 5–8 causal beats. On most beats, answer a small question, change the situation and introduce a harder question. Avoid repeating one mystery with no new evidence. The new information must alter a decision or risk; decorative cuts are not escalation.
6. **Payoff:** A reveal follows planted evidence, changes our understanding and has a visible consequence. Choose a resolved ending, a legitimate moral dilemma or a *earned* series cliffhanger. Never replace the story's ending with only "Part 2?".
7. **Storyboard feasibility:** Every beat has a distinct visible action, shot size, face/emotion or on-screen evidence. Use dialogue and close-ups intentionally, not static narration over unmoving figures. Fit each beat within its actual voice timing. In the present pipeline, dialogue needs its own supported audio solution; do not claim automatic multi-character voice acting.
8. **Editorial approval:** Share the opening, beat map, key reversal, ending and score with a human. **Do not spend on assets before approval.** The existing script/concept checkpoints are where this review belongs; this skill alone does not add a blocking runtime stage.

## Timing patterns

| Format | Opening | Development | Ending |
| --- | --- | --- | --- |
| 10–20 s micro-story | conflict visible in first 0–1 s | one change, one reversal | show payoff, optionally loop |
| 30–60 s | anomaly in first 0–2 s | 2–4 meaningful changes | earned turn and consequence |
| 60–120 s suspense/emotional story | anomaly in first 0–2 s; stakes clear within ~10 s | 5–8 causal beats, a development roughly every 8–15 s; vary rhythm | payoff or consequential cliffhanger with foreshadowing |

These are craft heuristics, not guaranteed YouTube retention metrics. A held close-up or pause is fine when it increases tension.

## Story-quality scorecard (0–5 per dimension)

- **Hook and immediate clarity:** Does the first *frame* pose an urgent, specific question?
- **Character desire and emotional stakes:** What could change or be lost?
- **Causal escalation and pacing:** Does every development create a new problem or change a choice?
- **Surprising but earned reversal:** Is the turn planted, legible and nonrandom?
- **Payoff and aftertaste:** Does the ending deliver consequence, emotion or a fair question?
- **Originality:** Distinct premise, character relationships, causal chain, specific scenes and ending.
- **Production feasibility:** Can the selected rendering mode actually depict the critical actions and evidence?

**Editorial threshold:** target >= 28/35, with hook, originality and payoff each >= 4/5. Any blatant copy or impossible-to-depict central action is a rejection regardless of total. Score with concrete evidence and reasons; AI self-scores are proposals, not objective measurement. If a premise fails, rewrite *the idea*, not merely the adjectives.

## Story handoff template

For each candidate supply:

- Working title; target audience; genre/tone; suggested duration and aspect ratio.
- One-sentence original premise and a one-line emotional stake.
- Exact first-frame visual and the first spoken line (if needed).
- 5–8 numbered causal beats for 60–120 s, each with an explicit new fact, action, rising question and visual.
- Reversal, its earlier setup, final consequence or fair cliffhanger.
- Originality notes compared with *supplied* references and known previous episodes.
- Scorecard with pass / revise / reject decision; production-mode limitations.

## Failure patterns to reject

- A generic question is asked, the obvious object appears, and the story ends.
- Fake suspense: loud sound, dark room or camera shake with no meaningful stakes.
- Multiple arbitrary twists with no established cause.
- A copy of the supplied reference with new names or a different location.
- Overexplaining a twist before showing it; unreadable tiny props in a wide shot.
- A story dependent on walking, handoffs or facial acting when the chosen mode cannot convincingly animate them.
- Forced danger or unresolved cliffhangers in every episode; vary wonder, humor, irony, empathy, mystery and triumph.

## Next-production quality loop

1. Approve the original story and storyboard **before** generation.
2. Render a short motion test of the most difficult story beat.
3. Review the finished video for silent-viewer clarity, audible stakes, foot/prop continuity, acting, evidence legibility, title/caption readability and reveal timing.
4. Keep only supported lessons in the existing episode-review history; do not declare the clip successful because the renderer produced an MP4.
5. When published and analytics are available, compare first-second hold, average view duration, completion, rewatches and comments; iterate based on measured evidence rather than guessed virality.
