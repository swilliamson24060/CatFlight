import type { Footprint, ItemColor } from "./core";
import type { ItemTemplate } from "./content";

export interface PlacedGridItem {
  instanceId: string;
  template: ItemTemplate;
  color: ItemColor;
  footprint: Footprint;
  origin: { row: number; col: number };
}

export interface GridResult {
  placedItems: PlacedGridItem[];
  decalIds: string[];
}
