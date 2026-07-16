import { playAssemble } from "../audio/sfx";
import type { RunContext } from "../engine/runContext";
import { CATEGORY_LABELS } from "../render/categoryColors";
import { composeWorkshopBackground } from "../render/kitchenShapes";
import { computeBlueprintEase, computeYieldBoost, type MetaState } from "../systems/metaProgression";
import {
  assembleCraft,
  computeFulfillmentRatio,
  groupCandidatesByCategory,
  identifyExcessPieces,
  type CategorySelections,
} from "../systems/synthesis";
import { ALL_CATEGORIES, FUNCTIONAL_CATEGORIES } from "../types/core";
import type { FunctionalPieceCategory, PieceCategory } from "../types/core";
import type { CraftRecord } from "../types/craft";
import type { PlacedGridItem } from "../types/grid";

export function renderSynthesis(
  root: HTMLElement,
  context: RunContext,
  meta: MetaState,
  onAdvance: (craft: CraftRecord, excessPieces: PlacedGridItem[], committed: CategorySelections) => void,
  onReturnToKitchen: (committed: CategorySelections) => void
): void {
  // This trip's fresh haul only -- the grid starts blank every trip, so anything committed on a
  // prior visit lives in context.committedComponents instead, not here.
  const placedItems = context.lastGridResult?.placedItems ?? [];
  const candidates = groupCandidatesByCategory(placedItems);
  const committed: CategorySelections = context.committedComponents ?? {};
  const ease = computeBlueprintEase(meta);
  const yieldBoost = computeYieldBoost(meta);

  function effectiveRequirement(category: FunctionalPieceCategory): number {
    return Math.max(1, context.blueprint.requirements[category] - ease);
  }

  const effectiveRequirements = Object.fromEntries(
    FUNCTIONAL_CATEGORIES.map((cat) => [cat, effectiveRequirement(cat)])
  ) as Record<FunctionalPieceCategory, number>;

  /** This session's newly toggled picks, not yet folded into context.committedComponents. */
  const selected: CategorySelections = {};

  function quotaFor(category: PieceCategory): number | null {
    return category === "decoration" ? null : effectiveRequirement(category as FunctionalPieceCategory);
  }

  function isClaimedElsewhere(item: PlacedGridItem, category: PieceCategory): boolean {
    return item.template.categories.some(
      (other) => other !== category && (selected[other] ?? []).some((s) => s.instanceId === item.instanceId)
    );
  }

  /** Everything committed to a category so far, across all trips, plus this session's new picks. */
  function mergedSelections(): CategorySelections {
    const result: CategorySelections = {};
    for (const category of ALL_CATEGORIES) {
      result[category] = [...(committed[category] ?? []), ...(selected[category] ?? [])];
    }
    return result;
  }

  function draw(): void {
    const binHtml = ALL_CATEGORIES.map((category) => {
      const committedItems = committed[category] ?? [];
      const items = candidates[category];
      const quota = quotaFor(category);
      const selectedItems = selected[category] ?? [];
      const totalCount = committedItems.length + selectedItems.length;

      const committedHtml = committedItems
        .map((item) => `<div class="committed-pill">${item.template.name} <span class="lock-badge">&#128274;</span></div>`)
        .join("");

      const atQuota = quota !== null && totalCount >= quota;
      const candidateHtml = items
        .map((item) => {
          const isSelected = selectedItems.some((s) => s.instanceId === item.instanceId);
          const claimed = !isSelected && isClaimedElsewhere(item, category);
          const disabled = claimed || (!isSelected && atQuota);
          const suffix = claimed ? " (claimed elsewhere)" : "";
          return `<button class="bin-option${isSelected ? " selected" : ""}" data-category="${category}" data-instance="${item.instanceId}" ${disabled ? "disabled" : ""}>${item.template.name}${suffix}</button>`;
        })
        .join("");

      const emptyHtml =
        committedItems.length === 0 && items.length === 0 ? `<p class="message">None found this run.</p>` : "";

      const quotaLabel = quota !== null ? ` (${totalCount}/${quota})` : ` (${totalCount} selected)`;
      return `<div class="bin"><h3>${CATEGORY_LABELS[category]}${quotaLabel}</h3>${committedHtml}${candidateHtml}${emptyHtml}</div>`;
    }).join("");

    const merged = mergedSelections();
    const fulfillmentPct = Math.round(computeFulfillmentRatio(merged, effectiveRequirements) * 100);
    const fulfillmentHtml = `<p>Blueprint fulfillment: ${fulfillmentPct}% — the closer to 100%, the better your flight odds.</p>`;

    const emptyCategories = FUNCTIONAL_CATEGORIES.filter((category) => (merged[category]?.length ?? 0) === 0);
    const missingWarningHtml =
      emptyCategories.length > 0
        ? `<p class="message">Missing entirely: ${emptyCategories.map((category) => CATEGORY_LABELS[category]).join(", ")} — every category needs at least 1 piece, or the flight is an automatic fail no matter what else you've got.</p>`
        : "";

    root.innerHTML = `
      <div class="phase-shell">
        <div class="workbench-hero">${composeWorkshopBackground()}</div>
        <p class="phase-label">Run ${context.runNumber} · Tier ${context.tier} · Trip ${context.tripCount + 1}</p>
        <h1>Phase 2: Doc's Workbench</h1>
        <div class="bins">${binHtml}</div>
        ${fulfillmentHtml}
        ${missingWarningHtml}
        <button id="advance-btn">Assemble Craft → Flight Sim</button>
        <button id="return-to-kitchen-btn" class="secondary-btn">Not close yet? Return to Kitchen</button>
      </div>
    `;

    wireEvents();
  }

  function wireEvents(): void {
    root.querySelectorAll<HTMLButtonElement>(".bin-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        const category = btn.dataset.category as PieceCategory;
        const instanceId = btn.dataset.instance!;
        const current = selected[category] ?? [];
        const idx = current.findIndex((item) => item.instanceId === instanceId);
        if (idx >= 0) {
          current.splice(idx, 1);
        } else {
          const item = candidates[category].find((candidate) => candidate.instanceId === instanceId);
          if (item) current.push(item);
        }
        selected[category] = current;
        draw();
      });
    });

    root.querySelector<HTMLButtonElement>("#advance-btn")!.addEventListener("click", () => {
      const merged = mergedSelections();
      const craft = assembleCraft(merged, effectiveRequirements, context.tripCount + 1, yieldBoost);
      const excessPieces = identifyExcessPieces(placedItems, merged);
      playAssemble();
      onAdvance(craft, excessPieces, merged);
    });

    root.querySelector<HTMLButtonElement>("#return-to-kitchen-btn")!.addEventListener("click", () => {
      onReturnToKitchen(mergedSelections());
    });
  }

  draw();
}
