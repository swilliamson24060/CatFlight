import { playLandingMiss, playLaunchFail, playMidflightFail, playSuccess } from "../audio/sfx";
import type { RunContext } from "../engine/runContext";
import { composeCraftCardSvg } from "../render/craftCard";
import {
  composeCraftLeanSvg,
  composeHarnessCloseupSvg,
  composePowerSourceCloseupSvg,
  composeWingsCloseupSvg,
  craftRecordToVisual,
} from "../render/craftComposer";
import { downloadDataUrl, svgToPngDataUrl } from "../render/exportImage";
import { evaluateFlight, type FlightGate, type FlightOutcome } from "../systems/flightSim";
import { FUNCTIONAL_CATEGORIES } from "../types/core";
import type { CraftRecord } from "../types/craft";

function hasAllCategories(craft: CraftRecord): boolean {
  return FUNCTIONAL_CATEGORIES.every((category) => craft.categories[category].components.length > 0);
}

const GATE_LABELS: Record<FlightGate, string> = {
  launch: "Launch",
  midflight: "Midflight",
  landing: "Landing",
};

const GATE_ORDER: FlightGate[] = ["launch", "midflight", "landing"];

function flavorText(outcome: FlightOutcome): string {
  if (outcome.success) {
    return "Meow-gor touches down gracefully next to the food dish. Doc Frankie pops a tiny bottle of sparkling apple juice. Level Complete!";
  }
  if (outcome.missingCategory) {
    return "Doc won't even bolt this together — a whole category of parts is missing entirely. The engine sputters and stalls before Meow-gor leaves the floor.";
  }
  switch (outcome.failedAt) {
    case "launch":
      return "The engine sputters and stalls — Meow-gor never leaves the floor.";
    case "midflight":
      return "Structural failure mid-air! The frame shears apart and Meow-gor crashes into the wall.";
    case "landing":
      return outcome.landingMissReason === "overshoot"
        ? "Too much momentum — Meow-gor overshoots the dish and crashes into the wall."
        : "Not enough glide — Meow-gor stalls out and drops short of the fridge.";
    default:
      return "";
  }
}

function gateStatusHtml(outcome: FlightOutcome): string {
  return GATE_ORDER.map((gate, index) => {
    let status = "not reached";
    if (index < outcome.gatesCleared) status = "✓";
    else if (gate === outcome.failedAt) status = "✗";
    return `${GATE_LABELS[gate]}: ${status}`;
  }).join(" &middot; ");
}

function playOutcomeSound(outcome: FlightOutcome): void {
  if (outcome.success) playSuccess();
  else if (outcome.failedAt === "launch") playLaunchFail();
  else if (outcome.failedAt === "midflight") playMidflightFail();
  else if (outcome.failedAt === "landing") playLandingMiss();
}

type RevealPhase = "reveal-harness" | "reveal-power" | "reveal-wings";
type Phase = RevealPhase | "idle" | "animating" | "revealed";

const REVEAL_CAPTIONS: Record<RevealPhase, string> = {
  "reveal-harness": "Harness",
  "reveal-power": "Power source",
  "reveal-wings": "Wings",
};

const REVEAL_STAGE_MS = 1100;

/** Only spotlights parts that were actually collected -- skips straight past an empty category. */
function buildRevealSequence(craft: CraftRecord): RevealPhase[] {
  const sequence: RevealPhase[] = [];
  if (craft.categories.harness.hero) sequence.push("reveal-harness");
  if (craft.categories.powerSource.hero) sequence.push("reveal-power");
  sequence.push("reveal-wings");
  return sequence;
}

function isRevealPhase(phase: Phase): phase is RevealPhase {
  return phase === "reveal-harness" || phase === "reveal-power" || phase === "reveal-wings";
}

