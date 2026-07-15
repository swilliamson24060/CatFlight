import { describe, expect, it } from "vitest";
import { generateDifficultyTier } from "./difficulty";

describe("generateDifficultyTier", () => {
  it("starts at 0.4 junk density at tier 0", () => {
    expect(generateDifficultyTier(0).junkDensity).toBeCloseTo(0.4, 5);
  });

  it("increases junk density monotonically with tier", () => {
    let prev = generateDifficultyTier(0);
    for (let tier = 1; tier <= 30; tier++) {
      const next = generateDifficultyTier(tier);
      expect(next.junkDensity).toBeGreaterThanOrEqual(prev.junkDensity);
      prev = next;
    }
  });

  it("caps junk density at 0.75", () => {
    expect(generateDifficultyTier(100).junkDensity).toBe(0.75);
  });
});
