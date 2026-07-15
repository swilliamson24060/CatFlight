import { describe, expect, it } from "vitest";
import { canPlace, clearInstance, createEmptyOccupancy, markOccupied, rotateFootprint } from "./grid";

describe("createEmptyOccupancy", () => {
  it("creates a square grid of the given size, all cells empty", () => {
    const occ = createEmptyOccupancy(5);
    expect(occ.length).toBe(5);
    expect(occ.every((row) => row.length === 5 && row.every((cell) => cell === null))).toBe(true);
  });
});

describe("rotateFootprint", () => {
  it("swaps width and height", () => {
    expect(rotateFootprint({ width: 1, height: 3 })).toEqual({ width: 3, height: 1 });
  });

  it("is a no-op for a square footprint", () => {
    expect(rotateFootprint({ width: 2, height: 2 })).toEqual({ width: 2, height: 2 });
  });
});

describe("canPlace", () => {
  it("allows placement within bounds on an empty grid", () => {
    const occ = createEmptyOccupancy(5);
    expect(canPlace(occ, { width: 2, height: 2 }, { row: 3, col: 3 })).toBe(true);
  });

  it("rejects placement that overflows the bottom/right edge", () => {
    const occ = createEmptyOccupancy(5);
    expect(canPlace(occ, { width: 2, height: 2 }, { row: 4, col: 4 })).toBe(false);
  });

  it("rejects a negative origin", () => {
    const occ = createEmptyOccupancy(5);
    expect(canPlace(occ, { width: 1, height: 1 }, { row: -1, col: 0 })).toBe(false);
  });

  it("rejects placement that overlaps an occupied cell", () => {
    const occ = createEmptyOccupancy(5);
    markOccupied(occ, { width: 2, height: 2 }, { row: 0, col: 0 }, "a");
    expect(canPlace(occ, { width: 1, height: 1 }, { row: 1, col: 1 })).toBe(false);
    expect(canPlace(occ, { width: 1, height: 1 }, { row: 2, col: 2 })).toBe(true);
  });
});

describe("clearInstance", () => {
  it("frees exactly the cells belonging to that instance, leaving others intact", () => {
    const occ = createEmptyOccupancy(5);
    markOccupied(occ, { width: 2, height: 1 }, { row: 0, col: 0 }, "a");
    markOccupied(occ, { width: 1, height: 1 }, { row: 1, col: 0 }, "b");
    clearInstance(occ, "a");
    expect(occ[0]).toEqual([null, null, null, null, null]);
    expect(occ[1]![0]).toBe("b");
  });
});
