import { getRarityBand } from "../data/colorBands";
import { toHslString } from "./color";
import { SHAPES_BY_ARCHETYPE } from "./shapes";
import { FUNCTIONAL_CATEGORIES } from "../types/core";
import type { DecorationArchetype, FunctionalPieceCategory, ItemColor } from "../types/core";
import type { CraftRecord } from "../types/craft";

export interface ComponentVisual {
  archetype: string;
  templateId: string;
  color: ItemColor;
}

export interface DecorationVisual {
  archetype: DecorationArchetype;
  flyBetter?: boolean;
}

export interface CraftVisual {
  /** One hero component per functional category; absent if the category ended up empty. */
  categories: Partial<Record<FunctionalPieceCategory, ComponentVisual>>;
  decorations: DecorationVisual[];
  /** Resolved wing art filenames for this craft -- see pickWingArt. */
  wingArt: { left: string; right: string };
  /** Resolved harness illustration for this craft, if HARNESS_ART_POOL has any entries -- see pickHarnessArt. */
  harnessArt?: string;
}

const DECORATION_GLYPHS: Record<DecorationArchetype, string> = {
  stickerSheet: "⭐",
  glitterGlue: "✨",
  racingStripe: "🏁",
  luckyCharmBead: "🍀",
};

/** Deterministic pseudo-random in [0, 1) -- stable across re-renders of the same craft (same
 * seed always yields the same output), so nothing reshuffles on every redraw. */
function pseudoRandom(seed: number): number {
  const value = Math.sin(seed) * 43758.5453;
  return value - Math.floor(value);
}

export interface WingArtDef {
  /** Rarity rank: 1 is most common, higher ranks are progressively rarer. */
  rank: number;
  file: string;
}

/**
 * Rank 1-2 are common, each successive rank rarer, down to rank 10 landing at ~5% pick chance.
 * To add more ranks later, just extend the pools below with rank: 11, 12, ... -- the geometric
 * curve keeps extending automatically, no other code changes needed.
 */
const RARITY_RATIO = 0.87;

function rarityWeight(rank: number): number {
  return RARITY_RATIO ** (rank - 1);
}

/**
 * Left and right wings are now genuinely different illustrated sets (not mirrors of one shared
 * pool), so mismatched pairs happen automatically -- no distinctness constraint needed. Each side
 * is drawn independently, weighted so rank 1 is most common and rank 10 is rarest (~5%).
 */
export const LEFT_WING_POOL: WingArtDef[] = Array.from({ length: 10 }, (_, i) => ({
  rank: i + 1,
  file: `wing-left-${i + 1}.png`,
}));

export const RIGHT_WING_POOL: WingArtDef[] = Array.from({ length: 10 }, (_, i) => ({
  rank: i + 1,
  file: `wing-right-${i + 1}.png`,
}));

function pickWeighted(pool: WingArtDef[], roll: number): WingArtDef {
  const totalWeight = pool.reduce((sum, entry) => sum + rarityWeight(entry.rank), 0);
  let remaining = roll * totalWeight;
  for (const entry of pool) {
    remaining -= rarityWeight(entry.rank);
    if (remaining <= 0) return entry;
  }
  return pool[pool.length - 1]!;
}

/**
 * Picks independent left/right wing art for a craft. Deterministic for a given seed, so the same
 * craft renders the same pair everywhere (Flight Sim screen, downloadable card) instead of
 * reshuffling on every re-render.
 */
export function pickWingArt(seed: number): { left: WingArtDef; right: WingArtDef } {
  const left = pickWeighted(LEFT_WING_POOL, pseudoRandom(seed + 0.501));
  const right = pickWeighted(RIGHT_WING_POOL, pseudoRandom(seed + 0.907));
  return { left, right };
}

export interface HarnessArtDef {
  file: string;
}

/**
 * Illustrated harness options -- picked uniformly at random (no rarity curve), independent of
 * which harness item was actually collected. To add more, drop a file in public/harness/ and
 * list it here; no other code changes needed.
 */
