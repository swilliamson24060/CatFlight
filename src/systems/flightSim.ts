export type FlightGate = "launch" | "midflight" | "landing";
export type LandingMissReason = "overshoot" | "undershoot";

export interface FlightOutcome {
  success: boolean;
  gatesCleared: number;
  failedAt: FlightGate | null;
  landingMissReason: LandingMissReason | null;
  fulfillmentRatio: number;
  /** True when the craft was missing at least one functional category outright -- an automatic
   * fail, no roll involved, regardless of overall fulfillment. Decoration doesn't count. */
  missingCategory: boolean;
}

/**
 * Success requires at least 1 piece in every functional category (Decoration is bonus-only and
 * never required) -- with no exceptions, that's an automatic fail no matter how high the overall
 * fulfillment is. Once that bar is cleared, success is a straight numerical check: roll a random
 * number in [0, 1) and succeed if it's <= the blueprint fulfillment ratio. A well-stocked build is
 * more likely -- but, short of exactly 100% fulfillment, never guaranteed -- to fly clean.
 *
 * On a failed roll, the flavor/animation (and gatesCleared, which scales the Scrap reward) still
 * follow the fulfillment level, so a near-miss still feels and pays out better than a wipeout.
 */
export function evaluateFlight(fulfillmentRatio: number, hasAllCategories: boolean): FlightOutcome {
  if (!hasAllCategories) {
    return {
      success: false,
      gatesCleared: 0,
      failedAt: "launch",
      landingMissReason: null,
      fulfillmentRatio,
      missingCategory: true,
    };
  }
  const roll = Math.random();
  if (roll <= fulfillmentRatio) {
    return { success: true, gatesCleared: 3, failedAt: null, landingMissReason: null, fulfillmentRatio, missingCategory: false };
  }
  if (fulfillmentRatio < 0.4) {
    return { success: false, gatesCleared: 0, failedAt: "launch", landingMissReason: null, fulfillmentRatio, missingCategory: false };
  }
  if (fulfillmentRatio < 0.7) {
    return { success: false, gatesCleared: 1, failedAt: "midflight", landingMissReason: null, fulfillmentRatio, missingCategory: false };
  }
  return {
    success: false,
    gatesCleared: 2,
    failedAt: "landing",
    landingMissReason: "undershoot",
    fulfillmentRatio,
    missingCategory: false,
  };
}
