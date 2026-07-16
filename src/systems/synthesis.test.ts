import { describe, expect, it } from "vitest";
import { assembleCraft, computeFulfillmentRatio, groupCandidatesByCategory, identifyExcessPieces } from "./synthesis";
import type { PieceTemplate } from "../types/content";
import type { FunctionalPieceCategory } from "../types/core";
import type { PlacedGridItem } from "../types/grid";

const REQUIREMENTS: Record<FunctionalPieceCategory, number> = {
  wingMembrane: 1,
  powerSource: 1,
  wingFlapper: 1,
  aeroHelper: 1,
  attachment: 1,
  harness: 1,
};

function makeItem(id: string, template: Partial<PieceTemplate> & Pick<PieceTemplate, "categories">): PlacedGridItem {
  const fullTemplate: PieceTemplate = {
    id,
    name: id,
    footprint: { width: 1, height: 1 },
    baseStats: { thrust: 1, weight: 1, drag: 0, durability: 0 },
    spawnWeight: 1,
    ...template,
  };
  return {
    instanceId: id,
    template: fullTemplate,
    color: { hue: 0, brilliance: 0.5 },
    footprint: fullTemplate.footprint,
    origin: { row: 0, col: 0 },
  };
}

describe("groupCandidatesByCategory", () => {
  it("puts a dual-category piece in both of its categories' arrays", () => {
    const cord = makeItem("cord", { categories: ["attachment", "harness"], archetype: "zipTie" });
    const groups = groupCandidatesByCategory([cord]);
    expect(groups.attachment).toContain(cord);
    expect(groups.harness).toContain(cord);
    expect(groups.powerSource).toEqual([]);
  });

  it("excludes junk (pieces with no categories)", () => {
    const junk = makeItem("junk", { categories: [] });
    const groups = groupCandidatesByCategory([junk]);
    for (const items of Object.values(groups)) {
      expect(items).not.toContain(junk);
    }
  });
});

describe("assembleCraft", () => {
  it("sums stats across multiple selected components in the same category", () => {
    const a = makeItem("a", { categories: ["wingMembrane"], archetype: "cardboard", baseStats: { thrust: 1, weight: 2, drag: 0, durability: 0 } });
    const b = makeItem("b", { categories: ["wingMembrane"], archetype: "plasticWrap", baseStats: { thrust: 1, weight: 3, drag: 0, durability: 0 } });
    const craft = assembleCraft({ wingMembrane: [a, b] }, REQUIREMENTS, 1);
    expect(craft.categories.wingMembrane.components).toHaveLength(2);
    expect(craft.stats.weight).toBeCloseTo(5, 5);
  });

  it("applies decoration score bonuses, bigger for Fly Better pieces", () => {
    const sticker = makeItem("sticker", { categories: ["decoration"], archetype: "stickerSheet" });
    const stripe = makeItem("stripe", { categories: ["decoration"], archetype: "racingStripe", flyBetter: true });
    const craft = assembleCraft({ decoration: [sticker, stripe] }, REQUIREMENTS, 1);
    expect(craft.score).toBeGreaterThan(100); // base score (trip 1) + 10 + 25
  });

  it("populates a seedString", () => {
    const craft = assembleCraft({}, REQUIREMENTS, 1);
    expect(craft.seedString).toBeTruthy();
  });

  it("populates a visualSeed in [0, 1)", () => {
    const craft = assembleCraft({}, REQUIREMENTS, 1);
    expect(craft.visualSeed).toBeGreaterThanOrEqual(0);
    expect(craft.visualSeed).toBeLessThan(1);
  });

  it("computes a craft's fulfillmentRatio from its selections vs. requirements", () => {
    const membrane = makeItem("m", { categories: ["wingMembrane"], archetype: "cardboard" });
    const craft = assembleCraft({ wingMembrane: [membrane] }, REQUIREMENTS, 1);
    expect(craft.fulfillmentRatio).toBeCloseTo(1 / 6, 5); // only 1 of 6 categories fulfilled
  });
});

describe("computeFulfillmentRatio", () => {
  it("averages min(have/need, 1) across all 6 functional categories", () => {
    const membrane = makeItem("m", { categories: ["wingMembrane"], archetype: "cardboard" });
    const ratio = computeFulfillmentRatio({ wingMembrane: [membrane, membrane] }, { ...REQUIREMENTS, wingMembrane: 2 });
    expect(ratio).toBeCloseTo(1 / 6, 5); // wingMembrane fully met (2/2, capped at 1), other 5 at 0
  });

  it("is 1 when every category is exactly met", () => {
    const item = makeItem("x", { categories: ["harness"], archetype: "shoelaceLoop" });
    const full: Record<FunctionalPieceCategory, number> = { ...REQUIREMENTS, harness: 1 };
    const ratio = computeFulfillmentRatio(
      {
        wingMembrane: [item],
        powerSource: [item],
        wingFlapper: [item],
        aeroHelper: [item],
        attachment: [item],
        harness: [item],
      },
      full
    );
    expect(ratio).toBeCloseTo(1, 5);
  });
});

describe("identifyExcessPieces", () => {
  it("returns pieces that weren't referenced in any selection", () => {
    const used = makeItem("used", { categories: ["powerSource"], archetype: "rubberBandSling" });
    const unused = makeItem("unused", { categories: ["harness"], archetype: "shoelaceLoop" });
    const excess = identifyExcessPieces([used, unused], { powerSource: [used] });
    expect(excess).toEqual([unused]);
  });
});
