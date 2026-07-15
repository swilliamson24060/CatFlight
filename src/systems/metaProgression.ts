import { DEFAULT_GRID_SIZE } from "./grid";
import type { FlightOutcome } from "./flightSim";
import type { PlacedGridItem } from "../types/grid";

export interface MetaState {
  scrap: number;
  spareParts: number;
  gridExpansionLevel: number;
  junkFilterLevel: number;
  rerollLevel: number;
  luckLevel: number;
  blueprintEaseLevel: number;
  yieldBoostLevel: number;
  bestTier: number;
  bestScore: number;
}

const STORAGE_KEY = "catflight-meta-v1";

export function createDefaultMetaState(): MetaState {
  return {
    scrap: 0,
    spareParts: 0,
    gridExpansionLevel: 0,
    junkFilterLevel: 0,
    rerollLevel: 0,
    luckLevel: 0,
    blueprintEaseLevel: 0,
    yieldBoostLevel: 0,
    bestTier: 0,
    bestScore: 0,
  };
}

export function loadMetaState(): MetaState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultMetaState();
    return { ...createDefaultMetaState(), ...JSON.parse(raw) };
  } catch {
    return createDefaultMetaState();
  }
}

export function saveMetaState(state: MetaState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function computeGridSize(meta: MetaState): number {
  return DEFAULT_GRID_SIZE + meta.gridExpansionLevel;
}

export function computeEffectiveJunkDensity(baseDensity: number, meta: MetaState): number {
  return Math.max(0.1, baseDensity - meta.junkFilterLevel * 0.04);
}

export function computeScrapReward(outcome: FlightOutcome): number {
  return 5 + outcome.gatesCleared * 5;
}

/** Placeholder formula -- flagged for a balance pass. Rewards carrying home more/bigger excess. */
export function computeSparePartsReward(excessPieces: PlacedGridItem[]): number {
  return excessPieces.reduce((sum, item) => sum + 2 + item.footprint.width * item.footprint.height, 0);
}

/** Fed into rollColor as an exponent bias; 0 at level 0 leaves the roll unchanged. */
export function computeLuckBias(meta: MetaState): number {
  return meta.luckLevel * 0.25;
}

/** Every level reduces every functional category's blueprint requirement by 1, floored at 1. */
export function computeBlueprintEase(meta: MetaState): number {
  return meta.blueprintEaseLevel;
}

/** Flat fractional boost applied to thrust/durability at assembly; 0 at level 0 leaves stats unchanged. */
export function computeYieldBoost(meta: MetaState): number {
  return meta.yieldBoostLevel * 0.05;
}

export type UpgradeId = "gridExpansion" | "junkFilter" | "reroll" | "luck" | "blueprintEase" | "yieldBoost";
export type UpgradeCurrency = "scrap" | "spareParts";

export interface UpgradeDef {
  id: UpgradeId;
  name: string;
  description: string;
  maxLevel: number;
  currency: UpgradeCurrency;
  costForLevel: (currentLevel: number) => number;
}

export const UPGRADES: UpgradeDef[] = [
  {
    id: "gridExpansion",
    name: "Bigger Toolbox",
    description: "+1 row and column to your inventory grid.",
    maxLevel: 5,
    currency: "scrap",
    costForLevel: (level) => 30 + level * 20,
  },
  {
    id: "junkFilter",
    name: "Junk Sense",
    description: "Reduces junk density on the countertop.",
    maxLevel: 8,
    currency: "scrap",
    costForLevel: (level) => 15 + level * 15,
  },
  {
    id: "reroll",
    name: "Lucky Paw",
    description: "+1 free countertop reroll per run.",
    maxLevel: 3,
    currency: "scrap",
    costForLevel: (level) => 10 + level * 10,
  },
  {
    id: "luck",
    name: "Golden Whisker",
    description: "Increases the odds of uncommon and rare color rolls.",
    maxLevel: 5,
    currency: "scrap",
    costForLevel: (level) => 20 + level * 20,
  },
  {
    id: "blueprintEase",
    name: "Doc's Shortcuts",
    description: "Reduces every blueprint category's requirement by 1 (never below 1).",
    maxLevel: 3,
    currency: "spareParts",
    costForLevel: (level) => 40 + level * 30,
  },
  {
    id: "yieldBoost",
    name: "Reinforced Rivets",
    description: "+5% thrust and durability on every assembled craft.",
    maxLevel: 5,
    currency: "spareParts",
    costForLevel: (level) => 25 + level * 20,
  },
];

export function getUpgradeLevel(meta: MetaState, id: UpgradeId): number {
  switch (id) {
    case "gridExpansion":
      return meta.gridExpansionLevel;
    case "junkFilter":
      return meta.junkFilterLevel;
    case "reroll":
      return meta.rerollLevel;
    case "luck":
      return meta.luckLevel;
    case "blueprintEase":
      return meta.blueprintEaseLevel;
    case "yieldBoost":
      return meta.yieldBoostLevel;
  }
}

function balanceFor(meta: MetaState, currency: UpgradeCurrency): number {
  return currency === "scrap" ? meta.scrap : meta.spareParts;
}

export function purchaseUpgrade(meta: MetaState, id: UpgradeId): MetaState {
  const def = UPGRADES.find((u) => u.id === id)!;
  const level = getUpgradeLevel(meta, id);
  if (level >= def.maxLevel) return meta;
  const cost = def.costForLevel(level);
  if (balanceFor(meta, def.currency) < cost) return meta;

  const updated: MetaState = {
    ...meta,
    scrap: def.currency === "scrap" ? meta.scrap - cost : meta.scrap,
    spareParts: def.currency === "spareParts" ? meta.spareParts - cost : meta.spareParts,
  };
  switch (id) {
    case "gridExpansion":
      updated.gridExpansionLevel = level + 1;
      break;
    case "junkFilter":
      updated.junkFilterLevel = level + 1;
      break;
    case "reroll":
      updated.rerollLevel = level + 1;
      break;
    case "luck":
      updated.luckLevel = level + 1;
      break;
    case "blueprintEase":
      updated.blueprintEaseLevel = level + 1;
      break;
    case "yieldBoost":
      updated.yieldBoostLevel = level + 1;
      break;
  }
  return updated;
}
