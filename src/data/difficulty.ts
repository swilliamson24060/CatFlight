import type { DifficultyTier } from "../types/content";

// Placeholder scaling curve -- tune against real playtest runs.
export function generateDifficultyTier(tier: number): DifficultyTier {
  return {
    tier,
    launchThreshold: 10 + tier * 2,
    midflightThreshold: 8 + tier * 2.5,
    glideMin: Math.max(0.4, 0.6 - tier * 0.02),
    glideMax: 1.4 + tier * 0.02,
    junkDensity: Math.min(0.75, 0.4 + tier * 0.03),
  };
}

export const PREVIEW_TIERS: DifficultyTier[] = [0, 1, 2, 3, 4].map(generateDifficultyTier);
