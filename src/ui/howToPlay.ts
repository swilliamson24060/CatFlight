const HELP_HTML = `
  <h2>How to Play</h2>
  <ol>
    <li><strong>Scavenge &amp; Grid</strong> — Click a countertop item to hold it, Rotate to flip it, then click a grid cell to place it. Click a placed item to pick it back up. Junk items waste grid space but cost nothing else. Decals auto-collect into your pouch. If you've unlocked Lucky Paw, Reroll regenerates the countertop.</li>
    <li><strong>Alchemist's Kitchen</strong> — Pick one item per bin (Frame / Skin / Engine) to assemble your craft. The preview shows your projected stats before you commit.</li>
    <li><strong>Test Flight Simulation</strong> — Launch! checks three gates in order: Launch (Thrust), Midflight (Durability), and Landing (Drag/Weight glide ratio). Clearing all three wins the run. Share your craft afterward with a code or a downloadable PNG card.</li>
    <li><strong>Mousehole HQ</strong> — Spend scrap earned from flights on permanent upgrades: a bigger grid, less junk, or free countertop rerolls.</li>
  </ol>
  <p>Rare and uncommon color rolls give stat bonuses and show a &#9733; or &#10022; badge on the finished craft, independent of hue.</p>
`;

export function mountHowToPlay(container: HTMLElement): void {
  const button = document.createElement("button");
  button.id = "how-to-play-btn";
  button.type = "button";
  button.textContent = "How to Play";
  container.appendChild(button);

  const overlay = document.createElement("div");
  overlay.id = "how-to-play-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "How to Play");
  overlay.style.display = "none";
  overlay.innerHTML = `
    <div class="how-to-play-panel">
      ${HELP_HTML}
      <button id="how-to-play-close" type="button">Close</button>
    </div>
  `;
  container.appendChild(overlay);

  function setOpen(open: boolean): void {
    overlay.style.display = open ? "flex" : "none";
  }

  button.addEventListener("click", () => setOpen(true));
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) setOpen(false);
  });
  overlay.querySelector<HTMLButtonElement>("#how-to-play-close")!.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
}
