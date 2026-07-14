import { ITEM_POOL } from "../data/items";
import { DECAL_POOL } from "../data/decals";
import { getRarityBand } from "../data/colorBands";
import type { DecalTemplate, ItemTemplate } from "../types/content";
import type { ItemColor, Stats } from "../types/core";

export interface CountertopItem {
  instanceId: string;
  kind: "grid" | "decal";
  template: ItemTemplate | DecalTemplate;
  color?: ItemColor;
}

let nextInstanceId = 1;
function makeInstanceId(): string {
  return `inst-${nextInstanceId++}`;
}

function weightedPick<T extends { spawnWeight: number }>(pool: T[]): T {
  const total = pool.reduce((sum, item) => sum + item.spawnWeight, 0);
  let roll = Math.random() * total;
  for (const item of pool) {
    roll -= item.spawnWeight;
    if (roll <= 0) return item;
  }
  return pool[pool.length - 1]!;
}

export function rollColor(): ItemColor {
  return { hue: Math.random() * 360, brilliance: Math.random() };
}

export const DEFAULT_COUNTERTOP_SIZE = 12;
const DECAL_CHANCE = 0.35;

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

/**
 * Always includes at least one Frame, one Skin, and one Engine candidate so a run can
 * never generate a countertop that makes synthesis impossible (see softlock fix).
 */
export function generateCountertop(junkDensity: number, countertopSize: number = DEFAULT_COUNTERTOP_SIZE): CountertopItem[] {
  const junkTemplates = ITEM_POOL.filter((item) => item.slotType === "junk");
  const usefulTemplates = ITEM_POOL.filter((item) => item.slotType !== "junk");
  const frameTemplates = ITEM_POOL.filter((item) => item.slotType === "frame");
  const skinTemplates = ITEM_POOL.filter((item) => item.slotType === "skin");
  const engineTemplates = ITEM_POOL.filter((item) => item.slotType === "engine");

  const guaranteed = [frameTemplates, skinTemplates, engineTemplates].map((pool) => weightedPick(pool));
  const items: CountertopItem[] = guaranteed.map((template) => ({
    instanceId: makeInstanceId(),
    kind: "grid",
    template,
    color: rollColor(),
  }));

  for (let i = items.length; i < countertopSize; i++) {
    const template = Math.random() < junkDensity ? weightedPick(junkTemplates) : weightedPick(usefulTemplates);
    items.push({ instanceId: makeInstanceId(), kind: "grid", template, color: rollColor() });
  }

  const shuffled = shuffle(items);

  if (Math.random() < DECAL_CHANCE) {
    const decal = weightedPick(DECAL_POOL);
    shuffled.push({ instanceId: makeInstanceId(), kind: "decal", template: decal });
  }

  return shuffled;
}

export function computeStatTally(perItemStats: Stats[]): Stats {
  return perItemStats.reduce(
    (acc, s) => ({
      thrust: acc.thrust + s.thrust,
      weight: acc.weight + s.weight,
      drag: acc.drag + s.drag,
      durability: acc.durability + s.durability,
    }),
    { thrust: 0, weight: 0, drag: 0, durability: 0 }
  );
}

export function applyRarityBonus(baseStats: Stats, color: ItemColor): Stats {
  const band = getRarityBand(color.brilliance);
  if (!band.statBonus) return baseStats;
  const result = { ...baseStats };
  for (const [key, fraction] of Object.entries(band.statBonus)) {
    const k = key as keyof Stats;
    result[k] = result[k] + result[k] * (fraction ?? 0);
  }
  return result;
}
