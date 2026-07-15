import type { RunContext } from "../engine/runContext";
import {
  canPlace,
  clearInstance,
  createEmptyOccupancy,
  markOccupied,
  rotateFootprint,
  type Occupancy,
} from "../systems/grid";
import {
  computeCountertopSize,
  computeEffectiveJunkDensity,
  computeGridSize,
  computeLuckBias,
  type MetaState,
} from "../systems/metaProgression";
import { applyRarityBonus, computeStatTally, generateCountertop, type CountertopItem } from "../systems/scavenge";
import type { Footprint } from "../types/core";
import type { ItemTemplate } from "../types/content";
import type { GridResult, PlacedGridItem } from "../types/grid";

interface HeldItem {
  instanceId: string;
  template: ItemTemplate;
  color: PlacedGridItem["color"];
  footprint: Footprint;
}

export function renderScavenge(
  root: HTMLElement,
  context: RunContext,
  meta: MetaState,
  onAdvance: (result: GridResult) => void
): void {
  const gridSize = computeGridSize(meta);
  const countertopSize = computeCountertopSize(meta);
  const effectiveJunkDensity = computeEffectiveJunkDensity(context.difficulty.junkDensity, meta);
  const luckBias = computeLuckBias(meta);

  let countertop: CountertopItem[] = generateCountertop(effectiveJunkDensity, countertopSize, luckBias);
  let rerollsRemaining = meta.rerollLevel;
  const decalPouch: string[] = [];
  const occupancy: Occupancy = createEmptyOccupancy(gridSize);
  const placedItems: PlacedGridItem[] = [];
  let held: HeldItem | null = null;
  let message: string | null = null;

  function draw(): void {
    const tally = computeStatTally(placedItems.map((p) => applyRarityBonus(p.template.baseStats, p.color)));
    const slotsPresent = new Set(placedItems.map((p) => p.template.slotType));

    const countertopHtml =
      countertop
        .map((item) => {
          const disabled = item.kind === "grid" && held ? "disabled" : "";
          const label =
            item.kind === "decal"
              ? `${item.template.name} (decal)`
              : `${item.template.name} [${(item.template as ItemTemplate).footprint.width}x${(item.template as ItemTemplate).footprint.height}]`;
          return `<button class="counter-item" data-instance="${item.instanceId}" ${disabled}>${label}</button>`;
        })
        .join("") || "<em>Countertop cleared.</em>";

    const gridHtml = Array.from({ length: gridSize }, (_, row) =>
      Array.from({ length: gridSize }, (_, col) => {
        const occupantId = occupancy[row]![col];
        const occupant = occupantId ? placedItems.find((p) => p.instanceId === occupantId) : undefined;
        const label = occupant ? `${occupant.template.name}, row ${row + 1} column ${col + 1}` : `Empty cell, row ${row + 1} column ${col + 1}`;
        return `<button type="button" class="cell${occupant ? " filled" : ""}" data-row="${row}" data-col="${col}" aria-label="${label}"></button>`;
      }).join("")
    ).join("");

    const heldHtml = held
      ? `<p>Holding: <strong>${held.template.name}</strong> (${held.footprint.width}x${held.footprint.height}) <button id="rotate-btn">Rotate</button> <button id="cancel-btn">Put back</button></p>`
      : `<p>Nothing held — click a countertop item to pick it up.</p>`;

    const rerollHtml = `<button id="reroll-btn" ${held || rerollsRemaining <= 0 ? "disabled" : ""}>Reroll Countertop (${rerollsRemaining} left)</button>`;

    root.innerHTML = `
      <div class="phase-shell">
        <p class="phase-label">Run ${context.runNumber} · Tier ${context.tier}</p>
        <h1>Phase 1: Scavenge &amp; Grid</h1>
        <p>Junk density this tier: ${(effectiveJunkDensity * 100).toFixed(0)}%</p>

        <h2>Countertop</h2>
        <div class="countertop">${countertopHtml}</div>
        ${meta.rerollLevel > 0 ? rerollHtml : ""}

        ${heldHtml}
        ${message ? `<p class="message">${message}</p>` : ""}

        <h2>Inventory Grid (${gridSize}&times;${gridSize})</h2>
        <div class="grid" style="grid-template-columns: repeat(${gridSize}, 1fr);">${gridHtml}</div>

        <h2>Stat Tally</h2>
        <p>Thrust ${tally.thrust.toFixed(1)} &middot; Weight ${tally.weight.toFixed(1)} &middot; Drag ${tally.drag.toFixed(1)} &middot; Durability ${tally.durability.toFixed(1)}</p>
        <p>Slots present: Frame ${slotsPresent.has("frame") ? "✓" : "—"} &middot; Skin ${slotsPresent.has("skin") ? "✓" : "—"} &middot; Engine ${slotsPresent.has("engine") ? "✓" : "—"} &middot; Decals collected: ${decalPouch.length}</p>

        <button id="advance-btn">Fill Grid → Workbench</button>
      </div>
    `;

    wireEvents();
  }

  function wireEvents(): void {
    root.querySelectorAll<HTMLButtonElement>(".counter-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const instanceId = btn.dataset.instance!;
        const idx = countertop.findIndex((item) => item.instanceId === instanceId);
        if (idx === -1) return;
        const item = countertop[idx]!;

        if (item.kind === "decal") {
          decalPouch.push(item.template.id);
          countertop.splice(idx, 1);
          message = null;
          draw();
          return;
        }

        if (held) return;
        countertop.splice(idx, 1);
        const template = item.template as ItemTemplate;
        held = { instanceId: item.instanceId, template, color: item.color!, footprint: { ...template.footprint } };
        message = null;
        draw();
      });
    });

    root.querySelector<HTMLButtonElement>("#rotate-btn")?.addEventListener("click", () => {
      if (!held) return;
      held.footprint = rotateFootprint(held.footprint);
      draw();
    });

    root.querySelector<HTMLButtonElement>("#cancel-btn")?.addEventListener("click", () => {
      if (!held) return;
      countertop.push({ instanceId: held.instanceId, kind: "grid", template: held.template, color: held.color });
      held = null;
      message = null;
      draw();
    });

    root.querySelector<HTMLButtonElement>("#reroll-btn")?.addEventListener("click", () => {
      if (held || rerollsRemaining <= 0) return;
      rerollsRemaining -= 1;
      countertop = generateCountertop(effectiveJunkDensity, countertopSize, luckBias);
      message = null;
      draw();
    });

    root.querySelectorAll<HTMLButtonElement>(".cell").forEach((cell) => {
      cell.addEventListener("click", () => {
        const row = Number(cell.dataset.row);
        const col = Number(cell.dataset.col);
        const occupantId = occupancy[row]![col];

        if (held) {
          if (occupantId) return;
          const origin = { row, col };
          if (!canPlace(occupancy, held.footprint, origin)) {
            message = "Doesn't fit there.";
            draw();
            return;
          }
          markOccupied(occupancy, held.footprint, origin, held.instanceId);
          placedItems.push({
            instanceId: held.instanceId,
            template: held.template,
            color: held.color,
            footprint: held.footprint,
            origin,
          });
          held = null;
          message = null;
          draw();
          return;
        }

        if (!occupantId) return;
        const placedIdx = placedItems.findIndex((p) => p.instanceId === occupantId);
        if (placedIdx === -1) return;
        const placed = placedItems[placedIdx]!;
        clearInstance(occupancy, placed.instanceId);
        placedItems.splice(placedIdx, 1);
        held = { instanceId: placed.instanceId, template: placed.template, color: placed.color, footprint: placed.footprint };
        message = null;
        draw();
      });
    });

    root.querySelector<HTMLButtonElement>("#advance-btn")!.addEventListener("click", () => {
      onAdvance({ placedItems: [...placedItems], decalIds: [...decalPouch] });
    });
  }

  draw();
}
