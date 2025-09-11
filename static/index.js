import { createNewWorld, decompress, gameUserStateLoad, isSaveOrLoadInProgress, loadEmptyScene, loadSlot, loadSlotData, loadSlotFromSave, purgeGameState, saveCurGame, setSaveOrLoadInProgress } from "./saveAndLoad.js";
import { resetClimateAndLighting, resetLighting, scheduler_main } from "./main.js";
import { keydown, keyup } from "./keyboard.js";
import { getLastMoveOffset, handleClick, handleMouseDown, handleMouseUp, handleTouchEnd, handleTouchMove, handleTouchStart } from "./mouse.js";
import { getBaseSize, getCanvasHeight, getCanvasWidth, isSquareOnCanvas, recacheCanvasPositions, resetZoom, setBaseSize, setCanvasSquaresX, setCanvasSquaresY, transformPixelsToCanvasSquares, zoom } from "./canvas.js";
import { addUIFunctionMap, GAMEDATA, loadGD, loadUI, saveGD, setGAMEDATA, UI_GAME_MAX_CANVAS_SQUARES_X, UI_GAME_MAX_CANVAS_SQUARES_Y, UI_MAIN_NEWWORLD_SIMHEIGHT, UI_NAME, UI_PALETTE_PASTE_MODE, UI_PALETTE_PASTE_MODE_BG, UI_PALETTE_PHYSICS, UI_PALETTE_PHYSICS_RIGID, UI_PALETTE_PHYSICS_STATIC, UI_PALLETE_MODE_PASTE, UI_SIMULATION_HEIGHT, UI_UI_CURWORLD, UI_UI_SIZE, UI_UI_WORLDNAME } from "./ui/UIData.js";
import { initUI } from "./ui/WindowManager.js";
import { addSquare } from "./squares/_sqOperations.js";
import { waterGraphReset } from "./waterGraph.js";
import { BackgroundImageSquare, ImageSquare, RigidImageSquare, StaticImageSquare } from "./squares/ImageSquare.js";

export let MAIN_CANVAS = document.getElementById("main");
export let MAIN_CONTEXT = MAIN_CANVAS.getContext('2d');

let params = new URLSearchParams(document.location.search);

export let DEBUG = params.get("debug");

const body = document.getElementById("body");

MAIN_CANVAS.addEventListener('mousemove', handleClick, false);
MAIN_CANVAS.addEventListener('mousedown', handleMouseDown);
MAIN_CANVAS.addEventListener('mouseup', handleMouseUp);

MAIN_CANVAS.onkeydown = keydown;
MAIN_CANVAS.onkeyup = keyup;
MAIN_CANVAS.onwheel = zoom;

MAIN_CANVAS.width = getCanvasWidth();
MAIN_CANVAS.height = getCanvasHeight();

document.addEventListener('touchstart', handleTouchStart, { passive: false });
document.addEventListener('touchend', handleTouchEnd, { passive: false });
document.addEventListener('touchmove', handleTouchMove, { passive: false });

window.oncontextmenu = () => false;
window.onload = function () {
    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyup);
    gameUserStateLoad();
}

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

    setBaseSize(4);

    // this is our viewport size
    setCanvasSquaresY(Math.max(Math.ceil(height / getBaseSize())), loadGD(UI_GAME_MAX_CANVAS_SQUARES_Y));
    setCanvasSquaresX(Math.floor(width / getBaseSize()));

    MAIN_CANVAS.width = width;
    MAIN_CANVAS.height = height;
    resetClimateAndLighting();
    waterGraphReset();
    initUI();
    recacheCanvasPositions();
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

addEventListener('paste', async (e) => {
    e.preventDefault();
    for (const clipboardItem of e.clipboardData.files) {
        if (clipboardItem.type.startsWith('image/')) {
            let image = await createImageBitmap(clipboardItem);
            let tempCanvas = document.createElement("canvas", { willReadFrequently: true });
            tempCanvas.width = image.width;
            tempCanvas.height = image.height;

            let tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });

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
                        if (isSquareOnCanvas(offsetX + i, offsetY + j))
                            addSquare(new targetProto(offsetX + i, offsetY + j, r, g, b, a))
                    }
                }
            }
        }
    }
});

async function handleFileDrop(ev) {
    setSaveOrLoadInProgress(true);
    // purgeGameState();

    const newWorldRes = await createNewWorld();

    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
    // Use DataTransferItemList interface to access the file(s)
    let item = [...ev.dataTransfer.items].at(0);
    if (item.kind === "file") {
        const file = item.getAsFile();
        const saveFile = await file.text();
        const decompressedSave = await decompress(saveFile);
        const saveObj = JSON.parse(decompressedSave);
        loadSlotFromSave(saveObj);

        saveGD(UI_NAME, saveObj.gamedata.UI_NAME);
        loadUI(UI_UI_WORLDNAME)[loadUI(UI_UI_CURWORLD)] = loadGD(UI_NAME);
        // await saveCurGame();
        setSaveOrLoadInProgress(false);
    }
};
window.addEventListener("dragover", (e) => {
    e.preventDefault();
});
window.addEventListener("drop", (e) => {
    e.preventDefault();
});

MAIN_CANVAS.addEventListener("drop", handleFileDrop);

setTimeout(scheduler_main, 0);
