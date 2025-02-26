import { MAIN_CONTEXT } from "./index.js";
import { isKeyPressed, KEY_CONTROL, KEY_SHIFT } from "./keyboard.js";
import { getLastMoveOffset, isMiddleMouseClicked } from "./mouse.js";
import { loadUI, saveUI, UI_BB_SIZE, UI_BB_STRENGTH, UI_SM_BB } from "./ui/UIData.js";

var BASE_SIZE = 12;
var CANVAS_SQUARES_X = 192; 
var CANVAS_SQUARES_Y = 108;
var CANVAS_VIEWPORT_CENTER_X = CANVAS_SQUARES_X * BASE_SIZE / 2;
var CANVAS_VIEWPORT_CENTER_Y = CANVAS_SQUARES_Y * BASE_SIZE / 2;
var CANVAS_SQUARES_ZOOM = 1; // higher is farther in. 1/n etc etc 

export function getBaseSize() {
    return BASE_SIZE;
}
export function setBaseSize(newSize) {
    BASE_SIZE = newSize;
}
export function setCanvasSquaresX(val) {
    CANVAS_SQUARES_X = Math.floor(val);
    MAIN_CANVAS.width = CANVAS_SQUARES_X * BASE_SIZE;
    MAIN_CANVAS.height = CANVAS_SQUARES_Y * BASE_SIZE;
    for (let i = 0; i < CANVAS_SQUARES_X; i++) {
        addSquare(new RockSquare(i, CANVAS_SQUARES_Y - 1));
    }
}
export function getCanvasSquaresX() {
    return CANVAS_SQUARES_X;
}
export function setCanvasSquaresY(val) {
    CANVAS_SQUARES_Y = Math.floor(val);
    MAIN_CANVAS.width = CANVAS_SQUARES_X * BASE_SIZE;
    MAIN_CANVAS.height = CANVAS_SQUARES_Y * BASE_SIZE;
    mainControlTable.setAttribute("width", CANVAS_SQUARES_X * BASE_SIZE);
    secondaryControlTable.setAttribute("width", CANVAS_SQUARES_X * BASE_SIZE);
    for (let i = 0; i < CANVAS_SQUARES_X; i++) {
        addSquare(new RockSquare(i, CANVAS_SQUARES_Y - 1));
    }
}
export function getCanvasSquaresY() {
    return CANVAS_SQUARES_Y;
}
export function transformPixelsToCanvasSquares(x, y) {
    var totalWidth = CANVAS_SQUARES_X * BASE_SIZE;
    var totalHeight = CANVAS_SQUARES_Y * BASE_SIZE;

    var windowWidth = totalWidth / CANVAS_SQUARES_ZOOM;
    var windowHeight = totalHeight / CANVAS_SQUARES_ZOOM;

    var canvasWindowWidth = CANVAS_SQUARES_X / CANVAS_SQUARES_ZOOM;
    var canvasWindowHeight = CANVAS_SQUARES_Y / CANVAS_SQUARES_ZOOM;
    
    var windowWidthStart = CANVAS_VIEWPORT_CENTER_X - (windowWidth / 2);
    var windowHeightStart = CANVAS_VIEWPORT_CENTER_Y - (windowHeight / 2); 

    var canvasWindowWidthStart = windowWidthStart /   BASE_SIZE;
    var canvasWindowHeightStart = windowHeightStart / BASE_SIZE;

    var xpi = x / totalWidth;
    var ypi = y / totalHeight;

    return [canvasWindowWidthStart + xpi * canvasWindowWidth, canvasWindowHeightStart + ypi * canvasWindowHeight];
}
export function zoomCanvasFillRect(x, y, dx, dy) {
    dx *= (CANVAS_SQUARES_ZOOM);
    dy *= (CANVAS_SQUARES_ZOOM);

    var totalWidth = CANVAS_SQUARES_X * BASE_SIZE;
    var totalHeight = CANVAS_SQUARES_Y * BASE_SIZE;

    var windowWidth = totalWidth / CANVAS_SQUARES_ZOOM;
    var windowHeight = totalHeight / CANVAS_SQUARES_ZOOM;

    var windowWidthStart = CANVAS_VIEWPORT_CENTER_X - (windowWidth / 2);
    var windowHeightStart = CANVAS_VIEWPORT_CENTER_Y - (windowHeight / 2); 

    var windowWidthEnd = CANVAS_VIEWPORT_CENTER_X + (windowWidth / 2);
    var windowHeightEnd = CANVAS_VIEWPORT_CENTER_Y + (windowHeight / 2); 

    var xpi = (x - windowWidthStart) / (windowWidthEnd - windowWidthStart);
    var ypi = (y - windowHeightStart) / (windowHeightEnd - windowHeightStart);

    var xpl = xpi * totalWidth;
    var ypl = ypi * totalHeight;
    
    MAIN_CONTEXT.fillRect(
        xpl, 
        ypl,
        dx,
        dy
    );
}

