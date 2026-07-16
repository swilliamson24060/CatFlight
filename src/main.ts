import "./style.css";
import { mountApp } from "./ui/app";
import { mountAudioControls } from "./ui/audioControls";
import { mountHowToPlay } from "./ui/howToPlay";
import { mountIntro } from "./ui/intro";

const root = document.querySelector<HTMLDivElement>("#app")!;
mountApp(root);
const howToPlay = mountHowToPlay(document.body, () => intro.replay());
const intro = mountIntro(document.body, () => howToPlay.maybeAutoOpen());
mountAudioControls(document.body);
