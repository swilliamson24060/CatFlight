import type { DifficultyTier } from "../types/content";
import type { Stats } from "../types/core";

export type FlightGate = "launch" | "midflight" | "landing";
export type LandingMissReason = "overshoot" | "undershoot";

export interface FlightOutcome {
  success: boolean;
  gatesCleared: number;
  failedAt: FlightGate | null;
  landingMissReason: LandingMissReason | null;
  glideRatio: number;
}

export function evaluateFlight(stats: Stats, difficulty: DifficultyTier): FlightOutcome {
  const glideRatio = stats.drag / stats.weight;

  if (stats.thrust < difficulty.launchThreshold) {
    return { success: false, gatesCleared: 0, failedAt: "launch", landingMissReason: null, glideRatio };
  }
  if (stats.durability < difficulty.midflightThreshold) {
    return { success: false, gatesCleared: 1, failedAt: "midflight", landingMissReason: null, glideRatio };
  }
  if (glideRatio < difficulty.glideMin || glideRatio > difficulty.glideMax) {
    const landingMissReason: LandingMissReason = glideRatio < difficulty.glideMin ? "overshoot" : "undershoot";
    return { success: false, gatesCleared: 2, failedAt: "landing", landingMissReason, glideRatio };
  }
  return { success: true, gatesCleared: 3, failedAt: null, landingMissReason: null, glideRatio };
}
