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

export function zoomCanvasFillCircleEllipse(x, y, size, tx, ty) {
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
    let xpl = xpi * totalWidth / tx;
    let ypl = ypi * totalHeight / ty;

    MAIN_CONTEXT.beginPath();
    MAIN_CONTEXT.scale (tx, ty);   
    MAIN_CONTEXT.arc(xpl, ypl, size * getCurZoom(), 0, 2 * Math.PI, false);
    MAIN_CONTEXT.fill();
    MAIN_CONTEXT.scale(1/tx, 1/ty);   

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

    theta += Math.PI / 2;

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
}

export function zoomCanvasFillRectThetaSlope(x, y, dx1, dx2, dy, xRef, yRef, theta, flip) {
    dx1 *= (getCurZoom());
    dx2 *= (getCurZoom());
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

    let x2Ref;

    xRef = xpl + dx1 / 2;
    x2Ref = xpl + dx2 / 2;
    yRef =  ypl + dy / 2;

    let p1x = xpl - x2Ref;
    let p2x = xpl + dx2 - x2Ref;
    let p3x = xpl + dx1 - xRef;
    let p4x = xpl - xRef;

    let p1y = ypl - yRef;
    let p2y = ypl - yRef;
    let p3y = ypl + dy - yRef;
    let p4y = ypl + dy - yRef;


    let p1xR = p1x * Math.cos(theta) - p1y * Math.sin(theta);
    let p1yR = p1y * Math.cos(theta) + p1x * Math.sin(theta);
    let p2xR = p2x * Math.cos(theta) - p2y * Math.sin(theta);
    let p2yR = p2y * Math.cos(theta) + p2x * Math.sin(theta);
    let p3xR = p3x * Math.cos(theta) - p3y * Math.sin(theta);
    let p3yR = p3y * Math.cos(theta) + p3x * Math.sin(theta);
    let p4xR = p4x * Math.cos(theta) - p4y * Math.sin(theta);
    let p4yR = p4y * Math.cos(theta) + p4x * Math.sin(theta);

    theta += Math.PI / 2;
    if (!flip) {
        theta -= Math.PI;
    }
    p1xR = p1x * Math.cos(theta) - p1y * Math.sin(theta);
    p1yR = p1y * Math.cos(theta) + p1x * Math.sin(theta);
    p2xR = p2x * Math.cos(theta) - p2y * Math.sin(theta);
    p2yR = p2y * Math.cos(theta) + p2x * Math.sin(theta);
    p3xR = p3x * Math.cos(theta) - p3y * Math.sin(theta);
    p3yR = p3y * Math.cos(theta) + p3x * Math.sin(theta);
    p4xR = p4x * Math.cos(theta) - p4y * Math.sin(theta);
    p4yR = p4y * Math.cos(theta) + p4x * Math.sin(theta);

    
    MAIN_CONTEXT.beginPath()
    MAIN_CONTEXT.moveTo(xRef + p1xR, yRef + p1yR);
    MAIN_CONTEXT.lineTo(xRef + p2xR, yRef + p2yR);
    MAIN_CONTEXT.lineTo(xRef + p3xR, yRef + p3yR);
    MAIN_CONTEXT.lineTo(xRef + p4xR, yRef + p4yR);
    MAIN_CONTEXT.lineTo(xRef + p1xR, yRef + p1yR);
    MAIN_CONTEXT.closePath();
    MAIN_CONTEXT.fill();
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

export function fillCanvasPointArr(pArr) {
    MAIN_CONTEXT.beginPath()
    MAIN_CONTEXT.moveTo(...pArr[0]);
    pArr.slice(1).forEach(p => MAIN_CONTEXT.lineTo(...p));
    MAIN_CONTEXT.closePath();
    MAIN_CONTEXT.fill();
}

export function decayVec(key, frac=0.7) {
    let val = loadGD(key);
    for (let i = 0; i < val.length; i++) {
        val[i] *= frac;
    }
    saveGD(key, val);
}

export function getCanvasWidth() {
    return CANVAS_SQUARES_X * BASE_SIZE;
}
export function getCanvasHeight() {
    return CANVAS_SQUARES_Y * BASE_SIZE;
}