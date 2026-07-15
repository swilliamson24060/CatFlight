import { FUNCTIONAL_CATEGORIES } from "../types/core";
import type { Archetype, FunctionalPieceCategory, ItemColor, Stats } from "../types/core";
import type { CraftRecord } from "../types/craft";

const CATEGORY_ORDER: FunctionalPieceCategory[] = [...FUNCTIONAL_CATEGORIES];

const ARCHETYPE_ORDER: Record<FunctionalPieceCategory, Archetype[]> = {
  wingMembrane: ["cardboard", "plasticWrap", "aluminumFoil", "bakingSheetMetal"],
  powerSource: ["rubberBandSling", "bakingSodaJet", "mentosCore", "hairdryer"],
  wingFlapper: ["glider", "flapper", "rocketRig", "rotorChute"],
  aeroHelper: ["finStabilizer", "ventedSpoiler", "noseWeight", "tailRudder"],
  attachment: ["zipTie", "hotGlueDab", "velcroStrap", "paperClip"],
  harness: ["shoelaceLoop", "rubberStrap", "cordSling", "bungeeHook"],
};

const ARCHETYPE_BITS = 2n;
const HUE_BITS = 9n;
const HUE_MAX = 511n;
const BRILLIANCE_BITS = 8n;
const BRILLIANCE_MAX = 255n;
const COMPONENT_BITS = ARCHETYPE_BITS + HUE_BITS + BRILLIANCE_BITS;

const DECORATION_COUNT_BITS = 4n;
const DECORATION_COUNT_MAX = 15n;
const DECORATION_BITS = DECORATION_COUNT_BITS + 1n;

const STAT_BITS = 9n;
const STAT_OFFSET = 256n;
const STAT_MAX = 511n;

const SCORE_BITS = 12n;
const SCORE_MAX = 4095n;

const BASE36_DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz";
const STAT_KEYS = ["thrust", "weight", "drag", "durability"] as const;

function bigIntFromBase36(value: string): bigint {
  let result = 0n;
  for (const char of value.toLowerCase()) {
    const digit = BASE36_DIGITS.indexOf(char);
    if (digit === -1) throw new Error(`Invalid character in craft code: ${char}`);
    result = result * 36n + BigInt(digit);
  }
  return result;
}

function encodeColor(color: ItemColor): bigint {
  const hue = BigInt(Math.round((color.hue / 360) * Number(HUE_MAX))) & HUE_MAX;
  const brilliance = BigInt(Math.round(color.brilliance * Number(BRILLIANCE_MAX))) & BRILLIANCE_MAX;
  return hue | (brilliance << HUE_BITS);
}

function decodeColor(bits: bigint): ItemColor {
  const hue = (Number(bits & HUE_MAX) / Number(HUE_MAX)) * 360;
  const brilliance = Number((bits >> HUE_BITS) & BRILLIANCE_MAX) / Number(BRILLIANCE_MAX);
  return { hue, brilliance };
}

function encodeComponent(archetypeIndex: number, color: ItemColor): bigint {
  return (BigInt(Math.max(0, archetypeIndex)) & 3n) | (encodeColor(color) << ARCHETYPE_BITS);
}

function decodeComponent(bits: bigint, order: Archetype[]): { archetype: Archetype; color: ItemColor } {
  const archetypeIndex = Number(bits & 3n);
  const color = decodeColor(bits >> ARCHETYPE_BITS);
  return { archetype: order[archetypeIndex] ?? order[0]!, color };
}

function encodeStat(value: number): bigint {
  const clamped = Math.max(-Number(STAT_OFFSET), Math.min(Number(STAT_OFFSET) - 1, Math.round(value)));
  return BigInt(clamped + Number(STAT_OFFSET)) & STAT_MAX;
}

function decodeStat(bits: bigint): number {
  return Number(bits & STAT_MAX) - Number(STAT_OFFSET);
}

/** Grand-total stats and score are packed explicitly since the visual only carries a hero
 * component per functional category -- a shared code should still show the real final numbers
 * even when a category's quota (and therefore its true stat contribution) exceeds 1. */
export interface EncodableCraft {
  categories: Record<FunctionalPieceCategory, { archetype: string; color: ItemColor } | undefined>;
  decorationCount: number;
  decorationFlyBetter: boolean;
  stats: Stats;
  score: number;
}

export function encodeCraft(craft: EncodableCraft): string {
  let packed = 0n;
  let shift = 0n;

  for (const category of CATEGORY_ORDER) {
    const component = craft.categories[category];
    const order = ARCHETYPE_ORDER[category];
    const archetypeIndex = component ? order.indexOf(component.archetype as Archetype) : 0;
    const color = component?.color ?? { hue: 0, brilliance: 0 };
    packed |= encodeComponent(archetypeIndex, color) << shift;
    shift += COMPONENT_BITS;
  }

  const decorationBits =
    (BigInt(Math.min(Number(DECORATION_COUNT_MAX), craft.decorationCount)) & DECORATION_COUNT_MAX) |
    ((craft.decorationFlyBetter ? 1n : 0n) << DECORATION_COUNT_BITS);
  packed |= decorationBits << shift;
  shift += DECORATION_BITS;

  for (const key of STAT_KEYS) {
    packed |= encodeStat(craft.stats[key]) << shift;
    shift += STAT_BITS;
  }

  packed |= (BigInt(Math.max(0, Math.min(Number(SCORE_MAX), Math.round(craft.score)))) & SCORE_MAX) << shift;

  return packed.toString(36);
}

export interface DecodedCraft {
  categories: Record<FunctionalPieceCategory, { archetype: Archetype; color: ItemColor }>;
  decorationCount: number;
  decorationFlyBetter: boolean;
  stats: Stats;
  score: number;
}

export function decodeCraftCode(code: string): DecodedCraft {
  const packed = bigIntFromBase36(code);
  const componentMask = (1n << COMPONENT_BITS) - 1n;
  let shift = 0n;

  const categories = {} as DecodedCraft["categories"];
  for (const category of CATEGORY_ORDER) {
    const bits = (packed >> shift) & componentMask;
    categories[category] = decodeComponent(bits, ARCHETYPE_ORDER[category]);
    shift += COMPONENT_BITS;
  }

  const decorationMask = (1n << DECORATION_BITS) - 1n;
  const decorationBits = (packed >> shift) & decorationMask;
  const decorationCount = Number(decorationBits & DECORATION_COUNT_MAX);
  const decorationFlyBetter = ((decorationBits >> DECORATION_COUNT_BITS) & 1n) === 1n;
  shift += DECORATION_BITS;

  const stats = {} as Stats;
  for (const key of STAT_KEYS) {
    stats[key] = decodeStat((packed >> shift) & STAT_MAX);
    shift += STAT_BITS;
  }

  const score = Number((packed >> shift) & SCORE_MAX);

  return { categories, decorationCount, decorationFlyBetter, stats, score };
}

export function craftSeedString(craft: Pick<CraftRecord, "categories" | "stats" | "score">): string {
  const categories = {} as EncodableCraft["categories"];
  for (const category of CATEGORY_ORDER) {
    const hero = craft.categories[category].hero;
    categories[category] = hero ? { archetype: hero.archetype, color: hero.color } : undefined;
  }
  const decoration = craft.categories.decoration;
  return encodeCraft({
    categories,
    decorationCount: decoration.components.length,
    decorationFlyBetter: decoration.components.some((c) => c.flyBetter),
    stats: craft.stats,
    score: craft.score,
  });
}
