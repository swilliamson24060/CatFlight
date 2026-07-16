import { describe, expect, it } from "vitest";
import {
  composeCraftFragment,
  composeCraftLeanSvg,
  composeHarnessCloseupSvg,
  composePowerSourceCloseupSvg,
  composeWingsCloseupSvg,
  HARNESS_ART_POOL,
  LEFT_WING_POOL,
  pickHarnessArt,
  pickWingArt,
  RIGHT_WING_POOL,
} from "./craftComposer";
import type { CraftVisual } from "./craftComposer";

function baseCraftVisual(): CraftVisual {
  return {
    categories: {},
    decorations: [],
    wingArt: { left: "wing-left-1.png", right: "wing-right-1.png" },
  };
}

function craftVisualWithWings(): CraftVisual {
  return {
    ...baseCraftVisual(),
    categories: {
      wingMembrane: { archetype: "cardboard", templateId: "cardboard_scrap", color: { hue: 0, brilliance: 0.5 } },
      wingFlapper: { archetype: "glider", templateId: "broom_handle", color: { hue: 0, brilliance: 0.5 } },
    },
  };
}

describe("pickWingArt", () => {
  it("only picks entries that exist in the respective pool", () => {
    const leftFiles = new Set(LEFT_WING_POOL.map((entry) => entry.file));
    const rightFiles = new Set(RIGHT_WING_POOL.map((entry) => entry.file));
    for (let seed = 0; seed < 50; seed++) {
      const { left, right } = pickWingArt(seed * 0.091);
      expect(leftFiles.has(left.file)).toBe(true);
      expect(rightFiles.has(right.file)).toBe(true);
    }
  });

  it("is deterministic for the same seed", () => {
    const a = pickWingArt(0.4242);
    const b = pickWingArt(0.4242);
    expect(a).toEqual(b);
  });

  it("covers a range of pairings across many seeds (not always the same pair)", () => {
    const pairs = new Set<string>();
    for (let seed = 0; seed < 100; seed++) {
      const { left, right } = pickWingArt(seed * 0.083);
      pairs.add(`${left.file}-${right.file}`);
    }
    expect(pairs.size).toBeGreaterThan(1);
  });

  it("picks rank 1 more often than rank 10 over many trials (left side)", () => {
    const counts: Record<number, number> = {};
    const trials = 4000;
    for (let seed = 0; seed < trials; seed++) {
      const { left } = pickWingArt(seed * 0.01337);
      counts[left.rank] = (counts[left.rank] ?? 0) + 1;
    }
    expect(counts[1] ?? 0).toBeGreaterThan(counts[10] ?? 0);
  });

  it("lands rank 10's pick rate near ~5% for each side", () => {
    const trials = 20000;
    let leftRank10 = 0;
    let rightRank10 = 0;
    for (let seed = 0; seed < trials; seed++) {
      const { left, right } = pickWingArt(seed * 0.007919);
      if (left.rank === 10) leftRank10++;
      if (right.rank === 10) rightRank10++;
    }
    expect(leftRank10 / trials).toBeGreaterThan(0.02);
    expect(leftRank10 / trials).toBeLessThan(0.08);
    expect(rightRank10 / trials).toBeGreaterThan(0.02);
    expect(rightRank10 / trials).toBeLessThan(0.08);
  });
});

describe("pickHarnessArt", () => {
  it("only picks files that exist in HARNESS_ART_POOL", () => {
    const files = new Set(HARNESS_ART_POOL.map((entry) => entry.file));
    for (let seed = 0; seed < 50; seed++) {
      const picked = pickHarnessArt(seed * 0.091);
      expect(picked).toBeDefined();
      expect(files.has(picked!.file)).toBe(true);
    }
  });

  it("is deterministic for the same seed", () => {
    expect(pickHarnessArt(0.4242)).toEqual(pickHarnessArt(0.4242));
  });

  it("covers more than one file across many seeds", () => {
    const files = new Set<string>();
    for (let seed = 0; seed < 100; seed++) {
      files.add(pickHarnessArt(seed * 0.083)!.file);
    }
    expect(files.size).toBeGreaterThan(1);
  });
});

