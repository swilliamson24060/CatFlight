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

export interface CraftVisual {
  /** One hero component per functional category; absent if the category ended up empty. */
  categories: Partial<Record<FunctionalPieceCategory, ComponentVisual>>;
  decorationCount: number;
  decorationFlyBetter: boolean;
}

const DECORATION_GLYPHS: Record<DecorationArchetype, string> = {
  stickerSheet: "⭐",
  glitterGlue: "✨",
  racingStripe: "🏁",
  luckyCharmBead: "🍀",
};

/** Fixed layout of each functional category's shape within the 240x170 viewBox. */
const LAYOUT: Record<FunctionalPieceCategory, { x: number; y: number; width: number; height: number; opacity?: number }> = {
  wingFlapper: { x: 20, y: 15, width: 200, height: 95 },
  wingMembrane: { x: 60, y: 38, width: 120, height: 57, opacity: 0.6 },
  powerSource: { x: 90, y: 118, width: 60, height: 38 },
  aeroHelper: { x: 8, y: 12, width: 38, height: 25 },
  attachment: { x: 194, y: 12, width: 38, height: 25 },
  harness: { x: 8, y: 120, width: 38, height: 25 },
};

/**
 * Rarity is otherwise signaled only through hue, which colorblind players can't rely on.
 * This badge is a hue-independent glyph so the "something special" signal doesn't depend
 * on distinguishing color -- and it doubles as the gold-tier visual flourish from the doc.
 */
function rarityBadgeMarkup(craft: CraftVisual): string {
  const tiers = Object.values(craft.categories).map((component) => getRarityBand(component!.color.brilliance).id);
  if (tiers.includes("rare")) {
    return `<text x="20" y="156" font-size="22" text-anchor="middle" fill="#b8860b" stroke="#7a5a00" stroke-width="0.5">★<animate attributeName="opacity" values="0.55;1;0.55" dur="1.6s" repeatCount="indefinite" /></text>`;
  }
  if (tiers.includes("uncommon")) {
    return `<text x="20" y="154" font-size="16" text-anchor="middle" fill="#777">✦</text>`;
  }
  return "";
}

function decorationMarkup(craft: CraftVisual): string {
  if (craft.decorationCount === 0) return "";
  const glyph = craft.decorationFlyBetter ? DECORATION_GLYPHS.racingStripe : DECORATION_GLYPHS.stickerSheet;
  const countBadge = craft.decorationCount > 1 ? `<text x="222" y="36" font-size="10" fill="#555">x${craft.decorationCount}</text>` : "";
  return `<text x="207" y="30" font-size="20" text-anchor="middle">${glyph}</text>${countBadge}`;
}

/** Inner markup only, sized to a 240x170 viewBox -- embeddable inside any parent svg. */
export function composeCraftFragment(craft: CraftVisual): string {
  const layers = FUNCTIONAL_CATEGORIES.map((category) => {
    const component = craft.categories[category];
    if (!component) return "";
    const shape = SHAPES_BY_ARCHETYPE[component.archetype as keyof typeof SHAPES_BY_ARCHETYPE];
    if (!shape) return "";
    const color = toHslString(component.color);
    const { x, y, width, height, opacity } = LAYOUT[category];
    return `
      <g fill="${color}" stroke="${color}"${opacity !== undefined ? ` opacity="${opacity}"` : ""}>
        <svg x="${x}" y="${y}" width="${width}" height="${height}" viewBox="${shape.viewBox}">${shape.markup}</svg>
      </g>
    `;
  }).join("");

  return `
    ${layers}
    ${decorationMarkup(craft)}
    ${rarityBadgeMarkup(craft)}
  `;
}

export function craftRecordToVisual(craft: CraftRecord): CraftVisual {
  const categories: CraftVisual["categories"] = {};
  for (const category of FUNCTIONAL_CATEGORIES) {
    const hero = craft.categories[category].hero;
    if (hero) categories[category] = { archetype: hero.archetype, color: hero.color };
  }
  const decoration = craft.categories.decoration;
  return {
    categories,
    decorationCount: decoration.components.length,
    decorationFlyBetter: decoration.components.some((c) => c.flyBetter),
  };
}

export function composeCraftSvg(craft: CraftVisual): string {
  return `
    <svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Assembled craft preview">
      ${composeCraftFragment(craft)}
    </svg>
  `;
}
