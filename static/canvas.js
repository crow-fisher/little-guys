import { MAIN_CONTEXT } from "./index.js";
import { isKeyPressed, KEY_CONTROL, KEY_SHIFT } from "./keyboard.js";
import { getLastMoveOffset, isMiddleMouseClicked } from "./mouse.js";
import { loadGD, saveGD, UI_PALETTE_SIZE, UI_PALETTE_STRENGTH, UI_UI_SIZE, UI_PALETTE_ACTIVE, loadUI, UI_PALETTE_SURFACE, UI_LIGHTING_SURFACE, UI_PALETTE_SELECT, UI_GAME_MAX_CANVAS_SQUARES_X, UI_GAME_MAX_CANVAS_SQUARES_Y } from "./ui/UIData.js";

let BASE_SIZE = 1;
let CANVAS_SQUARES_X = 192; 
let CANVAS_SQUARES_Y = 108;
let CANVAS_VIEWPORT_CENTER_X = CANVAS_SQUARES_X * BASE_SIZE / 2;
let CANVAS_VIEWPORT_CENTER_Y = CANVAS_SQUARES_Y * BASE_SIZE / 2;
let CANVAS_SQUARES_ZOOM = 1; // higher is farther in. 1/n etc etc 

export function getBaseSize() {
    return BASE_SIZE;
}
export function setBaseSize(newSize) {
    BASE_SIZE = newSize;
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

    let windowWidth = totalWidth / CANVAS_SQUARES_ZOOM;
    let windowHeight = totalHeight / CANVAS_SQUARES_ZOOM;

    let canvasWindowWidth = CANVAS_SQUARES_X / CANVAS_SQUARES_ZOOM;
    let canvasWindowHeight = CANVAS_SQUARES_Y / CANVAS_SQUARES_ZOOM;
    
    let windowWidthStart = CANVAS_VIEWPORT_CENTER_X - (windowWidth / 2);
    let windowHeightStart = CANVAS_VIEWPORT_CENTER_Y - (windowHeight / 2); 

    let canvasWindowWidthStart = windowWidthStart /   BASE_SIZE;
    let canvasWindowHeightStart = windowHeightStart / BASE_SIZE;

    let xpi = x / totalWidth;
    let ypi = y / totalHeight;

    return [canvasWindowWidthStart + xpi * canvasWindowWidth, canvasWindowHeightStart + ypi * canvasWindowHeight];
}
export function zoomCanvasFillRect(x, y, dx, dy) {
    dx *= (CANVAS_SQUARES_ZOOM);
    dy *= (CANVAS_SQUARES_ZOOM);

    let totalWidth = CANVAS_SQUARES_X * BASE_SIZE;
    let totalHeight = CANVAS_SQUARES_Y * BASE_SIZE;

    let windowWidth = totalWidth / CANVAS_SQUARES_ZOOM;
    let windowHeight = totalHeight / CANVAS_SQUARES_ZOOM;

    let windowWidthStart = CANVAS_VIEWPORT_CENTER_X - (windowWidth / 2);
    let windowHeightStart = CANVAS_VIEWPORT_CENTER_Y - (windowHeight / 2); 

    let windowWidthEnd = CANVAS_VIEWPORT_CENTER_X + (windowWidth / 2);
    let windowHeightEnd = CANVAS_VIEWPORT_CENTER_Y + (windowHeight / 2); 

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

    let windowWidth = totalWidth / CANVAS_SQUARES_ZOOM;
    let windowHeight = totalHeight / CANVAS_SQUARES_ZOOM;

    let windowWidthStart = CANVAS_VIEWPORT_CENTER_X - (windowWidth / 2);
    let windowHeightStart = CANVAS_VIEWPORT_CENTER_Y - (windowHeight / 2); 

    let windowWidthEnd = CANVAS_VIEWPORT_CENTER_X + (windowWidth / 2);
    let windowHeightEnd = CANVAS_VIEWPORT_CENTER_Y + (windowHeight / 2); 

    let xpi = (x - windowWidthStart) / (windowWidthEnd - windowWidthStart);
    let ypi = (y - windowHeightStart) / (windowHeightEnd - windowHeightStart);
    let xpl = xpi * totalWidth;
    let ypl = ypi * totalHeight;
    MAIN_CONTEXT.beginPath(); 
    MAIN_CONTEXT.arc(xpl, ypl, size * CANVAS_SQUARES_ZOOM, 0, 2 * Math.PI, false);
    MAIN_CONTEXT.fill();  
}

