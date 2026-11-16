import { z } from "zod";
import type { ResearchContext } from "@ys/core";
import { RESEARCH_POLICY, SCRIPT_CLAIM_POLICY, researchBlock } from "./research.ts";
import { customStyleBlock } from "@ys/core";
import { MOTION_DESIGN_POLICY, MOTION_REVIEW_POLICY, SHOT_INTENT_POLICY } from "./motion-design.ts";
import { STORY_RETENTION_POLICY, SCRIPT_RETENTION_POLICY, DOCTOR_RETENTION_POLICY, storyScenePacing } from "./story-retention.ts";
import { lessonsBlock, models, runStructured, type AgentDeps, type AgentImage, type AgentResult } from "./runner.ts";
import { CastOut, FrameReviewOut, ScriptDoctorOut, ScriptOut, ShotPlanOut, StoryOut, StyleBibleOut } from "./schemas.ts";

/*
 * Model'e giden talimatlar İngilizce (görsel modeller de İngilizce prompt bekliyor);
 * izleyicinin duyacağı anlatım ise bölümün dilinde yazdırılır.
 */

export interface EpisodeBrief {
  research?: ResearchContext;
  topic: string;
  lang: string;
  targetSec: number;
  styleHint?: string;
  audience?: string;
  /** Kanalın ses kimliği için ölçülmüş konuşma hızı; yoksa dil varsayılanı. */
  wordsPerMinute?: number;
  /** Önceki bölümlerin incelemesinden çıkan senaryo kuralları. */
  lessons?: string[];
}

/**
 * Anlatım hızı (kelime/dk). Eklemeli dillerde kelimeler uzun olduğu için dakikadaki kelime az.
 * tr: 29 Eki ölçümü, ElevenLabs v3 "George": 455 kelime → 239 sn ≈ 114 kelime/dk
 * (150 varsayımıyla bölüm %33 uzun çıktı).
 */
const WPM_BY_LANG: Record<string, number> = {
  tr: 115,
  fi: 110,
  hu: 115,
  de: 125,
  ar: 120,
  en: 150,
  es: 155,
  pt: 150,
  fr: 150,
  id: 135,
  hi: 140,
};

export function wordsPerMinute(brief: Pick<EpisodeBrief, "lang" | "wordsPerMinute">): number {
  return brief.wordsPerMinute || WPM_BY_LANG[brief.lang.split("-")[0]!] || 140;
}

export function artDirector(brief: EpisodeBrief, deps?: AgentDeps): Promise<AgentResult<StyleBibleOut>> {
  return runStructured(
    {
      name: "art-director",
      model: models().fast,
      effort: "medium",
      schema: StyleBibleOut,
      system: `You are the art director of an animated YouTube channel. Define a visual style that an image model can reproduce consistently across 100+ frames.
Rules:
- Favor stylized illustration over photorealism (cheaper, more consistent, no synthetic-media disclosure).
- Every frame is a full-bleed video frame. The style must NOT include borders, frames, ornamental margins, panels, page/paper edges or book layouts — even for historical art styles, describe only rendering technique, palette and texture.
- Never include text, letters, logos or watermarks.`,
      prompt: `Topic: ${brief.topic}\nAudience: ${brief.audience ?? "general"}\nStyle hint: ${brief.styleHint ?? "none — choose what fits the topic"}`,
    },
    deps,
  );
}

export const StylePickOut = z.object({
  packId: z.string().describe("Id of the chosen style pack, exactly as listed"),
  reason: z.string().describe("One short sentence: why this style fits the topic"),
});
export type StylePickOut = z.infer<typeof StylePickOut>;

/** Hazır stil paketlerinden konuya en uygununu seçer (ucuz; serbest sanat yönetimi yerine). */
export function stylePicker(
  brief: EpisodeBrief,
  packs: readonly { id: string; artStyle: string; suits: string }[],
  deps?: AgentDeps,
): Promise<AgentResult<StylePickOut>> {
  return runStructured(
    {
      name: "style-picker",
      model: models().cheap,
      effort: "low",
      schema: StylePickOut,
      system: `You choose the visual style of an animated YouTube video from a fixed catalogue of style packs. Pick the pack whose era, mood and subject fit the topic best, so the look itself tells the viewer what the video is about (an Ottoman story in Ottoman miniature, a 1980s computer story in neon synthwave, a crime story in film noir). Respect the user's style hint when it is given.
Catalogue:
${packs.map((p) => `- ${p.id}: ${p.artStyle}. Suits: ${p.suits}`).join("\n")}`,
      prompt: `Topic: ${brief.topic}\nAudience: ${brief.audience ?? "general"}\nStyle hint: ${brief.styleHint ?? "none"}`,
    },
    deps,
  );
}

