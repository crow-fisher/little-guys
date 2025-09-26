import { moveCamera, resetZoom } from "./canvas.js";
import { getGlobalThetaBase, setGlobalThetaBase } from "./globals.js";
import { isPlayerRunning, playerKeyDown, playerKeyUp } from "./player/playerMain.js";
import { loadGD, saveGD, UI_PALETTE_EYEDROPPER, UI_PALLETE_MODE_SPECIAL, UI_PALETTE_MIXER, UI_PALETTE_BLOCKS, UI_PALETTE_SELECT, UI_PALETTE_WATER, UI_TOPBAR_BLOCK, UI_PALETTE_AQUIFER, UI_PALETTE_SURFACE, closeEyedropperMixer, UI_PALETTE_ERASE, UI_TEXTEDIT_ACTIVE, UI_REGEX, UI_PALETTE_MODE, UI_PALETTE_MODE_SOIL, UI_PALETTE_MODE_ROCK, UI_PALETTE_SURFACE_OFF, UI_PALETTE_PLANTS } from "./ui/UIData.js";

export const KEY_CONTROL = "Control";
export const KEY_SHIFT = "Shift";

let lastKeypressTime = Date.now();

let keyPressMap = {};

export function isKeyPressed(keyName) {
    if (keyName in keyPressMap) {
        return keyPressMap[keyName];
    }
    return false;
}

export function getTimeSinceLastKeypress() {
    return Date.now() - lastKeypressTime;
}


function doKeyboardInput(e) {
    let curId = loadGD(UI_TEXTEDIT_ACTIVE);
    let curText = loadGD(curId);
    let curRegex = UI_REGEX[curId];
    if (e.key == "Backspace") {
        saveGD(curId, curText.substr(0, curText.length - 1));
    } else {
        if (e.key.length > 1) {
            return;
        }
        let newText = curText + e.key;
        let regex = new RegExp("^" + curRegex + "$");
        if (regex.test(newText)) {
            saveGD(curId, newText);
        }
    }
}

export function keydown(e) {
        // e.preventDefault();
    lastKeypressTime = Date.now();
    if (loadGD(UI_TEXTEDIT_ACTIVE)) {
        doKeyboardInput(e);
        return;
    }
    if (isPlayerRunning()) {
        playerKeyDown(e.key);
        return;
    }
    keyPressMap[e.key] = true;
    // if (e.key == "s") {
    //     doZoom(-0.1);
    // }
    // if (e.key == "x") {
    //     doZoom(0.1);
    // }
    if (e.key == "q") {
        setGlobalThetaBase(getGlobalThetaBase() + 0.1);
    }
    if (e.key == "e") {
        setGlobalThetaBase(getGlobalThetaBase() - 0.1);
    }

    if (e.key == "w") {
        if (!loadGD(UI_PALETTE_BLOCKS))
            moveCamera(0, -1);
    }
    if (e.key == "s") {
        moveCamera(0, 1);
    }
    if (e.key == "a") {
        moveCamera(-1, 0);
    }
    if (e.key == "d") {
        moveCamera(1, 0);
    }

    if (e.key == '1') {
        saveGD(UI_TOPBAR_BLOCK, true);
        saveGD(UI_PALETTE_BLOCKS, true);
        saveGD(UI_PALETTE_MODE, UI_PALETTE_MODE_SOIL);
        closeEyedropperMixer();

    }

    if (e.key == '2') {
        saveGD(UI_TOPBAR_BLOCK, true);
        saveGD(UI_PALETTE_BLOCKS, true);
        saveGD(UI_PALETTE_MODE, UI_PALETTE_MODE_ROCK);
        closeEyedropperMixer();
    }

    if (e.key == '3') {
        saveGD(UI_TOPBAR_BLOCK, true);
        saveGD(UI_PALETTE_BLOCKS, true);
        saveGD(UI_PALETTE_MODE, UI_PALLETE_MODE_SPECIAL);
        saveGD(UI_PALETTE_SELECT, UI_PALETTE_WATER);
    }

    if (e.key == '4') {
        saveGD(UI_TOPBAR_BLOCK, true);
        saveGD(UI_PALETTE_BLOCKS, true);
        saveGD(UI_PALETTE_MODE, UI_PALLETE_MODE_SPECIAL);
        saveGD(UI_PALETTE_SELECT, UI_PALETTE_AQUIFER);
    }
    
    if (e.key == '5') {
        saveGD(UI_TOPBAR_BLOCK, true);
        saveGD(UI_PALETTE_PLANTS, true);
    }

    if (e.key == '7') {
        saveGD(UI_TOPBAR_BLOCK, true);
        saveGD(UI_PALETTE_BLOCKS, true);
        saveGD(UI_PALETTE_SELECT, UI_PALETTE_ERASE);
    }


    if (e.key == 'q') {
        saveGD(UI_PALETTE_SELECT, UI_PALETTE_EYEDROPPER);
    }
    if (e.key == 'w') {
        saveGD(UI_PALETTE_SELECT, UI_PALETTE_MIXER);
    }
    if (e.key == "Escape") {
        resetZoom();
    }
}

export function keyup(e) {
    if (isPlayerRunning()) {
        playerKeyUp(e.key);
    }
    if (e.key in keyPressMap) {
        keyPressMap[e.key] = false;
    }
}