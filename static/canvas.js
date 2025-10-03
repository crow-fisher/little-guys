import { reset } from "./globalOperations.js";
import { MAIN_CONTEXT } from "./index.js";
import { isKeyPressed, KEY_CONTROL, KEY_SHIFT } from "./keyboard.js";
import { getLastLastMoveOffset, getLastMoveOffset, isMiddleMouseClicked } from "./mouse.js";
import { iterateOnOrganisms } from "./organisms/_orgOperations.js";
import { loadGD, saveGD, UI_PALETTE_SIZE, UI_PALETTE_STRENGTH, UI_UI_SIZE, UI_PALETTE_BLOCKS, loadUI, UI_PALETTE_SURFACE, UI_LIGHTING_SURFACE, UI_PALETTE_SELECT, UI_GAME_MAX_CANVAS_SQUARES_X, UI_GAME_MAX_CANVAS_SQUARES_Y, UI_CANVAS_VIEWPORT_CENTER_X, UI_CANVAS_VIEWPORT_CENTER_Y, UI_CANVAS_SQUARES_ZOOM, UI_CANVAS_VIEWPORT_FRAC_X, UI_CANVAS_VIEWPORT_FRAC_Y } from "./ui/UIData.js";

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

export function getCurZoom() {
    return zoom_arr.at(loadGD(UI_CANVAS_SQUARES_ZOOM));
}


export function getBaseSize() {
    return BASE_SIZE;
}
export function setBaseSize(newSize) {
    BASE_SIZE = newSize;
    resetZoomArr();
}

export function getBaseUISize() {
    return loadUI(UI_UI_SIZE);
}

export function setCanvasSquaresX(val) {
    CANVAS_SQUARES_X = Math.floor(val);
    saveGD(UI_GAME_MAX_CANVAS_SQUARES_X, Math.max(loadGD(UI_GAME_MAX_CANVAS_SQUARES_X), (CANVAS_SQUARES_X + 1)));
}
export function getCanvasSquaresX() {
    return CANVAS_SQUARES_X;
}
export function setCanvasSquaresY(val) {
    CANVAS_SQUARES_Y = Math.floor(val);
    saveGD(UI_GAME_MAX_CANVAS_SQUARES_Y, Math.max(loadGD(UI_GAME_MAX_CANVAS_SQUARES_Y), (CANVAS_SQUARES_Y + 1)));
}

export function getCanvasSquaresY() {
    return CANVAS_SQUARES_Y;
}
export function transformPixelsToCanvasSquares(x, y) {
    let totalWidth = CANVAS_SQUARES_X * BASE_SIZE;
    let totalHeight = CANVAS_SQUARES_Y * BASE_SIZE;

    let windowWidth = totalWidth / getCurZoom();
    let windowHeight = totalHeight / getCurZoom();

    let canvasWindowWidth = CANVAS_SQUARES_X / getCurZoom();
    let canvasWindowHeight = CANVAS_SQUARES_Y / getCurZoom();

    let windowWidthStart = loadGD(UI_CANVAS_VIEWPORT_CENTER_X) - (windowWidth / 2);
    let windowHeightStart = loadGD(UI_CANVAS_VIEWPORT_CENTER_Y) - (windowHeight / 2);

    let canvasWindowWidthStart = windowWidthStart / BASE_SIZE;
    let canvasWindowHeightStart = windowHeightStart / BASE_SIZE;

    let xpi = x / totalWidth;
    let ypi = y / totalHeight;

    return [canvasWindowWidthStart + xpi * canvasWindowWidth, canvasWindowHeightStart + ypi * canvasWindowHeight];
}



let frameXMin = 0;
let frameXMax = 0;
let frameYMin = 0;
let frameYMax = 0;

export function getFrameXMin() { return frameXMin; }
export function getFrameXMax() { return frameXMax; }
export function getFrameYMin() { return frameYMin; }
export function getFrameYMax() { return frameYMax; }

function resetCornerLocations() {
    let width = getCanvasWidth() / getCurZoom() / getBaseSize();
    let height = getCanvasHeight() / getCurZoom() / getBaseSize();

    let cx = loadGD(UI_CANVAS_VIEWPORT_CENTER_X) / getBaseSize();
    let cy = loadGD(UI_CANVAS_VIEWPORT_CENTER_Y) / getBaseSize();

    frameXMin = Math.floor(Math.max(0, cx - (width / 2)));
    frameXMax = Math.ceil(cx + (width / 2));
    frameYMin = Math.floor(Math.max(0, cy - (height / 2)));
    frameYMax = Math.ceil(cy + (height / 2));
}


