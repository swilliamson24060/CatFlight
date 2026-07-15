import type { FunctionalPieceCategory, PieceCategory } from "../types/core";

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

/** Display-only grouping of the 6 real categories into the 4 things Doc says he's searching
 * for -- purely presentational, used for the kitchen-phase reminder and Workshop briefing.
 * Doc's Workbench still shows the real 6 bins. */
export interface DisplayGroup {
  label: string;
  categories: FunctionalPieceCategory[];
}

export const DISPLAY_GROUPS: DisplayGroup[] = [
  { label: "Wing Membranes", categories: ["wingMembrane"] },
  { label: "Engine Parts", categories: ["powerSource"] },
  { label: "Structural Parts", categories: ["wingFlapper", "aeroHelper", "attachment"] },
  { label: "Harness Material", categories: ["harness"] },
];

export function summarizeBlueprintForDisplay(requirements: Record<FunctionalPieceCategory, number>): string {
  return DISPLAY_GROUPS.map((group) => {
    const total = group.categories.reduce((sum, cat) => sum + requirements[cat], 0);
    return `${group.label} &times;${total}`;
  }).join(" &middot; ");
}