export const HARNESS_ART_POOL: HarnessArtDef[] = [
  { file: "harness-1.png" },
  { file: "harness-2.png" },
  { file: "harness-3.png" },
  { file: "harness-4.png" },
];

export function pickHarnessArt(seed: number): HarnessArtDef | undefined {
  if (HARNESS_ART_POOL.length === 0) return undefined;
  const index = Math.floor(pseudoRandom(seed + 3.701) * HARNESS_ART_POOL.length);
  return HARNESS_ART_POOL[index];
}

/**
 * Keyed by the specific scavenged piece's templateId (e.g. "mustard_bottle") rather than
 * archetype, so items that share stats/archetype (mustard_bottle and baking_soda are both
 * bakingSodaJet) can still get distinct art. templateIds with no entry keep rendering the SVG
 * accent shape. power-soda-battery.png illustrates a fizzy soda + battery combo, standing in for
 * every non-mustard, non-spray-can power source until each gets its own dedicated art.
 */
export const POWER_SOURCE_ART_MAP: Partial<Record<string, string>> = {
  spray_can: "power-spray-can.png",
  rubber_band: "power-rubber-band.png",
  mustard_bottle: "power-mustard-bottle.png",
  baking_soda: "power-soda-battery.png",
  diet_soda: "power-soda-battery.png",
  fruity_gel_candy_mints: "power-soda-battery.png",
  battery_pack: "power-soda-battery.png",
};

let filterCounter = 0;

/** A hue-rotated <image>, as {defs, body} so callers can pool all <filter>s into one <defs>. */
function hueImageMarkup(
  href: string,
  x: number,
  y: number,
  width: number,
  height: number,
  hue: number,
  filterPrefix: string
): { defs: string; body: string } {
  const filterId = `${filterPrefix}-hue-${filterCounter++}`;
  return {
    defs: `<filter id="${filterId}"><feColorMatrix type="hueRotate" values="${hue.toFixed(1)}" /></filter>`,
    body: `<image href="${import.meta.env.BASE_URL}${href}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet" filter="url(#${filterId})" />`,
  };
}

const CAT_BODY_FILE = "cat-body-back.png";
const CAT_BODY_LAYOUT = { x: 78, y: 2, width: 84, height: 164 };

/** The cat's back, mounted behind the wings so they read as attached to its shoulders. Not a
 * collected piece, so no hue tint -- it's the mascot, not scavenged loot. */
function catBodyMarkup(): string {
  return `<image href="${import.meta.env.BASE_URL}pieces/${CAT_BODY_FILE}" x="${CAT_BODY_LAYOUT.x}" y="${CAT_BODY_LAYOUT.y}" width="${CAT_BODY_LAYOUT.width}" height="${CAT_BODY_LAYOUT.height}" preserveAspectRatio="xMidYMid meet" />`;
}

const WING_SLOT_X: Record<"left" | "right", number> = { left: 10, right: 148 };
const WING_ART_WIDTH = 82;
const WING_ART_HEIGHT = 152;
const WING_ART_Y = 6;

function wingImageMarkup(
  side: "left" | "right",
  file: string,
  component: ComponentVisual | undefined
): { defs: string; body: string } {
  const x = WING_SLOT_X[side];
  if (!component) {
    // Nothing collected for this half's category yet -- a faint placeholder instead of the art.
    return {
      defs: "",
      body: `<rect x="${x}" y="${WING_ART_Y}" width="${WING_ART_WIDTH}" height="${WING_ART_HEIGHT}" rx="8" fill="none" stroke="#999" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.4" />`,
    };
  }
  return hueImageMarkup(`wings/${file}`, x, WING_ART_Y, WING_ART_WIDTH, WING_ART_HEIGHT, component.color.hue, "wing");
}

/** Fixed mount points for the smaller accent categories -- attached to the body/wingtips
 * rather than floating in independent boxes. */
const ACCENT_LAYOUT: Record<"powerSource" | "harness", { x: number; y: number; width: number; height: number }> = {
  powerSource: { x: 90, y: 104, width: 60, height: 56 },
  harness: { x: 2, y: 116, width: 46, height: 44 },
};

