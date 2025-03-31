import { doZoom, resetZoom } from "./canvas.js";
import { getGlobalThetaBase, setGlobalThetaBase } from "./globals.js";
import { loadGD, saveGD, UI_PALETTE_EYEDROPPER, UI_PALETTE_MIXER, UI_BB_MODE, UI_MODE_ROCK, UI_MODE_SOIL, UI_SM_BB, UI_PALETTE_ACTIVE, UI_PALETTE_SELECT, UI_PALETTE_WATER, UI_TOPBAR_BLOCK, UI_PALETTE_ROCKMODE, UI_PALETTE_AQUIFER, UI_PALETTE_SURFACE, closeEyedropperMixer } from "./ui/UIData.js";

export const KEY_CONTROL = "Control";
export const KEY_SHIFT = "Shift";

let keyPressMap = {};

export function isKeyPressed(keyName) {
    if (keyName in keyPressMap) {
        return keyPressMap[keyName];
    }
    return false;
}



export function keydown(e) {
    e.preventDefault();
    keyPressMap[e.key] = true;

    if (e.key == "s") {
        doZoom(-0.1);
    }
    if (e.key == "x") {
        doZoom(0.1);
    }
    if (e.key == "a") {
        setGlobalThetaBase(getGlobalThetaBase() + 0.1);
    }
    if (e.key == "d") {
        setGlobalThetaBase(getGlobalThetaBase() - 0.1);
    }

    if (e.key == '1') {
        saveGD(UI_TOPBAR_BLOCK, true);
        saveGD(UI_PALETTE_ACTIVE, true);
        saveGD(UI_PALETTE_ROCKMODE, false);
        closeEyedropperMixer();

    }

    if (e.key == '2') {
        saveGD(UI_TOPBAR_BLOCK, true);
        saveGD(UI_PALETTE_ACTIVE, true);
        saveGD(UI_PALETTE_ROCKMODE, true);
        closeEyedropperMixer();


    }

    if (e.key == '3') {
        saveGD(UI_TOPBAR_BLOCK, true);
        saveGD(UI_PALETTE_ACTIVE, true);
        saveGD(UI_PALETTE_SELECT, UI_PALETTE_WATER);
        closeEyedropperMixer();


    }

    
    if (e.key == '4') {
        saveGD(UI_TOPBAR_BLOCK, true);
        saveGD(UI_PALETTE_ACTIVE, true);
        saveGD(UI_PALETTE_SELECT, UI_PALETTE_AQUIFER);
        closeEyedropperMixer();


    }

    if (e.key == '5') {
        saveGD(UI_TOPBAR_BLOCK, true);
        saveGD(UI_PALETTE_ACTIVE, true);
        saveGD(UI_PALETTE_SELECT, UI_PALETTE_SURFACE);
        closeEyedropperMixer();

    }


    if (e.key == 'q') {
        saveGD(UI_PALETTE_EYEDROPPER, !loadGD(UI_PALETTE_EYEDROPPER));
    }
    if (e.key == 'w') {
        saveGD(UI_PALETTE_MIXER, !loadGD(UI_PALETTE_MIXER));
    }
    if (e.key == "Escape") {
        resetZoom();
    }
}

export function keyup(e) {
    if (e.key in keyPressMap) {
        keyPressMap[e.key] = false;
    }
}