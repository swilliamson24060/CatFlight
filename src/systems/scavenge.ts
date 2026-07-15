import { getRarityBand } from "../data/colorBands";
import type { ItemColor, Stats } from "../types/core";

/** luckBias 0 leaves the roll unchanged; higher values skew brilliance upward toward 1. */
export function rollColor(luckBias = 0): ItemColor {
  const brilliance = Math.random() ** (1 / (1 + luckBias));
  return { hue: Math.random() * 360, brilliance };
}

export function computeStatTally(perItemStats: Stats[]): Stats {
  return perItemStats.reduce(
    (acc, s) => ({
      thrust: acc.thrust + s.thrust,
      weight: acc.weight + s.weight,
      drag: acc.drag + s.drag,
      durability: acc.durability + s.durability,
    }),
    { thrust: 0, weight: 0, drag: 0, durability: 0 }
  );
}

export function applyRarityBonus(baseStats: Stats, color: ItemColor): Stats {
  const band = getRarityBand(color.brilliance);
  if (!band.statBonus) return baseStats;
  const result = { ...baseStats };
  for (const [key, fraction] of Object.entries(band.statBonus)) {
    const k = key as keyof Stats;
    result[k] = result[k] + result[k] * (fraction ?? 0);
  }
  return result;
}
