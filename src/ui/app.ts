import { PhaseMachine, type Phase } from "../engine/phaseMachine";
import { advanceToNextRun, createInitialRunContext, type RunContext } from "../engine/runContext";
import { renderFlightSim } from "./flightSimScreen";
import { renderMetaUpgrade } from "./metaUpgradeScreen";
import { renderScavenge } from "./scavengeScreen";
import { renderSynthesis } from "./synthesisScreen";
import { computeScrapReward, loadMetaState, saveMetaState, type MetaState } from "../systems/metaProgression";

export function mountApp(root: HTMLElement): void {
  const machine = new PhaseMachine();
  let context: RunContext = createInitialRunContext();
  let meta: MetaState = loadMetaState();

  function render(phase: Phase): void {
    switch (phase) {
      case "scavenge":
        renderScavenge(root, context, meta, (result) => {
          context = { ...context, lastGridResult: result };
          machine.advance();
        });
        break;
      case "synthesis":
        renderSynthesis(
          root,
          context,
          (craft) => {
            context = { ...context, craft };
            machine.advance();
          },
          () => {
            context = { ...context, lastGridResult: undefined };
            machine.setPhase("scavenge");
          }
        );
        break;
      case "flightSim":
        renderFlightSim(root, context, (outcome) => {
          meta = {
            ...meta,
            scrap: meta.scrap + computeScrapReward(outcome),
            bestTier: Math.max(meta.bestTier, context.tier),
          };
          saveMetaState(meta);
          context = { ...context, lastFlightOutcome: outcome };
          machine.advance();
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
