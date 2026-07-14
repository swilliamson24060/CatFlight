import { generateDifficultyTier } from "../data/difficulty";
import type { DifficultyTier } from "../types/content";
import type { CraftRecord } from "../types/craft";
import type { GridResult } from "../types/grid";
import type { FlightOutcome } from "../systems/flightSim";

/** Shared state that travels with the player across one Scavenge->MetaUpgrade loop. */
export interface RunContext {
  runNumber: number;
  tier: number;
  difficulty: DifficultyTier;
  lastGridResult?: GridResult;
  craft?: CraftRecord;
  lastFlightOutcome?: FlightOutcome;
}

export function createInitialRunContext(): RunContext {
  return { runNumber: 1, tier: 0, difficulty: generateDifficultyTier(0) };
}

export function advanceToNextRun(context: RunContext): RunContext {
  const tier = context.tier + 1;
  return { runNumber: context.runNumber + 1, tier, difficulty: generateDifficultyTier(tier) };
}