function accentMarkup(category: keyof typeof ACCENT_LAYOUT, component: ComponentVisual | undefined): string {
  if (!component) return "";
  const shape = SHAPES_BY_ARCHETYPE[component.archetype as keyof typeof SHAPES_BY_ARCHETYPE];
  if (!shape) return "";
  const color = toHslString(component.color);
  const { x, y, width, height } = ACCENT_LAYOUT[category];
  return `
    <g fill="${color}" stroke="${color}">
      <svg x="${x}" y="${y}" width="${width}" height="${height}" viewBox="${shape.viewBox}">${shape.markup}</svg>
    </g>
  `;
}

function powerSourceMarkup(component: ComponentVisual | undefined): { defs: string; body: string } {
  if (!component) return { defs: "", body: "" };
  const file = POWER_SOURCE_ART_MAP[component.templateId];
  if (!file) return { defs: "", body: accentMarkup("powerSource", component) };
  const { x, y, width, height } = ACCENT_LAYOUT.powerSource;
  return hueImageMarkup(`pieces/power-source/${file}`, x, y, width, height, component.color.hue, "power-source");
}

function harnessMarkup(component: ComponentVisual | undefined, artFile: string | undefined): { defs: string; body: string } {
  if (!component) return { defs: "", body: "" };
  if (!artFile) return { defs: "", body: accentMarkup("harness", component) };
  const { x, y, width, height } = ACCENT_LAYOUT.harness;
  return hueImageMarkup(`harness/${artFile}`, x, y, width, height, component.color.hue, "harness");
}

/**
 * Rarity is otherwise signaled only through hue, which colorblind players can't rely on.
 * This badge is a hue-independent glyph so the "something special" signal doesn't depend
 * on distinguishing color -- and it doubles as the gold-tier visual flourish from the doc.
 */
function rarityBadgeMarkup(craft: CraftVisual): string {
  const tiers = Object.values(craft.categories).map((component) => getRarityBand(component!.color.brilliance).id);
  if (tiers.includes("rare")) {
    return `<text x="120" y="166" font-size="20" text-anchor="middle" fill="#b8860b" stroke="#7a5a00" stroke-width="0.5">★<animate attributeName="opacity" values="0.55;1;0.55" dur="1.6s" repeatCount="indefinite" /></text>`;
  }
  if (tiers.includes("uncommon")) {
    return `<text x="120" y="165" font-size="15" text-anchor="middle" fill="#777">✦</text>`;
  }
  return "";
}

/** Loosely spans both wings while dodging the body/accents in the lower-middle strip. */
const DECORATION_ZONE = { x: 12, y: 8, width: 216, height: 118 };

function decorationMarkup(decorations: DecorationVisual[]): string {
  return decorations
    .map((decoration, index) => {
      const glyph = DECORATION_GLYPHS[decoration.archetype] ?? "⭐";
      const jitterX = pseudoRandom(index * 12.9898 + 3.7);
      const jitterY = pseudoRandom(index * 78.233 + 9.1);
      const x = DECORATION_ZONE.x + jitterX * DECORATION_ZONE.width;
      const y = DECORATION_ZONE.y + jitterY * DECORATION_ZONE.height + 10;
      const size = decoration.flyBetter ? 17 : 14;
      return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${size}" text-anchor="middle">${glyph}</text>`;
    })
    .join("");
}

/** Inner markup only, sized to a 240x170 viewBox -- embeddable inside any parent svg. */
export function composeCraftFragment(craft: CraftVisual): string {
  const left = wingImageMarkup("left", craft.wingArt.left, craft.categories.wingMembrane);
  const right = wingImageMarkup("right", craft.wingArt.right, craft.categories.wingFlapper);
  const powerSource = powerSourceMarkup(craft.categories.powerSource);
  const harness = harnessMarkup(craft.categories.harness, craft.harnessArt);

  return `
    <defs>${left.defs}${right.defs}${powerSource.defs}${harness.defs}</defs>
    ${catBodyMarkup()}
    ${left.body}
    ${right.body}
    ${powerSource.body}
    ${harness.body}
    ${decorationMarkup(craft.decorations)}
    ${rarityBadgeMarkup(craft)}
  `;
}

