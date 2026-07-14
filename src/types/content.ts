import type { Archetype, Footprint, SlotType, Stats } from "./core";

/** A single entry in the scavenge spawn pool. Color is rolled at spawn time, not stored here. */
export interface ItemTemplate {
  id: string;
  name: string;
  slotType: SlotType | "junk";
  /** Undefined for junk items, which contribute no stats and can't be synthesized. */
  archetype?: Archetype;
  footprint: Footprint;
  baseStats: Stats;
  /** Relative weight for random selection from the pool; higher = more common. */
  spawnWeight: number;
}

/** A trinket found on the countertop that auto-collects and skips the grid entirely. */
export interface DecalTemplate {
  id: string;
  name: string;
  icon: string;
  spawnWeight: number;
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

/** Scaling parameters for one difficulty tier of the procedural flight sim gates. */
export interface DifficultyTier {
  tier: number;
  launchThreshold: number;
  midflightThreshold: number;
  glideMin: number;
  glideMax: number;
  junkDensity: number;
}