let _c_UI_CANVAS_SQUARES_ZOOM = getCurZoom();
let _c_UI_CANVAS_VIEWPORT_CENTER_X = loadGD(UI_CANVAS_VIEWPORT_CENTER_X);
let _c_UI_CANVAS_VIEWPORT_CENTER_Y = loadGD(UI_CANVAS_VIEWPORT_CENTER_Y);

function cameraBoundsCheck() {
    let w2 = (getCanvasWidth() / getCurZoom()) / 2;
    let h2 = (getCanvasHeight() / getCurZoom()) / 2;

    let xMin = w2;
    let yMin = h2;

    let xMax = loadGD(UI_GAME_MAX_CANVAS_SQUARES_X) * getBaseSize() - w2;
    let yMax = loadGD(UI_GAME_MAX_CANVAS_SQUARES_Y) * getBaseSize() - h2;

    saveGD(UI_CANVAS_VIEWPORT_CENTER_X, Math.min(xMax, Math.max(xMin, loadGD(UI_CANVAS_VIEWPORT_CENTER_X))));
    saveGD(UI_CANVAS_VIEWPORT_CENTER_Y, Math.min(yMax, Math.max(yMin, loadGD(UI_CANVAS_VIEWPORT_CENTER_Y))));
}

export function recacheCanvasPositions() {
    // 14 fps to 16 fps, 63k squares
    cameraBoundsCheck();
    _c_UI_CANVAS_SQUARES_ZOOM = getCurZoom();
    _c_UI_CANVAS_VIEWPORT_CENTER_X = loadGD(UI_CANVAS_VIEWPORT_CENTER_X);
    _c_UI_CANVAS_VIEWPORT_CENTER_Y = loadGD(UI_CANVAS_VIEWPORT_CENTER_Y);
    resetCornerLocations();
}

export function isSquareOnCanvas(x, y, dx=1, dy=1) {
    let totalWidth = getCanvasSquaresX() * BASE_SIZE;
    let totalHeight = getCanvasSquaresY() * BASE_SIZE;

    x *= BASE_SIZE;
    y *= BASE_SIZE;

    let windowWidth = totalWidth / _c_UI_CANVAS_SQUARES_ZOOM;
    let windowHeight = totalHeight / _c_UI_CANVAS_SQUARES_ZOOM;

    let windowWidthStart = _c_UI_CANVAS_VIEWPORT_CENTER_X - (windowWidth / 2);
    let windowHeightStart = _c_UI_CANVAS_VIEWPORT_CENTER_Y - (windowHeight / 2);

    let windowWidthEnd = _c_UI_CANVAS_VIEWPORT_CENTER_X + (windowWidth / 2);
    let windowHeightEnd = _c_UI_CANVAS_VIEWPORT_CENTER_Y + (windowHeight / 2);

    let margin = getBaseSize() * 2;

    if (x < (windowWidthStart - margin) || x > (windowWidthEnd + margin) || y < (windowHeightStart - margin) || y > (windowHeightEnd + margin))
        return false;
    return true;
}

export function zoomCanvasFillRect(x, y, dx, dy) {
    dx *= _c_UI_CANVAS_SQUARES_ZOOM;
    dy *= _c_UI_CANVAS_SQUARES_ZOOM;

    let totalWidth = CANVAS_SQUARES_X * BASE_SIZE;
    let totalHeight = CANVAS_SQUARES_Y * BASE_SIZE;

    let windowWidth = totalWidth / _c_UI_CANVAS_SQUARES_ZOOM;
    let windowHeight = totalHeight / _c_UI_CANVAS_SQUARES_ZOOM;

    let windowWidthStart = _c_UI_CANVAS_VIEWPORT_CENTER_X - (windowWidth / 2);
    let windowHeightStart = _c_UI_CANVAS_VIEWPORT_CENTER_Y - (windowHeight / 2);

    let windowWidthEnd = _c_UI_CANVAS_VIEWPORT_CENTER_X + (windowWidth / 2);
    let windowHeightEnd = _c_UI_CANVAS_VIEWPORT_CENTER_Y + (windowHeight / 2);

    let xpi = (x - windowWidthStart) / (windowWidthEnd - windowWidthStart);
    let ypi = (y - windowHeightStart) / (windowHeightEnd - windowHeightStart);

    let xpl = xpi * totalWidth;
    let ypl = ypi * totalHeight;

    MAIN_CONTEXT.fillRect(
        xpl,
        ypl,
        dx,
        dy
    );
}

