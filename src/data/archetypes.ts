import type { EngineArchetype, FrameArchetype, SkinArchetype, Stats } from "../types/core";

// Placeholder balancing numbers -- tune once the flight-sim gates are wired up.

export const FRAME_STATS: Record<FrameArchetype, Stats> = {
  glider: { thrust: 0, weight: 2, drag: 4, durability: 1 },
  flapper: { thrust: 1, weight: 4, drag: 3, durability: 2 },
  rocketRig: { thrust: 3, weight: 5, drag: 2, durability: 2 },
  rotorChute: { thrust: 0, weight: 4, drag: 6, durability: 2 },
};

export const SKIN_STATS: Record<SkinArchetype, Stats> = {
  cardboard: { thrust: 0, weight: 0, drag: 1, durability: 0 },
  plasticWrap: { thrust: 0, weight: 1, drag: 1, durability: 1 },
  aluminumFoil: { thrust: 0, weight: 3, drag: 1, durability: 3 },
  bakingSheetMetal: { thrust: 0, weight: 6, drag: 0, durability: 6 },
};

export const ENGINE_STATS: Record<EngineArchetype, Stats> = {
  rubberBandSling: { thrust: 2, weight: 1, drag: 0, durability: 0 },
  bakingSodaJet: { thrust: 4, weight: 2, drag: 0, durability: -1 },
  mentosCore: { thrust: 7, weight: 2, drag: 0, durability: -2 },
  hairdryer: { thrust: 5, weight: 3, drag: 0, durability: 1 },
};
