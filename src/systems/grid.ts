import type { Footprint } from "../types/core";

export const DEFAULT_GRID_SIZE = 6;

/** instanceId occupying each cell, or null if empty. */
export type Occupancy = (string | null)[][];

export function createEmptyOccupancy(size: number = DEFAULT_GRID_SIZE): Occupancy {
  return Array.from({ length: size }, () => Array<string | null>(size).fill(null));
}

export function rotateFootprint(footprint: Footprint): Footprint {
  return { width: footprint.height, height: footprint.width };
}

export function canPlace(
  occupancy: Occupancy,
  footprint: Footprint,
  origin: { row: number; col: number }
): boolean {
  const rows = occupancy.length;
  const cols = occupancy[0]?.length ?? 0;
  if (origin.row < 0 || origin.col < 0) return false;
  if (origin.row + footprint.height > rows) return false;
  if (origin.col + footprint.width > cols) return false;
  for (let r = origin.row; r < origin.row + footprint.height; r++) {
    for (let c = origin.col; c < origin.col + footprint.width; c++) {
      if (occupancy[r]![c] !== null) return false;
    }
  }
  return true;
}

export function markOccupied(
  occupancy: Occupancy,
  footprint: Footprint,
  origin: { row: number; col: number },
  instanceId: string
): void {
  for (let r = origin.row; r < origin.row + footprint.height; r++) {
    for (let c = origin.col; c < origin.col + footprint.width; c++) {
      occupancy[r]![c] = instanceId;
    }
  }
}

export function clearInstance(occupancy: Occupancy, instanceId: string): void {
  for (let r = 0; r < occupancy.length; r++) {
    for (let c = 0; c < occupancy[r]!.length; c++) {
      if (occupancy[r]![c] === instanceId) occupancy[r]![c] = null;
    }
  }
}
