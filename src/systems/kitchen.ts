import { PIECE_POOL } from "../data/pieces";
import { KITCHEN_SOURCES } from "../data/kitchenSources";
import { rollColor } from "./scavenge";
import { FUNCTIONAL_CATEGORIES } from "../types/core";
import type { FunctionalPieceCategory, ItemColor } from "../types/core";
import type { KitchenSourceTemplate, PieceTemplate } from "../types/content";

export interface KitchenPiece {
  instanceId: string;
  template: PieceTemplate;
  color: ItemColor;
}

export interface ActiveKitchenSource {
  source: KitchenSourceTemplate;
  reveals: KitchenPiece[];
}

let nextInstanceId = 1;
function makeInstanceId(): string {
  return `inst-${nextInstanceId++}`;
}

function weightedPick<T>(pool: T[], weightOf: (item: T) => number): T {
  const total = pool.reduce((sum, item) => sum + weightOf(item), 0);
  let roll = Math.random() * total;
  for (const item of pool) {
    roll -= weightOf(item);
    if (roll <= 0) return item;
  }
  return pool[pool.length - 1]!;
}

const TEMPLATE_BY_ID = new Map(PIECE_POOL.map((t) => [t.id, t]));

function templateFor(id: string): PieceTemplate {
  const template = TEMPLATE_BY_ID.get(id);
  if (!template) throw new Error(`Unknown piece template id: ${id}`);
  return template;
}

function sourcesContaining(templateId: string): KitchenSourceTemplate[] {
  return KITCHEN_SOURCES.filter((source) => source.revealPool.some((entry) => entry.templateId === templateId));
}

function makePiece(templateId: string, luckBias: number): KitchenPiece {
  return { instanceId: makeInstanceId(), template: templateFor(templateId), color: rollColor(luckBias) };
}

function rollReveal(source: KitchenSourceTemplate, junkDensity: number, luckBias: number): KitchenPiece {
  const pool = source.revealPool.map((entry) => ({ entry, template: templateFor(entry.templateId) }));
  const junkOnly = pool.filter((p) => p.template.categories.length === 0);

  const chosen =
    junkOnly.length > 0 && Math.random() < junkDensity
      ? weightedPick(junkOnly, (p) => p.entry.weight ?? p.template.spawnWeight)
      : weightedPick(pool, (p) => p.entry.weight ?? p.template.spawnWeight);

  return makePiece(chosen.template.id, luckBias);
}

const TARGET_ACTIVE_SOURCES = 5;

/**
 * Activates a subset of KITCHEN_SOURCES for this run (capped at TARGET_ACTIVE_SOURCES) and rolls
 * each one's reveals up front (the reveal itself stays hidden from the player until they click
 * the hotspot). Best-effort guarantees at least one real candidate exists for every functional
 * category, preferring to reuse an already-active source so the area cap holds; if the cap is
 * already reached and no active source can cover a remaining category, that category's coverage
 * simply isn't guaranteed this trip (the retry loop handles bad luck, same as everywhere else).
 */
export function generateKitchenLayout(junkDensity: number, luckBias = 0): ActiveKitchenSource[] {
  const activeIds = new Set<string>();
  const forcedTemplatesBySource = new Map<string, string[]>();

  const shuffledCategories = [...FUNCTIONAL_CATEGORIES].sort(() => Math.random() - 0.5) as FunctionalPieceCategory[];

  for (const category of shuffledCategories) {
    const candidateTemplates = PIECE_POOL.filter((t) => t.categories.includes(category));
    const guaranteedTemplate = weightedPick(candidateTemplates, (t) => t.spawnWeight);
    const candidateSources = sourcesContaining(guaranteedTemplate.id);
    const alreadyActive = candidateSources.filter((s) => activeIds.has(s.id));

    let targetSource: KitchenSourceTemplate;
    if (alreadyActive.length > 0) {
      targetSource = alreadyActive[Math.floor(Math.random() * alreadyActive.length)]!;
    } else if (activeIds.size < TARGET_ACTIVE_SOURCES) {
      targetSource = candidateSources[Math.floor(Math.random() * candidateSources.length)]!;
    } else {
      continue;
    }

    activeIds.add(targetSource.id);
    const forced = forcedTemplatesBySource.get(targetSource.id) ?? [];
    if (!forced.includes(guaranteedTemplate.id)) forced.push(guaranteedTemplate.id);
    forcedTemplatesBySource.set(targetSource.id, forced);
  }

  while (activeIds.size < Math.min(TARGET_ACTIVE_SOURCES, KITCHEN_SOURCES.length)) {
    const pick = KITCHEN_SOURCES[Math.floor(Math.random() * KITCHEN_SOURCES.length)]!;
    activeIds.add(pick.id);
  }

  return KITCHEN_SOURCES.filter((source) => activeIds.has(source.id)).map((source) => {
    const rolledCount =
      source.revealCount.min + Math.floor(Math.random() * (source.revealCount.max - source.revealCount.min + 1));
    const forced = forcedTemplatesBySource.get(source.id) ?? [];
    const revealCount = Math.max(rolledCount, forced.length);

    const reveals: KitchenPiece[] = forced.map((templateId) => makePiece(templateId, luckBias));
    for (let i = reveals.length; i < revealCount; i++) {
      reveals.push(rollReveal(source, junkDensity, luckBias));
    }
    return { source, reveals };
  });
}
