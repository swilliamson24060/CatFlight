import { describe, expect, it } from "vitest";
import { pickWingArtPair, WING_ART_POOL } from "./craftComposer";

describe("pickWingArtPair", () => {
  it("always picks two distinct entries when the pool has 2 or more", () => {
    expect(WING_ART_POOL.length).toBeGreaterThanOrEqual(2);
    for (let seed = 0; seed < 200; seed++) {
      const { left, right } = pickWingArtPair(seed * 0.037);
      expect(left.id).not.toBe(right.id);
    }
  });

  it("only picks ids that exist in the pool", () => {
    const poolIds = new Set(WING_ART_POOL.map((entry) => entry.id));
    for (let seed = 0; seed < 50; seed++) {
      const { left, right } = pickWingArtPair(seed * 0.091);
      expect(poolIds.has(left.id)).toBe(true);
      expect(poolIds.has(right.id)).toBe(true);
    }
  });

  it("is deterministic for the same seed", () => {
    const a = pickWingArtPair(0.4242);
    const b = pickWingArtPair(0.4242);
    expect(a).toEqual(b);
  });

  it("covers a range of pairings across many seeds (not always the same pair)", () => {
    const pairs = new Set<string>();
    for (let seed = 0; seed < 100; seed++) {
      const { left, right } = pickWingArtPair(seed * 0.083);
      pairs.add(`${left.id}-${right.id}`);
    }
    expect(pairs.size).toBeGreaterThan(1);
  });
});
