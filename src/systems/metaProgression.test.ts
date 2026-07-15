import { describe, expect, it } from "vitest";
import {
  UPGRADES,
  computeCountertopSize,
  computeEffectiveJunkDensity,
  computeGridSize,
  computeLuckBias,
  computeScrapReward,
  createDefaultMetaState,
  getUpgradeLevel,
  purchaseUpgrade,
} from "./metaProgression";
import { rollColor } from "./scavenge";
import type { FlightOutcome } from "./flightSim";

function outcomeWith(gatesCleared: number): FlightOutcome {
  return { success: gatesCleared === 3, gatesCleared, failedAt: null, landingMissReason: null, glideRatio: 1 };
}

describe("computeGridSize / computeCountertopSize", () => {
  it("scale with gridExpansionLevel", () => {
    const meta = { ...createDefaultMetaState(), gridExpansionLevel: 2 };
    expect(computeGridSize(meta)).toBe(7);
    expect(computeCountertopSize(meta)).toBe(16);
  });
});

describe("computeEffectiveJunkDensity", () => {
  it("reduces junk density per junkFilterLevel", () => {
    const meta = { ...createDefaultMetaState(), junkFilterLevel: 3 };
    expect(computeEffectiveJunkDensity(0.4, meta)).toBeCloseTo(0.28, 5);
  });

  it("floors at 0.1 regardless of level", () => {
    const meta = { ...createDefaultMetaState(), junkFilterLevel: 20 };
    expect(computeEffectiveJunkDensity(0.4, meta)).toBe(0.1);
  });
});

describe("computeScrapReward", () => {
  it("scales with gates cleared", () => {
    expect(computeScrapReward(outcomeWith(0))).toBe(5);
    expect(computeScrapReward(outcomeWith(1))).toBe(10);
    expect(computeScrapReward(outcomeWith(3))).toBe(20);
  });
});

describe("computeLuckBias", () => {
  it("is zero at level 0 and scales linearly with luckLevel", () => {
    expect(computeLuckBias(createDefaultMetaState())).toBe(0);
    expect(computeLuckBias({ ...createDefaultMetaState(), luckLevel: 4 })).toBeCloseTo(1, 5);
  });
});

describe("rollColor with luckBias", () => {
  it("leaves the roll unchanged at bias 0", () => {
    // A bias of 0 must reduce to the identity exponent (1), i.e. Math.random() unmodified.
    const samples = Array.from({ length: 5000 }, () => rollColor(0).brilliance);
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    expect(mean).toBeGreaterThan(0.45);
    expect(mean).toBeLessThan(0.55);
  });

  it("skews brilliance upward as bias increases", () => {
    const unbiased = Array.from({ length: 5000 }, () => rollColor(0).brilliance);
    const biased = Array.from({ length: 5000 }, () => rollColor(1).brilliance);
    const mean = (samples: number[]) => samples.reduce((a, b) => a + b, 0) / samples.length;
    expect(mean(biased)).toBeGreaterThan(mean(unbiased));
  });

  it("always stays within [0, 1]", () => {
    for (let i = 0; i < 1000; i++) {
      const { brilliance } = rollColor(2);
      expect(brilliance).toBeGreaterThanOrEqual(0);
      expect(brilliance).toBeLessThanOrEqual(1);
    }
  });
});

describe("purchaseUpgrade", () => {
  it("deducts cost and increments level when affordable", () => {
    const meta = { ...createDefaultMetaState(), scrap: 100 };
    const rerollDef = UPGRADES.find((u) => u.id === "reroll")!;
    const updated = purchaseUpgrade(meta, "reroll");
    expect(getUpgradeLevel(updated, "reroll")).toBe(1);
    expect(updated.scrap).toBe(100 - rerollDef.costForLevel(0));
  });

  it("is a no-op when scrap is insufficient", () => {
    const meta = { ...createDefaultMetaState(), scrap: 0 };
    const updated = purchaseUpgrade(meta, "reroll");
    expect(updated).toEqual(meta);
  });

  it("is a no-op once maxLevel is reached", () => {
    const rerollDef = UPGRADES.find((u) => u.id === "reroll")!;
    const meta = { ...createDefaultMetaState(), scrap: 100000, rerollLevel: rerollDef.maxLevel };
    const updated = purchaseUpgrade(meta, "reroll");
    expect(updated.scrap).toBe(meta.scrap);
    expect(getUpgradeLevel(updated, "reroll")).toBe(rerollDef.maxLevel);
  });
});
