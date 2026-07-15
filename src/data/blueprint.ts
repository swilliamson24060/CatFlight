import type { Blueprint } from "../types/content";

/**
 * First-pass quotas -- flagged for a simulation-based balance pass (mirrors difficulty.ts's
 * documented calibration) once the kitchen/Doc's Workbench mechanics are playable end-to-end.
 */
export function generateBlueprint(tier: number): Blueprint {
  return {
    tier,
    requirements: {
      wingMembrane: 1 + Math.floor(tier / 4),
      powerSource: 1,
      wingFlapper: 1 + Math.floor(tier / 5),
      aeroHelper: 1,
      attachment: 1,
      harness: 1,
    },
  };
}
