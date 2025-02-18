import { resetZoom } from "./canvas.js";

var rightMouseClicked = false;
var middleMouseClicked = false;
var lastMouseDownStart = Date.now(); 
var mouseDown = 0;
var lastMoveEvent = null;
var lastMoveOffset = null;
var lastLastMoveOffset = null;

export function isLeftMouseClicked() {
    return leftMouseClicked;
}

export function isMiddleMouseClicked() {
    return middleMouseClicked;
}

export function isRightMouseClicked() {
    return rightMouseClicked;
}

export function getLastMouseDown() {
    return lastMouseDownStart;
}

export function handleMouseDown(e) {
    e.preventDefault();
    switch (e.button) {
        case 2: 
            rightMouseClicked = true;
            break;
        case 1:
            middleMouseClicked = true;
            resetZoom();
            break; 
        case 0:
        default:
            leftMouseClicked = true;
            break;
    }
}

export function handleMouseUp(e) {
    e.preventDefault();
    switch (e.button) {
        case 2: 
            rightMouseClicked = false;
            break;
        case 1:
            middleMouseClicked = false;
            break; 
        case 0:
        default:
            leftMouseClicked = false;
            break;
    }
}

export function handleClick(event) {
    lastMoveEvent = event;
    lastMoveOffset = getOffset(event);

    if (!rightMouseClicked && mouseDown <= 0) {
        lastLastMoveOffset = lastMoveOffset;
    }
}

export function getOffset(evt) {
    if (
        (evt.pageX > (CANVAS_SQUARES_X * 1.5) * BASE_SIZE) || 
        (evt.pageY > (CANVAS_SQUARES_Y * 1.5) * BASE_SIZE)
    ) {
        offScreen = true;
    } else {
        offScreen = false;
    }
    if (evt.offsetX != undefined)
        return { x: evt.offsetX, y: evt.offsetY };

    var el = evt.target;
    var offset = { x: 0, y: 0 };

    while (el.offsetParent) {
        offset.x += el.offsetLeft;
        offset.y += el.offsetTop;
        el = el.offsetParent;
    }

    offset.x = evt.pageX - offset.x;
    offset.y = evt.pageY - offset.y;

    return offset;
}