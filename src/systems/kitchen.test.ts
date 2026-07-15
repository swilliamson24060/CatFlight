import { describe, expect, it } from "vitest";
import { generateKitchenLayout } from "./kitchen";
import { FUNCTIONAL_CATEGORIES } from "../types/core";

describe("generateKitchenLayout", () => {
  it("always activates exactly 5 sources (the area cap)", () => {
    for (let i = 0; i < 50; i++) {
      expect(generateKitchenLayout(0.5).length).toBe(5);
    }
  });

  it("covers every functional category in the large majority of runs, given the 5-area cap", () => {
    // Coverage is best-effort now (5 slots for 6 categories) -- assert it succeeds often, not always.
    const trials = 500;
    let covered = 0;
    for (let i = 0; i < trials; i++) {
      const layout = generateKitchenLayout(0.9);
      const categoriesFound = new Set(
        layout.flatMap((active) => active.reveals.flatMap((piece) => piece.template.categories))
      );
      if (FUNCTIONAL_CATEGORIES.every((category) => categoriesFound.has(category))) covered++;
    }
    expect(covered / trials).toBeGreaterThan(0.7);
  });

  it("never reveals fewer pieces than a source's declared minimum", () => {
    const layout = generateKitchenLayout(0.5);
    for (const active of layout) {
      expect(active.reveals.length).toBeGreaterThanOrEqual(active.source.revealCount.min);
    }
  });
});
