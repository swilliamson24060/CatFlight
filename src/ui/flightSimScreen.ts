import { playLandingMiss, playLaunchFail, playMidflightFail, playSuccess } from "../audio/sfx";
import type { RunContext } from "../engine/runContext";
import { composeCraftCardSvg } from "../render/craftCard";
import { composeCraftSvg } from "../render/craftComposer";
import { downloadDataUrl, svgToPngDataUrl } from "../render/exportImage";
import { evaluateFlight, type FlightGate, type FlightOutcome } from "../systems/flightSim";

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

function animationClassFor(outcome: FlightOutcome): string {
  if (outcome.success) return "anim-success";
  switch (outcome.failedAt) {
    case "launch":
      return "anim-launch-fail";
    case "midflight":
      return "anim-midflight-fail";
    case "landing":
      return outcome.landingMissReason === "overshoot" ? "anim-landing-overshoot" : "anim-landing-undershoot";
    default:
      return "";
  }
}

function playOutcomeSound(outcome: FlightOutcome): void {
  if (outcome.success) playSuccess();
  else if (outcome.failedAt === "launch") playLaunchFail();
  else if (outcome.failedAt === "midflight") playMidflightFail();
  else if (outcome.failedAt === "landing") playLandingMiss();
}

type Phase = "idle" | "animating" | "revealed";

export function renderFlightSim(root: HTMLElement, context: RunContext, onAdvance: (outcome: FlightOutcome) => void): void {
  const craft = context.craft;
  const d = context.difficulty;
  let outcome: FlightOutcome | null = null;
  let phase: Phase = "idle";
  let shareMessage: { text: string; ok: boolean } | null = null;

  function draw(): void {
    const animClass = outcome && phase !== "idle" ? animationClassFor(outcome) : "";
    const craftHtml = craft
      ? `<div class="craft-preview">
           <div class="flight-stage"><div class="flight-craft ${animClass}">${composeCraftSvg(craft)}</div></div>
         </div>
         <p>Stats: Thrust ${craft.stats.thrust.toFixed(1)} &middot; Weight ${craft.stats.weight.toFixed(1)} &middot; Drag ${craft.stats.drag.toFixed(1)} &middot; Durability ${craft.stats.durability.toFixed(1)}</p>`
      : `<p><em>No craft assembled.</em></p>`;

    const thresholdsHtml = `<p>Gates: Launch &ge; ${d.launchThreshold}, Midflight &ge; ${d.midflightThreshold}, Glide ratio in [${d.glideMin.toFixed(2)}, ${d.glideMax.toFixed(2)}].</p>`;

    let actionHtml = "";
    if (phase === "idle") {
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
        ${actionHtml}
      </div>
    `;

    wireEvents();

    if (phase === "animating") {
      const craftEl = root.querySelector<HTMLElement>(".flight-craft");
      craftEl?.addEventListener(
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
    root.querySelector<HTMLButtonElement>("#launch-btn")?.addEventListener("click", () => {
      if (!craft) return;
      outcome = evaluateFlight(craft.stats, d);
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
      const cardSvg = composeCraftCardSvg(craft, craft.stats, craft.seedString ?? "");
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
