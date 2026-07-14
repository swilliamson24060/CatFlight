import type { RunContext } from "../engine/runContext";
import { composeCraftSvg } from "../render/craftComposer";
import { computeStatTally } from "../systems/scavenge";
import { assembleCraft, groupCandidatesBySlot, resolveComponent } from "../systems/synthesis";
import type { SlotType } from "../types/core";
import type { CraftRecord } from "../types/craft";
import type { PlacedGridItem } from "../types/grid";

const SLOT_LABELS: Record<SlotType, string> = {
  frame: "Frame",
  skin: "Skin",
  engine: "Engine",
};

const SLOTS: SlotType[] = ["frame", "skin", "engine"];

export function renderSynthesis(
  root: HTMLElement,
  context: RunContext,
  onAdvance: (craft: CraftRecord) => void,
  onBack: () => void
): void {
  const placedItems = context.lastGridResult?.placedItems ?? [];
  const decalIds = context.lastGridResult?.decalIds ?? [];
  const candidates = groupCandidatesBySlot(placedItems);
  const isStuck = SLOTS.some((slot) => candidates[slot].length === 0);

  const selected: Partial<Record<SlotType, string>> = {};
  for (const slot of SLOTS) {
    if (candidates[slot].length === 1) selected[slot] = candidates[slot][0]!.instanceId;
  }

  function getSelectedItem(slot: SlotType): PlacedGridItem | undefined {
    const id = selected[slot];
    return id ? candidates[slot].find((item) => item.instanceId === id) : undefined;
  }

  function draw(): void {
    const binHtml = SLOTS.map((slot) => {
      const options = candidates[slot];
      if (options.length === 0) {
        return `<div class="bin"><h3>${SLOT_LABELS[slot]}</h3><p class="message">None found this run.</p></div>`;
      }
      const buttons = options
        .map(
          (item) =>
            `<button class="bin-option${selected[slot] === item.instanceId ? " selected" : ""}" data-slot="${slot}" data-instance="${item.instanceId}">${item.template.name}</button>`
        )
        .join("");
      return `<div class="bin"><h3>${SLOT_LABELS[slot]}</h3>${buttons}</div>`;
    }).join("");

    const frameItem = getSelectedItem("frame");
    const skinItem = getSelectedItem("skin");
    const engineItem = getSelectedItem("engine");
    const ready = Boolean(frameItem && skinItem && engineItem);

    let previewHtml = `<p><em>Select one item per bin to preview the craft.</em></p>`;
    if (frameItem && skinItem && engineItem) {
      const frameComp = resolveComponent(frameItem);
      const skinComp = resolveComponent(skinItem);
      const engineComp = resolveComponent(engineItem);
      const totals = computeStatTally([frameComp.stats, skinComp.stats, engineComp.stats]);
      const svg = composeCraftSvg({
        frame: frameComp,
        skin: skinComp,
        engine: engineComp,
        decalId: decalIds[0] ?? null,
      });
      previewHtml = `
        <div class="craft-preview">${svg}</div>
        <p>Projected stats: Thrust ${totals.thrust.toFixed(1)} &middot; Weight ${totals.weight.toFixed(1)} &middot; Drag ${totals.drag.toFixed(1)} &middot; Durability ${totals.durability.toFixed(1)}</p>
      `;
    }

    const decalNote =
      decalIds.length > 1 ? `<p>Carrying ${decalIds.length} decals (first one shown; extras kept for later).</p>` : "";

    const backHtml = isStuck
      ? `<p class="message">Missing a component type — you can't assemble a craft from this haul.</p>
         <button id="back-btn">Return to Scavenge</button>`
      : "";

    root.innerHTML = `
      <div class="phase-shell">
        <p class="phase-label">Run ${context.runNumber} · Tier ${context.tier}</p>
        <h1>Phase 2: Alchemist's Kitchen (Synthesis)</h1>
        <div class="bins">${binHtml}</div>
        ${previewHtml}
        ${decalNote}
        ${backHtml}
        <button id="advance-btn" ${ready ? "" : "disabled"}>Assemble Craft → Flight Sim</button>
      </div>
    `;

    wireEvents();
  }

  function wireEvents(): void {
    root.querySelectorAll<HTMLButtonElement>(".bin-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        const slot = btn.dataset.slot as SlotType;
        const instanceId = btn.dataset.instance!;
        selected[slot] = instanceId;
        draw();
      });
    });

    root.querySelector<HTMLButtonElement>("#advance-btn")!.addEventListener("click", () => {
      const frameItem = getSelectedItem("frame");
      const skinItem = getSelectedItem("skin");
      const engineItem = getSelectedItem("engine");
      if (!frameItem || !skinItem || !engineItem) return;
      onAdvance(assembleCraft(frameItem, skinItem, engineItem, decalIds[0] ?? null));
    });

    root.querySelector<HTMLButtonElement>("#back-btn")?.addEventListener("click", () => {
      onBack();
    });
  }

  draw();
}
