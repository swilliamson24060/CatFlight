import { setMusicTrack } from "../audio/music";
import { PhaseMachine, type Phase } from "../engine/phaseMachine";
import { advanceToNextRun, createInitialRunContext, type RunContext } from "../engine/runContext";
import { renderFlightSim } from "./flightSimScreen";
import { renderKitchen } from "./kitchenScreen";
import { renderMetaUpgrade } from "./metaUpgradeScreen";
import { renderSynthesis } from "./synthesisScreen";
import {
  computeScrapReward,
  computeSparePartsReward,
  loadMetaState,
  saveMetaState,
  type MetaState,
} from "../systems/metaProgression";

export function mountApp(root: HTMLElement): void {
  const machine = new PhaseMachine();
  let context: RunContext = createInitialRunContext();
  let meta: MetaState = loadMetaState();

  function render(phase: Phase): void {
    setMusicTrack(phase === "synthesis" ? "lab" : "theme");

    switch (phase) {
      case "scavenge":
        renderKitchen(root, context, meta, (result) => {
          context = { ...context, lastGridResult: result, tripCount: context.tripCount + 1 };
          machine.advance();
        });
        break;
      case "synthesis":
        renderSynthesis(root, context, meta, (craft, excessPieces) => {
          context = { ...context, craft, excessPieces };
          machine.advance();
        });
        break;
      case "flightSim":
        renderFlightSim(root, context, (outcome) => {
          context = { ...context, lastFlightOutcome: outcome };

          if (outcome.success) {
            const sparePartsEarned = computeSparePartsReward(context.excessPieces ?? []);
            meta = {
              ...meta,
              scrap: meta.scrap + computeScrapReward(outcome),
              spareParts: meta.spareParts + sparePartsEarned,
              bestTier: Math.max(meta.bestTier, context.tier),
              bestScore: Math.max(meta.bestScore, context.craft?.score ?? 0),
            };
            saveMetaState(meta);
            machine.advance();
          } else {
            // Failed flights don't end the run -- back to the kitchen with the same blueprint
            // and everything already carried, for another (score-costing) trip.
            machine.setPhase("scavenge");
          }
        });
        break;
      case "metaUpgrade":
        renderMetaUpgrade(root, context, meta, (updatedMeta) => {
          meta = updatedMeta;
          saveMetaState(meta);
          context = advanceToNextRun(context);
          machine.advance();
        });
        break;
    }
  }

  machine.subscribe(render);
  render(machine.getPhase());
}
