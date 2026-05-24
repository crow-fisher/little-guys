import { MainManager } from "./mainManager.js";

window.oncontextmenu = () => false;

const mainManager = new MainManager();


window.onresize = () => mainManager.onresize();



mainManager.main();