import type { PieceCategory } from "../types/core";

export interface CategoryColor {
  fill: string;
  border: string;
}

export const CATEGORY_COLORS: Record<PieceCategory | "junk", CategoryColor> = {
  wingMembrane: { fill: "#c9a227", border: "#96791b" },
  powerSource: { fill: "#e0674f", border: "#b34a35" },
  wingFlapper: { fill: "#5b8fc7", border: "#3f6a9c" },
  aeroHelper: { fill: "#4fa37c", border: "#357a5b" },
  attachment: { fill: "#c77d3f", border: "#96591f" },
  harness: { fill: "#8a6fb0", border: "#654f85" },
  decoration: { fill: "#a778c9", border: "#7d569e" },
  junk: { fill: "#9a9a9a", border: "#707070" },
};

export const CATEGORY_LABELS: Record<PieceCategory, string> = {
  wingMembrane: "Wing Membrane",
  powerSource: "Power Source",
  wingFlapper: "Wing Flapper",
  aeroHelper: "Aerodynamic Helper",
  attachment: "Attachment",
  harness: "Harness",
  decoration: "Decoration",
};
