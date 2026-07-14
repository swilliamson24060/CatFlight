export type SlotType = "frame" | "skin" | "engine";

export type FrameArchetype = "glider" | "flapper" | "rocketRig" | "rotorChute";
export type SkinArchetype = "cardboard" | "plasticWrap" | "aluminumFoil" | "bakingSheetMetal";
export type EngineArchetype = "rubberBandSling" | "bakingSodaJet" | "mentosCore" | "hairdryer";

export type Archetype = FrameArchetype | SkinArchetype | EngineArchetype;

export interface Stats {
  thrust: number;
  weight: number;
  drag: number;
  durability: number;
}

export interface Footprint {
  width: number;
  height: number;
}

/** hue: 0-360 degrees, rolled uniformly. brilliance: 0-1, rolled from a weighted curve. */
export interface ItemColor {
  hue: number;
  brilliance: number;
}
