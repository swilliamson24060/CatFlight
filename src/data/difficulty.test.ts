import { describe, expect, it } from "vitest";
import { generateDifficultyTier } from "./difficulty";

describe("generateDifficultyTier", () => {
  it("starts accessible at tier 0", () => {
    const tier0 = generateDifficultyTier(0);
    expect(tier0.launchThreshold).toBe(3);
    expect(tier0.midflightThreshold).toBe(3);
    expect(tier0.glideMin).toBeCloseTo(0.3, 5);
    expect(tier0.glideMax).toBeCloseTo(1.3, 5);
  });

  it("increases launch and midflight thresholds monotonically with tier", () => {
    let prev = generateDifficultyTier(0);
    for (let tier = 1; tier <= 30; tier++) {
      const next = generateDifficultyTier(tier);
      expect(next.launchThreshold).toBeGreaterThan(prev.launchThreshold);
      expect(next.midflightThreshold).toBeGreaterThan(prev.midflightThreshold);
      prev = next;
    }
  });

  it("narrows the glide window toward [0.6, 0.8] and never inverts", () => {
    for (const tier of [0, 10, 30, 60, 100]) {
      const d = generateDifficultyTier(tier);
      expect(d.glideMin).toBeLessThan(d.glideMax);
      expect(d.glideMin).toBeLessThanOrEqual(0.6);
      expect(d.glideMax).toBeGreaterThanOrEqual(0.8);
    }
  });

  it("caps junk density at 0.75", () => {
    expect(generateDifficultyTier(100).junkDensity).toBe(0.75);
  });
});
