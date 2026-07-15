import type {
  AeroHelperArchetype,
  AttachmentArchetype,
  DecorationArchetype,
  HarnessArchetype,
  PowerSourceArchetype,
  Stats,
  WingFlapperArchetype,
  WingMembraneArchetype,
} from "../types/core";

// Placeholder balancing numbers -- tune during the blueprint/score balance pass.

export const WING_MEMBRANE_STATS: Record<WingMembraneArchetype, Stats> = {
  cardboard: { thrust: 0, weight: 0, drag: 1, durability: 0 },
  plasticWrap: { thrust: 0, weight: 1, drag: 1, durability: 1 },
  aluminumFoil: { thrust: 0, weight: 3, drag: 1, durability: 3 },
  bakingSheetMetal: { thrust: 0, weight: 6, drag: 0, durability: 6 },
};

export const POWER_SOURCE_STATS: Record<PowerSourceArchetype, Stats> = {
  rubberBandSling: { thrust: 2, weight: 1, drag: 0, durability: 0 },
  bakingSodaJet: { thrust: 4, weight: 2, drag: 0, durability: -1 },
  mentosCore: { thrust: 7, weight: 2, drag: 0, durability: -2 },
  hairdryer: { thrust: 5, weight: 3, drag: 0, durability: 1 },
};

export const WING_FLAPPER_STATS: Record<WingFlapperArchetype, Stats> = {
  glider: { thrust: 0, weight: 2, drag: 4, durability: 1 },
  flapper: { thrust: 1, weight: 4, drag: 3, durability: 2 },
  rocketRig: { thrust: 3, weight: 5, drag: 2, durability: 2 },
  rotorChute: { thrust: 0, weight: 4, drag: 6, durability: 2 },
};

export const AERO_HELPER_STATS: Record<AeroHelperArchetype, Stats> = {
  finStabilizer: { thrust: 0, weight: 1, drag: 2, durability: 1 },
  ventedSpoiler: { thrust: 0, weight: 2, drag: 3, durability: 0 },
  noseWeight: { thrust: 0, weight: 3, drag: 0, durability: 2 },
  tailRudder: { thrust: 0, weight: 1, drag: 1, durability: 1 },
};

export const ATTACHMENT_STATS: Record<AttachmentArchetype, Stats> = {
  zipTie: { thrust: 0, weight: 0, drag: 0, durability: 1 },
  hotGlueDab: { thrust: 0, weight: 0, drag: 0, durability: 2 },
  velcroStrap: { thrust: 0, weight: 1, drag: 0, durability: 1 },
  paperClip: { thrust: 0, weight: 0, drag: 0, durability: 0 },
};

export const HARNESS_STATS: Record<HarnessArchetype, Stats> = {
  shoelaceLoop: { thrust: 0, weight: 1, drag: 0, durability: 1 },
  rubberStrap: { thrust: 0, weight: 1, drag: 0, durability: 2 },
  cordSling: { thrust: 0, weight: 2, drag: 0, durability: 2 },
  bungeeHook: { thrust: 0, weight: 2, drag: 0, durability: 3 },
};

export const DECORATION_STATS: Record<DecorationArchetype, Stats> = {
  stickerSheet: { thrust: 0, weight: 0, drag: 0, durability: 0 },
  glitterGlue: { thrust: 0, weight: 0, drag: 0, durability: 0 },
  racingStripe: { thrust: 1, weight: 0, drag: -1, durability: 0 },
  luckyCharmBead: { thrust: 0, weight: 0, drag: 0, durability: 1 },
};
