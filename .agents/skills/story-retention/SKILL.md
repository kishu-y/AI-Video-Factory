---
name: story-retention
description: Research and adapt verifiable real-world incidents into high-retention animated documentary stories without inventing facts, scenes, quotes, characters or outcomes. Use before story generation, when rewriting a weak hook, when reviewing scripts or reference videos, and before committing to costly asset generation.
---

# Verified True Stories — Retention and Factual Integrity

**Channel default: documented real events, not fabricated fiction.** The audience should be able to look up the event. Use this skill to research and shape factual stories, not to invent plots or imitate another video's narrative. Fiction is opt-in only when the user explicitly requests it. Read [AGENTS.md](../../../AGENTS.md) for runtime boundaries. The production agents cannot load skill files dynamically; a compact counterpart is wired into `packages/agents/src/story-retention.ts`.

## Nonfiction hard rules (current channel default)

- **REAL EVENT ONLY:** Every story must identify an actual incident, the **date/place/people when confirmed**, and its outcome. Source the crucial hooks, reversals and final facts. Do not fabricate characters, conversations, feelings, countdowns, texts, warnings, deaths, rescues or causal links.
- **Sources before scripts:** Research the event *before* selecting a hook. Prefer primary records. For breaking/current reports use dated, corroborated trustworthy sources and label allegations and evolving uncertainty. If no adequate records exist, choose a different event. No source is never permission to improvise.
- **Evidence ledger:** For each beat maintain `claim | source URL | quoted/paraphrased evidence | confidence/uncertainty | visual treatment`. Keep quotes short, accurate, attributed and only if supported; otherwise use narration paraphrase instead of invented speech bubbles.
- **Chronology truth:** A true documented climax can be teased in the first second with a clear flash-forward, but events must not be re-ordered or spliced to imply false causation. Don't assign private thoughts or dialogue. Do not create a fake "new clue" that investigators never found.
- **Ethical depiction:** Be factual and respectful toward victims and surviving families. Avoid graphic exploitation and unsupported blame. Distinguish fact from hypothesis and from illustrative staging. A dramatized shot is marked `reconstruction`; no AI reconstruction is passed off as real footage.
- **Outcome first, score second:** If the documented ending does not support the proposed twist or payoff, change the editorial approach or reject the event. Never force the story to fit a seven-beat formula.
- **Runtime limitation:** The tool-free Story Architect, Screenwriter and Script Doctor cannot browse or verify URLs themselves. The editor must supply source research; a model-generated story without verified source context is *unverified*, not production-ready. The existing skill/prompt update does not create a new automatic hard gate.

### Example source-backed candidate (research, not a plot template)

**British Airways Flight 5390, 10 June 1990**: An AAIB investigation documented a cockpit windscreen separating at about 17,300 feet, the captain partly pulled outside, cabin crew restraining him, a successful emergency landing at Southampton and 87 survivors. The report attributes the loss of the windscreen to incorrectly sized fastening bolts and maintenance/oversight failures. Verified government record: https://www.gov.uk/aaib-reports/1-1992-bac-one-eleven-g-bjrt-10-june-1990. This extraordinary real event illustrates that accurate reporting can provide a powerful first-frame hook without inventing jeopardy. Confirm specific details against the official report before scripting.

## Reference and format decision

Two tested examples (local user footage; do not check source media into git):

- **Baseline:** "The Squeak That Followed": 1920×1080, 30 fps, 10.5 s. The robot hears a squeak, then discovers a duck. This proves rendering but has low narrative stakes and an obvious payoff.
- **Storytelling reference:** uploaded `saveinta.mp4`: 720×1280 portrait, 30 fps, 122.4 s. The story starts in an ordinary classroom, introduces an unsettling sound, escalates through a coded warning and a friend's messages, then creates a contradiction at a closed door. Learn only the *abstract mechanisms*: immediate anomaly, escalating evidence, personal stakes, conflicting information, consequential decision, open question.

