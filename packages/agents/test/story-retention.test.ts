import { describe, expect, it } from "vitest";
import {
  STORY_RETENTION_POLICY,
  SCRIPT_RETENTION_POLICY,
  DOCTOR_RETENTION_POLICY,
  storyScenePacing,
} from "../src/story-retention.ts";

describe("story-retention runtime policy", () => {
  it("requires originality, escalation and an earned payoff", () => {
    expect(STORY_RETENTION_POLICY).toContain("Originality firewall");
    expect(STORY_RETENTION_POLICY).toContain("Verified real-world storytelling is the default");
    expect(STORY_RETENTION_POLICY).toContain("NEEDS_RESEARCH");
    expect(STORY_RETENTION_POLICY).toContain("Never invent events, characters, dialogue");
    expect(SCRIPT_RETENTION_POLICY).toContain("true recorded outcome");
    expect(DOCTOR_RETENTION_POLICY).toContain("unsupported hooks");
    expect(STORY_RETENTION_POLICY).toContain("First visible 0–2 seconds");
    expect(STORY_RETENTION_POLICY).toContain("5–8 escalating causal beats");
    expect(STORY_RETENTION_POLICY).toContain("Plant the decisive clue");
    expect(STORY_RETENTION_POLICY).toContain("school-lockdown/false-friend-at-door");
    expect(SCRIPT_RETENTION_POLICY).toContain("visibly change");
    expect(DOCTOR_RETENTION_POLICY).toContain("REJECT_STORY:");
  });

  it("uses attainable scene lengths for micro, short and long episodes", () => {
    expect(storyScenePacing(10)).toContain("1–3 very short scenes");
    expect(storyScenePacing(10)).not.toContain("use scenes roughly 20–60 seconds");
    expect(storyScenePacing(45)).toContain("4–15 seconds");
    expect(storyScenePacing(122)).toContain("6–20 seconds");
    expect(storyScenePacing(600)).toContain("20–60 seconds");
  });
});
