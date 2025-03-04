

import { loadEmptyScene } from "./saveAndLoad.js";
import { scheduler_main } from "./main.js";
import { keydown, keyup } from "./keyboard.js";
import { handleClick, handleMouseDown, handleMouseUp } from "./mouse.js";
import { getCanvasHeight, getCanvasWidth, resetZoom, setBaseSize, setCanvasSquaresX, setCanvasSquaresY, zoom } from "./canvas.js";
import { loadUI, UI_DISPLAY_SIZEY } from "./ui/UIData.js";
import { initUI } from "./ui/WindowManager.js";

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
    indexCanvasSize();
}

setTimeout(scheduler_main, 0);

function indexCanvasSize() {
    let margin = 50;
    let width = window.innerWidth - margin;
    let height = window.innerHeight - margin;

    let c_baseSize = Math.ceil(height / loadUI(UI_DISPLAY_SIZEY));
    setCanvasSquaresY(loadUI(UI_DISPLAY_SIZEY));
    setCanvasSquaresX(width / c_baseSize);
    setBaseSize(c_baseSize);

    MAIN_CANVAS.width = width;
    MAIN_CANVAS.height = height; 
    initUI();
    resetZoom();
}
// addUIFunctionMap(UI_DISPLAY_SIZEY)

window.onresize = indexCanvasSize;