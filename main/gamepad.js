const gamepads = {};

export const GBA  = 0b10000000000; // gamepad button a 
export const GBY  = 0b01000000000; // ...
export const GBX  = 0b00100000000;
export const GBB  = 0b00010000000;
export const GBDU = 0b00000100000; // gamepad button dpad up
export const GBDD = 0b00000010000; 
export const GBDL = 0b00000001000;
export const GBDR = 0b00000000100; 
export const GBSL = 0b00000000010; // gamepad button shoulder left
export const GBSR = 0b00000000001; 

let activeGamepad = 0;
let pressedMask = 0;
let stickLeftX = 0;
let stickLeftY = 0;
let stickRightX = 0;
let stickRightY = 0;
let triggerLeft = 0;
let triggerRight = 0;

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
    doButtonInput(GBB, gp.buttons[1].pressed);
    doButtonInput(GBX, gp.buttons[2].pressed);
    doButtonInput(GBY, gp.buttons[3].pressed);
    doButtonInput(GBSL, gp.buttons[4].pressed);
    doButtonInput(GBSR, gp.buttons[5].pressed);

    if (gp.buttons.length >= 16) {
        doButtonInput(GBDU, gp.buttons[12].pressed);
        doButtonInput(GBDD, gp.buttons[13].pressed);
        doButtonInput(GBDL, gp.buttons[14].pressed);
        doButtonInput(GBDR, gp.buttons[15].pressed);
    }




    stickLeftX = gp.axes[0];
    stickLeftY = gp.axes[1];
    stickRightX = gp.axes[2];
    stickRightY = gp.axes[3];
    triggerLeft = gp.buttons[6].value;
    triggerRight = gp.buttons[7].value;
}

function pdz(val, dz = 0.2) {
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

export function getTriggers() {
    return [triggerLeft, triggerRight];
}