export function zoomCanvasFillCircle(x, y, size) {
    let totalWidth = CANVAS_SQUARES_X * BASE_SIZE;
    let totalHeight = CANVAS_SQUARES_Y * BASE_SIZE;

    let windowWidth = totalWidth / getCurZoom();
    let windowHeight = totalHeight / getCurZoom();

    let windowWidthStart = loadGD(UI_CANVAS_VIEWPORT_CENTER_X) - (windowWidth / 2);
    let windowHeightStart = loadGD(UI_CANVAS_VIEWPORT_CENTER_Y) - (windowHeight / 2);

    let windowWidthEnd = loadGD(UI_CANVAS_VIEWPORT_CENTER_X) + (windowWidth / 2);
    let windowHeightEnd = loadGD(UI_CANVAS_VIEWPORT_CENTER_Y) + (windowHeight / 2);

    let xpi = (x - windowWidthStart) / (windowWidthEnd - windowWidthStart);
    let ypi = (y - windowHeightStart) / (windowHeightEnd - windowHeightStart);
    let xpl = xpi * totalWidth;
    let ypl = ypi * totalHeight;
    MAIN_CONTEXT.beginPath();
    MAIN_CONTEXT.arc(xpl, ypl, size * getCurZoom(), 0, 2 * Math.PI, false);
    MAIN_CONTEXT.fill();
}

export function transformCanvasSquaresToPixels(x, y) {
    let totalWidth = CANVAS_SQUARES_X * BASE_SIZE;
    let totalHeight = CANVAS_SQUARES_Y * BASE_SIZE;

    let windowWidth = totalWidth / getCurZoom();
    let windowHeight = totalHeight / getCurZoom();

    let windowWidthStart = loadGD(UI_CANVAS_VIEWPORT_CENTER_X) - (windowWidth / 2);
    let windowHeightStart = loadGD(UI_CANVAS_VIEWPORT_CENTER_Y) - (windowHeight / 2);

    let windowWidthEnd = loadGD(UI_CANVAS_VIEWPORT_CENTER_X) + (windowWidth / 2);
    let windowHeightEnd = loadGD(UI_CANVAS_VIEWPORT_CENTER_Y) + (windowHeight / 2);

    let xpi = (x - windowWidthStart) / (windowWidthEnd - windowWidthStart);
    let ypi = (y - windowHeightStart) / (windowHeightEnd - windowHeightStart);

    let xpl = xpi * totalWidth;
    let ypl = ypi * totalHeight;

    return [xpl, ypl];
}

export function zoomCanvasFillRectTheta(x, y, dx, dy, xRef, yRef, theta) {
    dx *= (getCurZoom());
    dy *= (getCurZoom());

    let totalWidth = CANVAS_SQUARES_X * BASE_SIZE;
    let totalHeight = CANVAS_SQUARES_Y * BASE_SIZE;

    let windowWidth = totalWidth / getCurZoom();
    let windowHeight = totalHeight / getCurZoom();

    let windowWidthStart = loadGD(UI_CANVAS_VIEWPORT_CENTER_X) - (windowWidth / 2);
    let windowHeightStart = loadGD(UI_CANVAS_VIEWPORT_CENTER_Y) - (windowHeight / 2);

    let windowWidthEnd = loadGD(UI_CANVAS_VIEWPORT_CENTER_X) + (windowWidth / 2);
    let windowHeightEnd = loadGD(UI_CANVAS_VIEWPORT_CENTER_Y) + (windowHeight / 2);

    let xpi = (x - windowWidthStart) / (windowWidthEnd - windowWidthStart);
    let ypi = (y - windowHeightStart) / (windowHeightEnd - windowHeightStart);

    let xpl = xpi * totalWidth;
    let ypl = ypi * totalHeight;

    xRef = xpl + dx / 2;
    yRef = ypl + dy / 2;

    let p1x = xpl - xRef;
    let p1y = ypl - yRef;

    let p2x = xpl + dx - xRef;
    let p2y = ypl - yRef;

    let p3x = xpl + dx - xRef;
    let p3y = ypl + dy - yRef;

    let p4x = xpl - xRef;
    let p4y = ypl + dy - yRef;

    let p1xR = p1x * Math.cos(theta) - p1y * Math.sin(theta);
    let p1yR = p1y * Math.cos(theta) + p1x * Math.sin(theta);
    let p2xR = p2x * Math.cos(theta) - p2y * Math.sin(theta);
    let p2yR = p2y * Math.cos(theta) + p2x * Math.sin(theta);
    let p3xR = p3x * Math.cos(theta) - p3y * Math.sin(theta);
    let p3yR = p3y * Math.cos(theta) + p3x * Math.sin(theta);
    let p4xR = p4x * Math.cos(theta) - p4y * Math.sin(theta);
    let p4yR = p4y * Math.cos(theta) + p4x * Math.sin(theta);

    MAIN_CONTEXT.beginPath()
    MAIN_CONTEXT.moveTo(xRef + p1xR, yRef + p1yR);
    MAIN_CONTEXT.lineTo(xRef + p2xR, yRef + p2yR);
    MAIN_CONTEXT.lineTo(xRef + p3xR, yRef + p3yR);
    MAIN_CONTEXT.lineTo(xRef + p4xR, yRef + p4yR);
    MAIN_CONTEXT.lineTo(xRef + p1xR, yRef + p1yR);
    MAIN_CONTEXT.closePath();
    MAIN_CONTEXT.fill();

    // MAIN_CONTEXT.arc(xRef, yRef, 10, 0, 2 * Math.PI, false);

    // MAIN_CONTEXT.stroke();


}