export function storyArchitect(brief: EpisodeBrief, deps?: AgentDeps): Promise<AgentResult<StoryOut>> {
  return runStructured(
    {
      name: "story-architect",
      model: models().creative,
      effort: "high",
      schema: StoryOut,
      system: `You design original narrative YouTube episodes for sustained attention across formats from 10-second micro-shorts to longer animated stories.
Rules:
- Cold open on a visible, concrete anomaly or consequential action; the viewer should perceive a specific question in the opening frame without requiring narration.
- Give the story a human spine: someone who wants something, an obstacle, rising stakes, a turn. Facts serve the story, not the other way round.
- Structure according to duration: hook → escalating new information and character choices → earned turn → consequence/payoff. A ten-second episode cannot contain the same number of beats as a two-minute story.
- Be specific: real names, dates, numbers and places that are well established. Never invent facts; if a detail is uncertain, leave it out.
- Avoid clichés ("in a world", "little did they know", "changed everything forever"), listicles and calls to subscribe.
- Every beat names a visible, storyboard-able action, discovery or emotional reaction. Never rely on a still frame to perform an unsupported physical action.
- Beat durations must sum to the target duration (±10%).
- Write title, logline, premise, hook and beat summaries in the episode language (${brief.lang}).
${STORY_RETENTION_POLICY}
${RESEARCH_POLICY}`,
      prompt: `Topic: ${brief.topic}\nEpisode language: ${brief.lang}\nTarget duration: ${brief.targetSec} seconds\nAudience: ${brief.audience ?? "general"}${researchBlock(brief.research)}`,
    },
    deps,
  );
}

/**
 * Sayı ve adların yazımı (4 Kas, kullanıcı: "sayısal değerlerin Türkçe ifadesi komik olabiliyor", "C++ si artı artı
 * değil"). Eskiden "sayıları yazıyla yaz" deniyordu: model "Intel 4004"ü "Dört bin dört", "GPT-2"yi "GPT iki" yazıyor,
 * altyazı da öyle görünüyordu. Artık rakam dilin kuralıyla yazılır; seslendirme aşaması kodla okur (pipeline
 * numbers.ts), adların okunuşunu sözlük ve telaffuz ajanı verir.
 */
export const NUMBERS_AND_NAMES =
  "Write numbers, years, amounts, percentages and ordinals with digits in the narration language's own conventions (Turkish: 1453, 1,5 milyon, 3.000, %75, II. Mehmed, 19. yüzyıl, 1990'larda; never an English decimal point); the voice stage reads them aloud correctly and the subtitles show the digits. No ≈, ~ or × in the narration: write the word. Keep names of people, companies, products and programming languages in their original spelling (C++, JavaScript, Steve Jobs), and abbreviations as abbreviations (TBMM, ABD, COBOL); never translate, expand or respell them the way they sound: the voice stage decides how each is said.";

export function screenwriter(brief: EpisodeBrief, story: StoryOut, deps?: AgentDeps): Promise<AgentResult<ScriptOut>> {
  const wpm = wordsPerMinute(brief);
  const targetWords = Math.round((brief.targetSec / 60) * wpm);
  return runStructured(
    {
      name: "screenwriter",
      model: models().creative,
      effort: "high",
      schema: ScriptOut,
      system: `You write voice-over narration for animated YouTube videos.
Rules:
- Narration language: ${brief.lang}. Write for the ear: one idea per sentence, varied sentence length, concrete nouns and verbs, show don't tell.
- Total narration ≈ ${targetWords} words (${wpm} wpm for this voice/language). This is a hard length budget: stay within ±10%. ${storyScenePacing(brief.targetSec)}
- Open with the story's hook moment, not a greeting. End every scene with a forward pull (a question, a consequence, a "but") that the next scene answers. Use callbacks to earlier details.
- No filler ("as we all know", "interestingly"), no repetition of the same fact, rhetorical questions at most once per scene, no calls to subscribe.
- Narration must be speakable: no brackets, emojis, stage directions or URLs. ${NUMBERS_AND_NAMES}
- visualIntent (English) lists 2–3 renderable visual moments (who acts, readable clue or object, face reaction, camera size). location is in English; reuse location names exactly.${lessonsBlock(brief.lessons)}
${SCRIPT_RETENTION_POLICY}
${RESEARCH_POLICY}
${SCRIPT_CLAIM_POLICY}`,
      prompt: `Story:\n${JSON.stringify(story, null, 2)}${researchBlock(brief.research)}`,
    },
    deps,
  );
}

