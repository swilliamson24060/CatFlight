export type FlightGate = "launch" | "midflight" | "landing";
export type LandingMissReason = "overshoot" | "undershoot";

export interface FlightOutcome {
  success: boolean;
  gatesCleared: number;
  failedAt: FlightGate | null;
  landingMissReason: LandingMissReason | null;
  fulfillmentRatio: number;
}

/**
 * First-pass thresholds -- flagged for a balance pass, same spirit as the original stat-based
 * curve. Success now depends on how close the assembled craft came to the blueprint, not raw stats.
 */
export function evaluateFlight(fulfillmentRatio: number): FlightOutcome {
  if (fulfillmentRatio < 0.4) {
    return { success: false, gatesCleared: 0, failedAt: "launch", landingMissReason: null, fulfillmentRatio };
  }
  if (fulfillmentRatio < 0.7) {
    return { success: false, gatesCleared: 1, failedAt: "midflight", landingMissReason: null, fulfillmentRatio };
  }
  if (fulfillmentRatio < 1) {
    return { success: false, gatesCleared: 2, failedAt: "landing", landingMissReason: "undershoot", fulfillmentRatio };
  }
  return { success: true, gatesCleared: 3, failedAt: null, landingMissReason: null, fulfillmentRatio };
}
