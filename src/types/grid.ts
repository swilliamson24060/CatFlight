import type { Footprint, ItemColor } from "./core";
import type { PieceTemplate } from "./content";

export interface PlacedGridItem {
  instanceId: string;
  template: PieceTemplate;
  color: ItemColor;
  footprint: Footprint;
  origin: { row: number; col: number };
}

export interface GridResult {
  placedItems: PlacedGridItem[];
}
