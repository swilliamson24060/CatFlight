import { afterEach, describe, expect, it, vi } from "vitest";
import { evaluateFlight } from "./flightSim";

describe("evaluateFlight", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("always succeeds at 100% fulfillment (roll can never exceed it)", () => {
    for (let i = 0; i < 200; i++) {
      expect(evaluateFlight(1, true).success).toBe(true);
    }
  });

  it("succeeds when the roll lands at or below the fulfillment ratio", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    expect(evaluateFlight(0.6, true).success).toBe(true);
    expect(evaluateFlight(0.5, true).success).toBe(true);
  });

  it("fails when the roll lands above the fulfillment ratio", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    expect(evaluateFlight(0.49, true).success).toBe(false);
  });

  it("picks failure flavor/gatesCleared from the fulfillment band, not the roll", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    expect(evaluateFlight(0.2, true)).toMatchObject({ success: false, gatesCleared: 0, failedAt: "launch", landingMissReason: null });
    expect(evaluateFlight(0.5, true)).toMatchObject({ success: false, gatesCleared: 1, failedAt: "midflight", landingMissReason: null });
    expect(evaluateFlight(0.9, true)).toMatchObject({ success: false, gatesCleared: 2, failedAt: "landing", landingMissReason: "undershoot" });
  });

  it("a successful roll always reports all 3 gates cleared", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.1);
    expect(evaluateFlight(0.5, true)).toMatchObject({ success: true, gatesCleared: 3, failedAt: null, landingMissReason: null });
  });

  it("success rate roughly tracks the fulfillment ratio over many rolls", () => {
    const trials = 2000;
    for (const ratio of [0.2, 0.5, 0.8]) {
      let successes = 0;
      for (let i = 0; i < trials; i++) {
        if (evaluateFlight(ratio, true).success) successes++;
      }
      const rate = successes / trials;
      expect(rate).toBeGreaterThan(ratio - 0.07);
      expect(rate).toBeLessThan(ratio + 0.07);
    }
  });

  it("is an automatic fail when missing a whole category, even at 100% fulfillment and a lucky roll", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const outcome = evaluateFlight(1, false);
    expect(outcome).toMatchObject({ success: false, gatesCleared: 0, failedAt: "launch", missingCategory: true });
  });

  it("never reports missingCategory when every category has at least one piece", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    expect(evaluateFlight(0.2, true).missingCategory).toBe(false);
    expect(evaluateFlight(1, true).missingCategory).toBe(false);
  });
});
