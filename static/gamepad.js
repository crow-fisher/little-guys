const gamepads = {};

export const GBA = 0b10000;
export const GBNOTSURE = 0b01000;
export const GBX = 0b00100;
export const GBB = 0b00010;

let activeGamepad = 0;

let pressedMask = 0;
let stickLeftX = 0;
let stickLeftY = 0;
let stickRightX = 0;
let stickRightY = 0;

export function isButtonPressed(button) {
    return (pressedMask & button) == button;
}

export function inv(val) {
    return ~val;
}

function doButtonInput(button, pressed) {
    if (pressed) {
        pressedMask = pressedMask | button;
    } else {
        pressedMask = pressedMask & inv(button);
    }
}

export function gamepadInputLoop() {
    const gamepads = navigator.getGamepads();
    if (!gamepads) {
        return;
    }

    for (let i = 0; i < gamepads.length; i++) {
        let gpTest = gamepads[i];
        if (gpTest == null) {
            continue;
        }
        if (gpTest.buttons[0].pressed
            || gpTest.buttons[1].pressed
            || gpTest.buttons[2].pressed
            || gpTest.buttons[3].pressed) {
                activeGamepad = i;
            }
    }

    const gp = gamepads[activeGamepad];
    if (gp == null) {
        return;
    }
    doButtonInput(GBA, gp.buttons[0].pressed);
    doButtonInput(GBNOTSURE, gp.buttons[1].pressed);
    doButtonInput(GBX, gp.buttons[2].pressed);
    doButtonInput(GBB, gp.buttons[3].pressed);

    stickLeftX = gp.axes[0];
    stickLeftY = gp.axes[1];
    stickRightX = gp.axes[2];
    stickRightY = gp.axes[3];
}

function pdz(val, dz=0.2) {
    if (val > 0) {
        if (val > dz) {
            return val;
        }
        return 0;
    } else {
        if (val < -dz) {
            return val;
        }
        return 0;
    }
}

export function getLeftStick() {
    return [pdz(stickLeftX), pdz(stickLeftY)];
}

export function getRightStick() {
    return [pdz(stickRightX), pdz(stickRightY)];
}