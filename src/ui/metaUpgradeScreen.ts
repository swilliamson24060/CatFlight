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

    const scoreSummary =
      outcome?.success && context.craft
        ? `<p>Trips taken: ${context.tripCount + 1} &middot; Score: ${context.craft.score}</p>`
        : "";

    const upgradeCards = UPGRADES.map((upgrade) => {
      const level = getUpgradeLevel(meta, upgrade.id);
      const maxed = level >= upgrade.maxLevel;
      const cost = maxed ? null : upgrade.costForLevel(level);
      const balance = upgrade.currency === "scrap" ? meta.scrap : meta.spareParts;
      const canAfford = cost !== null && balance >= cost;
      const currencyLabel = upgrade.currency === "scrap" ? "scrap" : "spare parts";
      return `
        <div class="upgrade-card">
          <h3>${upgrade.name} <span class="upgrade-level">Lv ${level}/${upgrade.maxLevel}</span></h3>
          <p>${upgrade.description}</p>
          <button class="buy-btn" data-id="${upgrade.id}" ${maxed || !canAfford ? "disabled" : ""}>
            ${maxed ? "MAXED" : `Buy — ${cost} ${currencyLabel}`}
          </button>
        </div>
      `;
    }).join("");

    root.innerHTML = `
      <div class="phase-shell">
        <p class="phase-label">Run ${context.runNumber} · Tier ${context.tier}</p>
        <h1>Phase 4: Mousehole HQ</h1>
        ${outcomeSummary}
        ${scoreSummary}
        <p class="scrap-balance">Scrap: ${meta.scrap} &middot; Spare Parts: ${meta.spareParts}</p>
        <p class="best-tier">Best tier reached: ${meta.bestTier} &middot; Best score: ${meta.bestScore}</p>
        <div class="upgrades">${upgradeCards}</div>
        <p>Next run is tier ${context.tier + 1}.</p>
        <button id="advance-btn">Start Next Run → Kitchen</button>
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
