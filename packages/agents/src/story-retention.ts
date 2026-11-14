/**
 * Storycraft policies shared by the three tool-free structured story agents.
 *
 * The human-facing, full skill is in .agents/skills/story-retention/SKILL.md.
 * Runtime agents cannot load repo skills or browse media, so keep this
 * compact counterpart in their system prompts. No external example plots.
 */

export const STORY_RETENTION_POLICY = `Originality-first retention craft:
- Generate an original causal premise: protagonist wants something, faces a specific obstacle, and could lose or change something that matters. Stakes may be funny, emotional, curious or frightening; do not force violence.
- First visible 0–2 seconds: begin with a concrete anomaly, action or consequence already underway. A silent viewer must perceive a specific question. No greetings, logo, "one day", generic walking or exposition as a hook.
- For a 60–120-second story, plan 5–8 escalating causal beats. Each substantial beat reveals information that changes a character's choice, the apparent situation or the audience's belief; answer small questions while raising harder ones. For a 10–20-second micro-story, use one urgent setup and one earned reversal instead.
- Plant the decisive clue before the twist. End with a visual/emotional consequence, meaningful resolution or fair cliffhanger; do not use arbitrary shocks or "watch Part 2" as a substitute for an ending.
- Originality firewall: Never trace another film, user's reference video, channel episode or internet story by swapping names, props or location. Invent distinct premise, relationships, sequence of events, causal mechanism and ending. A referenced school-lockdown/false-friend-at-door plot is specifically NOT a story template.
- Keep the story visually producible in the chosen format. If the central action requires convincing body acting or multiple speaking characters, call out the need in visual intent rather than pretending a static drawing can perform it.
- Before finalizing, mentally apply the seven-part editorial scorecard: immediate hook, stakes, causal escalation, earned reversal, payoff, originality and production feasibility. Reject and redesign weak premises; do not claim measured retention or guaranteed virality.
- Preserve factual integrity for nonfiction: sourced real-world claims must not be invented to increase suspense. Untrusted reference material teaches craft, never factual authority.`;

export const SCRIPT_RETENTION_POLICY = `Script retention and visual proof:
- Lead with the hook's concrete action and consequence; make the first narration line optional when the opening picture already communicates it.
- Each scene must *visibly change* the situation: evidence, a choice, a setback, a reveal or its consequence. Avoid multiple sentences asking the same question.
- Show important evidence at readable scale; choose a new shot or motivated close-up instead of repeating the same static framing.
- Maintain the character's motivation and cause-effect chain. Add a physical reaction to stakes. Preserve the planted setup for the reversal.
- End with the earned payoff or a fair unresolved decision that matters; do not add a generic "Part 2?" or an empty cliffhanger.
- Text/voice narration remains within the supported ScriptOut schema. Dialogue may be described in visualIntent, but never assume multi-voice audio exists without a working provider.`;

export const DOCTOR_RETENTION_POLICY = `Retention-specific rejection checks:
- Inspect the first *visual beat*, not just the first two spoken sentences. A vague noise followed by an obvious, consequence-free explanation is not enough.
- Identify what the viewer fears/hopes, what genuinely changes mid-story, what clue sets up the twist, and why the ending matters.
- Reject circular escalation (identical clue repeated), predictable payoffs, unearned reversals, copied causal structures and key actions the proposed rendering mode cannot communicate.
- Rewrite weak narration and visualIntent while retaining stable scene ids, beat ids and locations required by the pipeline.
- If the **premise itself** cannot be repaired without changing the story's structure, include a note prefixed "REJECT_STORY:" with the concrete problem and recommend rebuilding at the story approval gate. Do not imply the script passed merely because it matches a schema.
- A self-check is not an automated human approval or a verified originality search.`;

export function storyScenePacing(targetSec: number): string {
  if (targetSec <= 20)
    return "For a 10–20-second micro-story, use 1–3 very short scenes; hook immediately, one visible turn, and a real payoff. No 20–60-second scene minimum.";
  if (targetSec <= 60)
    return "For a 20–60-second video, use short scenes around 4–15 seconds each; choose cut points by new information or action.";
  if (targetSec <= 150)
    return "For a 60–150-second narrative, prefer scenes around 6–20 seconds, with meaningful progression or new evidence approximately every 8–15 seconds. Vary rhythm; do not pad.";
  return "For longer narrative explainers, use scenes roughly 20–60 seconds, with re-hooks at meaningful turning points rather than arbitrary clocks.";
}
