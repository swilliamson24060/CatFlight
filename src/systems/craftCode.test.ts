import { describe, expect, it } from "vitest";
import { decodeCraftCode, encodeCraft, type EncodableCraft } from "./craftCode";

function roundTrip(craft: EncodableCraft) {
  const code = encodeCraft(craft);
  return { code, decoded: decodeCraftCode(code) };
}

const BASE_CRAFT: EncodableCraft = {
  categories: {
    wingMembrane: { archetype: "cardboard", color: { hue: 0, brilliance: 0 } },
    powerSource: { archetype: "hairdryer", color: { hue: 180, brilliance: 0.5 } },
    wingFlapper: { archetype: "glider", color: { hue: 0, brilliance: 0 } },
    aeroHelper: { archetype: "finStabilizer", color: { hue: 90, brilliance: 0.3 } },
    attachment: { archetype: "zipTie", color: { hue: 270, brilliance: 0.7 } },
    harness: { archetype: "bungeeHook", color: { hue: 45, brilliance: 0.9 } },
  },
  decorationCount: 0,
  decorationFlyBetter: false,
  stats: { thrust: 10, weight: 8, drag: 4, durability: 3 },
  score: 85,
};

describe("craftCode round-trip", () => {
  it("preserves archetype and approximates hue/brilliance for every functional category", () => {
    const craft: EncodableCraft = {
      ...BASE_CRAFT,
      categories: {
        ...BASE_CRAFT.categories,
        wingMembrane: { archetype: "cardboard", color: { hue: 359.9, brilliance: 1 } },
        powerSource: { archetype: "hairdryer", color: { hue: 180, brilliance: 0.5 } },
      },
    };
    const { decoded } = roundTrip(craft);

    expect(decoded.categories.wingMembrane.archetype).toBe("cardboard");
    expect(decoded.categories.powerSource.archetype).toBe("hairdryer");
    expect(decoded.categories.wingFlapper.archetype).toBe("glider");
    expect(decoded.categories.wingMembrane.color.hue).toBeCloseTo(359.9, 0);
    expect(decoded.categories.powerSource.color.brilliance).toBeCloseTo(0.5, 2);
  });

  it("preserves decoration count and Fly Better flag", () => {
    const craft: EncodableCraft = { ...BASE_CRAFT, decorationCount: 3, decorationFlyBetter: true };
    const { decoded } = roundTrip(craft);
    expect(decoded.decorationCount).toBe(3);
    expect(decoded.decorationFlyBetter).toBe(true);
  });

  it("preserves the grand-total stats and score", () => {
    const craft: EncodableCraft = { ...BASE_CRAFT, stats: { thrust: 12.4, weight: -3, drag: 7, durability: 0 }, score: 55 };
    const { decoded } = roundTrip(craft);
    expect(decoded.stats.thrust).toBeCloseTo(12, 0);
    expect(decoded.stats.weight).toBeCloseTo(-3, 0);
    expect(decoded.score).toBe(55);
  });

  it("produces a url-safe base36 code", () => {
    const code = encodeCraft(BASE_CRAFT);
    expect(/^[0-9a-z]+$/.test(code)).toBe(true);
  });
});
