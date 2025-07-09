import { getBaseSize, getCanvasSquaresX, getCanvasSquaresY, resetZoom } from "./canvas.js";
import { isEyedropperOrMixerClicked, loadGD, UI_PALETTE_EYEDROPPER, UI_PALETTE_MIXER } from "./ui/UIData.js";
import { clearMouseHoverColorCacheMap } from "./ui/WindowManager.js";

let leftMouseClicked = false;
let rightMouseClicked = false;
let middleMouseClicked = false;
let leftMouseUpEvent = true;
let lastMouseDownStart = Date.now(); 
let mouseDown = 0;
let lastMoveEvent = null;
let lastMoveOffset = null;
let lastLastMoveOffset = null;
let lastMoveEventTime = Date.now();

let mouseEventCounter = new Map();

export function getLastMoveEventTime() {
    return lastMoveEventTime;
}
export function doSingleTimeMouseEvent(event, func) {
    if (mouseEventCounter.has(event)) {
        return;
    } else {
        mouseEventCounter[event] = 1;
        return func();
    }
}

export function getLastMoveOffset() {
    return lastMoveOffset;
}

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

export function getLeftMouseUpEvent() {
    if (leftMouseUpEvent) {
        leftMouseUpEvent = false;
        return true;
    }
    return false;
}

export function handleMouseDown(e) {
    e.preventDefault();
    lastMoveEventTime = Date.now();
    if (!isLeftMouseClicked()) {
        lastMouseDownStart = Date.now();
        mouseEventCounter.clear();
    }

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
    clearMouseHoverColorCacheMap();
    let leftMouseWasClicked = leftMouseClicked;
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
    if (isEyedropperOrMixerClicked()) {
        leftMouseUpEvent = leftMouseWasClicked;
    }
}

export function handleClick(event) {
    lastMoveEvent = event;
    lastMoveOffset = getOffset(event);
    lastMoveEventTime = Date.now();

    if (!rightMouseClicked && mouseDown <= 0) {
        lastLastMoveOffset = lastMoveOffset;
    }
}

// Handle Touch Events
export function handleTouchStart(e) {
    e.preventDefault();
    handleTouchMove(e, true);
    lastMouseDownStart = Date.now();
    
    // We can simulate mouse down events for the first touch
    let touch = e.touches[0];
    switch (touch.button) {
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

export function handleTouchEnd(e) {
    e.preventDefault();
    let leftMouseWasClicked = leftMouseClicked;
    if (e.touches.length === 0) {
        // No more touches, reset click states
        leftMouseClicked = false;
        rightMouseClicked = false;
        middleMouseClicked = false;
    }
    if (loadGD(UI_PALETTE_EYEDROPPER) || loadGD(UI_PALETTE_MIXER)) {
        leftMouseUpEvent = leftMouseWasClicked;
    }
}

let mouseTouchStartCallback = null;
export function setMouseTouchStartCallback(f) {
    mouseTouchStartCallback = f
}

export function handleTouchMove(e, fromTouchStart=false) {
    e.preventDefault();
    lastMoveEvent = e;
    let touch = e.touches[0];
    lastMoveOffset = getOffset(touch);
    if (fromTouchStart) {
        if (mouseTouchStartCallback != null) {
            mouseTouchStartCallback(lastMoveOffset);
        }
    }

    if (!rightMouseClicked && mouseDown <= 0) {
        lastLastMoveOffset = lastMoveOffset;
    }
}

export function getOffset(evt) {
    if (
        (evt.pageX > (getCanvasSquaresX) * getBaseSize()) || 
        (evt.pageY > (getCanvasSquaresY) * getBaseSize())
    ) {
        leftMouseClicked = false;
        rightMouseClicked = false;
        middleMouseClicked = false;
    }

    // Check if the event is a touch or mouse event and calculate the offset accordingly
    if (evt.touches) {
        // For touch events, use the first touch
        let touch = evt.touches[0];
        return { x: touch.pageX - evt.target.offsetLeft, y: touch.pageY - evt.target.offsetTop };
    } else if (evt.offsetX != undefined) {
        // For mouse events
        return { x: evt.offsetX, y: evt.offsetY };
    } else {
        // Fallback for older browsers
        let el = evt.target;
        let offset = { x: 0, y: 0 };
        while (el.offsetParent) {
            offset.x += el.offsetLeft;
            offset.y += el.offsetTop;
            el = el.offsetParent;
        }
        offset.x = evt.pageX - offset.x;
        offset.y = evt.pageY - offset.y;
        return offset;
    }
}