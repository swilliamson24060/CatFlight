import { getRarityBand } from "../data/colorBands";
import { toHslString } from "./color";
import { SHAPES_BY_ARCHETYPE } from "./shapes";
import { FUNCTIONAL_CATEGORIES } from "../types/core";
import type { DecorationArchetype, FunctionalPieceCategory, ItemColor } from "../types/core";
import type { CraftRecord } from "../types/craft";

export interface ComponentVisual {
  archetype: string;
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
  /** Resolved wing art filenames for this craft -- see pickWingArtPair. */
  wingArt: { left: string; right: string };
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
  id: string;
  file: string;
}

/**
 * Pool of available illustrated wing halves. Selection is random per craft and deliberately
 * independent of what was actually collected -- color still comes from the collected category's
 * rolled hue, but which illustration shows up is just for visual variety. To grow the variety,
 * drop a new file in public/wings/ and add an entry here; no other code changes needed.
 */
export const WING_ART_POOL: WingArtDef[] = [
  { id: "junk", file: "wing-junk.png" },
  { id: "gear", file: "wing-gear.png" },
];

/**
 * Picks two distinct entries from WING_ART_POOL for a craft's left/right wings -- distinct so the
 * pair always reads as "mismatched, cobbled together," which only gets more varied as the pool
 * grows. Deterministic for a given seed, so the same craft renders the same pair everywhere
 * (Flight Sim screen, downloadable card) instead of reshuffling on every re-render.
 */
export function pickWingArtPair(seed: number): { left: WingArtDef; right: WingArtDef } {
  const pool = WING_ART_POOL;
  const firstIndex = Math.floor(pseudoRandom(seed + 0.501) * pool.length);
  const first = pool[firstIndex]!;
  if (pool.length < 2) return { left: first, right: first };

  let secondIndex = Math.floor(pseudoRandom(seed + 0.907) * (pool.length - 1));
  if (secondIndex >= firstIndex) secondIndex += 1;
  const second = pool[secondIndex]!;

  return pseudoRandom(seed + 1.3) < 0.5 ? { left: first, right: second } : { left: second, right: first };
}

const WING_SLOT_X: Record<"left" | "right", number> = { left: 10, right: 148 };
const WING_ART_WIDTH = 82;
const WING_ART_HEIGHT = 152;
const WING_ART_Y = 6;

let filterCounter = 0;

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
  const filterId = `wing-hue-${filterCounter++}`;
  return {
    defs: `<filter id="${filterId}"><feColorMatrix type="hueRotate" values="${component.color.hue.toFixed(1)}" /></filter>`,
    body: `<image href="${import.meta.env.BASE_URL}wings/${file}" x="${x}" y="${WING_ART_Y}" width="${WING_ART_WIDTH}" height="${WING_ART_HEIGHT}" preserveAspectRatio="xMidYMid meet" filter="url(#${filterId})" />`,
  };
}

/** Fixed mount points for the smaller accent categories -- attached to the body/wingtips
 * rather than floating in independent boxes. */
const ACCENT_LAYOUT: Record<Exclude<FunctionalPieceCategory, "wingFlapper" | "wingMembrane">, { x: number; y: number; width: number; height: number }> = {
  powerSource: { x: 98, y: 134, width: 44, height: 28 },
  aeroHelper: { x: 2, y: 2, width: 30, height: 20 },
  attachment: { x: 208, y: 2, width: 30, height: 20 },
  harness: { x: 2, y: 138, width: 30, height: 20 },
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
  const bodyMarkup = `<rect x="98" y="134" width="44" height="26" rx="8" fill="#efe9d8" stroke="#6b6b6b" stroke-width="1.5" />`;

  return `
    <defs>${left.defs}${right.defs}</defs>
    ${left.body}
    ${right.body}
    ${bodyMarkup}
    ${accentMarkup("powerSource", craft.categories.powerSource)}
    ${accentMarkup("aeroHelper", craft.categories.aeroHelper)}
    ${accentMarkup("attachment", craft.categories.attachment)}
    ${accentMarkup("harness", craft.categories.harness)}
    ${decorationMarkup(craft.decorations)}
    ${rarityBadgeMarkup(craft)}
  `;
}

export function craftRecordToVisual(craft: CraftRecord): CraftVisual {
  const categories: CraftVisual["categories"] = {};
  for (const category of FUNCTIONAL_CATEGORIES) {
    const hero = craft.categories[category].hero;
    if (hero) categories[category] = { archetype: hero.archetype, color: hero.color };
  }
  const decorations = craft.categories.decoration.components.map((c) => ({
    archetype: c.archetype as DecorationArchetype,
    flyBetter: c.flyBetter,
  }));
  const pair = pickWingArtPair(craft.visualSeed);
  return { categories, decorations, wingArt: { left: pair.left.file, right: pair.right.file } };
}

export function composeCraftSvg(craft: CraftVisual): string {
  return `
    <svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Assembled craft preview">
      ${composeCraftFragment(craft)}
    </svg>
  `;
}
