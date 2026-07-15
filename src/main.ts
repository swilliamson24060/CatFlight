import "./style.css";
import { mountApp } from "./ui/app";
import { mountHowToPlay } from "./ui/howToPlay";

const root = document.querySelector<HTMLDivElement>("#app")!;
mountApp(root);
mountHowToPlay(document.body);
