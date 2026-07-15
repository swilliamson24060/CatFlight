import { isMuted } from "./sfx";

const MUSIC_VOLUME = 0.35;

let audioEl: HTMLAudioElement | null = null;
let userInteracted = false;

function getAudioElement(): HTMLAudioElement {
  if (!audioEl) {
    audioEl = new Audio(`${import.meta.env.BASE_URL}audio/caper-a-montmartre.mp3`);
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
