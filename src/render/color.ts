import { getRarityBand } from "../data/colorBands";
import type { ItemColor } from "../types/core";

export function resolveDisplayHue(color: ItemColor): number {
  const band = getRarityBand(color.brilliance);
  return band.hueOverride ?? color.hue;
}

export function toHslString(color: ItemColor): string {
  const hue = resolveDisplayHue(color);
  const saturation = 35 + color.brilliance * 55; // 35-90%
  const lightness = 42 + color.brilliance * 12; // 42-54%
  return `hsl(${hue.toFixed(0)}, ${saturation.toFixed(0)}%, ${lightness.toFixed(0)}%)`;
}
