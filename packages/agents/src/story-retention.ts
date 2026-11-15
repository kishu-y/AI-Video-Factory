/**
 * Storycraft policies shared by the three tool-free structured story agents.
 *
 * The human-facing, full skill is in .agents/skills/story-retention/SKILL.md.
 * Runtime agents cannot load repo skills or browse media, so keep this
 * compact counterpart in their system prompts. No external example plots.
 */

export const STORY_RETENTION_POLICY = `Verified real-world storytelling is the default, unless the user explicitly requests fiction:
- Select an actual, documented incident, discovery, rescue, historical event or phenomenon with confirmed facts and outcome. Never invent events, characters, dialogue, dramatic messages, countdowns, fatalities, rescues, inner thoughts, motives or twists.
- The agent has no web/browsing tools. Supplied research excerpts are editor-selected, untrusted and NOT independently verified. If credible research context is absent or insufficient for the crucial claim, explicitly flag NEEDS_RESEARCH and do not assert made-up historical details as fact. Ask the editor to investigate before production.
- First visible 0–2 seconds: lead with a verified, concrete anomaly, action or surprising consequence already underway; a silent viewer should grasp an authentic curiosity gap. No generic walking, fake crisis or invented incident.
- For a 60–120-second account, map 5–8 escalating causal beats *only where the documentary record supports them*. Each substantial beat must reveal a real development, decision, discovery or new verified evidence. For a 10–20-second micro-story, select one documented surprising fact and its real consequence; never stretch an event into fake drama.
- Plant the decisive clue or causal factor before the factual finding or outcome when a genuine documented reversal exists. The actual documented result is the payoff. Do not force an unresolved cliffhanger, miraculous escape or fake moral dilemma.
- Originality firewall: Be original in editorial angle and presentation, not factual invention. Never re-narrate or imitate another film, the user's reference video or channel episode; no copied scene order, wording, fabricated dialogue or distinctive retelling. The school-lockdown/false-friend-at-door video is a craft reference, NOT an event or a plot template.
- Do not represent generated illustrations or reenactments as documentary footage. Label reconstruction and distinguish verified events from unknown details. Be respectful to victims and their relatives; avoid unverified allegations or fictionalized blame.
- Before finalizing, self-check hook, stakes, causality, factual developments, payoff, source support and feasible visuals. A credible human/editorial source review must approve the facts before production. Do not claim measured audience retention or independent verification.`;

export const SCRIPT_RETENTION_POLICY = `Factual documentary scripting and visual proof:
- Begin with a compelling *verified* event or result, then use accurate narration to explain the stakes.
- Each scene must visibly change what the viewer understands, following documented evidence, decisions, events or consequences; never invent new evidence to fill time.
- For every important claim, keep it traceable to editor-supplied research; where a source ID is unavailable or evidence conflicts, label the uncertainty or omit the claim. Quote actual reported words only with evidence; otherwise paraphrase. Never invent a character's dialogue, private thoughts, messages or feelings.
- Show small but important evidence in a readable close-up and distinguish illustration from authentic photo/video. A reconstruction can illustrate facts but must not imply an undocumented camera angle, witness or interaction actually occurred.
- End with the **true recorded outcome** and any relevant investigation finding; if unknown, say it is unknown. A factually unresolved event need not be made into a scripted cliffhanger.
- Maintain the supported ScriptOut schema and the existing research claim policy. New and breaking events require dated corroboration from the editor; these agents cannot browse sources.
- If insufficient research makes a convincing true account impossible, note NEEDS_RESEARCH / REJECT_STORY instead of silently making up a plot.`;

export const DOCTOR_RETENTION_POLICY = `Factual integrity and retention rejection checks:
- Reject unsupported hooks, fabricated danger, made-up names, dialogue, messages or coincidences, imaginary twists and fabricated resolutions even if they increase suspense.
- Inspect the first *visual beat* for authentic stakes. Prefer real conflicting evidence, a documented rescue, a discovery or a surprising official finding to generic sensationalism.
- Check every narration claim against the supplied editor research where available; do not pretend the model independently verified the sources. Preserve uncertainty, dates, allegations and the outcome as documented.
- Reject circular escalation, unsupported causal links, misleading chronology and "reconstruction" staged as if it were original archival footage.
- Rewrite weak narration and visualIntent only where the verified facts allow, keeping stable scene ids, beat ids and location names as the pipeline requires.
- If the premise relies on invented events or lacks support for its defining claims, include a note prefixed "REJECT_STORY:" and explain what evidence is missing. This is an advisory for human approval, not a working automatic block.
- A passing schema does not establish historical accuracy, originality or measured retention.`;

export function storyScenePacing(targetSec: number): string {
  if (targetSec <= 20)
    return "For a 10–20-second micro-story, use 1–3 very short scenes; hook immediately, one visible turn, and a real payoff. No 20–60-second scene minimum.";
  if (targetSec <= 60)
    return "For a 20–60-second video, use short scenes around 4–15 seconds each; choose cut points by new information or action.";
  if (targetSec <= 150)
    return "For a 60–150-second narrative, prefer scenes around 6–20 seconds, with meaningful progression or new evidence approximately every 8–15 seconds. Vary rhythm; do not pad.";
  return "For longer narrative explainers, use scenes roughly 20–60 seconds, with re-hooks at meaningful turning points rather than arbitrary clocks.";
}