describe("composeCraftFragment", () => {
  it("does not render aeroHelper or attachment components", () => {
    const withAccents: CraftVisual = {
      ...baseCraftVisual(),
      categories: {
        aeroHelper: { archetype: "finStabilizer", templateId: "fan_blade", color: { hue: 0, brilliance: 0.5 } },
        attachment: { archetype: "zipTie", templateId: "zip_tie_pack", color: { hue: 0, brilliance: 0.5 } },
      },
    };
    const withoutAccents = baseCraftVisual();
    expect(composeCraftFragment(withAccents)).toBe(composeCraftFragment(withoutAccents));
  });

  it("falls back to the SVG accent shape for a powerSource templateId with no mapped art", () => {
    const craft: CraftVisual = {
      ...baseCraftVisual(),
      categories: {
        powerSource: { archetype: "rubberBandSling", templateId: "some_future_power_item", color: { hue: 0, brilliance: 0.5 } },
      },
    };
    const fragment = composeCraftFragment(craft);
    expect(fragment).toContain("<svg");
    expect(fragment).not.toContain("pieces/power-source/");
  });

  it("renders the mapped illustration for a known powerSource templateId", () => {
    const craft: CraftVisual = {
      ...baseCraftVisual(),
      categories: {
        powerSource: { archetype: "rubberBandSling", templateId: "rubber_band", color: { hue: 0, brilliance: 0.5 } },
      },
    };
    expect(composeCraftFragment(craft)).toContain("pieces/power-source/power-rubber-band.png");
  });

  it("renders a harness illustration whenever a harness component is present", () => {
    const craft: CraftVisual = {
      ...baseCraftVisual(),
      harnessArt: pickHarnessArt(0.5)!.file,
      categories: {
        harness: { archetype: "shoelaceLoop", templateId: "shoelace", color: { hue: 0, brilliance: 0.5 } },
      },
    };
    expect(composeCraftFragment(craft)).toContain("harness/");
  });
});

describe("composeCraftLeanSvg", () => {
  it("never renders harness or power source art, even when both are present", () => {
    const craft: CraftVisual = {
      ...baseCraftVisual(),
      harnessArt: pickHarnessArt(0.5)!.file,
      categories: {
        harness: { archetype: "shoelaceLoop", templateId: "shoelace", color: { hue: 0, brilliance: 0.5 } },
        powerSource: { archetype: "rubberBandSling", templateId: "rubber_band", color: { hue: 0, brilliance: 0.5 } },
      },
    };
    const svg = composeCraftLeanSvg(craft);
    expect(svg).not.toContain("harness/");
    expect(svg).not.toContain("pieces/power-source/");
  });

  it("still renders the wings and cat body", () => {
    const svg = composeCraftLeanSvg(craftVisualWithWings());
    expect(svg).toContain("wings/wing-left-1.png");
    expect(svg).toContain("wings/wing-right-1.png");
    expect(svg).toContain("pieces/cat-body-back.png");
  });
});

describe("close-up shots for the reveal sequence", () => {
  it("composeHarnessCloseupSvg is undefined without a harness component, defined with one", () => {
    expect(composeHarnessCloseupSvg(baseCraftVisual())).toBeUndefined();
    const withHarness: CraftVisual = {
      ...baseCraftVisual(),
      harnessArt: "harness-2.png",
      categories: { harness: { archetype: "shoelaceLoop", templateId: "shoelace", color: { hue: 0, brilliance: 0.5 } } },
    };
    expect(composeHarnessCloseupSvg(withHarness)).toContain("harness/harness-2.png");
  });

  it("composePowerSourceCloseupSvg is undefined without a powerSource component, defined with one", () => {
    expect(composePowerSourceCloseupSvg(baseCraftVisual())).toBeUndefined();
    const withPower: CraftVisual = {
      ...baseCraftVisual(),
      categories: { powerSource: { archetype: "rubberBandSling", templateId: "rubber_band", color: { hue: 0, brilliance: 0.5 } } },
    };
    expect(composePowerSourceCloseupSvg(withPower)).toContain("pieces/power-source/power-rubber-band.png");
  });

  it("composeWingsCloseupSvg always renders both wing images and nothing else", () => {
    const svg = composeWingsCloseupSvg(craftVisualWithWings());
    expect(svg).toContain("wings/wing-left-1.png");
    expect(svg).toContain("wings/wing-right-1.png");
    expect(svg).not.toContain("pieces/cat-body-back.png");
  });
});
