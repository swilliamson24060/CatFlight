const HELP_HTML = `
  <h2>How to Play</h2>
  <ol>
    <li><strong>The Kitchen</strong> — Doc's blueprint lists what he needs: Wing Membrane, Power Source, Wing Flapper, Aerodynamic Helper, Attachment, and Harness pieces. Click a kitchen appliance to search it — you'll only see an object's name and size, not what it's useful for. Keep the ones you want (Rotate to flip, click a grid cell to place), Discard the rest. A device might be all scrap, all useful, or a mix — you won't know until Doc looks it over.</li>
    <li><strong>Doc's Workbench</strong> — This is where everything gets identified. Fill each category's quota from what you found (a piece good for two categories, like a cord, can only be claimed by one). Decoration is optional and never required — sparkly extras score bonus points, and a few special "Fly Better" decorations also nudge your stats.</li>
    <li><strong>Test Flight Simulation</strong> — Launch! checks three gates in order: Launch (Thrust), Midflight (Durability), and Landing (Drag/Weight glide ratio). Clearing all three wins the run and banks a Score — fewer kitchen trips before a successful flight means a higher Score. A crash doesn't end anything: you head straight back to the kitchen with everything you've already carried, for another trip. Share a successful craft with a code or a downloadable PNG card.</li>
    <li><strong>Mousehole HQ</strong> — Spend scrap earned from flights on permanent upgrades: a bigger grid, less junk, or free rerolls. Spare Parts, earned from pieces left over after a successful build, fund a separate set of upgrades that make future blueprints easier to satisfy.</li>
  </ol>
  <p>Rare and uncommon color rolls give stat bonuses and show a &#9733; or &#10022; badge on the finished craft, independent of hue.</p>
`;

export function mountHowToPlay(container: HTMLElement, onReplayIntro: () => void): void {
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
      <button id="replay-intro-btn" type="button">Watch Intro Again</button>
      <button id="how-to-play-close" type="button">Close</button>
    </div>
  `;
  container.appendChild(overlay);

  overlay.querySelector<HTMLButtonElement>("#replay-intro-btn")!.addEventListener("click", () => {
    overlay.style.display = "none";
    onReplayIntro();
  });

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
