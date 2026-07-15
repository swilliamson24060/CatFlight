import { DEFAULT_GRID_SIZE } from "./grid";
import type { FlightOutcome } from "./flightSim";

export interface MetaState {
  scrap: number;
  gridExpansionLevel: number;
  junkFilterLevel: number;
  rerollLevel: number;
  luckLevel: number;
  bestTier: number;
}

const STORAGE_KEY = "catflight-meta-v1";

export function createDefaultMetaState(): MetaState {
  return { scrap: 0, gridExpansionLevel: 0, junkFilterLevel: 0, rerollLevel: 0, luckLevel: 0, bestTier: 0 };
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

export function computeCountertopSize(meta: MetaState): number {
  return 12 + meta.gridExpansionLevel * 2;
}

export function computeEffectiveJunkDensity(baseDensity: number, meta: MetaState): number {
  return Math.max(0.1, baseDensity - meta.junkFilterLevel * 0.04);
}

export function computeScrapReward(outcome: FlightOutcome): number {
  return 5 + outcome.gatesCleared * 5;
}

/** Fed into rollColor as an exponent bias; 0 at level 0 leaves the roll unchanged. */
export function computeLuckBias(meta: MetaState): number {
  return meta.luckLevel * 0.25;
}

export type UpgradeId = "gridExpansion" | "junkFilter" | "reroll" | "luck";

export interface UpgradeDef {
  id: UpgradeId;
  name: string;
  description: string;
  maxLevel: number;
  costForLevel: (currentLevel: number) => number;
}

export const UPGRADES: UpgradeDef[] = [
  {
    id: "gridExpansion",
    name: "Bigger Toolbox",
    description: "+1 row and column to your inventory grid.",
    maxLevel: 5,
    costForLevel: (level) => 30 + level * 20,
  },
  {
    id: "junkFilter",
    name: "Junk Sense",
    description: "Reduces junk density on the countertop.",
    maxLevel: 8,
    costForLevel: (level) => 15 + level * 15,
  },
  {
    id: "reroll",
    name: "Lucky Paw",
    description: "+1 free countertop reroll per run.",
    maxLevel: 3,
    costForLevel: (level) => 10 + level * 10,
  },
  {
    id: "luck",
    name: "Golden Whisker",
    description: "Increases the odds of uncommon and rare color rolls.",
    maxLevel: 5,
    costForLevel: (level) => 20 + level * 20,
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
  }
}

export function purchaseUpgrade(meta: MetaState, id: UpgradeId): MetaState {
  const def = UPGRADES.find((u) => u.id === id)!;
  const level = getUpgradeLevel(meta, id);
  if (level >= def.maxLevel) return meta;
  const cost = def.costForLevel(level);
  if (meta.scrap < cost) return meta;

  const updated: MetaState = { ...meta, scrap: meta.scrap - cost };
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
  }
  return updated;
}
