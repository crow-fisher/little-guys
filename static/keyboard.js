import { moveCamera, resetZoom, rotatePoint } from "./canvas.js";
import { getActiveClimate } from "./climate/climateManager.js";
import { getGlobalThetaBase, setGlobalThetaBase } from "./globals.js";
import { isPlayerRunning, playerKeyDown, playerKeyUp } from "./player/playerMain.js";
import { loadGD, saveGD, UI_PALETTE_EYEDROPPER, UI_PALLETE_MODE_SPECIAL, UI_PALETTE_MIXER, UI_PALETTE_BLOCKS, UI_PALETTE_SELECT, UI_PALETTE_WATER, UI_TOPBAR_BLOCK, UI_PALETTE_AQUIFER, UI_PALETTE_SURFACE, closeEyedropperMixer, UI_PALETTE_ERASE, UI_TEXTEDIT_ACTIVE, UI_REGEX, UI_PALETTE_MODE, UI_PALETTE_MODE_SOIL, UI_PALETTE_MODE_ROCK, UI_PALETTE_SURFACE_OFF, UI_PALETTE_PLANTS, UI_PALETTE_ROCKIDX, addUIFunctionMap, UI_PALETTE_COMPOSITION, UI_STARMAP_XROTATION, UI_STARMAP_YROTATION, UI_STARMAP_ZROTATION, UI_STARMAP_YROTATION_SPEED, UI_STARMAP_XROTATION_SPEED, UI_STARMAP_ZROTATION_SPEED, UI_CAMERA_YOFFSET, UI_CAMERA_ZOFFSET, UI_CAMERA_XOFFSET, UI_CAMERA_XROTATION, UI_CAMERA_YROTATION, UI_CAMERA_ZROTATION, UI_VIEWMODE_SELECT, UI_VIEWMODE_3D, UI_CAMERA_ZOFFSET_DT, UI_CAMERA_XOFFSET_DT, UI_CAMERA_YOFFSET_DT, UI_CAMERA_OFFSET_VEC_DT, UI_CAMERA_OFFSET_VEC, UI_CAMERA_ROTATION_VEC } from "./ui/UIData.js";
import { clearMouseHoverColorCacheMap } from "./ui/WindowManager.js";

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

function _3dViewKeymap(key) {
    let offset = 1;
    let cur = [0, 0, 0, 0];
    if (key == 'd') {
        cur[0] += offset; 
    }
    if (key == 'a') { 
        cur[0] -= offset; 
    }
    if (key == 's') {
        cur[1] += offset; 
    }
    if (key == 'w') {
        cur[1] -= offset; 
    }
    if (key == 'q') {
        cur[2] += offset; 
    }
    if (key == 'e') {
        cur[2] -= offset; 
    }

    let cr = loadGD(UI_CAMERA_ROTATION_VEC)
    let transformed = rotatePoint(cur, cr[0], cr[1], cr[2]);

    cur[0] += transformed[0];
    cur[1] += transformed[1];
    cur[2] += transformed[2];
    
    saveGD(UI_CAMERA_OFFSET_VEC_DT, cur)

    if (key == 'Escape') {
        saveGD(UI_CAMERA_XOFFSET, 0);
        saveGD(UI_CAMERA_YOFFSET, 0);
        saveGD(UI_CAMERA_ZOFFSET, 0);
        saveGD(UI_CAMERA_XROTATION, 0);
        saveGD(UI_CAMERA_YROTATION, 0);
        saveGD(UI_CAMERA_ZROTATION, 0);
    }

}

function globalKeymap(key) {
    if (key == '1') {
        saveGD(UI_TOPBAR_BLOCK, true);
        saveGD(UI_PALETTE_BLOCKS, true);
        saveGD(UI_PALETTE_MODE, UI_PALETTE_MODE_SOIL);
        closeEyedropperMixer();
    }

    if (key == '2') {
        saveGD(UI_TOPBAR_BLOCK, true);
        saveGD(UI_PALETTE_BLOCKS, true);
        saveGD(UI_PALETTE_MODE, UI_PALETTE_MODE_ROCK);
        closeEyedropperMixer();
    }

    if (key == '3') {
        saveGD(UI_TOPBAR_BLOCK, true);
        saveGD(UI_PALETTE_BLOCKS, true);
        saveGD(UI_PALETTE_MODE, UI_PALLETE_MODE_SPECIAL);
        saveGD(UI_PALETTE_SELECT, UI_PALETTE_WATER);
    }

    if (key == '4') {
        saveGD(UI_TOPBAR_BLOCK, true);
        saveGD(UI_PALETTE_BLOCKS, true);
        saveGD(UI_PALETTE_MODE, UI_PALLETE_MODE_SPECIAL);
        saveGD(UI_PALETTE_SELECT, UI_PALETTE_AQUIFER);
    }

    if (key == '5') {
        saveGD(UI_TOPBAR_BLOCK, true);
        saveGD(UI_PALETTE_PLANTS, true);
    }

    if (key == '7') {
        saveGD(UI_TOPBAR_BLOCK, true);
        saveGD(UI_PALETTE_BLOCKS, true);
        saveGD(UI_PALETTE_SELECT, UI_PALETTE_ERASE);
    }

}

