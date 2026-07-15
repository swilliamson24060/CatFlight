import type { DifficultyTier } from "../types/content";

/** Junk density is the only thing that still scales with tier -- flight success is driven by
 * blueprint fulfillment now (see systems/flightSim.ts), not stat thresholds. */
export function generateDifficultyTier(tier: number): DifficultyTier {
  return {
    tier,
    junkDensity: Math.min(0.75, 0.4 + tier * 0.03),
  };
}

export const PREVIEW_TIERS: DifficultyTier[] = [0, 1, 2, 3, 4].map(generateDifficultyTier);
