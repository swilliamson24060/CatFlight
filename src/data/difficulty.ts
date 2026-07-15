import type { DifficultyTier } from "../types/content";

/**
 * Calibrated by simulating best-possible-play success rates against the real item pool
 * (see the balance pass): the achievable base thrust/durability ceiling with typical rolls
 * is roughly 10/9, and achievable glide ratio (drag/weight) skews low with a median around
 * 0.67, not 1.0. Thresholds below aim for ~85% success at tier 0, declining to a genuine
 * skill ceiling by tier ~12-15 -- pushing further requires rare/uncommon color luck.
 */
export function generateDifficultyTier(tier: number): DifficultyTier {
  return {
    tier,
    launchThreshold: 3 + tier * 0.4,
    midflightThreshold: 3 + tier * 0.35,
    glideMin: Math.min(0.6, 0.3 + tier * 0.01),
    glideMax: Math.max(0.8, 1.3 - tier * 0.02),
    junkDensity: Math.min(0.75, 0.4 + tier * 0.03),
  };
}

export const PREVIEW_TIERS: DifficultyTier[] = [0, 1, 2, 3, 4].map(generateDifficultyTier);
