import type { EngineArchetype, FrameArchetype, SkinArchetype } from "../types/core";

export interface ShapeDef {
  viewBox: string;
  markup: string;
}

// Simple flat vector silhouettes -- one shape per archetype, tinted at render time.
// Kept to basic SVG primitives per the "avoid animation bloat" design constraint.

export const FRAME_SHAPES: Record<FrameArchetype, ShapeDef> = {
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
};

export const SKIN_SHAPES: Record<SkinArchetype, ShapeDef> = {
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
};

export const ENGINE_SHAPES: Record<EngineArchetype, ShapeDef> = {
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
};
