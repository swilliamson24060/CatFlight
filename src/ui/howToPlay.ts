const HELP_HTML = `
  <h2>How to Play</h2>
  <ol>
    <li><strong>Doc's Workshop</strong> — At the start of a new blueprint, Doc tells you what he needs this time: Wing Membranes, Engine Parts, Structural Parts, and Harness Material, in random amounts. That's your target for the trip.</li>
    <li><strong>The Kitchen</strong> — Every trip starts with a blank 5x5 carry grid. 5 appliances are available, but you can only search 3 of them before heading back — choose wisely. Click one to search it — you'll only see an object's name and size, not what it's useful for. Keep the ones you want (Rotate to flip, click a grid cell to place), Discard the rest. A device might be all scrap, all useful, or a mix — you won't know until Doc looks it over.</li>
    <li><strong>Doc's Workbench</strong> — This is where everything gets identified. Assign what you found to each of the 6 real categories (a piece good for two, like a cord, can only be claimed by one) — the moment you assign a piece it's locked in for good (marked with &#128274;) and permanently off the grid, counting toward the blueprint no matter how many more trips it takes. Doc will always assemble something, even from a partial haul, but the closer you get to the blueprint's quotas, the better your odds in the air. Decoration is optional and never required — sparkly extras score bonus points, and a few special "Fly Better" decorations also nudge your stats. Not feeling ready? Return to the Kitchen for another trip before you assemble — no flight attempt spent, and next trip's grid starts blank again (anything you found but didn't assign this trip is gone, so decide before you head back).</li>
    <li><strong>Test Flight Simulation</strong> — Launch! Your blueprint fulfillment percentage is your odds of a clean flight — a lucky roll can pull off a win even with a middling haul, but only 100% fulfillment guarantees it. A bad roll still crashes somewhere that matches how far off you were: badly short and you won't get off the ground, partway there and you'll crash mid-flight or miss the landing. Clearing it wins the run and banks a Score — fewer kitchen trips before a successful flight means a higher Score. A crash doesn't end anything: you head straight back to the kitchen with everything you've already carried, for another trip. Share a successful craft with a code or a downloadable PNG card.</li>
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
