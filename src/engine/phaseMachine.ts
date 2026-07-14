export type Phase = "scavenge" | "synthesis" | "flightSim" | "metaUpgrade";

const PHASE_ORDER: Phase[] = ["scavenge", "synthesis", "flightSim", "metaUpgrade"];

type Listener = (phase: Phase) => void;

export class PhaseMachine {
  private current: Phase = "scavenge";
  private listeners = new Set<Listener>();

  getPhase(): Phase {
    return this.current;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  advance(): Phase {
    const index = PHASE_ORDER.indexOf(this.current);
    this.current = PHASE_ORDER[(index + 1) % PHASE_ORDER.length]!;
    this.notify();
    return this.current;
  }

  /** Jumps directly to a phase, bypassing the normal cyclic order. */
  setPhase(phase: Phase): void {
    this.current = phase;
    this.notify();
  }

  private notify(): void {
    for (const listener of this.listeners) listener(this.current);
  }
}
