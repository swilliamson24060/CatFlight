const BASE_SCORE = 100;
const PENALTY_PER_EXTRA_TRIP = 15;
const MIN_SCORE = 10;

/** First-pass formula -- tunable alongside the blueprint balance pass. */
export function computeScore(tripCount: number): number {
  const extraTrips = Math.max(0, tripCount - 1);
  return Math.max(MIN_SCORE, BASE_SCORE - extraTrips * PENALTY_PER_EXTRA_TRIP);
}
