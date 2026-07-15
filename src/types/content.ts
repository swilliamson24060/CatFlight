import type { Archetype, Footprint, FunctionalPieceCategory, PieceCategory, Stats } from "./core";

/** A single entry in the kitchen spawn pool. Color is rolled at spawn time, not stored here. */
export interface PieceTemplate {
  id: string;
  name: string;
  /** Empty = pure scrap, contributes no stats and can't be synthesized. 2 entries = dual-purpose. */
  categories: PieceCategory[];
  /** Undefined only when categories is empty. */
  archetype?: Archetype;
  footprint: Footprint;
  baseStats: Stats;
  /** Relative weight for random selection from a reveal pool; higher = more common. */
  spawnWeight: number;
  /** Decoration pieces only: grants a small real stat bonus and extra Score when used. */
  flyBetter?: boolean;
}

export function isJunkPiece(template: PieceTemplate): boolean {
  return template.categories.length === 0;
}

/** One clickable kitchen appliance/furniture hotspot. */
export interface KitchenSourceTemplate {
  id: string;
  name: string;
  /** Position of the clickable hotspot, as a percentage of the kitchen scene's viewBox. */
  hotspot: { x: number; y: number; width: number; height: number };
  /** How many objects this source reveals when opened. */
  revealCount: { min: number; max: number };
  /** Which pieces can come out of this source, with optional per-source weight overrides. */
  revealPool: { templateId: string; weight?: number }[];
}

/** Randomly rolled quotas for the 6 functional categories. Decoration is deliberately excluded -- it's bonus-only. */
export interface Blueprint {
  requirements: Record<FunctionalPieceCategory, number>;
}

/** Defines the brilliance ranges that grant rarity bonuses, applied per-item at synthesis time. */
export interface RarityBand {
  id: "common" | "uncommon" | "rare";
  minBrilliance: number;
  maxBrilliance: number;
  statBonus?: Partial<Stats>;
  /** If set, hue is snapped toward this value regardless of the item's rolled hue (e.g. rare -> gold). */
  hueOverride?: number;
}

/** Scaling parameters for one difficulty tier. Flight success is now driven by blueprint
 * fulfillment (see systems/flightSim.ts), not stat thresholds -- junkDensity is all that's left. */
export interface DifficultyTier {
  tier: number;
  junkDensity: number;
}