/**
 * Senaryo doktoru: taslağı izlenme ve anlaşılırlık açısından eleştirip yeniden yazar. Notlar saklanır;
 * bölümler arası hangi kusurların tekrarlandığını görmek için.
 */
export function scriptDoctor(brief: EpisodeBrief, story: StoryOut, draft: ScriptOut, deps?: AgentDeps): Promise<AgentResult<ScriptDoctorOut>> {
  const wpm = wordsPerMinute(brief);
  const targetWords = Math.round((brief.targetSec / 60) * wpm);
  return runStructured(
    {
      name: "script-doctor",
      model: models().creative,
      effort: "high",
      schema: ScriptDoctorOut,
      system: `You are a script doctor for narrative YouTube explainers. Critique the draft, then return an improved full script.
Check and fix:
- Hook: does the first *visual moment* contain a concrete anomaly, consequential action, or specific emotional question? If not, rewrite the opening narration and visualIntent.
- Clarity: could a curious 15-year-old follow every step? Define jargon in passing with an image, not a lecture.
- Pacing: cut repetition and filler; every scene must move the story; each scene ends with a forward pull.
- Accuracy: remove or soften any claim that is not well established. Never add new facts you are unsure of.
- Speakability in ${brief.lang}: short sentences, no tongue-twisters. ${NUMBERS_AND_NAMES}
- Length: keep total narration ≈ ${targetWords} words (±10%).
Keep scene ids, beatIds and location names unchanged; you may rewrite narration, emotion and visualIntent. notes: the most important problems you fixed in English; report a structural failure using REJECT_STORY: if it cannot be repaired within this schema.${lessonsBlock(brief.lessons)}
${DOCTOR_RETENTION_POLICY}
${RESEARCH_POLICY}
${SCRIPT_CLAIM_POLICY}`,
      prompt: `Story:\n${JSON.stringify(story, null, 2)}\n\nDraft script:\n${JSON.stringify(draft, null, 2)}${researchBlock(brief.research)}`,
    },
    deps,
  );
}

/** Anlatımı kelime indeksleriyle gösterir; Director çekim başlangıçlarını bu indekslerle verir. */
export function indexWords(narration: string): { words: string[]; annotated: string } {
  const words = narration.split(/\s+/).filter(Boolean);
  return { words, annotated: words.map((w, i) => `[${i}]${w}`).join(" ") };
}

/** Senaryodaki tekrar eden karakter ve mekânları çıkarır; tutarlılığın temeli (plan §6). */
/** Kütüphanede bu stilde çizilmiş karakter: aynı kişi başka bölümde geçerse yeniden çizilmez. */
export interface LibraryCharacterBrief {
  id: string;
  name: string;
  description: string;
}

