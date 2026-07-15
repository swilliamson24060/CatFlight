import { getRarityBand } from "../data/colorBands";
import { DECAL_GLYPHS } from "./decals";
import { toHslString } from "./color";
import { ENGINE_SHAPES, FRAME_SHAPES, SKIN_SHAPES } from "./shapes";
import type { EngineArchetype, FrameArchetype, ItemColor, SkinArchetype } from "../types/core";

export interface ComponentVisual {
  archetype: string;
  color: ItemColor;
}

export interface CraftVisual {
  frame: ComponentVisual;
  skin: ComponentVisual;
  engine: ComponentVisual;
  decalId: string | null;
}

/**
 * Rarity is otherwise signaled only through hue, which colorblind players can't rely on.
 * This badge is a hue-independent glyph so the "something special" signal doesn't depend
 * on distinguishing color -- and it doubles as the gold-tier visual flourish from the doc.
 */
function rarityBadgeMarkup(craft: CraftVisual): string {
  const tiers = [craft.frame.color, craft.skin.color, craft.engine.color].map(
    (color) => getRarityBand(color.brilliance).id
  );
  if (tiers.includes("rare")) {
    return `<text x="20" y="156" font-size="22" text-anchor="middle" fill="#b8860b" stroke="#7a5a00" stroke-width="0.5">★<animate attributeName="opacity" values="0.55;1;0.55" dur="1.6s" repeatCount="indefinite" /></text>`;
  }
  if (tiers.includes("uncommon")) {
    return `<text x="20" y="154" font-size="16" text-anchor="middle" fill="#777">✦</text>`;
  }
  return "";
}

/** Inner markup only, sized to a 240x170 viewBox -- embeddable inside any parent svg. */
export function composeCraftFragment(craft: CraftVisual): string {
  const frameShape = FRAME_SHAPES[craft.frame.archetype as FrameArchetype];
  const skinShape = SKIN_SHAPES[craft.skin.archetype as SkinArchetype];
  const engineShape = ENGINE_SHAPES[craft.engine.archetype as EngineArchetype];

  const frameColor = toHslString(craft.frame.color);
  const skinColor = toHslString(craft.skin.color);
  const engineColor = toHslString(craft.engine.color);

  const decalGlyph = craft.decalId ? DECAL_GLYPHS[craft.decalId] : null;

  return `
    <g fill="${frameColor}" stroke="${frameColor}">
      <svg x="20" y="20" width="200" height="110" viewBox="${frameShape.viewBox}">${frameShape.markup}</svg>
    </g>
    <g fill="${skinColor}" stroke="${skinColor}" opacity="0.6">
      <svg x="60" y="45" width="120" height="60" viewBox="${skinShape.viewBox}">${skinShape.markup}</svg>
    </g>
    <g fill="${engineColor}" stroke="${engineColor}">
      <svg x="90" y="122" width="60" height="40" viewBox="${engineShape.viewBox}">${engineShape.markup}</svg>
    </g>
    ${decalGlyph ? `<text x="205" y="28" font-size="22" text-anchor="middle">${decalGlyph}</text>` : ""}
    ${rarityBadgeMarkup(craft)}
  `;
}

export function composeCraftSvg(craft: CraftVisual): string {
  return `
    <svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Assembled craft preview">
      ${composeCraftFragment(craft)}
    </svg>
  `;
}