export function zoomCanvasSquareText(x, y, text) {
    let dx = getCurZoom();
    let dy = getCurZoom();

    let totalWidth = CANVAS_SQUARES_X * BASE_SIZE;
    let totalHeight = CANVAS_SQUARES_Y * BASE_SIZE;

    let windowWidth = totalWidth / getCurZoom();
    let windowHeight = totalHeight / getCurZoom();

    let windowWidthStart = loadGD(UI_CANVAS_VIEWPORT_CENTER_X) - (windowWidth / 2);
    let windowHeightStart = loadGD(UI_CANVAS_VIEWPORT_CENTER_Y) - (windowHeight / 2);

    let windowWidthEnd = loadGD(UI_CANVAS_VIEWPORT_CENTER_X) + (windowWidth / 2);
    let windowHeightEnd = loadGD(UI_CANVAS_VIEWPORT_CENTER_Y) + (windowHeight / 2);

    let xpi = (x - windowWidthStart) / (windowWidthEnd - windowWidthStart);
    let ypi = (y - windowHeightStart) / (windowHeightEnd - windowHeightStart);

    let xpl = xpi * totalWidth;
    let ypl = ypi * totalHeight;
    MAIN_CONTEXT.strokeText(
        text,
        xpl + dx / 2,
        ypl + dy / 2
    );
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
    let trueX = loadGD(UI_CANVAS_VIEWPORT_CENTER_X) + x * mult;
    let trueY = loadGD(UI_CANVAS_VIEWPORT_CENTER_Y) + y * mult;

    let initialX = saveGD(UI_CANVAS_VIEWPORT_CENTER_X, Math.round(trueX)); 
    let initialY = saveGD(UI_CANVAS_VIEWPORT_CENTER_Y, Math.round(trueY)); 

    let leftoverX = trueX - loadGD(UI_CANVAS_VIEWPORT_CENTER_X);
    let leftoverY = trueY - loadGD(UI_CANVAS_VIEWPORT_CENTER_Y);

    let secondaryX = saveGD(UI_CANVAS_VIEWPORT_CENTER_X, Math.round(initialX + leftoverX + loadGD(UI_CANVAS_VIEWPORT_FRAC_X))); 
    let secondaryY = saveGD(UI_CANVAS_VIEWPORT_CENTER_Y, Math.round(initialY + leftoverY + loadGD(UI_CANVAS_VIEWPORT_FRAC_Y)));

    saveGD(UI_CANVAS_VIEWPORT_FRAC_X, loadGD(UI_CANVAS_VIEWPORT_FRAC_X) + leftoverX - (secondaryX - initialX));
    saveGD(UI_CANVAS_VIEWPORT_FRAC_Y, loadGD(UI_CANVAS_VIEWPORT_FRAC_Y) + leftoverY - (secondaryY - initialY));

    recacheCanvasPositions();
}
export function getCanvasWidth() {
    return CANVAS_SQUARES_X * BASE_SIZE;
}
export function getCanvasHeight() {
    return CANVAS_SQUARES_Y * BASE_SIZE;
}