import { FUNCTIONAL_CATEGORIES } from "../types/core";
import type { FunctionalPieceCategory } from "../types/core";
import type { Blueprint } from "../types/content";

/** Each functional category's quota is rolled independently, uniform 1-5. */
export function generateBlueprint(): Blueprint {
  const requirements = {} as Record<FunctionalPieceCategory, number>;
  for (const category of FUNCTIONAL_CATEGORIES) {
    requirements[category] = 1 + Math.floor(Math.random() * 5);
  }
  return { requirements };
}
