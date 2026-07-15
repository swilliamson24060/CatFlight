import { describe, expect, it } from "vitest";
import { evaluateFlight } from "./flightSim";

describe("evaluateFlight", () => {
  it("fails at launch when fulfillment is below 40%", () => {
    const outcome = evaluateFlight(0.2);
    expect(outcome).toMatchObject({ success: false, gatesCleared: 0, failedAt: "launch", landingMissReason: null });
  });

  it("fails at midflight between 40% and 70% fulfillment", () => {
    const outcome = evaluateFlight(0.5);
    expect(outcome).toMatchObject({ success: false, gatesCleared: 1, failedAt: "midflight", landingMissReason: null });
  });

  it("misses landing (undershoot) between 70% and 100% fulfillment", () => {
    const outcome = evaluateFlight(0.9);
    expect(outcome).toMatchObject({ success: false, gatesCleared: 2, failedAt: "landing", landingMissReason: "undershoot" });
  });

  it("succeeds at full (100%) fulfillment", () => {
    const outcome = evaluateFlight(1);
    expect(outcome).toMatchObject({ success: true, gatesCleared: 3, failedAt: null, landingMissReason: null });
  });

  it("treats each threshold boundary as inclusive of the better band", () => {
    expect(evaluateFlight(0.4).failedAt).toBe("midflight");
    expect(evaluateFlight(0.7).failedAt).toBe("landing");
  });
});