export function zoomCanvasFillRectTheta(x, y, dx, dy, xRef, yRef, theta) {
    dx *= (CANVAS_SQUARES_ZOOM);
    dy *= (CANVAS_SQUARES_ZOOM);

    let totalWidth = CANVAS_SQUARES_X * BASE_SIZE;
    let totalHeight = CANVAS_SQUARES_Y * BASE_SIZE;

    let windowWidth = totalWidth / CANVAS_SQUARES_ZOOM;
    let windowHeight = totalHeight / CANVAS_SQUARES_ZOOM;

    let windowWidthStart = CANVAS_VIEWPORT_CENTER_X - (windowWidth / 2);
    let windowHeightStart = CANVAS_VIEWPORT_CENTER_Y - (windowHeight / 2); 

    let windowWidthEnd = CANVAS_VIEWPORT_CENTER_X + (windowWidth / 2);
    let windowHeightEnd = CANVAS_VIEWPORT_CENTER_Y + (windowHeight / 2); 

    let xpi = (x - windowWidthStart) / (windowWidthEnd - windowWidthStart);
    let ypi = (y - windowHeightStart) / (windowHeightEnd - windowHeightStart);

    let xpl = xpi * totalWidth;
    let ypl = ypi * totalHeight;

    xRef = xpl + dx/2;
    yRef = ypl + dy/2;

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
    let dx = CANVAS_SQUARES_ZOOM;
    let dy = CANVAS_SQUARES_ZOOM;

    let totalWidth = CANVAS_SQUARES_X * BASE_SIZE;
    let totalHeight = CANVAS_SQUARES_Y * BASE_SIZE;

    let windowWidth = totalWidth / CANVAS_SQUARES_ZOOM;
    let windowHeight = totalHeight / CANVAS_SQUARES_ZOOM;

    let windowWidthStart = CANVAS_VIEWPORT_CENTER_X - (windowWidth / 2);
    let windowHeightStart = CANVAS_VIEWPORT_CENTER_Y - (windowHeight / 2); 

    let windowWidthEnd = CANVAS_VIEWPORT_CENTER_X + (windowWidth / 2);
    let windowHeightEnd = CANVAS_VIEWPORT_CENTER_Y + (windowHeight / 2); 

    let xpi = (x - windowWidthStart) / (windowWidthEnd - windowWidthStart);
    let ypi = (y - windowHeightStart) / (windowHeightEnd - windowHeightStart);

    let xpl = xpi * totalWidth;
    let ypl = ypi * totalHeight;
    
    MAIN_CONTEXT.fillText(
        text,
        xpl + dx / 2,
        ypl + dy / 2
    );
}



export function zoom(event) {
    event.preventDefault();
    if (loadGD(UI_PALETTE_ACTIVE)) {
        if (loadGD(UI_PALETTE_SELECT) == loadGD(UI_PALETTE_SURFACE)) {
            saveGD(UI_LIGHTING_SURFACE, Math.max(.0000001, Math.min(.999999999, loadGD(UI_LIGHTING_SURFACE) + event.deltaY * .00005)));

        } else if (isKeyPressed(KEY_CONTROL) || isKeyPressed(KEY_SHIFT)) {
            let size = loadGD(UI_PALETTE_SIZE);
            size += event.deltaY * 0.005;
            size = Math.min(Math.max(size, 1), 14)
            saveGD(UI_PALETTE_SIZE, size);
        } else {
            let strength = loadGD(UI_PALETTE_STRENGTH);
            if (event.deltaY > 0) {
                strength *= (0.999 ** event.deltaY); 
            } else {
                for (let i = 0; i < Math.abs(event.deltaY); i++) {
                    strength += (1 - strength) * 0.001;
                }
            }
            saveGD(UI_PALETTE_STRENGTH, strength);
        }
        return;

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

    // let canvasPos = transformPixelsToCanvasSquares(lastMoveOffset.x, lastMoveOffset.y);
    // let lsqFound = false;-
    // iterateOnOrganisms((org) => org.lifeSquares.filter((lsq) => lsq.linkedOrganism.spinnable && lsq.component != null)
    //     .forEach((lsq) => {
    //     let dist = ((canvasPos[0] - lsq.getPosX()) ** 2 + (canvasPos[1] - lsq.getPosY()) ** 2) ** 0.5;
    //     if (dist < 1.4) {
    //         if (shiftPressed) {
    //             lsq.component.twist += deltaY * 0.00009;
    //         } else {
    //             lsq.component.theta += deltaY * 0.0003;
    //         }
    //         lsqFound = true;
    //     }
    // }), 0);
    // if (lsqFound) {
    //     return;
    // }

    let x = 1 - lastMoveOffset.x / totalWidth;
    let y = 1 - lastMoveOffset.y / totalHeight;
    let startZoom = CANVAS_SQUARES_ZOOM;
    CANVAS_SQUARES_ZOOM = Math.min(Math.max(CANVAS_SQUARES_ZOOM + deltaY * -0.001, 1), 100);
    let endZoom = CANVAS_SQUARES_ZOOM;

    let startWidth = totalWidth / startZoom;
    let endWidth = totalWidth / endZoom;

    let startHeight = totalHeight / startZoom;
    let endHeight = totalHeight / endZoom;

    let widthDiff = endWidth - startWidth;
    let heightDiff = endHeight - startHeight;

    CANVAS_VIEWPORT_CENTER_X += (widthDiff * (x - 0.5));
    CANVAS_VIEWPORT_CENTER_Y += (heightDiff * (y - 0.5));
}
export function resetZoom() {
    CANVAS_VIEWPORT_CENTER_X = (CANVAS_SQUARES_X * BASE_SIZE) / 2;
    CANVAS_VIEWPORT_CENTER_Y = (CANVAS_SQUARES_Y * BASE_SIZE) / 2;
    CANVAS_SQUARES_ZOOM = 1;
}
export function getCanvasWidth() {
    return CANVAS_SQUARES_X * BASE_SIZE;
}
export function getCanvasHeight() {
    return CANVAS_SQUARES_Y * BASE_SIZE;
}