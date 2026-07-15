export type PieceCategory =
  | "wingMembrane"
  | "powerSource"
  | "wingFlapper"
  | "aeroHelper"
  | "attachment"
  | "harness"
  | "decoration";

/** The 6 categories a blueprint sets quotas for. Decoration is bonus-only and never required. */
export type FunctionalPieceCategory = Exclude<PieceCategory, "decoration">;

export const FUNCTIONAL_CATEGORIES: FunctionalPieceCategory[] = [
  "wingMembrane",
  "powerSource",
  "wingFlapper",
  "aeroHelper",
  "attachment",
  "harness",
];

export const ALL_CATEGORIES: PieceCategory[] = [...FUNCTIONAL_CATEGORIES, "decoration"];

export type WingMembraneArchetype = "cardboard" | "plasticWrap" | "aluminumFoil" | "bakingSheetMetal";
export type PowerSourceArchetype = "rubberBandSling" | "bakingSodaJet" | "mentosCore" | "hairdryer";
export type WingFlapperArchetype = "glider" | "flapper" | "rocketRig" | "rotorChute";
export type AeroHelperArchetype = "finStabilizer" | "ventedSpoiler" | "noseWeight" | "tailRudder";
export type AttachmentArchetype = "zipTie" | "hotGlueDab" | "velcroStrap" | "paperClip";
export type HarnessArchetype = "shoelaceLoop" | "rubberStrap" | "cordSling" | "bungeeHook";
export type DecorationArchetype = "stickerSheet" | "glitterGlue" | "racingStripe" | "luckyCharmBead";

export type Archetype =
  | WingMembraneArchetype
  | PowerSourceArchetype
  | WingFlapperArchetype
  | AeroHelperArchetype
  | AttachmentArchetype
  | HarnessArchetype
  | DecorationArchetype;

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