**Do not copy** the classroom, lockdown, coded announcement, friend hiding in a closet, voice at the door, order of those beats, dialogue, characters or reversal. Do not use any existing movie or short as a plot template; reference media can teach craft only.

Default **creative target** for narrative Shorts: 9:16 portrait, 60–120 s (30 fps; 720×1280 is an acceptable draft reference), with cinematic shot variation, expressive acting and legible captions. This is a recommendation, **not** a claim the current vector renderer supplies 3D character animation. A 10–20 s short is valid for one crisp joke or visual reversal. Longer or horizontal episodes remain user-selectable. Set duration to story needs, not arbitrary padding.

## Current CLI workflow for the next story

The CLI supports `--vertical` and fractional `--minutes`; **portrait is not the default**. Draft the story and script before triggering expensive stages:

```cmd
pnpm ys episode new --topic "YOUR DOCUMENTED REAL EVENT" --lang en --minutes 1.5 --motion vector --budget 1 --manual --vertical
pnpm ys episode run YOUR_NEW_EPISODE_ID --until script
pnpm ys episode show YOUR_NEW_EPISODE_ID
```

Inspect the returned story/script for hook, beats, originality, visual feasibility and the scorecard **before** approving the script or running concept/voice. Under the experimental manual ChatGPT backend this still creates JSON requests; this storytelling skill does **not** automate those file exchanges, nor does `--vertical` turn vector assets into 3D models.

## Process — BEFORE art, voices or rendering

1. **Event selection:** Identify 3 **different real, verifiable events** with authentic human stakes, unusual evidence or an extraordinary outcome. Prefer documented cases with a clear beginning, escalation and resolution. Do not fabricate a premise or sensationalize a routine incident.
2. **Source gate:** Find at least one strong primary source (official investigation, court record, scientific paper, contemporaneous first-hand record, public agency record) and corroborate with credible independent reporting where practicable. Save URLs, publication/event dates, exact supporting passages and unresolved contradictions. If the key claim cannot be supported, **reject the event**; don't invent missing details.
3. **Factual originality:** Choose a fresh *editorial angle* and visual sequence; the event and its outcome stay fixed. Check recent channel episodes and avoid reproducing another documentary's narration, phrasing, edited shot order or distinctive invented treatment. An original presentation is not an invented event.
4. **Opening-frame test (0–2 s):** Show a clear, unusual, *already happening* moment. The viewer should infer a pressing question with sound muted. Avoid greetings, logos, "one day", generic walking, exposition and threats without stakes.
5. **Escalation map:** For ~60–120 s, plan 5–8 causal beats. On most beats, answer a small question, change the situation and introduce a harder question. Avoid repeating one mystery with no new evidence. The new information must alter a decision or risk; decorative cuts are not escalation.
6. **Payoff:** Reveal what investigators, contemporaneous records or direct participants actually established. Preserve the **real outcome**, even when it is modest or unresolved. Never invent a twist, rescue, moral dilemma, cliffhanger or last-minute confession to make it more dramatic.
7. **Incident follow-up and viewer prediction:** Record an explicit verification cutoff, document the next expected reliable development, and ask only a neutral, checkable viewer prediction about an unresolved outcome. Plan a follow-up only when new facts emerge.
8. **Storyboard feasibility:** Every beat has a distinct visible action, shot size, face/emotion or on-screen evidence. Use dialogue and close-ups intentionally, not static narration over unmoving figures. Fit each beat within its actual voice timing. In the present pipeline, dialogue needs its own supported audio solution; do not claim automatic multi-character voice acting.
9. **Editorial approval:** Share the opening, beat map, key reversal, ending and score with a human. **Do not spend on assets before approval.** The existing script/concept checkpoints are where this review belongs; this skill alone does not add a blocking runtime stage.

## Incident lifecycle and prediction loop

