import { isMuted } from "./sfx";

const MUSIC_VOLUME = 0.35;

export type MusicTrack = "theme" | "lab";

const TRACK_SRC: Record<MusicTrack, string> = {
  theme: "audio/caper-a-montmartre.mp3",
  lab: "audio/labyrinth-pulse.mp3",
};

let audioEl: HTMLAudioElement | null = null;
let userInteracted = false;
let currentTrack: MusicTrack = "theme";

function getAudioElement(): HTMLAudioElement {
  if (!audioEl) {
    audioEl = new Audio(`${import.meta.env.BASE_URL}${TRACK_SRC[currentTrack]}`);
    audioEl.loop = true;
    audioEl.volume = MUSIC_VOLUME;
  }
  return audioEl;
}

function refreshPlayback(): void {
  const audio = getAudioElement();
  if (isMuted() || !userInteracted) {
    audio.pause();
  } else {
    void audio.play().catch(() => {});
  }
}

/** Browsers block autoplay until a real user gesture -- call on every click, it's a no-op after the first. */
export function notifyUserInteracted(): void {
  if (userInteracted) return;
  userInteracted = true;
  refreshPlayback();
}

export function syncMusicToMuteState(): void {
  refreshPlayback();
}

/** Swaps the looping background track (e.g. entering Doc's Workbench) -- a no-op if already on that track. */
export function setMusicTrack(track: MusicTrack): void {
  if (track === currentTrack) return;
  currentTrack = track;
  const audio = getAudioElement();
  audio.pause();
  audio.src = `${import.meta.env.BASE_URL}${TRACK_SRC[track]}`;
  audio.currentTime = 0;
  refreshPlayback();
}
