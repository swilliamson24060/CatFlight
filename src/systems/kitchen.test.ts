import { describe, expect, it } from "vitest";
import { generateKitchenLayout } from "./kitchen";
import { FUNCTIONAL_CATEGORIES } from "../types/core";

describe("generateKitchenLayout", () => {
  it("always includes at least one real candidate for every functional category", () => {
    // Stress well above the game's actual junk density clamp to keep this from flaking.
    for (let i = 0; i < 200; i++) {
      const layout = generateKitchenLayout(0.9);
      const categoriesFound = new Set(
        layout.flatMap((active) => active.reveals.flatMap((piece) => piece.template.categories))
      );
      for (const category of FUNCTIONAL_CATEGORIES) {
        expect(categoriesFound.has(category)).toBe(true);
      }
    }
  });

  it("never reveals fewer pieces than a source's declared minimum", () => {
    const layout = generateKitchenLayout(0.5);
    for (const active of layout) {
      expect(active.reveals.length).toBeGreaterThanOrEqual(active.source.revealCount.min);
    }
  });
});
