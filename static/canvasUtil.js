import { MAIN_CONTEXT } from "./index.js";
import { isKeyPressed, KEY_CONTROL, KEY_SHIFT } from "./keyboard.js";
import { getLastMoveOffset, isMiddleMouseClicked } from "./mouse.js";
import { loadGD, saveGD, UI_PALETTE_SIZE, UI_PALETTE_STRENGTH, UI_UI_SIZE, UI_PALETTE_BLOCKS, loadUI, UI_PALETTE_SURFACE, UI_LIGHTING_SURFACE, UI_PALETTE_SELECT, UI_GAME_MAX_CANVAS_SQUARES_X, UI_GAME_MAX_CANVAS_SQUARES_Y, UI_CANVAS_VIEWPORT_CENTER_X, UI_CANVAS_VIEWPORT_CENTER_Y, UI_CANVAS_SQUARES_ZOOM } from "./ui/UIData.js";

let BASE_SIZE = 4;
let CANVAS_SQUARES_X = 192;
let CANVAS_SQUARES_Y = 108;

let zoom_arr = new Array();
let neutral_zoom_idx = zoom_arr.length;
function resetZoomArr() {
    zoom_arr = new Array();
    neutral_zoom_idx = zoom_arr.length;
    for (let i = 1; i < 20; i += 1) {
        zoom_arr.push(i);
    }
}

let lastMouseWheelState = 0;

export function getSingletonMouseWheelState() {
    // reasoning - if we're calling this method, we're catching a mouse wheel scroll state, right? 
    // and you probably don't want to scroll on two things at once. so it's fine for this to be a global
    let ret = structuredClone(lastMouseWheelState);
    lastMouseWheelState = 0;
    return ret;
}

export function getCurZoom() {
    return zoom_arr.at(loadGD(UI_CANVAS_SQUARES_ZOOM));
}


export function zoom(event) {
    event.preventDefault();
    if (loadGD(UI_PALETTE_BLOCKS)) {
        if (isKeyPressed(KEY_SHIFT)) {
            if (loadGD(UI_PALETTE_SELECT) == loadGD(UI_PALETTE_SURFACE)) {
                saveGD(UI_LIGHTING_SURFACE, Math.max(.0000001, Math.min(.999999999, loadGD(UI_LIGHTING_SURFACE) + event.deltaY * .00005)));
                return;
            }
            let strength = loadGD(UI_PALETTE_STRENGTH);
            if (event.deltaY > 0) {
                strength *= (0.999 ** event.deltaY);
            } else {
                for (let i = 0; i < Math.abs(event.deltaY); i++) {
                    strength += (1 - strength) * 0.001;
                }
            }
            saveGD(UI_PALETTE_STRENGTH, strength);
            return;
        }

        if (isKeyPressed(KEY_CONTROL)) {
            let size = loadGD(UI_PALETTE_SIZE);
            size += event.deltaY * 0.005;
            size = Math.min(Math.max(size, 0), 14)
            saveGD(UI_PALETTE_SIZE, size);
            return;
        }
    }
    doZoom(event.deltaY);
}



export function doZoom(deltaY) {
    let lastMoveOffset = getLastMoveOffset();
    if (lastMoveOffset == null || isMiddleMouseClicked()) {
        return;
    }
    let totalWidth = CANVAS_SQUARES_X * BASE_SIZE;
    let totalHeight = CANVAS_SQUARES_Y * BASE_SIZE;

    let x = 1 - lastMoveOffset.x / totalWidth;
    let y = 1 - lastMoveOffset.y / totalHeight;
    let startZoom = getCurZoom();

    let zoom_idx = loadGD(UI_CANVAS_SQUARES_ZOOM);

    if (deltaY < 0) {
        zoom_idx = Math.min(zoom_arr.length - 1, zoom_idx + 1);
    } else {
        zoom_idx = Math.max(0, zoom_idx - 1);
    }

    saveGD(UI_CANVAS_SQUARES_ZOOM, zoom_idx);

    //  Math.min(Math.max(getCurZoom() + deltaY * -0.001, 1), 100);
    let endZoom = getCurZoom();

    let startWidth = totalWidth / startZoom;
    let endWidth = totalWidth / endZoom;

    let startHeight = totalHeight / startZoom;
    let endHeight = totalHeight / endZoom;

    let widthDiff = endWidth - startWidth;
    let heightDiff = endHeight - startHeight;

    saveGD(UI_CANVAS_VIEWPORT_CENTER_X, loadGD(UI_CANVAS_VIEWPORT_CENTER_X) + Math.floor((widthDiff * (x - 0.5))));
    saveGD(UI_CANVAS_VIEWPORT_CENTER_Y, loadGD(UI_CANVAS_VIEWPORT_CENTER_Y) + Math.floor((heightDiff * (y - 0.5))));
    recacheCanvasPositions();
}
export function resetZoom() {
    saveGD(UI_CANVAS_VIEWPORT_CENTER_X, 5000);
    saveGD(UI_CANVAS_VIEWPORT_CENTER_Y, 5000);


    saveGD(UI_CANVAS_SQUARES_ZOOM, 2);
    recacheCanvasPositions();
}

export function canvasPanRoutine() {
    if (!isMiddleMouseClicked())
        return;
    panCanvas();
}

let canvasLastMoveOffset = {x: 0, y: 0};

export function resetCanvasLastMoveOffset() {
    canvasLastMoveOffset = getLastMoveOffset();
}

function panCanvas() {
    let llmo = canvasLastMoveOffset;
    let lmo = getLastMoveOffset();
    let dx = llmo.x - lmo.x;
    let dy = llmo.y - lmo.y;
    moveCamera(dx, dy, 1/(getCurZoom()));
    canvasLastMoveOffset = lmo;
}

export function moveCamera(x, y, mult=40) {
    saveGD(UI_CANVAS_VIEWPORT_CENTER_X, Math.round(loadGD(UI_CANVAS_VIEWPORT_CENTER_X) + x * mult));
    saveGD(UI_CANVAS_VIEWPORT_CENTER_Y, Math.round(loadGD(UI_CANVAS_VIEWPORT_CENTER_Y) + y * mult));
    recacheCanvasPositions();
}