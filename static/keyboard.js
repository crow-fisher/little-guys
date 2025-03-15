import { doZoom, resetZoom } from "./canvas.js";
import { getGlobalThetaBase, setGlobalThetaBase } from "./globals.js";
import { loadUI, saveUI, UI_BB_EYEDROPPER, UI_BB_MIXER, UI_BB_MODE, UI_MODE_ROCK, UI_MODE_SOIL, UI_SM_BB, UI_SM_SPECIAL, UI_PALETTE_SELECT, UI_SPECIAL_WATER, UI_TOPBAR_BLOCK } from "./ui/UIData.js";

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
        saveUI(UI_SM_BB, true);
        saveUI(UI_BB_MODE, UI_MODE_SOIL);
    }

    if (e.key == '2') {
        saveUI(UI_TOPBAR_BLOCK, true);
        saveUI(UI_SM_BB, true);
        saveUI(UI_BB_MODE, UI_MODE_ROCK);
    }

    if (e.key == '3') {
        saveUI(UI_TOPBAR_BLOCK, true);
        saveUI(UI_SM_SPECIAL, true);
        saveUI(UI_PALETTE_SELECT, UI_SPECIAL_WATER);
    }

    if (e.key == 'q') {
        saveUI(UI_BB_EYEDROPPER, !loadUI(UI_BB_EYEDROPPER));
    }
    if (e.key == 'w') {
        saveUI(UI_BB_MIXER, !loadUI(UI_BB_MIXER));
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