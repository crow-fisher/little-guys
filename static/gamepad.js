const gamepads = {};

export const GBY = 0b10000;
export const GBX = 0b01000;
export const GBA = 0b00100;
export const GBB = 0b00010;

let activeGamepad = 0;

let pressedMask = 0;
let stickLeftX = 0;
let stickLeftY = 0;
let stickRightX = 0;
let stickRightY = 0;

export function isButtonPressed(button) {
    return (pressedMask | button) == button;
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
    doButtonInput(GBY, gp.buttons[0].pressed);
    doButtonInput(GBX, gp.buttons[1].pressed);
    doButtonInput(GBA, gp.buttons[2].pressed);
    doButtonInput(GBB, gp.buttons[3].pressed);

    stickLeftX = gp.axes[0];
    stickLeftY = gp.axes[1];
    stickRightX = gp.axes[2];
    stickRightY = gp.axes[3];
}

export function getLeftStick() {
    return [stickLeftX, stickLeftY];
}

export function getRightStick() {
    return [stickRightX, stickRightY];
}