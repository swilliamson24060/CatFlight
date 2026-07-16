import type { Archetype, ItemColor, PieceCategory, Stats } from "./core";

export interface CraftComponent {
  archetype: Archetype;
  /** The scavenged piece's template id (e.g. "cardboard_scrap"). */
  templateId: string;
  color: ItemColor;
  stats: Stats;
  flyBetter?: boolean;
}

export interface CraftCategoryResult {
  components: CraftComponent[];
  stats: Stats;
  /** Representative component for the visual layer -- undefined only when the category is empty. */
  hero?: CraftComponent;
}

export interface CraftRecord {
  categories: Record<PieceCategory, CraftCategoryResult>;
  stats: Stats;
  score: number;
  /** Average over the 6 functional categories of min(selected/required, 1) -- drives flight success. */
  fulfillmentRatio: number;
  /** Compact shareable encoding -- populated by the craft export step. */
  seedString?: string;
  /** Random in [0, 1), rolled once at assembly time -- drives which illustrated wing art is
   * picked for each side (see render/craftComposer.ts), independent of what was collected, so
   * it stays stable across re-renders of the same craft instead of reshuffling on every redraw. */
  visualSeed: number;
}