export function castingDirector(
  script: ScriptOut,
  style: StyleBibleOut,
  deps?: AgentDeps,
  library: LibraryCharacterBrief[] = [],
  /** Karakter bankasından zaten kadroda olanlar (sunucu, seçilen karakterler, seri maskotu): kod ekler. */
  fixed: { name: string; role: string }[] = [],
): Promise<AgentResult<CastOut>> {
  return runStructured(
    {
      name: "casting-director",
      model: models().fast,
      effort: "medium",
      schema: CastOut,
      system: `You are the casting and production designer of an animated video.
From the script, list the recurring on-screen characters and locations that must look identical every time they appear.
Rules:
- Only include characters/locations shown in 2+ shots or central to the story. Crowds and one-off extras are NOT characters.
- visualDescription is a fixed, specific design an illustrator can redraw identically (no "maybe", no alternatives).
- Each location is ONE physical place seen in one view. Never merge places ("lamp room and keeper's room" must be two locations) — merged places get drawn as split-screen images.
- A character that changes over the story (e.g. chick → adult) is described in the look it has in most shots.
- Never put readable text in a description (signs, notes, book pages): image models render it as letters. Say "a paper notice" instead of quoting it.
- Historical/real figures: depict respectfully in the given art style; never depict prophets or religious figures.
- Set "kind" honestly: only humans are "person". A recurring horse, dog or bird is "animal"; a recurring bag, machine, vehicle, device, gadget, prototype, product or logo is "object" (they are drawn differently from people: a "person" is drawn as a human puppet, so a handheld device marked "person" turns into a robot). A robot, android or cartoon mascot with a body, arms and legs that acts on screen (narrates, points, reacts, types) is a "person": it is drawn on the same puppet and can gesture; marked "object" it would stand still as a prop.
- Realism is mandatory: real people, places, buildings, objects and uniforms are described as they really looked (period-correct clothing, headgear, hair, beard, materials, colours, architecture). Set "reference" for every real one so the illustrator works from a real photo or painting; never invent the look of something real.
Art style: ${style.artStyle}.${
        library.length
          ? `\nCharacter library (already drawn in this art style; reusing one is free and keeps the channel consistent):
${library.map((c) => `- ${c.id}: ${c.name} — ${c.description}`).join("\n")}
If a character of this script is EXACTLY the same person as a library character (the same real historical figure, or the channel's recurring host/narrator), set "reuse" to that id and copy its visualDescription. Never reuse a library character for a different person just because the role is similar.`
          : ""
      }${
        fixed.length
          ? `\nAlready cast from the channel's character bank (code adds them; do NOT list them and do not create another character for the same role):\n${fixed.map((c) => `- ${c.name}: ${c.role}`).join("\n")}`
          : ""
      }`,
      prompt: script.scenes
        .map((s) => `## ${s.id} (location: ${s.location})\nVisual intent: ${s.visualIntent}\nNarration: ${s.narration}`)
        .join("\n\n"),
    },
    deps,
  );
}

/** vector: görsel/video API'si yok; Claude SVG varlık + sahne JSON'u üretir, Remotion canlandırır. */
export type MotionMode = "animated" | "mixed" | "still" | "vector";

const MOTION_RULES: Record<MotionMode, (ratio: number) => string> = {
  animated: () =>
    `- Every shot is "ai_clip" (the whole video is animated). Shots last 3–5 seconds: clips are billed in 5-second blocks, so a 6-second shot costs as much as a 10-second one. Each motionPrompt describes one clear, simple motion that fits the shot.`,
  mixed: (ratio) =>
    `- About ${Math.round(ratio * 100)}% of shots should be "ai_clip" (real motion needed: action, transformation). All others "still_motion" (parallax/Ken Burns on a still). Shots last 3–8 seconds.`,
  still: () => `- Every shot is "still_motion" (parallax/Ken Burns on a still). Shots last 3–8 seconds.`,
  vector: () => `- Every shot is "still_motion". Shots last 4–9 seconds.`,
};

