import { describe, expect, it } from "vitest";
import { evaluateFlight } from "./flightSim";
import type { DifficultyTier } from "../types/content";

const difficulty: DifficultyTier = {
  tier: 0,
  launchThreshold: 10,
  midflightThreshold: 8,
  glideMin: 0.6,
  glideMax: 1.4,
  junkDensity: 0.4,
};

describe("evaluateFlight", () => {
  it("fails at launch when thrust is below threshold", () => {
    const outcome = evaluateFlight({ thrust: 5, weight: 10, drag: 5, durability: 10 }, difficulty);
    expect(outcome).toMatchObject({ success: false, gatesCleared: 0, failedAt: "launch", landingMissReason: null });
  });

  it("fails at midflight when durability is below threshold", () => {
    const outcome = evaluateFlight({ thrust: 12, weight: 10, drag: 6, durability: 5 }, difficulty);
    expect(outcome).toMatchObject({ success: false, gatesCleared: 1, failedAt: "midflight", landingMissReason: null });
  });

  it("fails landing with overshoot when glide ratio is below the minimum", () => {
    const outcome = evaluateFlight({ thrust: 12, weight: 10, drag: 2, durability: 10 }, difficulty);
    expect(outcome).toMatchObject({ success: false, gatesCleared: 2, failedAt: "landing", landingMissReason: "overshoot" });
  });

  it("fails landing with undershoot when glide ratio is above the maximum", () => {
    const outcome = evaluateFlight({ thrust: 12, weight: 5, drag: 10, durability: 10 }, difficulty);
    expect(outcome).toMatchObject({ success: false, gatesCleared: 2, failedAt: "landing", landingMissReason: "undershoot" });
  });

  it("succeeds when all three gates clear", () => {
    const outcome = evaluateFlight({ thrust: 12, weight: 10, drag: 8, durability: 10 }, difficulty);
    expect(outcome).toMatchObject({ success: true, gatesCleared: 3, failedAt: null, landingMissReason: null });
  });

  it("treats each gate threshold as inclusive", () => {
    const outcome = evaluateFlight({ thrust: 10, weight: 10, drag: 8, durability: 8 }, difficulty);
    expect(outcome.success).toBe(true);
  });
});
