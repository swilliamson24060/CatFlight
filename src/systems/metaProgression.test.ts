import { describe, expect, it } from "vitest";
import {
  UPGRADES,
  computeCountertopSize,
  computeEffectiveJunkDensity,
  computeGridSize,
  computeScrapReward,
  createDefaultMetaState,
  getUpgradeLevel,
  purchaseUpgrade,
} from "./metaProgression";
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