**Real news is an ongoing record, not a fictional serial.** Every episode must identify exactly what was known at a stated editorial cutoff date/time and which later facts would change the story.

1. **Episode A — what happened:** Verify the incident, date, relevant official record, established consequences and what remains unresolved. Cite the most important claims. Separate `CONFIRMED`, `OFFICIAL PRELIMINARY FINDING`, `FORECAST`, `ALLEGATION` and `UNKNOWN`.
2. **Viewer prediction:** Ask one genuinely open, time-bounded and independently checkable question. Offer 2–3 neutral options only if there is a measurable outcome. A prediction is an audience opinion, **not** evidence or our forecast. Don't ask viewers to predict deaths, disasters or guilt.
3. **Update trigger:** Note the earliest relevant agency decision, report, result, recovery forecast or independently verified follow-up. For a fast-moving incident, recheck on a sensible schedule (e.g. next day); for an investigation, wait for a material finding. No automatic monitoring exists just because this skill describes it.
4. **Episode B — what happened next:** Recheck official and reputable independent sources, note what changed, preserve the exact original question and cutoff, and show whether the outcome is `CONFIRMED`, `PARTIAL`, `PENDING` or `DISPUTED`. Never claim viewers were right or wrong without collecting real poll/comment data.
5. **Causal discipline:** A later related news story is not proof of causality. Show connections only if supported by evidence. If there is no meaningful development, publish no forced follow-up.

### Incident tracking record

Maintain a durable editorial record with: `incidentId`, `eventDate`, `lastVerifiedAt` (with time zone), `confirmedTimeline`, `sourceURLs`, `claimsAndConfidence`, `openQuestions`, `viewerPredictionExactText`, `predictionDeadline`, `outcomeStatus`, `followUpEvidence`, `nextCheck`, and `nextEpisodeAngle`. For an example, see `docs/story-cases/2026-11-13-us-ground-stop.md`. New developments require new timestamps and fresh citations; never silently backdate an update or move a prior prediction deadline.

## Pre-publication fact, rights and legal risk review (mandatory editorial step)

This is a production checklist, **not legal advice or legal clearance**. For sensitive claims against identifiable people or organizations, have qualified counsel review the actual video, title, thumbnail and description.

| Risk | Mandatory check |
| --- | --- |
| **False or misleading factual claims** | Verify headline, opening, descriptions, numbers, timeline and conclusion against reliable sources. Qualify preliminary theories and forecasts. Don't make the thumbnail more absolute than the evidence. |
| **Defamation / allegations** | Do not accuse a named employee, company, contractor or individual of negligence, sabotage, cyberattack, crime or incompetence without sufficiently established, attributed evidence. Say "Officials are investigating X" rather than "X caused it" when findings remain preliminary. Be fair about responses and corrections. |
| **Copyright** | Facts can be reported, but a news outlet's footage, photos, script, graphics and music may be protected. Use owned/licensed assets, permission, or a properly evaluated legal exception. Attribution or short length alone does not create permission. Keep asset licenses and receipts. |
| **AI video / visual deception** | Clearly label reenacted or hypothetical shots as `ILLUSTRATION` / `AI RECONSTRUCTION`. Never present invented pilot radio calls, fake eyewitnesses, faux official documents, synthetic news footage or a cloned voice as genuine. Follow current platform disclosure settings for realistic AI-altered or AI-generated content; labeling alone doesn't legalize false or defamatory content. |
| **Privacy and dignity** | Don't expose private contact details, unverified names, sensitive information or humiliating portrayals of uninvolved individuals. Be careful with identifiable victims and minors. |
| **Fair and unbiased framing** | Distinguish primary source claims from independent verification, credible competing explanations and unknowns. Do not falsely equate established findings with unsupported rumors. Avoid clickbait framing that implies a conspiracy unsupported by evidence. |
| **Predictions and follow-ups** | Distinguish viewer speculation from newsroom claims. Don't invent future events or quietly revise a prior prediction. Publish a dated correction/update when the facts change. |
| **Sponsors and commerce** | Disclose sponsorships, affiliate relationships and material endorsements conspicuously when they occur. |

