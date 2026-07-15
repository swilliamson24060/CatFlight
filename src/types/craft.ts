import type { Archetype, ItemColor, PieceCategory, Stats } from "./core";

export interface CraftComponent {
  archetype: Archetype;
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
  /** Compact shareable encoding -- populated by the craft export step. */
  seedString?: string;
}
