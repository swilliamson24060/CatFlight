const MUTE_KEY = "catflight-audio-muted";

export function isMuted(): boolean {
  return localStorage.getItem(MUTE_KEY) === "1";
}

export function setMuted(muted: boolean): void {
  localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
}

export function toggleMuted(): boolean {
  const next = !isMuted();
  setMuted(next);
  return next;
}

let ctx: AudioContext | null = null;

function getContext(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
  }
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
  return ctx;
}

interface ToneOptions {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  volume?: number;
  delay?: number;
  frequencyEnd?: number;
}

function playTone(opts: ToneOptions): void {
  if (isMuted()) return;
  const context = getContext();
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = opts.type ?? "sine";

  const startTime = context.currentTime + (opts.delay ?? 0);
  osc.frequency.setValueAtTime(opts.frequency, startTime);
  if (opts.frequencyEnd !== undefined) {
    osc.frequency.linearRampToValueAtTime(opts.frequencyEnd, startTime + opts.duration);
  }

  const volume = opts.volume ?? 0.15;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + opts.duration);

  osc.connect(gain);
  gain.connect(context.destination);
  osc.start(startTime);
  osc.stop(startTime + opts.duration + 0.05);
}

export function playClick(): void {
  playTone({ frequency: 700, duration: 0.06, type: "sine", volume: 0.07 });
}

export function playPurchase(): void {
  playTone({ frequency: 523.25, duration: 0.09, type: "triangle", volume: 0.12 });
  playTone({ frequency: 783.99, duration: 0.14, type: "triangle", volume: 0.12, delay: 0.08 });
}

export function playAssemble(): void {
  playTone({ frequency: 440, duration: 0.08, type: "triangle", volume: 0.1 });
  playTone({ frequency: 554.37, duration: 0.1, type: "triangle", volume: 0.1, delay: 0.07 });
}

export function playSuccess(): void {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((frequency, i) => playTone({ frequency, duration: 0.2, type: "triangle", volume: 0.14, delay: i * 0.1 }));
}

export function playLaunchFail(): void {
  playTone({ frequency: 180, frequencyEnd: 90, duration: 0.5, type: "square", volume: 0.12 });
}

export function playMidflightFail(): void {
  playTone({ frequency: 320, frequencyEnd: 60, duration: 0.6, type: "sawtooth", volume: 0.13 });
}

export function playLandingMiss(): void {
  playTone({ frequency: 220, frequencyEnd: 110, duration: 0.35, type: "square", volume: 0.12 });
}