export function director(
  script: ScriptOut,
  style: StyleBibleOut,
  sceneDurationsSec: Record<string, number>,
  opts: { aiClipRatio: number; motionMode?: MotionMode; cast?: CastOut },
  deps?: AgentDeps,
): Promise<AgentResult<ShotPlanOut>> {
  const scenes = script.scenes
    .map((s) => {
      const { annotated } = indexWords(s.narration);
      return `## ${s.id} (${(sceneDurationsSec[s.id] ?? 0).toFixed(1)} s, location: ${s.location}, emotion: ${s.emotion})\nVisual intent: ${s.visualIntent}\nNarration: ${annotated}`;
    })
    .join("\n\n");
  const cast = opts.cast
    ? `Cast (reference images exist for these; use their ids):\n${opts.cast.characters.map((c) => `- ${c.id} ${c.name}: ${c.role}`).join("\n")}\n${opts.cast.locations.map((l) => `- ${l.id} ${l.name}`).join("\n")}\n\n`
    : "";

  return runStructured(
    {
      name: "director",
      model: models().fast,
      effort: "medium",
      schema: ShotPlanOut,
      system: `You are a film director planning shots for an animated narrated video.
Rules:
- For every scene, split the narration into shots by giving the word index where each shot starts. The first shot of a scene starts at 0; indices strictly increase.
- Estimate shot length from scene duration / word count. Cut on meaning, not mid-phrase.
${MOTION_RULES[opts.motionMode ?? "mixed"](opts.aiClipRatio)}
${MOTION_DESIGN_POLICY}
${SHOT_INTENT_POLICY}
${customStyleBlock(style)}
- Adapt custom motion and typography to this output schema: still_motion cannot animate independent SVG layers or arbitrary folds; use its supported camera and ambience. For ai_clip, put the intended subject movement in motionPrompt. Typography guidance governs composition and readable negative space; imagePrompt must not request lettering, and this schema cannot create title layers.
- imagePrompt: one concrete frame, describe action, composition, framing. The style prefix and the cast/location reference images are added automatically — refer to cast members by name, do not redescribe their looks. Never ask for text in the image.
- characterIds/locationId: tag every shot with the cast ids that appear in it, so reference images can be attached.
- ambience: a subtle animated overlay that makes still_motion shots feel alive. It must match what is in the frame: "rain"/"snow" only outdoors in that weather, "fog" for night, mist or mystery, "dust" for old rooms, workshops, attics, "embers" near fire or forges, "flicker" for candle/lamp/screen light, "rays" for sunlight through windows or trees, "confetti" only for a celebration moment (a launch, a win, a record). Use "none" when nothing fits; keep the same ambience across shots of one location and moment.
Visual style for reference: ${style.artStyle}.`,
      prompt: cast + scenes,
    },
    deps,
  );
}

export interface FrameReviewInput {
  frame: AgentImage;
  /** Kadro referansları; kimlik karşılaştırması için. */
  refs: { image: AgentImage; label: string }[];
  description: string;
  imagePrompt: string;
  /** Karede görünmesi beklenen karakter adları. */
  characters: string[];
  /** Seçilen palet ve yalnız karede görülebilen özel kabul kuralları. */
  style?: Pick<StyleBibleOut, "artStyle" | "palette" | "reviewRules">;
}

/** Üretilen kareyi ucuz bir görsel modelle denetler; yazı, kolaj, çift karakter gibi hataları yakalar. */
export function frameInspector(input: FrameReviewInput, deps?: AgentDeps): Promise<AgentResult<FrameReviewOut>> {
  const refList = input.refs.map((r, i) => `Image ${i + 2}: reference for ${r.label}`).join("\n");
  return runStructured(
    {
      name: "frame-inspector",
      model: models().cheap,
      effort: "low",
      schema: FrameReviewOut,
      images: [input.frame, ...input.refs.map((r) => r.image)],
      system: `You are a strict quality inspector for keyframes of an animated narrated video. Image 1 is the generated frame; any further images are cast reference sheets.
${MOTION_REVIEW_POLICY}
${input.style ? `Chosen art style: ${input.style.artStyle}. Palette: ${input.style.palette.join(", ")}. Deliberate limited colours and material texture are not defects; judge contrast and recognizability within this palette.` : ""}${customStyleBlock(input.style, true)}
Report only real, visible problems:
- text: any readable letters, words, numbers, signs, captions or watermarks in image 1.
- panels: image 1 is a collage, comic panels, split screen, book page or has borders/frames.
- duplicate_character: the same character appears more than once.
- wrong_character: an expected character does not match its reference (face, hair, outfit), or an unexpected main character appears.
- anatomy: extra or missing limbs/fingers, melted faces, broken objects that a viewer would notice.
- missing_subject: the frame does not show what the shot description asks for.
- off_style: the art style clearly differs from the references.
Small stylistic imperfections are not issues. Score 8–10 for usable frames, 5–7 for noticeable but tolerable flaws, 0–4 for frames that must be redrawn.
fix: one short instruction that would prevent the problems when redrawing (e.g. "show Hasan only once, no signs or lettering"), or empty.`,
      prompt: `Shot description: ${input.description}
Image prompt used: ${input.imagePrompt}
Expected characters: ${input.characters.length ? input.characters.join(", ") : "none specified"}
${refList}`,
    },
    deps,
  );
}
