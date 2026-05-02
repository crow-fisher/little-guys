import { getBaseSize, getCanvasSquaresX, getCanvasSquaresY, resetCanvasLastMoveOffset, resetZoom, rotatePointRx, rotatePointRy } from "./canvas.js";
import { copyVecValue } from "./climate/stars/matrix.js";
import { sphericalToCartesian } from "./climate/stars/starHandlerUtil.js";
import { MAIN_CANVAS } from "./index.js";
import { setOrganismAddedThisClick, setPrevManipulationOffset } from "./manipulation.js";
import { isEyedropperOrMixerClicked, loadGD, saveGD, UI_CAMERA_ROTATION_VEC, UI_PALETTE_EYEDROPPER, UI_PALETTE_MIXER, UI_VIEWMODE_3D, UI_VIEWMODE_SELECT } from "./ui/UIData.js";
import { clearMouseHoverColorCacheMap } from "./ui/WindowManager.js";

let leftMouseClicked = false;
let rightMouseClicked = false;
let middleMouseClicked = false;
let leftMouseUpEvent = true;
let lastMouseDownStart = Date.now(); 
let lastMosueUpEvent = Date.now();
let mouseDown = 0;
let lastMoveEvent = null;
let lastMoveOffset = null;
let lastLastMoveOffset = null;
let lastMoveEventTime = Date.now();
let mouseEventCounter = new Map();

let isMouse3DMode = false;

export function getLastMouseUpEvent() {
    return lastMosueUpEvent;
}
export function getLastMoveEvent() {
    return lastMoveEvent;
} 
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

export function getLastLastMoveOffset() {
    return lastLastMoveOffset;
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

export function getLastMouseDownStart() {
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
    touchMode = false;
    if (!isLeftMouseClicked()) {
        lastMouseDownStart = Date.now();
        mouseEventCounter.clear();
        if (isMouse3DMode) {
            isMouse3DMode = false;
        } else if (loadGD(UI_VIEWMODE_SELECT) == UI_VIEWMODE_3D) {
            isMouse3DMode = true;
            MAIN_CANVAS.requestPointerLock({unadjustedMovement: true}); 
        }
    }

    switch (e.button) {
        case 2: 
            rightMouseClicked = true;
            break;
        case 1:
            if (!middleMouseClicked)
                resetCanvasLastMoveOffset();
            middleMouseClicked = true;
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
    setOrganismAddedThisClick(false);
    let leftMouseWasClicked = leftMouseClicked;
    lastMosueUpEvent = Date.now();
    setPrevManipulationOffset(null);
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
    if (isMouse3DMode) {
        handleMouse3DMove(event);
        return;
    }
    lastMoveEvent = event;
    lastMoveOffset = getOffset(event);
    lastMoveEventTime = Date.now();

    if (!rightMouseClicked && mouseDown <= 0) {
        lastLastMoveOffset = lastMoveOffset;
    }
}

function handleMouse3DMove(event) {
    loadGD(UI_CAMERA_ROTATION_VEC)[0] += event.movementX / 1500;
    loadGD(UI_CAMERA_ROTATION_VEC)[1] += event.movementY / 1500;
}

let touchMode = false;
let touchActive = false;

export function isTouchMode() {
    return touchMode;
}

export function isTouchActive() {
    return touchActive;
}

// Handle Touch Events
export function handleTouchStart(e) {
    e.preventDefault();
    handleTouchMove(e, true);
    lastMouseDownStart = Date.now();
    
    touchMode = true;
    touchActive = true;

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
    touchActive = false;
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