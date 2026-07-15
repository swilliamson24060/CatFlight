import { describe, expect, it } from "vitest";
import { decodeCraftCode, encodeCraft, type EncodableCraft } from "./craftCode";

function roundTrip(craft: EncodableCraft) {
  const code = encodeCraft(craft);
  return { code, decoded: decodeCraftCode(code) };
}

describe("craftCode round-trip", () => {
  it("preserves archetype and approximates hue/brilliance for every component", () => {
    const craft: EncodableCraft = {
      frame: { archetype: "glider", color: { hue: 0, brilliance: 0 } },
      skin: { archetype: "cardboard", color: { hue: 359.9, brilliance: 1 } },
      engine: { archetype: "hairdryer", color: { hue: 180, brilliance: 0.5 } },
      decalId: null,
    };
    const { decoded } = roundTrip(craft);

    expect(decoded.frame.archetype).toBe("glider");
    expect(decoded.skin.archetype).toBe("cardboard");
    expect(decoded.engine.archetype).toBe("hairdryer");
    expect(decoded.frame.color.hue).toBeCloseTo(0, 0);
    expect(decoded.skin.color.hue).toBeCloseTo(359.9, 0);
    expect(decoded.engine.color.brilliance).toBeCloseTo(0.5, 2);
    expect(decoded.decalId).toBeNull();
  });

  it("preserves a decal id", () => {
    const craft: EncodableCraft = {
      frame: { archetype: "rotorChute", color: { hue: 48, brilliance: 0.999 } },
      skin: { archetype: "bakingSheetMetal", color: { hue: 12.3, brilliance: 0.845 } },
      engine: { archetype: "mentosCore", color: { hue: 300, brilliance: 0.2 } },
      decalId: "holo_paw",
    };
    const { decoded } = roundTrip(craft);
    expect(decoded.decalId).toBe("holo_paw");
  });

  it("produces a short, url-safe base36 code", () => {
    const craft: EncodableCraft = {
      frame: { archetype: "rocketRig", color: { hue: 0, brilliance: 0 } },
      skin: { archetype: "aluminumFoil", color: { hue: 0, brilliance: 0 } },
      engine: { archetype: "rubberBandSling", color: { hue: 0, brilliance: 0 } },
      decalId: "comet",
    };
    const code = encodeCraft(craft);
    expect(code.length).toBeLessThanOrEqual(13);
    expect(/^[0-9a-z]+$/.test(code)).toBe(true);
  });
});
