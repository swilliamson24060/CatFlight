const INTRO_PANELS: { src: string; dialogue: string }[] = [
  {
    src: `${import.meta.env.BASE_URL}intro/panel-1.jpg`,
    dialogue: "Meow-gor stares up at the fridge, where the premium cat food waits just out of reach, as Doc Frankie looks on.",
  },
  {
    src: `${import.meta.env.BASE_URL}intro/panel-2.png`,
    dialogue: "Doc Frankie: \"What's wrong, Meow-gor?\"",
  },
  {
    src: `${import.meta.env.BASE_URL}intro/panel-3.png`,
    dialogue: "Meow-gor: \"I'm hungry but the food is up too high!\"",
  },
  {
    src: `${import.meta.env.BASE_URL}intro/panel-4.png`,
    dialogue: "Doc Frankie: \"Why don't you just jump on the counter and then on the fridge?\"",
  },
  {
    src: `${import.meta.env.BASE_URL}intro/panel-5.png`,
    dialogue: "Meow-gor: \"But the humans say I'm not allowed on the counter.\"",
  },
  {
    src: `${import.meta.env.BASE_URL}intro/panel-6.png`,
    dialogue: "Meow-gor: \"I know! Can you make me some wings, Doc Frankie?\"",
  },
];

const SEEN_KEY = "catflight-intro-seen-v1";

export interface IntroHandle {
  replay: () => void;
}

/** `onClose` fires once, right after the intro's first auto-shown viewing this session ends
 * (immediately, if the intro was already seen on a prior visit) -- used to chain the How to Play
 * modal in right after, without the two overlays racing each other open at once. */
export function mountIntro(container: HTMLElement, onClose?: () => void): IntroHandle {
  let index = 0;
  let hasFiredCloseCallback = false;

  const overlay = document.createElement("div");
  overlay.id = "intro-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Cat Flight introduction");
  overlay.style.display = "none";
  container.appendChild(overlay);

  function fireCloseCallbackOnce(): void {
    if (hasFiredCloseCallback) return;
    hasFiredCloseCallback = true;
    onClose?.();
  }

  function close(): void {
    overlay.style.display = "none";
    localStorage.setItem(SEEN_KEY, "1");
    fireCloseCallbackOnce();
  }

  function advance(): void {
    if (index < INTRO_PANELS.length - 1) {
      index += 1;
      draw();
    } else {
      close();
    }
  }

  function back(): void {
    if (index > 0) {
      index -= 1;
      draw();
    }
  }

  function draw(): void {
    const panel = INTRO_PANELS[index]!;
    const isFirst = index === 0;
    const isLast = index === INTRO_PANELS.length - 1;
    overlay.innerHTML = `
      <div class="intro-panel-wrap">
        <img src="${panel.src}" alt="Cat Flight intro, panel ${index + 1} of ${INTRO_PANELS.length}" class="intro-panel-img" />
        <p class="sr-only">${panel.dialogue}</p>
        <div class="intro-controls">
          <span class="intro-progress">${index + 1} / ${INTRO_PANELS.length}</span>
          <button id="intro-skip" type="button">Skip</button>
          <button id="intro-prev" type="button" ${isFirst ? "disabled" : ""}>Previous</button>
          <button id="intro-next" type="button">${isLast ? "Let's fly!" : "Next"}</button>
        </div>
      </div>
    `;
    overlay.querySelector<HTMLButtonElement>("#intro-next")!.addEventListener("click", advance);
    overlay.querySelector<HTMLButtonElement>("#intro-prev")!.addEventListener("click", back);
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
    else if (event.key === "ArrowLeft") back();
  });

  if (!localStorage.getItem(SEEN_KEY)) {
    open();
  } else {
    fireCloseCallbackOnce();
  }

  return { replay: open };
}
