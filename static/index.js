import { gameUserStateLoad } from "./saveAndLoad.js";
import { resetClimateAndLighting, resetLighting, scheduler_main } from "./main.js";
import { keydown, keyup } from "./keyboard.js";
import { getLastMoveOffset, handleClick, handleMouseDown, handleMouseUp, handleTouchEnd, handleTouchMove, handleTouchStart } from "./mouse.js";
import { getBaseSize, getCanvasHeight, getCanvasWidth, resetZoom, setBaseSize, setCanvasSquaresX, setCanvasSquaresY, transformPixelsToCanvasSquares, zoom } from "./canvas.js";
import { addUIFunctionMap, loadGD, saveGD, UI_MAIN_NEWWORLD_SIMHEIGHT, UI_PALETTE_PASTE_MODE, UI_PALETTE_PASTE_MODE_BG, UI_PALETTE_PHYSICS, UI_PALETTE_PHYSICS_RIGID, UI_PALETTE_PHYSICS_STATIC, UI_PALLETE_MODE_PASTE, UI_SIMULATION_HEIGHT, UI_UI_SIZE } from "./ui/UIData.js";
import { initUI } from "./ui/WindowManager.js";
import { addSquare } from "./squares/_sqOperations.js";
import { waterGraphReset } from "./waterGraph.js";
import { BackgroundImageSquare, ImageSquare, RigidImageSquare, StaticImageSquare } from "./squares/ImageSquare.js";

export let MAIN_CANVAS = document.getElementById("main");
export let MAIN_CONTEXT = MAIN_CANVAS.getContext('2d');

const body = document.getElementById("body");

MAIN_CANVAS.addEventListener('mousemove', handleClick, false);
MAIN_CANVAS.addEventListener('mousedown', handleMouseDown);
MAIN_CANVAS.addEventListener('mouseup', handleMouseUp);

MAIN_CANVAS.onkeydown = keydown;
MAIN_CANVAS.onkeyup = keyup;
MAIN_CANVAS.onwheel = zoom;

MAIN_CANVAS.width = getCanvasWidth();
MAIN_CANVAS.height = getCanvasHeight();

document.addEventListener('contextmenu', (e) => e.preventDefault());

document.addEventListener('touchstart', handleTouchStart, { passive: false });
document.addEventListener('touchend', handleTouchEnd, { passive: false });
document.addEventListener('touchmove', handleTouchMove, { passive: false });

window.oncontextmenu = () => false;
window.onload = function () {
    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyup);
    gameUserStateLoad();
}

setTimeout(scheduler_main, 0);

let width = 0;
let height = 0;

export function getTotalCanvasPixelWidth() { return width; }
export function getTotalCanvasPixelHeight() { return height; }

export function _resetLighting() {
    resetLighting();
}

export function indexCanvasSize(shouldInitUIClimateAndLighting = true) {
    let margin = 0;
    width = Math.floor(window.innerWidth - margin);
    height = Math.floor(window.innerHeight - margin);
    setBaseSize(Math.floor(height / loadGD(UI_SIMULATION_HEIGHT)));
    while (getBaseSize() % 4 != 0 && getBaseSize() > 1)
        setBaseSize(getBaseSize() - 1);

    setCanvasSquaresY(Math.floor(height / getBaseSize()));
    setCanvasSquaresX(Math.floor(width / getBaseSize()));

    MAIN_CANVAS.width = width;
    MAIN_CANVAS.height = height;
    resetClimateAndLighting();
    waterGraphReset();
    initUI();
    resetZoom();
}

addUIFunctionMap(UI_SIMULATION_HEIGHT, () => {
    saveGD(UI_MAIN_NEWWORLD_SIMHEIGHT, loadGD(UI_SIMULATION_HEIGHT));
    indexCanvasSize(false);
});

addUIFunctionMap(UI_UI_SIZE, initUI)

let backgroundColor = "#FFFFFF";
export function setBackgroundColor(hexColor) {
    backgroundColor = hexColor;
    body.style = "background-color: " + hexColor
}
export function getCurBackgroundColor() {
    return backgroundColor;
}

window.onresize = indexCanvasSize;
// window.onblur = saveCurGame;
document.documentElement.style.overflow = 'hidden';  // firefox, chrome
document.addEventListener('paste', async (e) => {
    e.preventDefault();
    for (const clipboardItem of e.clipboardData.files) {
        if (clipboardItem.type.startsWith('image/')) {
            let image = await createImageBitmap(clipboardItem);
            let tempCanvas = document.createElement("canvas", {willReadFrequently: true});
            tempCanvas.width = image.width;
            tempCanvas.height = image.height;
            
            let tempCtx = tempCanvas.getContext("2d", {willReadFrequently: true});

            let lastMoveOffset = getLastMoveOffset();
            if (lastMoveOffset == null) {
                return;
            }
            if (lastMoveOffset.x > getCanvasWidth() || lastMoveOffset > getCanvasHeight()) {
                return;
            }
            let offsetTransformed = transformPixelsToCanvasSquares(lastMoveOffset.x, lastMoveOffset.y);
            let offsetX = Math.round(offsetTransformed[0]);
            let offsetY = Math.round(offsetTransformed[1]);
            tempCtx.drawImage(image, 0, 0);

            for (let i = 0; i < image.width; i++) {
                for (let j = 0; j < image.height; j++) {
                    let r = tempCtx.getImageData(i, j, 1, 1).data[0];
                    let g = tempCtx.getImageData(i, j, 1, 1).data[1];
                    let b = tempCtx.getImageData(i, j, 1, 1).data[2];
                    let a = tempCtx.getImageData(i, j, 1, 1).data[3] / 255;
                    if (a > (50 / 255)) {
                        let targetProto = ImageSquare;
                        if (loadGD(UI_PALETTE_PASTE_MODE) == UI_PALETTE_PASTE_MODE_BG) {
                            targetProto = BackgroundImageSquare;
                        } else if (loadGD(UI_PALETTE_PHYSICS) == UI_PALETTE_PHYSICS_STATIC) {
                            targetProto = StaticImageSquare;
                        } else if (loadGD(UI_PALETTE_PHYSICS) == UI_PALETTE_PHYSICS_RIGID) {
                            targetProto = RigidImageSquare;
                        }
                        addSquare(new targetProto(offsetX + i, offsetY + j, r, g, b, a))
                    }
                }
            }
        }
    }
});