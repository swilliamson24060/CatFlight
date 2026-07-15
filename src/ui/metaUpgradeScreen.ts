import { playPurchase } from "../audio/sfx";
import type { RunContext } from "../engine/runContext";
import {
  UPGRADES,
  computeScrapReward,
  getUpgradeLevel,
  purchaseUpgrade,
  saveMetaState,
  type MetaState,
} from "../systems/metaProgression";

export function renderMetaUpgrade(
  root: HTMLElement,
  context: RunContext,
  initialMeta: MetaState,
  onAdvance: (meta: MetaState) => void
): void {
  let meta = initialMeta;

  function draw(): void {
    const outcome = context.lastFlightOutcome;
    const outcomeSummary = outcome
      ? `<p>Last flight: ${
          outcome.success ? "Success! Gates cleared 3/3." : `Crashed at the ${outcome.failedAt} gate (${outcome.gatesCleared}/3 gates cleared).`
        } Earned ${computeScrapReward(outcome)} scrap.</p>`
      : "";

    const upgradeCards = UPGRADES.map((upgrade) => {
      const level = getUpgradeLevel(meta, upgrade.id);
      const maxed = level >= upgrade.maxLevel;
      const cost = maxed ? null : upgrade.costForLevel(level);
      const canAfford = cost !== null && meta.scrap >= cost;
      return `
        <div class="upgrade-card">
          <h3>${upgrade.name} <span class="upgrade-level">Lv ${level}/${upgrade.maxLevel}</span></h3>
          <p>${upgrade.description}</p>
          <button class="buy-btn" data-id="${upgrade.id}" ${maxed || !canAfford ? "disabled" : ""}>
            ${maxed ? "MAXED" : `Buy — ${cost} scrap`}
          </button>
        </div>
      `;
    }).join("");

    root.innerHTML = `
      <div class="phase-shell">
        <p class="phase-label">Run ${context.runNumber} · Tier ${context.tier}</p>
        <h1>Phase 4: Mousehole HQ</h1>
        ${outcomeSummary}
        <p class="scrap-balance">Scrap: ${meta.scrap}</p>
        <div class="upgrades">${upgradeCards}</div>
        <p>Next run is tier ${context.tier + 1}.</p>
        <button id="advance-btn">Start Next Run → Scavenge</button>
      </div>
    `;

    wireEvents();
  }

  function wireEvents(): void {
    root.querySelectorAll<HTMLButtonElement>(".buy-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id as (typeof UPGRADES)[number]["id"];
        meta = purchaseUpgrade(meta, id);
        saveMetaState(meta);
        playPurchase();
        draw();
      });
    });

    root.querySelector<HTMLButtonElement>("#advance-btn")!.addEventListener("click", () => {
      onAdvance(meta);
    });
  }

  draw();
}
