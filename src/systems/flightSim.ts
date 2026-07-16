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
 * Success is a straight numerical check: roll a random number in [0, 1) and succeed if it's <=
 * the blueprint fulfillment ratio. A well-stocked build is more likely -- but, short of exactly
 * 100% fulfillment, never guaranteed -- to fly clean.
 *
 * On a failed roll, the flavor/animation (and gatesCleared, which scales the Scrap reward) still
 * follow the fulfillment level, so a near-miss still feels and pays out better than a wipeout.
 */
export function evaluateFlight(fulfillmentRatio: number): FlightOutcome {
  const roll = Math.random();
  if (roll <= fulfillmentRatio) {
    return { success: true, gatesCleared: 3, failedAt: null, landingMissReason: null, fulfillmentRatio };
  }
  if (fulfillmentRatio < 0.4) {
    return { success: false, gatesCleared: 0, failedAt: "launch", landingMissReason: null, fulfillmentRatio };
  }
  if (fulfillmentRatio < 0.7) {
    return { success: false, gatesCleared: 1, failedAt: "midflight", landingMissReason: null, fulfillmentRatio };
  }
  return { success: false, gatesCleared: 2, failedAt: "landing", landingMissReason: "undershoot", fulfillmentRatio };
}
