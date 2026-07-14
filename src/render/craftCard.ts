import { composeCraftFragment, type CraftVisual } from "./craftComposer";
import type { Stats } from "../types/core";

export function composeCraftCardSvg(craft: CraftVisual, stats: Stats, code: string): string {
  return `
    <svg viewBox="0 0 320 260" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif">
      <rect x="0" y="0" width="320" height="260" fill="#fafafa" stroke="#ccc" stroke-width="2" />
      <svg x="40" y="12" width="240" height="170" viewBox="0 0 240 170">${composeCraftFragment(craft)}</svg>
      <text x="160" y="200" text-anchor="middle" font-size="15" font-weight="bold" fill="#222">Cat Flight — My Wing</text>
      <text x="160" y="219" text-anchor="middle" font-size="11" fill="#333">Thrust ${stats.thrust.toFixed(1)} &middot; Weight ${stats.weight.toFixed(1)} &middot; Drag ${stats.drag.toFixed(1)} &middot; Durability ${stats.durability.toFixed(1)}</text>
      <text x="160" y="240" text-anchor="middle" font-size="10" fill="#777">Code: ${code}</text>
    </svg>
  `;
}