export function craftRecordToVisual(craft: CraftRecord): CraftVisual {
  const categories: CraftVisual["categories"] = {};
  for (const category of FUNCTIONAL_CATEGORIES) {
    const hero = craft.categories[category].hero;
    if (hero) categories[category] = { archetype: hero.archetype, templateId: hero.templateId, color: hero.color };
  }
  const decorations = craft.categories.decoration.components.map((c) => ({
    archetype: c.archetype as DecorationArchetype,
    flyBetter: c.flyBetter,
  }));
  const pair = pickWingArt(craft.visualSeed);
  const harnessArt = pickHarnessArt(craft.visualSeed)?.file;
  return { categories, decorations, wingArt: { left: pair.left.file, right: pair.right.file }, harnessArt };
}

export function composeCraftSvg(craft: CraftVisual): string {
  return `
    <svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Assembled craft preview">
      ${composeCraftFragment(craft)}
    </svg>
  `;
}

/**
 * Wings + cat body only -- no harness/power source icons. Used for the Flight Sim screen's
 * persistent view, once the reveal sequence (see compose*CloseupSvg below) has already given
 * harness and power source their own spotlight moment.
 */
function composeCraftLeanFragment(craft: CraftVisual): string {
  const left = wingImageMarkup("left", craft.wingArt.left, craft.categories.wingMembrane);
  const right = wingImageMarkup("right", craft.wingArt.right, craft.categories.wingFlapper);

  return `
    <defs>${left.defs}${right.defs}</defs>
    ${catBodyMarkup()}
    ${left.body}
    ${right.body}
    ${decorationMarkup(craft.decorations)}
    ${rarityBadgeMarkup(craft)}
  `;
}

export function composeCraftLeanSvg(craft: CraftVisual): string {
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Wings mounted on Meow-gor's back">${composeCraftLeanFragment(craft)}</svg>`;
}

function paddedViewBox(box: { x: number; y: number; width: number; height: number }, pad: number): string {
  return `${box.x - pad} ${box.y - pad} ${box.width + pad * 2} ${box.height + pad * 2}`;
}

const CLOSEUP_PADDING = 14;

/** Tight close-up shots for the pre-flight reveal sequence -- each spotlights one collected part
 * before the persistent lean view (wings + body) takes over. Undefined when that part wasn't
 * collected this trip, so the caller can skip straight past it. */
export function composeHarnessCloseupSvg(craft: CraftVisual): string | undefined {
  if (!craft.categories.harness) return undefined;
  const harness = harnessMarkup(craft.categories.harness, craft.harnessArt);
  const viewBox = paddedViewBox(ACCENT_LAYOUT.harness, CLOSEUP_PADDING);
  return `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Harness close-up"><defs>${harness.defs}</defs>${harness.body}</svg>`;
}

export function composePowerSourceCloseupSvg(craft: CraftVisual): string | undefined {
  if (!craft.categories.powerSource) return undefined;
  const powerSource = powerSourceMarkup(craft.categories.powerSource);
  const viewBox = paddedViewBox(ACCENT_LAYOUT.powerSource, CLOSEUP_PADDING);
  return `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Power source close-up"><defs>${powerSource.defs}</defs>${powerSource.body}</svg>`;
}

/** Both wings, floating without the cat body -- the "before" shot to the lean view's "after". */
export function composeWingsCloseupSvg(craft: CraftVisual): string {
  const left = wingImageMarkup("left", craft.wingArt.left, craft.categories.wingMembrane);
  const right = wingImageMarkup("right", craft.wingArt.right, craft.categories.wingFlapper);
  return `<svg viewBox="4 2 232 162" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Wings close-up"><defs>${left.defs}${right.defs}</defs>${left.body}${right.body}</svg>`;
}
