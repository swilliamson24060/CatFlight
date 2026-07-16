import { generateBlueprint } from "../data/blueprint";
import { generateDifficultyTier } from "../data/difficulty";
import type { Blueprint, DifficultyTier } from "../types/content";
import type { CraftRecord } from "../types/craft";
import type { PieceCategory } from "../types/core";
import type { GridResult, PlacedGridItem } from "../types/grid";
import type { FlightOutcome } from "../systems/flightSim";

/** Shared state that travels with the player across one Scavenge->MetaUpgrade loop. */
export interface RunContext {
  runNumber: number;
  tier: number;
  difficulty: DifficultyTier;
  blueprint: Blueprint;
  /** How many kitchen trips have been taken on the current blueprint; resets to 0 on success. */
  tripCount: number;
  lastGridResult?: GridResult;
  /** Pieces left over after the last Doc's Workbench assembly; persists across retries. */
  excessPieces?: PlacedGridItem[];
  craft?: CraftRecord;
  lastFlightOutcome?: FlightOutcome;
  /** Doc's Workbench category assignments, kept so a trip back to the kitchen doesn't lose them.
   * Pieces referenced here are locked in the grid -- committed to a category, not removable. */
  categorySelections?: Partial<Record<PieceCategory, string[]>>;
}

export function createInitialRunContext(): RunContext {
  return {
    runNumber: 1,
    tier: 0,
    difficulty: generateDifficultyTier(0),
    blueprint: generateBlueprint(),
    tripCount: 0,
  };
}

/** Called only after a successful flight -- advances to the next tier with a fresh blueprint. */
export function advanceToNextRun(context: RunContext): RunContext {
  const tier = context.tier + 1;
  return {
    runNumber: context.runNumber + 1,
    tier,
    difficulty: generateDifficultyTier(tier),
    blueprint: generateBlueprint(),
    tripCount: 0,
  };
}
