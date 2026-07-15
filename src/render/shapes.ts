import type { Archetype } from "../types/core";

export interface ShapeDef {
  viewBox: string;
  markup: string;
}

// Simple flat vector silhouettes -- one shape per archetype, tinted at render time.
// Kept to basic SVG primitives per the "avoid animation bloat" design constraint.
// Keyed flatly by archetype (not nested by category) so a dual-category piece can render
// correctly no matter which of its categories it ends up assigned to at Doc's Workbench.

export const SHAPES_BY_ARCHETYPE: Record<Exclude<Archetype, "stickerSheet" | "glitterGlue" | "racingStripe" | "luckyCharmBead">, ShapeDef> = {
  // Wing Flapper (structural silhouette)
  glider: {
    viewBox: "0 0 160 100",
    markup: `<ellipse cx="80" cy="50" rx="75" ry="16" />`,
  },
  flapper: {
    viewBox: "0 0 160 100",
    markup: `<polygon points="8,50 62,18 82,50 62,82" /><polygon points="82,50 136,18 156,50 136,82" />`,
  },
  rocketRig: {
    viewBox: "0 0 160 100",
    markup: `<polygon points="20,85 80,8 140,85 80,62" />`,
  },
  rotorChute: {
    viewBox: "0 0 160 100",
    markup: `<ellipse cx="80" cy="50" rx="72" ry="30" /><ellipse cx="80" cy="50" rx="18" ry="9" fill="#00000030" stroke="none" />`,
  },

  // Wing Membrane (skin overlay)
  cardboard: {
    viewBox: "0 0 100 60",
    markup: `<rect x="4" y="4" width="92" height="52" rx="4" /><line x1="4" y1="20" x2="96" y2="20" stroke="#00000035" stroke-width="2" /><line x1="4" y1="35" x2="96" y2="35" stroke="#00000035" stroke-width="2" /><line x1="4" y1="50" x2="96" y2="50" stroke="#00000035" stroke-width="2" />`,
  },
  plasticWrap: {
    viewBox: "0 0 100 60",
    markup: `<path d="M4,28 Q19,10 34,28 T64,28 T94,28 L94,48 Q79,32 64,48 T34,48 T4,48 Z" />`,
  },
  aluminumFoil: {
    viewBox: "0 0 100 60",
    markup: `<rect x="4" y="4" width="92" height="52" rx="2" /><line x1="4" y1="4" x2="96" y2="56" stroke="#ffffff55" stroke-width="2" /><line x1="30" y1="4" x2="96" y2="36" stroke="#ffffff55" stroke-width="2" /><line x1="4" y1="30" x2="64" y2="56" stroke="#ffffff55" stroke-width="2" />`,
  },
  bakingSheetMetal: {
    viewBox: "0 0 100 60",
    markup: `<rect x="2" y="2" width="96" height="56" rx="3" />`,
  },

  // Power Source
  rubberBandSling: {
    viewBox: "0 0 60 40",
    markup: `<ellipse cx="30" cy="20" rx="22" ry="10" fill="none" stroke-width="6" />`,
  },
  bakingSodaJet: {
    viewBox: "0 0 60 40",
    markup: `<rect x="20" y="4" width="20" height="32" rx="6" />`,
  },
  mentosCore: {
    viewBox: "0 0 60 40",
    markup: `<circle cx="30" cy="20" r="11" /><line x1="30" y1="2" x2="30" y2="9" stroke-width="3" /><line x1="13" y1="9" x2="19" y2="14" stroke-width="3" /><line x1="47" y1="9" x2="41" y2="14" stroke-width="3" /><line x1="13" y1="31" x2="19" y2="26" stroke-width="3" /><line x1="47" y1="31" x2="41" y2="26" stroke-width="3" />`,
  },
  hairdryer: {
    viewBox: "0 0 60 40",
    markup: `<polygon points="8,10 40,15 40,25 8,30" /><rect x="38" y="14" width="14" height="12" rx="2" />`,
  },

  // Aerodynamic Helper (small accent)
  finStabilizer: {
    viewBox: "0 0 60 40",
    markup: `<polygon points="30,4 46,34 14,34" />`,
  },
  ventedSpoiler: {
    viewBox: "0 0 60 40",
    markup: `<rect x="6" y="14" width="48" height="14" rx="2" /><line x1="6" y1="21" x2="54" y2="21" stroke="#00000035" stroke-width="2" />`,
  },
  noseWeight: {
    viewBox: "0 0 60 40",
    markup: `<circle cx="30" cy="20" r="13" />`,
  },
  tailRudder: {
    viewBox: "0 0 60 40",
    markup: `<polygon points="10,32 30,6 34,32" />`,
  },

  // Attachment (small accent)
  zipTie: {
    viewBox: "0 0 60 40",
    markup: `<ellipse cx="30" cy="20" rx="16" ry="10" fill="none" stroke-width="4" /><rect x="42" y="15" width="10" height="10" rx="2" />`,
  },
  hotGlueDab: {
    viewBox: "0 0 60 40",
    markup: `<circle cx="30" cy="22" r="12" /><circle cx="30" cy="10" r="5" />`,
  },
  velcroStrap: {
    viewBox: "0 0 60 40",
    markup: `<rect x="8" y="14" width="44" height="12" rx="2" /><line x1="12" y1="20" x2="48" y2="20" stroke="#00000030" stroke-width="1.5" stroke-dasharray="2 2" />`,
  },
  paperClip: {
    viewBox: "0 0 60 40",
    markup: `<path d="M20,8 Q40,8 40,20 Q40,32 24,32 Q12,32 12,22 Q12,15 22,15 Q30,15 30,22" fill="none" stroke-width="4" />`,
  },

  // Harness (small accent)
  shoelaceLoop: {
    viewBox: "0 0 60 40",
    markup: `<path d="M12,30 Q30,4 48,30" fill="none" stroke-width="4" />`,
  },
  rubberStrap: {
    viewBox: "0 0 60 40",
    markup: `<rect x="8" y="16" width="44" height="10" rx="5" />`,
  },
  cordSling: {
    viewBox: "0 0 60 40",
    markup: `<path d="M8,12 Q30,36 52,12" fill="none" stroke-width="4" />`,
  },
  bungeeHook: {
    viewBox: "0 0 60 40",
    markup: `<path d="M20,8 L20,24 Q20,32 30,32 Q40,32 40,24" fill="none" stroke-width="4" />`,
  },
};
