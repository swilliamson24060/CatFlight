import { describe, expect, it } from "vitest";
import { applyRarityBonus, computeStatTally } from "./scavenge";

describe("computeStatTally", () => {
  it("sums stats across items", () => {
    const total = computeStatTally([
      { thrust: 1, weight: 2, drag: 3, durability: 4 },
      { thrust: 5, weight: 6, drag: 7, durability: 8 },
    ]);
    expect(total).toEqual({ thrust: 6, weight: 8, drag: 10, durability: 12 });
  });
});

describe("applyRarityBonus", () => {
  it("leaves common-tier stats unchanged", () => {
    const stats = { thrust: 4, weight: 2, drag: 0, durability: 0 };
    expect(applyRarityBonus(stats, { hue: 0, brilliance: 0.5 })).toEqual(stats);
  });

  it("applies the +10% uncommon durability bonus", () => {
    const stats = { thrust: 0, weight: 0, drag: 0, durability: 10 };
    expect(applyRarityBonus(stats, { hue: 0, brilliance: 0.9 }).durability).toBeCloseTo(11, 5);
  });

  it("applies the +25% rare thrust bonus", () => {
    const stats = { thrust: 10, weight: 0, drag: 0, durability: 0 };
    expect(applyRarityBonus(stats, { hue: 0, brilliance: 0.999 }).thrust).toBeCloseTo(12.5, 5);
  });
});
