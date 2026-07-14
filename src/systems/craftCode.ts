import { DECAL_POOL } from "../data/decals";
import type { EngineArchetype, FrameArchetype, ItemColor, SkinArchetype } from "../types/core";
import type { CraftRecord } from "../types/craft";

const FRAME_ORDER: FrameArchetype[] = ["glider", "flapper", "rocketRig", "rotorChute"];
const SKIN_ORDER: SkinArchetype[] = ["cardboard", "plasticWrap", "aluminumFoil", "bakingSheetMetal"];
const ENGINE_ORDER: EngineArchetype[] = ["rubberBandSling", "bakingSodaJet", "mentosCore", "hairdryer"];

const ARCHETYPE_BITS = 2n;
const HUE_BITS = 9n;
const HUE_MAX = 511n;
const BRILLIANCE_BITS = 8n;
const BRILLIANCE_MAX = 255n;
const DECAL_BITS = 4n;
const NO_DECAL = 15n;
const COMPONENT_BITS = ARCHETYPE_BITS + HUE_BITS + BRILLIANCE_BITS;

const BASE36_DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz";

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
  return (BigInt(archetypeIndex) & 3n) | (encodeColor(color) << ARCHETYPE_BITS);
}

function decodeComponent<T extends string>(bits: bigint, order: T[]): { archetype: T; color: ItemColor } {
  const archetypeIndex = Number(bits & 3n);
  const color = decodeColor(bits >> ARCHETYPE_BITS);
  return { archetype: order[archetypeIndex] ?? order[0]!, color };
}

export interface EncodableCraft {
  frame: { archetype: string; color: ItemColor };
  skin: { archetype: string; color: ItemColor };
  engine: { archetype: string; color: ItemColor };
  decalId: string | null;
}

export function encodeCraft(craft: EncodableCraft): string {
  const frameIdx = FRAME_ORDER.indexOf(craft.frame.archetype as FrameArchetype);
  const skinIdx = SKIN_ORDER.indexOf(craft.skin.archetype as SkinArchetype);
  const engineIdx = ENGINE_ORDER.indexOf(craft.engine.archetype as EngineArchetype);
  const decalIdx = craft.decalId ? DECAL_POOL.findIndex((d) => d.id === craft.decalId) : -1;
  const decalBits = decalIdx === -1 ? NO_DECAL : BigInt(decalIdx) & 15n;

  let packed = decalBits;
  packed |= encodeComponent(frameIdx, craft.frame.color) << DECAL_BITS;
  packed |= encodeComponent(skinIdx, craft.skin.color) << (DECAL_BITS + COMPONENT_BITS);
  packed |= encodeComponent(engineIdx, craft.engine.color) << (DECAL_BITS + COMPONENT_BITS * 2n);

  return packed.toString(36);
}

export interface DecodedCraft {
  frame: { archetype: FrameArchetype; color: ItemColor };
  skin: { archetype: SkinArchetype; color: ItemColor };
  engine: { archetype: EngineArchetype; color: ItemColor };
  decalId: string | null;
}

export function decodeCraftCode(code: string): DecodedCraft {
  const packed = bigIntFromBase36(code);
  const componentMask = (1n << COMPONENT_BITS) - 1n;

  const decalBits = packed & 15n;
  const frameBits = (packed >> DECAL_BITS) & componentMask;
  const skinBits = (packed >> (DECAL_BITS + COMPONENT_BITS)) & componentMask;
  const engineBits = (packed >> (DECAL_BITS + COMPONENT_BITS * 2n)) & componentMask;

  const decalId = decalBits === NO_DECAL ? null : (DECAL_POOL[Number(decalBits)]?.id ?? null);

  return {
    frame: decodeComponent(frameBits, FRAME_ORDER),
    skin: decodeComponent(skinBits, SKIN_ORDER),
    engine: decodeComponent(engineBits, ENGINE_ORDER),
    decalId,
  };
}

export function craftSeedString(craft: Pick<CraftRecord, "frame" | "skin" | "engine" | "decalId">): string {
  return encodeCraft(craft);
}
