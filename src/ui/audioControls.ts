import { notifyUserInteracted, syncMusicToMuteState } from "../audio/music";
import { isMuted, playClick, toggleMuted } from "../audio/sfx";

export function mountAudioControls(container: HTMLElement): void {
  const button = document.createElement("button");
  button.id = "mute-btn";
  button.type = "button";

  function updateLabel(): void {
    button.textContent = isMuted() ? "🔇 Sound Off" : "🔊 Sound On";
  }
  updateLabel();

  button.addEventListener("click", () => {
    toggleMuted();
    syncMusicToMuteState();
    updateLabel();
  });
  container.appendChild(button);

  document.addEventListener("click", (event) => {
    notifyUserInteracted();
    const target = event.target as HTMLElement;
    const clickedButton = target.closest("button");
    if (clickedButton && clickedButton.id !== "mute-btn") {
      playClick();
    }
  });
}
