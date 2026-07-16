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
  /** This trip's scavenged haul only -- the grid always starts blank on a new trip. */
  lastGridResult?: GridResult;
  /** Pieces left over after the last Doc's Workbench assembly; persists across retries. */
  excessPieces?: PlacedGridItem[];
  craft?: CraftRecord;
  lastFlightOutcome?: FlightOutcome;
  /** Pieces already committed to each category at Doc's Workbench, accumulated across every trip
   * on this blueprint. Once a piece is added here it's off the grid for good -- the grid resets
   * every trip, so this is the durable record of blueprint progress. */
  committedComponents?: Partial<Record<PieceCategory, PlacedGridItem[]>>;
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