export function zoomCanvasSquareText(x, y, text) {
    let dx = CANVAS_SQUARES_ZOOM;
    let dy = CANVAS_SQUARES_ZOOM;

    var totalWidth = CANVAS_SQUARES_X * BASE_SIZE;
    var totalHeight = CANVAS_SQUARES_Y * BASE_SIZE;

    var windowWidth = totalWidth / CANVAS_SQUARES_ZOOM;
    var windowHeight = totalHeight / CANVAS_SQUARES_ZOOM;

    var windowWidthStart = CANVAS_VIEWPORT_CENTER_X - (windowWidth / 2);
    var windowHeightStart = CANVAS_VIEWPORT_CENTER_Y - (windowHeight / 2); 

    var windowWidthEnd = CANVAS_VIEWPORT_CENTER_X + (windowWidth / 2);
    var windowHeightEnd = CANVAS_VIEWPORT_CENTER_Y + (windowHeight / 2); 

    var xpi = (x - windowWidthStart) / (windowWidthEnd - windowWidthStart);
    var ypi = (y - windowHeightStart) / (windowHeightEnd - windowHeightStart);

    var xpl = xpi * totalWidth;
    var ypl = ypi * totalHeight;
    
    MAIN_CONTEXT.strokeText(
        text,
        xpl + dx / 2,
        ypl + dy / 2
    );
}



export function zoom(event) {
    event.preventDefault();
    if (loadUI(UI_SM_BB)) {
        if (isKeyPressed(KEY_CONTROL) || isKeyPressed(KEY_SHIFT)) {
            let size = loadUI(UI_BB_SIZE);
            size += event.deltaY * 0.005;
            size = Math.min(Math.max(size, 1), 14)
            saveUI(UI_BB_SIZE, size);
        } else {
            let strength = loadUI(UI_BB_STRENGTH);
            if (event.deltaY > 0) {
                strength *= (0.999 ** event.deltaY); 
            } else {
                for (let i = 0; i < Math.abs(event.deltaY); i++) {
                    strength += (1 - strength) * 0.001;
                }
            }
            saveUI(UI_BB_STRENGTH, strength);
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
    var totalWidth = CANVAS_SQUARES_X * BASE_SIZE;
    var totalHeight = CANVAS_SQUARES_Y * BASE_SIZE;

    // var canvasPos = transformPixelsToCanvasSquares(lastMoveOffset.x, lastMoveOffset.y);
    // var lsqFound = false;-
    // iterateOnOrganisms((org) => org.lifeSquares.filter((lsq) => lsq.linkedOrganism.spinnable && lsq.component != null)
    //     .forEach((lsq) => {
    //     var dist = ((canvasPos[0] - lsq.getPosX()) ** 2 + (canvasPos[1] - lsq.getPosY()) ** 2) ** 0.5;
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

    var x = 1 - lastMoveOffset.x / totalWidth;
    var y = 1 - lastMoveOffset.y / totalHeight;
    var startZoom = CANVAS_SQUARES_ZOOM;
    CANVAS_SQUARES_ZOOM = Math.min(Math.max(CANVAS_SQUARES_ZOOM + deltaY * -0.001, 1), 100);
    var endZoom = CANVAS_SQUARES_ZOOM;

    var startWidth = totalWidth / startZoom;
    var endWidth = totalWidth / endZoom;

    var startHeight = totalHeight / startZoom;
    var endHeight = totalHeight / endZoom;

    var widthDiff = endWidth - startWidth;
    var heightDiff = endHeight - startHeight;

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