**STOP / REVISE triggers:** no credible source for the central hook; headline exceeds the sources; unsubstantiated blame; fabricated scenes/dialogue presented as facts; unclear footage/music rights; meaningful AI realism left undisclosed where required; predictions that assert imminent catastrophe without evidence; unverified claim about a real person's wrongdoing. A pass through this checklist cannot guarantee no lawsuit, complaint, takedown or demonetization.

**Reference authorities to consult before publishing:**
- FAA ground-stop primary statement: https://www.faa.gov/newsroom/faa-statement-nationwide-ground-stop
- U.S. DOT November 14, 2026 briefing (preliminary technical investigation): https://www.transportation.gov/briefing-room/icymi-us-transportation-secretary-sean-p-duffy-provides-update-restoration-airspace
- U.S. Copyright Office: https://www.copyright.gov/help/faq/faq-protect.html
- YouTube realistic synthetic-content disclosure: https://support.google.com/youtube/answer/14328491
- YouTube misinformation: https://support.google.com/youtube/answer/10834785
- Defamation overview (state rules differ): https://www.law.cornell.edu/wex/defamation
- FTC endorsement disclosures: https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers

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
- **Surprising but documented development:** Does the turn genuinely occur in the sources, with prior factual setup?
- **Payoff and aftertaste:** Does the ending deliver consequence, emotion or a fair question?
- **Editorial originality:** Distinct approach, pacing and presentation without copying a reference or altering the documented facts.
- **Production feasibility:** Can the selected rendering mode actually depict the critical actions and evidence?

**Editorial threshold:** target >= 28/35, with hook, originality and payoff each >= 4/5. Any blatant copy or impossible-to-depict central action is a rejection regardless of total. Score with concrete evidence and reasons; AI self-scores are proposals, not objective measurement. If a premise fails, rewrite *the idea*, not merely the adjectives.

## Story handoff template

For each candidate supply:

- Working title; target audience; genre/tone; suggested duration and aspect ratio.
- One-sentence factual incident description and one-line stakes, both supported by sources.
- Exact first-frame visual and the first spoken line (if needed).
- 5–8 numbered causal beats for 60–120 s, each with an explicit *sourced* new fact, consequence, rising question and feasible visualization.
- Documented reversal or finding, its evidence, and the actual ending (including unresolved uncertainties).
- Fact ledger (source URL + evidence for each key claim), disclosure of uncertainty and an editorial originality check.
- Scorecard with pass / revise / reject decision; production-mode limitations.

## Failure patterns to reject

- A generic question is asked, the obvious object appears, and the story ends.
- Fake suspense: loud sound, dark room or camera shake with no meaningful stakes.
- Multiple unsourced twists, invented eyewitness dialogue, composite characters or altered outcomes.
- A copy of the supplied reference with new names or a different location.
- Overexplaining a twist before showing it; unreadable tiny props in a wide shot.
- A story dependent on walking, handoffs or facial acting when the chosen mode cannot convincingly animate them.
- Forced danger or unresolved cliffhangers in every episode; vary wonder, humor, irony, empathy, mystery and triumph.

## Next-production quality loop

1. Verify sources and approve the factual story and storyboard **before** generation.
2. Render a short motion test of the most difficult story beat.
3. Review the finished video for silent-viewer clarity, audible stakes, foot/prop continuity, acting, evidence legibility, title/caption readability and reveal timing.
4. Keep only supported lessons in the existing episode-review history; do not declare the clip successful because the renderer produced an MP4.
5. When published and analytics are available, compare first-second hold, average view duration, completion, rewatches and comments; iterate based on measured evidence rather than guessed virality.
