import type { RarityBand } from "../types/content";

// statBonus values are fractional boosts (0.1 = +10%), applied to the rolled item's
// contribution to its final crafted component -- not flat stat additions.
export const RARITY_BANDS: RarityBand[] = [
  { id: "common", minBrilliance: 0, maxBrilliance: 0.845 },
  {
    id: "uncommon",
    minBrilliance: 0.845,
    maxBrilliance: 0.995,
    statBonus: { durability: 0.1 },
  },
  {
    id: "rare",
    minBrilliance: 0.995,
    maxBrilliance: 1,
    statBonus: { thrust: 0.25 },
    hueOverride: 48, // gold
  },
];

export function getRarityBand(brilliance: number): RarityBand {
  const band = RARITY_BANDS.find((b) => brilliance >= b.minBrilliance && brilliance <= b.maxBrilliance);
  return band ?? RARITY_BANDS[0]!;
}
