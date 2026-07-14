import { applyRarityBonus, computeStatTally } from "./scavenge";
import { craftSeedString } from "./craftCode";
import type { SlotType } from "../types/core";
import type { CraftComponent, CraftRecord } from "../types/craft";
import type { PlacedGridItem } from "../types/grid";

export type SlotCandidates = Record<SlotType, PlacedGridItem[]>;

export function groupCandidatesBySlot(placedItems: PlacedGridItem[]): SlotCandidates {
  const groups: SlotCandidates = { frame: [], skin: [], engine: [] };
  for (const item of placedItems) {
    if (item.template.slotType === "junk") continue;
    groups[item.template.slotType].push(item);
  }
  return groups;
}

export function resolveComponent(item: PlacedGridItem): CraftComponent {
  return {
    archetype: item.template.archetype!,
    color: item.color,
    stats: applyRarityBonus(item.template.baseStats, item.color),
  };
}

export function assembleCraft(
  frameItem: PlacedGridItem,
  skinItem: PlacedGridItem,
  engineItem: PlacedGridItem,
  decalId: string | null
): CraftRecord {
  const frame = resolveComponent(frameItem);
  const skin = resolveComponent(skinItem);
  const engine = resolveComponent(engineItem);
  const craft: CraftRecord = {
    frame,
    skin,
    engine,
    decalId,
    stats: computeStatTally([frame.stats, skin.stats, engine.stats]),
  };
  craft.seedString = craftSeedString(craft);
  return craft;
}
