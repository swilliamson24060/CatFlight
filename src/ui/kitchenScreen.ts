import type { RunContext } from "../engine/runContext";
import { CATEGORY_LABELS } from "../render/categoryColors";
import { ITEM_GLYPHS } from "../render/itemGlyphs";
import { composeKitchenBackground } from "../render/kitchenShapes";
import {
  canPlace,
  clearInstance,
  createEmptyOccupancy,
  markOccupied,
  rotateFootprint,
  type Occupancy,
} from "../systems/grid";
import { generateKitchenLayout, type ActiveKitchenSource, type KitchenPiece } from "../systems/kitchen";
import { applyRarityBonus, computeStatTally } from "../systems/scavenge";
import {
  computeEffectiveJunkDensity,
  computeGridSize,
  computeLuckBias,
  type MetaState,
} from "../systems/metaProgression";
import { FUNCTIONAL_CATEGORIES } from "../types/core";
import type { Footprint } from "../types/core";
import type { PieceTemplate } from "../types/content";
import type { GridResult, PlacedGridItem } from "../types/grid";

interface HeldItem {
  instanceId: string;
  template: PieceTemplate;
  color: PlacedGridItem["color"];
  footprint: Footprint;
}

export function renderKitchen(
  root: HTMLElement,
  context: RunContext,
  meta: MetaState,
  onAdvance: (result: GridResult) => void
): void {
  const gridSize = computeGridSize(meta);
  const effectiveJunkDensity = computeEffectiveJunkDensity(context.difficulty.junkDensity, meta);
  const luckBias = computeLuckBias(meta);

  const layout: ActiveKitchenSource[] = generateKitchenLayout(effectiveJunkDensity, luckBias);
  const pendingReveals = new Map<string, KitchenPiece[]>();
  for (const active of layout) pendingReveals.set(active.source.id, [...active.reveals]);
  const searchedSourceIds = new Set<string>();

  const pendingTray: KitchenPiece[] = [];
  const occupancy: Occupancy = createEmptyOccupancy(gridSize);
  const placedItems: PlacedGridItem[] = [];
  for (const prior of context.lastGridResult?.placedItems ?? []) {
    markOccupied(occupancy, prior.footprint, prior.origin, prior.instanceId);
    placedItems.push(prior);
  }

  let held: HeldItem | null = null;
  let openSourceId: string | null = null;
  let message: string | null = null;

  function draw(): void {
    const tally = computeStatTally(placedItems.map((p) => applyRarityBonus(p.template.baseStats, p.color)));

    const blueprintHtml = FUNCTIONAL_CATEGORIES.map(
      (cat) => `${CATEGORY_LABELS[cat]} &times;${context.blueprint.requirements[cat]}`
    ).join(" &middot; ");

    const hotspotsHtml = layout
      .map((active) => {
        const { source } = active;
        const searched = searchedSourceIds.has(source.id);
        const label = searched ? `${source.name} (searched)` : source.name;
        return `<button type="button" class="kitchen-hotspot${searched ? " searched" : ""}" data-source="${source.id}" style="left:${source.hotspot.x}%; top:${source.hotspot.y}%; width:${source.hotspot.width}%; height:${source.hotspot.height}%;" aria-label="${label}">${source.name}</button>`;
      })
      .join("");

    const openSource = openSourceId ? layout.find((a) => a.source.id === openSourceId) : undefined;
    const revealPanelHtml = openSource
      ? (() => {
          const remaining = pendingReveals.get(openSource.source.id) ?? [];
          const itemsHtml =
            remaining.length > 0
              ? remaining
                  .map((piece) => {
                    const glyph = ITEM_GLYPHS[piece.template.id] ?? "";
                    return `
                      <div class="reveal-item">
                        <span>${glyph} ${piece.template.name} [${piece.template.footprint.width}x${piece.template.footprint.height}]</span>
                        <button type="button" class="keep-btn" data-instance="${piece.instanceId}">Keep</button>
                        <button type="button" class="discard-btn" data-instance="${piece.instanceId}">Discard</button>
                      </div>
                    `;
                  })
                  .join("")
              : "<p><em>Nothing left to search here.</em></p>";
          return `
            <div class="reveal-panel">
              <h3>${openSource.source.name}</h3>
              ${itemsHtml}
              <button type="button" id="close-reveal-btn">Close</button>
            </div>
          `;
        })()
      : "";

    const trayHtml =
      pendingTray.length > 0
        ? pendingTray
            .map((piece) => {
              const glyph = ITEM_GLYPHS[piece.template.id] ?? "";
              const disabled = held ? "disabled" : "";
              return `<button type="button" class="tray-item" data-instance="${piece.instanceId}" ${disabled}>${glyph} ${piece.template.name} [${piece.template.footprint.width}x${piece.template.footprint.height}]</button>`;
            })
            .join("")
        : "<em>Tray empty.</em>";

    const gridHtml = Array.from({ length: gridSize }, (_, row) =>
      Array.from({ length: gridSize }, (_, col) => {
        const occupantId = occupancy[row]![col];
        const occupant = occupantId ? placedItems.find((p) => p.instanceId === occupantId) : undefined;
        const label = occupant
          ? `${occupant.template.name}, row ${row + 1} column ${col + 1}`
          : `Empty cell, row ${row + 1} column ${col + 1}`;
        return `<button type="button" class="cell${occupant ? " filled" : ""}" data-row="${row}" data-col="${col}" aria-label="${label}"></button>`;
      }).join("")
    ).join("");

    const shapesHtml = placedItems
      .map((item) => {
        const left = (item.origin.col / gridSize) * 100;
        const top = (item.origin.row / gridSize) * 100;
        const width = (item.footprint.width / gridSize) * 100;
        const height = (item.footprint.height / gridSize) * 100;
        const glyph = ITEM_GLYPHS[item.template.id] ?? "";
        return `<div class="placed-item-shape" style="left:${left}%; top:${top}%; width:${width}%; height:${height}%; background:#8a8a8a; border-color:#666;">${glyph}</div>`;
      })
      .join("");

    const heldHtml = held
      ? `<p>Holding: ${ITEM_GLYPHS[held.template.id] ?? ""} <strong>${held.template.name}</strong> (${held.footprint.width}x${held.footprint.height}) <button id="rotate-btn">Rotate</button> <button id="cancel-btn">Put back in tray</button> <button id="discard-held-btn">Discard</button></p>`
      : `<p>Nothing held — click a tray item to pick it up.</p>`;

    root.innerHTML = `
      <div class="phase-shell">
        <p class="phase-label">Run ${context.runNumber} · Tier ${context.tier} · Trip ${context.tripCount + 1}</p>
        <h1>Phase 1: The Kitchen</h1>
        <p class="blueprint-header">Doc's blueprint calls for: ${blueprintHtml}</p>

        <div class="kitchen-scene">
          ${composeKitchenBackground()}
          ${hotspotsHtml}
        </div>
        ${revealPanelHtml}

        <h2>Tray</h2>
        <div class="tray">${trayHtml}</div>

        ${heldHtml}
        ${message ? `<p class="message">${message}</p>` : ""}

        <h2>Inventory Grid (${gridSize}&times;${gridSize})</h2>
        <div class="grid" style="grid-template-columns: repeat(${gridSize}, 1fr);">${gridHtml}${shapesHtml}</div>

        <p>Carried stat tally: Thrust ${tally.thrust.toFixed(1)} &middot; Weight ${tally.weight.toFixed(1)} &middot; Drag ${tally.drag.toFixed(1)} &middot; Durability ${tally.durability.toFixed(1)}</p>

        <button id="advance-btn">Return to Doc's Workbench</button>
      </div>
    `;

    wireEvents();
  }

  function wireEvents(): void {
    root.querySelectorAll<HTMLButtonElement>(".kitchen-hotspot").forEach((btn) => {
      btn.addEventListener("click", () => {
        const sourceId = btn.dataset.source!;
        openSourceId = sourceId;
        searchedSourceIds.add(sourceId);
        message = null;
        draw();
      });
    });

    root.querySelector<HTMLButtonElement>("#close-reveal-btn")?.addEventListener("click", () => {
      openSourceId = null;
      draw();
    });

    root.querySelectorAll<HTMLButtonElement>(".keep-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!openSourceId) return;
        const instanceId = btn.dataset.instance!;
        const remaining = pendingReveals.get(openSourceId) ?? [];
        const idx = remaining.findIndex((p) => p.instanceId === instanceId);
        if (idx === -1) return;
        pendingTray.push(remaining[idx]!);
        remaining.splice(idx, 1);
        draw();
      });
    });

    root.querySelectorAll<HTMLButtonElement>(".discard-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!openSourceId) return;
        const instanceId = btn.dataset.instance!;
        const remaining = pendingReveals.get(openSourceId) ?? [];
        const idx = remaining.findIndex((p) => p.instanceId === instanceId);
        if (idx === -1) return;
        remaining.splice(idx, 1);
        draw();
      });
    });

    root.querySelectorAll<HTMLButtonElement>(".tray-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (held) return;
        const instanceId = btn.dataset.instance!;
        const idx = pendingTray.findIndex((p) => p.instanceId === instanceId);
        if (idx === -1) return;
        const piece = pendingTray[idx]!;
        pendingTray.splice(idx, 1);
        held = { instanceId: piece.instanceId, template: piece.template, color: piece.color, footprint: { ...piece.template.footprint } };
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
      pendingTray.push({ instanceId: held.instanceId, template: held.template, color: held.color });
      held = null;
      message = null;
      draw();
    });

    root.querySelector<HTMLButtonElement>("#discard-held-btn")?.addEventListener("click", () => {
      if (!held) return;
      held = null;
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
      onAdvance({ placedItems: [...placedItems] });
    });
  }

  draw();
}
