

import { loadEmptyScene } from "./saveAndLoad.js";
import { scheduler_main } from "./main.js";
import { keydown, keyup } from "./keyboard.js";
import { handleClick, handleMouseDown, handleMouseUp } from "./mouse.js";
import { getCanvasHeight, getCanvasWidth, zoom } from "./canvas.js";

export var MAIN_CANVAS = document.getElementById("main");
export var MAIN_CONTEXT = MAIN_CANVAS.getContext('2d');

MAIN_CANVAS.addEventListener('mousemove', handleClick, false);
MAIN_CANVAS.addEventListener('mousedown', handleMouseDown);
MAIN_CANVAS.addEventListener('mouseup', handleMouseUp);

MAIN_CANVAS.onkeydown = keydown;
MAIN_CANVAS.onkeyup = keyup;
MAIN_CANVAS.onwheel = zoom;

MAIN_CANVAS.width = getCanvasWidth();
MAIN_CANVAS.height = getCanvasHeight();

document.addEventListener('contextmenu', (e) => e.preventDefault());

window.oncontextmenu = () => false;
window.onload = function () {
    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyup);
    loadEmptyScene();
}

setTimeout(scheduler_main, 0);