function transformComposition(sandDelta, clayDelta) {
    let arr = loadGD(UI_PALETTE_COMPOSITION);

    let sand = arr[0];
    let silt = arr[1];
    let clay = arr[2];

    let sandSiltCache = sand + silt;

    sand += sandDelta;
    silt -= sandDelta;
    clay += clayDelta;

    sand -= (sand / sandSiltCache) * clayDelta;
    silt -= (silt / sandSiltCache) * clayDelta;

    return [sand, silt, clay];
}

function rockKeymap(key) {
    if (key == "z")
        saveGD(UI_PALETTE_ROCKIDX, Math.max(0, loadGD(UI_PALETTE_ROCKIDX) - 1));
    if (key == "c")
        saveGD(UI_PALETTE_ROCKIDX, Math.min(getActiveClimate().rockColors.length - 1, loadGD(UI_PALETTE_ROCKIDX) + 1));

    if (key == "w") {
        saveGD(UI_PALETTE_COMPOSITION, transformComposition(0, .01));
    }
    if (key == "s") {
        saveGD(UI_PALETTE_COMPOSITION, transformComposition(0, -.01));
    }
    if (key == "a") {
        saveGD(UI_PALETTE_COMPOSITION, transformComposition(.001, 0));
    }
    if (key == "d") {
        saveGD(UI_PALETTE_COMPOSITION, transformComposition(-.001, 0));
    }
    if (key == 'q') {
        saveGD(UI_PALETTE_SELECT, UI_PALETTE_EYEDROPPER);
    }
    if (key == 'e') {
        saveGD(UI_PALETTE_SELECT, UI_PALETTE_MIXER);
    }
}

function toollessKeyMap(key) {
    if (key == "q") {
        setGlobalThetaBase(getGlobalThetaBase() + 0.1);
    }
    if (key == "e") {
        setGlobalThetaBase(getGlobalThetaBase() - 0.1);
    }

    if (key == "w") {
        if (!loadGD(UI_PALETTE_BLOCKS))
            moveCamera(0, -1);
    }
    if (key == "s") {
        moveCamera(0, 1);
    }
    if (key == "a") {
        moveCamera(-1, 0);
    }
    if (key == "d") {
        moveCamera(1, 0);
    }

    if (key == "j") {
        saveGD(UI_STARMAP_YROTATION_SPEED, loadGD(UI_STARMAP_YROTATION_SPEED) - .01);
    }
    if (key == "l") {
        saveGD(UI_STARMAP_YROTATION_SPEED, loadGD(UI_STARMAP_YROTATION_SPEED) + .01);
    }
    if (key == "i") {
        saveGD(UI_STARMAP_XROTATION_SPEED, loadGD(UI_STARMAP_XROTATION_SPEED) + .01);
    }
    if (key == "k") {
        saveGD(UI_STARMAP_XROTATION_SPEED, loadGD(UI_STARMAP_XROTATION_SPEED) - .01);
    }
    if (key == "u") {
        saveGD(UI_STARMAP_ZROTATION_SPEED, loadGD(UI_STARMAP_ZROTATION_SPEED) + .01);
    }
    if (key == "o") {
        saveGD(UI_STARMAP_ZROTATION_SPEED, loadGD(UI_STARMAP_ZROTATION_SPEED) - .01);
    }


    if (key == "Escape") {
        resetZoom();
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

    if (loadGD(UI_VIEWMODE_SELECT) == UI_VIEWMODE_3D) {
        _3dViewKeymap(e.key)
        return;
    }
    keyPressMap[e.key] = true;

    globalKeymap(e.key);

    let mode = loadGD(UI_PALETTE_MODE);
    let selectMode = loadGD(UI_PALETTE_SELECT);

    if (mode == UI_PALETTE_MODE_ROCK) {
        rockKeymap(e.key);
    } else {
        toollessKeyMap(e.key);
    }

    // if (e.key == "s") {
    //     doZoom(-0.1);
    // }
    // if (e.key == "x") {
    //     doZoom(0.1);
    // }

}

export function keyup(e) {
    if (isPlayerRunning()) {
        playerKeyUp(e.key);
    }
    if (e.key in keyPressMap) {
        keyPressMap[e.key] = false;
    }
}

addUIFunctionMap(UI_PALETTE_ROCKIDX, clearMouseHoverColorCacheMap);