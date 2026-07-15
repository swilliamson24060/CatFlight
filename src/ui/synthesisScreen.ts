import { playAssemble } from "../audio/sfx";
import type { RunContext } from "../engine/runContext";
import { CATEGORY_LABELS } from "../render/categoryColors";
import { composeCraftSvg } from "../render/craftComposer";
import { computeBlueprintEase, computeYieldBoost, type MetaState } from "../systems/metaProgression";
import {
  assembleCraft,
  chooseHero,
  groupCandidatesByCategory,
  identifyExcessPieces,
  resolveComponent,
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
  onAdvance: (craft: CraftRecord, excessPieces: PlacedGridItem[]) => void,
  onBack: () => void
): void {
  const placedItems = context.lastGridResult?.placedItems ?? [];
  const candidates = groupCandidatesByCategory(placedItems);
  const ease = computeBlueprintEase(meta);
  const yieldBoost = computeYieldBoost(meta);

  function effectiveRequirement(category: FunctionalPieceCategory): number {
    return Math.max(1, context.blueprint.requirements[category] - ease);
  }

  const isStuck = FUNCTIONAL_CATEGORIES.some((cat) => candidates[cat].length === 0);

  const selected: Partial<Record<PieceCategory, string[]>> = {};

  function quotaFor(category: PieceCategory): number | null {
    return category === "decoration" ? null : effectiveRequirement(category as FunctionalPieceCategory);
  }

  function isClaimedElsewhere(item: PlacedGridItem, category: PieceCategory): boolean {
    return item.template.categories.some(
      (other) => other !== category && (selected[other] ?? []).includes(item.instanceId)
    );
  }

  function getSelections(): CategorySelections {
    const result: CategorySelections = {};
    for (const category of ALL_CATEGORIES) {
      const ids = selected[category] ?? [];
      result[category] = ids
        .map((id) => candidates[category].find((item) => item.instanceId === id))
        .filter((item): item is PlacedGridItem => Boolean(item));
    }
    return result;
  }

  function isReady(): boolean {
    return FUNCTIONAL_CATEGORIES.every((cat) => (selected[cat]?.length ?? 0) === effectiveRequirement(cat));
  }

  function draw(): void {
    const binHtml = ALL_CATEGORIES.map((category) => {
      const items = candidates[category];
      const quota = quotaFor(category);
      const selectedIds = selected[category] ?? [];

      if (items.length === 0) {
        return `<div class="bin"><h3>${CATEGORY_LABELS[category]}</h3><p class="message">None found this run.</p></div>`;
      }

      const atQuota = quota !== null && selectedIds.length >= quota;
      const buttons = items
        .map((item) => {
          const isSelected = selectedIds.includes(item.instanceId);
          const claimed = !isSelected && isClaimedElsewhere(item, category);
          const disabled = claimed || (!isSelected && atQuota);
          const suffix = claimed ? " (claimed elsewhere)" : "";
          return `<button class="bin-option${isSelected ? " selected" : ""}" data-category="${category}" data-instance="${item.instanceId}" ${disabled ? "disabled" : ""}>${item.template.name}${suffix}</button>`;
        })
        .join("");
      const quotaLabel = quota !== null ? ` (${selectedIds.length}/${quota})` : ` (${selectedIds.length} selected)`;
      return `<div class="bin"><h3>${CATEGORY_LABELS[category]}${quotaLabel}</h3>${buttons}</div>`;
    }).join("");

    const selections = getSelections();
    const previewCategories: Record<string, { archetype: string; color: PlacedGridItem["color"] }> = {};
    let hasAnyFunctional = false;
    for (const category of FUNCTIONAL_CATEGORIES) {
      const items = selections[category] ?? [];
      if (items.length === 0) continue;
      const hero = chooseHero(items.map(resolveComponent));
      if (hero) {
        previewCategories[category] = { archetype: hero.archetype, color: hero.color };
        hasAnyFunctional = true;
      }
    }
    const decorations = selections.decoration ?? [];

    let previewHtml = `<p><em>Select pieces to fill each category and preview the craft.</em></p>`;
    if (hasAnyFunctional) {
      const svg = composeCraftSvg({
        categories: previewCategories,
        decorationCount: decorations.length,
        decorationFlyBetter: decorations.some((item) => item.template.flyBetter),
      });
      previewHtml = `<div class="craft-preview">${svg}</div>`;
    }

    const anyShort = FUNCTIONAL_CATEGORIES.some((cat) => candidates[cat].length < effectiveRequirement(cat));
    const backHtml = anyShort
      ? `<p class="message">${
          isStuck
            ? "Missing a component type — you can't assemble a craft from this haul."
            : "Not quite enough of something yet."
        }</p>
         <button id="back-btn">Return to Kitchen</button>`
      : "";

    root.innerHTML = `
      <div class="phase-shell">
        <p class="phase-label">Run ${context.runNumber} · Tier ${context.tier} · Trip ${context.tripCount + 1}</p>
        <h1>Phase 2: Doc's Workbench</h1>
        <div class="bins">${binHtml}</div>
        ${previewHtml}
        ${backHtml}
        <button id="advance-btn" ${isReady() ? "" : "disabled"}>Assemble Craft → Flight Sim</button>
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
        const idx = current.indexOf(instanceId);
        if (idx >= 0) {
          current.splice(idx, 1);
        } else {
          current.push(instanceId);
        }
        selected[category] = current;
        draw();
      });
    });

    root.querySelector<HTMLButtonElement>("#advance-btn")!.addEventListener("click", () => {
      if (!isReady()) return;
      const selections = getSelections();
      const craft = assembleCraft(selections, context.tripCount + 1, yieldBoost);
      const excessPieces = identifyExcessPieces(placedItems, selections);
      playAssemble();
      onAdvance(craft, excessPieces);
    });

    root.querySelector<HTMLButtonElement>("#back-btn")?.addEventListener("click", () => {
      onBack();
    });
  }

  draw();
}
