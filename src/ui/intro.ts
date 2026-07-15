const INTRO_PANELS: { src: string; dialogue: string }[] = [
  {
    src: "/intro/panel-1.jpg",
    dialogue: "Meow-gor stares up at the fridge, where the premium cat food waits just out of reach, as Doc Frankie looks on.",
  },
  {
    src: "/intro/panel-2.png",
    dialogue: "Doc Frankie: \"What's wrong, Meow-gor?\"",
  },
  {
    src: "/intro/panel-3.png",
    dialogue: "Meow-gor: \"I'm hungry but the food is up too high!\"",
  },
  {
    src: "/intro/panel-4.png",
    dialogue: "Doc Frankie: \"Why don't you just jump on the counter and then on the fridge?\"",
  },
  {
    src: "/intro/panel-5.png",
    dialogue: "Meow-gor: \"But the humans say I'm not allowed on the counter.\"",
  },
  {
    src: "/intro/panel-6.png",
    dialogue: "Meow-gor: \"I know! Can you make me some wings, Doc Frankie?\"",
  },
];

const SEEN_KEY = "catflight-intro-seen-v1";

export interface IntroHandle {
  replay: () => void;
}

export function mountIntro(container: HTMLElement): IntroHandle {
  let index = 0;

  const overlay = document.createElement("div");
  overlay.id = "intro-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Cat Flight introduction");
  overlay.style.display = "none";
  container.appendChild(overlay);

  function close(): void {
    overlay.style.display = "none";
    localStorage.setItem(SEEN_KEY, "1");
  }

  function advance(): void {
    if (index < INTRO_PANELS.length - 1) {
      index += 1;
      draw();
    } else {
      close();
    }
  }

  function draw(): void {
    const panel = INTRO_PANELS[index]!;
    const isLast = index === INTRO_PANELS.length - 1;
    overlay.innerHTML = `
      <div class="intro-panel-wrap">
        <img src="${panel.src}" alt="Cat Flight intro, panel ${index + 1} of ${INTRO_PANELS.length}" class="intro-panel-img" />
        <p class="sr-only">${panel.dialogue}</p>
        <div class="intro-controls">
          <span class="intro-progress">${index + 1} / ${INTRO_PANELS.length}</span>
          <button id="intro-skip" type="button">Skip</button>
          <button id="intro-next" type="button">${isLast ? "Let's fly!" : "Next"}</button>
        </div>
      </div>
    `;
    overlay.querySelector<HTMLButtonElement>("#intro-next")!.addEventListener("click", advance);
    overlay.querySelector<HTMLButtonElement>("#intro-skip")!.addEventListener("click", close);
  }

  function open(): void {
    index = 0;
    overlay.style.display = "flex";
    draw();
  }

  document.addEventListener("keydown", (event) => {
    if (overlay.style.display === "none") return;
    if (event.key === "Escape") close();
    else if (event.key === "Enter" || event.key === " " || event.key === "ArrowRight") advance();
  });

  if (!localStorage.getItem(SEEN_KEY)) {
    open();
  }

  return { replay: open };
}
