import type { SlotType } from "../types/core";

export interface SlotColor {
  fill: string;
  border: string;
}

export const SLOT_COLORS: Record<SlotType | "junk" | "decal", SlotColor> = {
  frame: { fill: "#5b8fc7", border: "#3f6a9c" },
  skin: { fill: "#c9a227", border: "#96791b" },
  engine: { fill: "#e0674f", border: "#b34a35" },
  junk: { fill: "#9a9a9a", border: "#707070" },
  decal: { fill: "#a778c9", border: "#7d569e" },
};
