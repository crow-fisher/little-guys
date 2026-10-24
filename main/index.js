import { MainManager } from "./mainManager.js";

window.oncontextmenu = () => false;

const mainManager = new MainManager();

window.onresize = () => mainManager.onresize();

document.addEventListener("pointerlockchange", (event) => { {
    if (!document.pointerLockElement) {
        mainManager.canvasManager.pointerLock = false;
    }
}})

mainManager.main();