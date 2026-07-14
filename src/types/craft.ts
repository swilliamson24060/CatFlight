import type { Archetype, ItemColor, Stats } from "./core";

export interface CraftComponent {
  archetype: Archetype;
  color: ItemColor;
  stats: Stats;
}

export interface CraftRecord {
  frame: CraftComponent;
  skin: CraftComponent;
  engine: CraftComponent;
  decalId: string | null;
  stats: Stats;
  /** Compact shareable encoding -- populated by the craft export step. */
  seedString?: string;
}
