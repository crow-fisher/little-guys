import { doZoom, resetZoom } from "./canvas.js";
import { getGlobalThetaBase, setGlobalThetaBase } from "./globals.js";
import { loadUI, saveUI, UI_PALETTE_EYEDROPPER, UI_PALETTE_MIXER, UI_BB_MODE, UI_MODE_ROCK, UI_MODE_SOIL, UI_SM_BB, UI_PALETTE_ACTIVE, UI_PALETTE_SELECT, UI_PALETTE_WATER, UI_TOPBAR_BLOCK, UI_PALETTE_ROCKMODE, UI_PALETTE_AQUIFER, UI_PALETTE_SURFACE } from "./ui/UIData.js";

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
        saveUI(UI_TOPBAR_BLOCK, true);
        saveUI(UI_PALETTE_ACTIVE, true);
        saveUI(UI_PALETTE_ROCKMODE, false);
    }

    if (e.key == '2') {
        saveUI(UI_TOPBAR_BLOCK, true);
        saveUI(UI_PALETTE_ACTIVE, true);
        saveUI(UI_PALETTE_ROCKMODE, true);
    }

    if (e.key == '3') {
        saveUI(UI_TOPBAR_BLOCK, true);
        saveUI(UI_PALETTE_ACTIVE, true);
        saveUI(UI_PALETTE_SELECT, UI_PALETTE_WATER);
    }

    
    if (e.key == '4') {
        saveUI(UI_TOPBAR_BLOCK, true);
        saveUI(UI_PALETTE_ACTIVE, true);
        saveUI(UI_PALETTE_SELECT, UI_PALETTE_AQUIFER);
    }

    if (e.key == '5') {
        saveUI(UI_TOPBAR_BLOCK, true);
        saveUI(UI_PALETTE_ACTIVE, true);
        saveUI(UI_PALETTE_SELECT, UI_PALETTE_SURFACE);
    }


    if (e.key == 'q') {
        saveUI(UI_PALETTE_EYEDROPPER, !loadUI(UI_PALETTE_EYEDROPPER));
    }
    if (e.key == 'w') {
        saveUI(UI_PALETTE_MIXER, !loadUI(UI_PALETTE_MIXER));
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