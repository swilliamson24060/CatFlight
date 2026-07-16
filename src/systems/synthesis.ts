import { applyRarityBonus, computeStatTally } from "./scavenge";
import { computeScore } from "./scoring";
import { craftSeedString } from "./craftCode";
import { ALL_CATEGORIES, FUNCTIONAL_CATEGORIES } from "../types/core";
import type { FunctionalPieceCategory, PieceCategory, Stats } from "../types/core";
import type { CraftCategoryResult, CraftComponent, CraftRecord } from "../types/craft";
import type { PlacedGridItem } from "../types/grid";

export type CategoryCandidates = Record<PieceCategory, PlacedGridItem[]>;
export type CategorySelections = Partial<Record<PieceCategory, PlacedGridItem[]>>;

const DECORATION_SCORE_BONUS = 10;
const FLY_BETTER_SCORE_BONUS = 25;

/** A dual-category piece appears in both of its categories' candidate arrays. */
export function groupCandidatesByCategory(placedItems: PlacedGridItem[]): CategoryCandidates {
  const groups = Object.fromEntries(ALL_CATEGORIES.map((c) => [c, [] as PlacedGridItem[]])) as CategoryCandidates;
  for (const item of placedItems) {
    for (const category of item.template.categories) {
      groups[category].push(item);
    }
  }
  return groups;
}

export function resolveComponent(item: PlacedGridItem): CraftComponent {
  return {
    archetype: item.template.archetype!,
    templateId: item.template.id,
    color: item.color,
    stats: applyRarityBonus(item.template.baseStats, item.color),
    flyBetter: item.template.flyBetter,
  };
}

/** Picks the strongest component to represent a multi-piece category visually; stats already sum regardless. */
export function chooseHero(components: CraftComponent[]): CraftComponent | undefined {
  const impact = (c: CraftComponent) => c.stats.thrust + c.stats.durability - c.stats.weight - c.stats.drag;
  return components.reduce<CraftComponent | undefined>(
    (best, c) => (!best || impact(c) > impact(best) ? c : best),
    undefined
  );
}

export function computeFulfillmentRatio(
  selections: CategorySelections,
  requirements: Record<FunctionalPieceCategory, number>
): number {
  const ratios = FUNCTIONAL_CATEGORIES.map((category) => {
    const have = selections[category]?.length ?? 0;
    const need = requirements[category];
    return Math.min(have / need, 1);
  });
  return ratios.reduce((sum, r) => sum + r, 0) / ratios.length;
}

export function assembleCraft(
  selections: CategorySelections,
  requirements: Record<FunctionalPieceCategory, number>,
  tripCount: number,
  yieldBoost = 0
): CraftRecord {
  const categories = {} as Record<PieceCategory, CraftCategoryResult>;
  const categoryStats: Stats[] = [];

  for (const category of ALL_CATEGORIES) {
    const items = selections[category] ?? [];
    const components = items.map(resolveComponent);
    const stats = computeStatTally(components.map((c) => c.stats));
    const hero = chooseHero(components);
    categories[category] = { components, stats, hero };
    categoryStats.push(stats);
  }

  const decorations = selections.decoration ?? [];
  const decorationBonus = decorations.reduce(
    (sum, item) => sum + (item.template.flyBetter ? FLY_BETTER_SCORE_BONUS : DECORATION_SCORE_BONUS),
    0
  );

  const totalStats = computeStatTally(categoryStats);
  const boostedStats: Stats = {
    ...totalStats,
    thrust: totalStats.thrust * (1 + yieldBoost),
    durability: totalStats.durability * (1 + yieldBoost),
  };

  const craft: CraftRecord = {
    categories,
    stats: boostedStats,
    score: computeScore(tripCount) + decorationBonus,
    fulfillmentRatio: computeFulfillmentRatio(selections, requirements),
    visualSeed: Math.random(),
  };
  craft.seedString = craftSeedString(craft);
  return craft;
}

/** Everything carried but not selected into the assembled craft -- unused duplicates, the losing
 * side of a dual-category pick, unpicked decorations, and revealed junk. */
export function identifyExcessPieces(placedItems: PlacedGridItem[], selections: CategorySelections): PlacedGridItem[] {
  const usedIds = new Set<string>();
  for (const items of Object.values(selections)) {
    for (const item of items ?? []) usedIds.add(item.instanceId);
  }
  return placedItems.filter((item) => !usedIds.has(item.instanceId));
}