export function renderFlightSim(root: HTMLElement, context: RunContext, onAdvance: (outcome: FlightOutcome) => void): void {
  const craft = context.craft;
  const visual = craft ? craftRecordToVisual(craft) : null;
  const revealSequence = craft ? buildRevealSequence(craft) : [];
  let revealIndex = 0;
  let phase: Phase = revealSequence.length > 0 ? revealSequence[0]! : "idle";
  let outcome: FlightOutcome | null = null;
  let shareMessage: { text: string; ok: boolean } | null = null;
  let revealTimer: number | undefined;

  function clearRevealTimer(): void {
    if (revealTimer !== undefined) {
      window.clearTimeout(revealTimer);
      revealTimer = undefined;
    }
  }

  function advanceReveal(): void {
    revealIndex++;
    phase = revealIndex < revealSequence.length ? revealSequence[revealIndex]! : "idle";
    draw();
  }

  function skipReveal(): void {
    clearRevealTimer();
    phase = "idle";
    draw();
  }

  function draw(): void {
    if (!root.isConnected) return;

    let craftHtml: string;
    if (!craft || !visual) {
      craftHtml = `<p><em>No craft assembled.</em></p>`;
    } else if (isRevealPhase(phase)) {
      const closeup =
        phase === "reveal-harness"
          ? composeHarnessCloseupSvg(visual)
          : phase === "reveal-power"
            ? composePowerSourceCloseupSvg(visual)
            : composeWingsCloseupSvg(visual);
      craftHtml = `
        <div class="craft-preview reveal-shot">
          <div class="reveal-caption">${REVEAL_CAPTIONS[phase]}</div>
          ${closeup ?? ""}
        </div>
      `;
    } else {
      const fogTint = outcome ? (outcome.success ? "fog-success" : "fog-fail") : "";
      const fogState = phase === "animating" ? "animating" : phase === "revealed" ? "settled" : "";
      craftHtml = `
        <div class="craft-preview">
          <div class="flight-stage">
            <div class="flight-craft">${composeCraftLeanSvg(visual)}</div>
            <div class="flight-fog ${fogTint} ${fogState}"></div>
          </div>
        </div>
      `;
    }

    const thresholdsHtml =
      craft && !isRevealPhase(phase)
        ? `<p>Blueprint fulfillment: ${Math.round(craft.fulfillmentRatio * 100)}% — that's your odds of a clean flight.</p>`
        : "";

    const missingCategoryWarningHtml =
      craft && phase === "idle" && !hasAllCategories(craft)
        ? `<p class="message">Missing at least one category entirely -- Doc won't even attempt the flight until every category has something.</p>`
        : "";

    let actionHtml = "";
    if (isRevealPhase(phase)) {
      actionHtml = `<button id="skip-reveal-btn" class="skip-reveal-btn">Skip &rsaquo;</button>`;
    } else if (phase === "idle") {
      actionHtml = `<button id="launch-btn">Launch!</button>`;
    } else if (phase === "animating") {
      actionHtml = `<p class="flying-status"><em>Flying&hellip;</em></p>`;
    } else if (phase === "revealed" && outcome) {
      const shareHtml = craft
        ? `<div class="share-section">
             <p>Share code: <code>${craft.seedString}</code></p>
             <button id="copy-btn">Copy Share Code</button>
             <button id="download-btn">Download Craft Card (PNG)</button>
             ${shareMessage ? `<p class="${shareMessage.ok ? "success" : "message"}">${shareMessage.text}</p>` : ""}
           </div>`
        : "";
      actionHtml = `
        <p class="${outcome.success ? "success" : "message"}">${flavorText(outcome)}</p>
        <p>${gateStatusHtml(outcome)}</p>
        ${shareHtml}
        <button id="continue-btn">Continue → Mousehole HQ</button>
      `;
    }

    root.innerHTML = `
      <div class="phase-shell">
        <p class="phase-label">Run ${context.runNumber} · Tier ${context.tier}</p>
        <h1>Phase 3: Test Flight Simulation</h1>
        ${craftHtml}
        ${thresholdsHtml}
        ${missingCategoryWarningHtml}
        ${actionHtml}
      </div>
    `;

    wireEvents();

    if (isRevealPhase(phase)) {
      clearRevealTimer();
      revealTimer = window.setTimeout(advanceReveal, REVEAL_STAGE_MS);
    }

    if (phase === "animating") {
      const fogEl = root.querySelector<HTMLElement>(".flight-fog");
      fogEl?.addEventListener(
        "animationend",
        () => {
          phase = "revealed";
          if (outcome) playOutcomeSound(outcome);
          draw();
        },
        { once: true }
      );
    }
  }

  function wireEvents(): void {
    root.querySelector<HTMLButtonElement>("#skip-reveal-btn")?.addEventListener("click", skipReveal);

    root.querySelector<HTMLButtonElement>("#launch-btn")?.addEventListener("click", () => {
      if (!craft) return;
      outcome = evaluateFlight(craft.fulfillmentRatio, hasAllCategories(craft));
      phase = "animating";
      draw();
    });

    root.querySelector<HTMLButtonElement>("#copy-btn")?.addEventListener("click", () => {
      if (!craft?.seedString) return;
      navigator.clipboard
        .writeText(craft.seedString)
        .then(() => {
          shareMessage = { text: "Copied to clipboard!", ok: true };
          draw();
        })
        .catch(() => {
          shareMessage = { text: "Couldn't copy — select the code manually.", ok: false };
          draw();
        });
    });

    root.querySelector<HTMLButtonElement>("#download-btn")?.addEventListener("click", () => {
      if (!craft) return;
      const cardSvg = composeCraftCardSvg(craftRecordToVisual(craft), craft.stats, craft.seedString ?? "");
      svgToPngDataUrl(cardSvg, 320, 260)
        .then((dataUrl) => {
          downloadDataUrl(dataUrl, `cat-flight-wing-${craft.seedString ?? "craft"}.png`);
        })
        .catch(() => {
          shareMessage = { text: "Couldn't generate the image.", ok: false };
          draw();
        });
    });

    root.querySelector<HTMLButtonElement>("#continue-btn")?.addEventListener("click", () => {
      if (!outcome) return;
      onAdvance(outcome);
    });
  }

  draw();
}
