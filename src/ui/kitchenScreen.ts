import type { RunContext } from "../engine/runContext";
import { summarizeBlueprintForDisplay } from "../render/categoryColors";
import { ITEM_GLYPHS } from "../render/itemGlyphs";
import { composeKitchenBackground, composeWorkshopBackground } from "../render/kitchenShapes";
import {
  canPlace,
  clearInstance,
  createEmptyOccupancy,
  markOccupied,
  rotateFootprint,
  type Occupancy,
} from "../systems/grid";
import { generateKitchenLayout, type ActiveKitchenSource, type KitchenPiece } from "../systems/kitchen";
import {
  computeEffectiveJunkDensity,
  computeGridSize,
  computeLuckBias,
  type MetaState,
} from "../systems/metaProgression";
import type { Footprint } from "../types/core";
import type { PieceTemplate } from "../types/content";
import type { GridResult, PlacedGridItem } from "../types/grid";

const OPENS_PER_TRIP = 3;

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
  let gridModalOpen = false;
  let message: string | null = null;
  let showBriefing = context.tripCount === 0;
  let opensRemaining = OPENS_PER_TRIP;

  function closeModal(): void {
    if (held) {
      pendingTray.push({ instanceId: held.instanceId, template: held.template, color: held.color });
      held = null;
    }
    openSourceId = null;
    gridModalOpen = false;
    message = null;
  }

  function draw(): void {
    const blueprintHtml = summarizeBlueprintForDisplay(context.blueprint.requirements);

    const hotspotsHtml = layout
      .map((active) => {
        const { source } = active;
        const searched = searchedSourceIds.has(source.id);
        const locked = !searched && opensRemaining <= 0;
        const label = searched ? `${source.name} (searched)` : locked ? `${source.name} (no searches left this trip)` : source.name;
        return `<button type="button" class="kitchen-hotspot${searched ? " searched" : ""}${locked ? " locked" : ""}" data-source="${source.id}" style="left:${source.hotspot.x}%; top:${source.hotspot.y}%; width:${source.hotspot.width}%; height:${source.hotspot.height}%;" aria-label="${label}" ${locked ? "disabled" : ""}>${source.name}</button>`;
      })
      .join("");

    const modalOpen = openSourceId !== null || gridModalOpen;
    const activeSource = openSourceId ? layout.find((a) => a.source.id === openSourceId) : undefined;

    const revealListHtml = activeSource
      ? (() => {
          const remaining = pendingReveals.get(activeSource.source.id) ?? [];
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
          return `<div class="reveal-panel">${itemsHtml}</div>`;
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
        return `<button type="button" class="cell${occupant ? " filled" : ""}" data-row="${row}" data-col="${col}" style="grid-column: ${col + 1}; grid-row: ${row + 1};" aria-label="${label}"></button>`;
      }).join("")
    ).join("");

    const shapesHtml = placedItems
      .map((item) => {
        const glyph = ITEM_GLYPHS[item.template.id] ?? "";
        const colStart = item.origin.col + 1;
        const rowStart = item.origin.row + 1;
        return `<button type="button" class="placed-item-shape" data-instance="${item.instanceId}" style="grid-column: ${colStart} / span ${item.footprint.width}; grid-row: ${rowStart} / span ${item.footprint.height};" aria-label="${item.template.name}, pick back up">${glyph}</button>`;
      })
      .join("");

    const heldHtml = held
      ? `<p>Holding: ${ITEM_GLYPHS[held.template.id] ?? ""} <strong>${held.template.name}</strong> (${held.footprint.width}x${held.footprint.height}) <button id="rotate-btn">Rotate</button> <button id="cancel-btn">Put back in tray</button> <button id="discard-held-btn">Discard</button></p>`
      : `<p>Nothing held — click a tray item to pick it up.</p>`;

    const modalHtml = modalOpen
      ? `
        <div class="kitchen-modal-overlay" id="kitchen-modal-overlay">
          <div class="kitchen-modal">
            <button type="button" class="kitchen-modal-close" id="close-modal-btn" aria-label="Close">&times;</button>
            <div class="kitchen-modal-left">
              <h3>${activeSource ? activeSource.source.name : "Your Grid"}</h3>
              ${revealListHtml}
              <h4>Tray</h4>
              <div class="tray">${trayHtml}</div>
              ${heldHtml}
              ${message ? `<p class="message">${message}</p>` : ""}
            </div>
            <div class="kitchen-modal-right">
              <div class="grid" style="grid-template-columns: repeat(${gridSize}, 1fr); grid-template-rows: repeat(${gridSize}, 1fr);">${gridHtml}${shapesHtml}</div>
            </div>
          </div>
        </div>
      `
      : "";

    const briefingHtml = showBriefing
      ? `
        <div class="workshop-briefing-overlay" id="workshop-briefing-overlay">
          <div class="workshop-briefing-panel">
            <div class="workshop-scene">${composeWorkshopBackground()}</div>
            <h2>Doc's Workshop</h2>
            <p>"Alright, here's what I need for this build:"</p>
            <p class="workshop-briefing-list">${blueprintHtml}</p>
            <p>You've got ${OPENS_PER_TRIP} spots you can search in the kitchen this trip -- choose wisely.</p>
            <button type="button" id="start-searching-btn">Start Searching</button>
          </div>
        </div>
      `
      : "";

    root.innerHTML = `
      <div class="phase-shell">
        <p class="phase-label">Run ${context.runNumber} · Tier ${context.tier} · Trip ${context.tripCount + 1}</p>
        <h1>Phase 1: The Kitchen</h1>
        <p class="blueprint-header">Doc's blueprint calls for: ${blueprintHtml}</p>
        <p class="opens-remaining">Searches left this trip: ${opensRemaining}</p>

        <div class="kitchen-scene">
          ${composeKitchenBackground()}
          ${hotspotsHtml}
        </div>

        <p class="blueprint-reminder">Doc still needs: ${blueprintHtml}</p>

        <button type="button" id="view-grid-btn">View Grid (${placedItems.length} placed)</button>
        <button id="advance-btn">Return to Doc's Workbench</button>

        ${modalHtml}
        ${briefingHtml}
      </div>
    `;

    wireEvents();
  }

  function wireEvents(): void {
    root.querySelector<HTMLButtonElement>("#start-searching-btn")?.addEventListener("click", () => {
      showBriefing = false;
      draw();
    });

    root.querySelectorAll<HTMLButtonElement>(".kitchen-hotspot").forEach((btn) => {
      btn.addEventListener("click", () => {
        const sourceId = btn.dataset.source!;
        if (!searchedSourceIds.has(sourceId)) {
          if (opensRemaining <= 0) return;
          opensRemaining -= 1;
          searchedSourceIds.add(sourceId);
        }
        openSourceId = sourceId;
        message = null;
        draw();
      });
    });

    root.querySelector<HTMLButtonElement>("#view-grid-btn")?.addEventListener("click", () => {
      gridModalOpen = true;
      draw();
    });

    root.querySelector<HTMLButtonElement>("#close-modal-btn")?.addEventListener("click", () => {
      closeModal();
      draw();
    });

    root.querySelector<HTMLDivElement>("#kitchen-modal-overlay")?.addEventListener("click", (event) => {
      if (event.target === event.currentTarget) {
        closeModal();
        draw();
      }
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
        if (!held) return;
        const row = Number(cell.dataset.row);
        const col = Number(cell.dataset.col);
        if (occupancy[row]![col]) return;
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
      });
    });

    root.querySelectorAll<HTMLButtonElement>(".placed-item-shape").forEach((shape) => {
      shape.addEventListener("click", () => {
        if (held) return;
        const instanceId = shape.dataset.instance!;
        const placedIdx = placedItems.findIndex((p) => p.instanceId === instanceId);
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
