import { describe, expect, it } from "vitest";
import { ITEM_POOL } from "../data/items";
import { assembleCraft, groupCandidatesBySlot } from "./synthesis";
import type { SlotType } from "../types/core";
import type { PlacedGridItem } from "../types/grid";

function makePlacedItem(instanceId: string, slotType: SlotType | "junk"): PlacedGridItem {
  const template = ITEM_POOL.find((item) => item.slotType === slotType)!;
  return {
    instanceId,
    template,
    color: { hue: 180, brilliance: 0.5 },
    footprint: template.footprint,
    origin: { row: 0, col: 0 },
  };
}

describe("groupCandidatesBySlot", () => {
  it("groups placed items by slot and excludes junk", () => {
    const groups = groupCandidatesBySlot([
      makePlacedItem("a", "frame"),
      makePlacedItem("b", "skin"),
      makePlacedItem("c", "junk"),
    ]);
    expect(groups.frame).toHaveLength(1);
    expect(groups.skin).toHaveLength(1);
    expect(groups.engine).toHaveLength(0);
  });
});

describe("assembleCraft", () => {
  it("resolves three components into a craft with a populated seed string", () => {
    const frame = makePlacedItem("frame-1", "frame");
    const skin = makePlacedItem("skin-1", "skin");
    const engine = makePlacedItem("engine-1", "engine");
    const craft = assembleCraft(frame, skin, engine, null);

    expect(craft.frame.archetype).toBe(frame.template.archetype);
    expect(craft.skin.archetype).toBe(skin.template.archetype);
    expect(craft.engine.archetype).toBe(engine.template.archetype);
    expect(craft.decalId).toBeNull();
    expect(craft.seedString).toBeTruthy();
    expect(craft.stats.thrust).toBeGreaterThanOrEqual(0);
  });

  it("carries the chosen decal id through", () => {
    const frame = makePlacedItem("frame-1", "frame");
    const skin = makePlacedItem("skin-1", "skin");
    const engine = makePlacedItem("engine-1", "engine");
    const craft = assembleCraft(frame, skin, engine, "flame");
    expect(craft.decalId).toBe("flame");
  });
});
