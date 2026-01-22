import { reset3DCameraTo2DScreen } from "./camera.js";
import { getBaseSize, moveCamera, resetZoom, rotatePoint } from "./canvas.js";
import { getActiveClimate } from "./climate/climateManager.js";
import { getGlobalThetaBase, setGlobalThetaBase } from "./globals.js";
import { isPlayerRunning, playerKeyDown, playerKeyUp } from "./player/playerMain.js";
import { addSquareOverride } from "./squares/_sqOperations.js";
import { loadGD, saveGD, UI_PALETTE_EYEDROPPER, UI_PALLETE_MODE_SPECIAL, UI_PALETTE_MIXER, UI_PALETTE_BLOCKS, UI_PALETTE_SELECT, UI_PALETTE_WATER, UI_TOPBAR_BLOCK, UI_PALETTE_AQUIFER, closeEyedropperMixer, UI_PALETTE_ERASE, UI_TEXTEDIT_ACTIVE, UI_REGEX, UI_PALETTE_MODE, UI_PALETTE_MODE_SOIL, UI_PALETTE_MODE_ROCK, UI_PALETTE_PLANTS, UI_PALETTE_ROCKIDX, addUIFunctionMap, UI_PALETTE_COMPOSITION, UI_VIEWMODE_SELECT, UI_VIEWMODE_3D, UI_CAMERA_OFFSET_VEC_DT, UI_CAMERA_OFFSET_VEC, UI_CAMERA_ROTATION_VEC, UI_CAMERA_ROTATION_VEC_DT, UI_STARMAP_ROTATION_VEC_DT, UI_CANVAS_VIEWPORT_CENTER_X, UI_CANVAS_VIEWPORT_CENTER_Z, UI_CANVAS_VIEWPORT_CENTER_Y, UI_CANVAS_SQUARES_ZOOM, UI_STARMAP_CONSTELATION_BRIGHTNESS, UI_CAMERA_FOV } from "./ui/UIData.js";
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

function _applyDeltaToVec(applied, offset, dx, dy, dz) {
    applied[0] += offset * dx; 
    applied[1] += offset * dy; 
    applied[2] += offset * dz;
    return applied; 
}

function _3dViewKeymap(key) {
    let offset = 10;
    let applied = [0, 0, 0, 0];

    if (key == 's') {
        applied[0] += offset; 
    }
    if (key == 'w') { 
        applied[0] -= offset; 
    }
    if (key == 'd') {
        applied[1] -= offset; 
    }
    if (key == 'a') {
        applied[1] += offset; 
    }
    if (key == 'q') {
        applied[2] += offset; 
    }
    if (key == 'e') {
        applied[2] -= offset;
    }

    let ct = loadGD(UI_CAMERA_OFFSET_VEC_DT);
    ct[0] += applied[0];
    ct[1] += applied[1];
    ct[2] += applied[2];
    saveGD(UI_CAMERA_OFFSET_VEC_DT, ct)

    let crd = loadGD(UI_CAMERA_ROTATION_VEC_DT);
    offset = .01;
    if (key == 'l') {
        crd[0] += offset; 
    }
    if (key == 'j') { 
        crd[0] -= offset; 
    }
    if (key == 'k') {
        crd[1] += offset; 
    }
    if (key == 'i') {
        crd[1] -= offset; 
    }
    saveGD(UI_CAMERA_ROTATION_VEC_DT, crd);

    if (key == 'u') {
        saveGD(UI_STARMAP_CONSTELATION_BRIGHTNESS, loadGD(UI_STARMAP_CONSTELATION_BRIGHTNESS) - .01);
    }
    if (key === 'o') {
        saveGD(UI_STARMAP_CONSTELATION_BRIGHTNESS, loadGD(UI_STARMAP_CONSTELATION_BRIGHTNESS) + .01);
    }

    if (key == '7') {
        saveGD(UI_CAMERA_FOV, loadGD(UI_CAMERA_FOV) + 10);
    }
    if (key === '8') {
        saveGD(UI_CAMERA_FOV, loadGD(UI_CAMERA_FOV) - 10);
    }


    if (key == 'Escape') {
            saveGD(UI_CANVAS_VIEWPORT_CENTER_X, 0);
            saveGD(UI_CANVAS_VIEWPORT_CENTER_Y, 0);
        
        saveGD(UI_CAMERA_OFFSET_VEC, [0, 0, -50, 1]);
        saveGD(UI_CAMERA_OFFSET_VEC, [0, 0, -50, 1]);
        saveGD(UI_CAMERA_OFFSET_VEC_DT, [0, 0, 0, 0]);
        saveGD(UI_CAMERA_ROTATION_VEC, [0, 0, 0, 0]);
        saveGD(UI_CAMERA_ROTATION_VEC_DT, [0, 0, 0, 0]);
    }

    if (key == ' ') {
        reset3DCameraTo2DScreen();
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

    let starmapVecDt = loadGD(UI_STARMAP_ROTATION_VEC_DT);

    if (key == "j") {
        starmapVecDt = _applyDeltaToVec(starmapVecDt, .01, -1, 0, 0);
    }
    if (key == "l") {
        starmapVecDt = _applyDeltaToVec(starmapVecDt, .01, 1, 0, 0);
    }
    if (key == "i") {
        starmapVecDt = _applyDeltaToVec(starmapVecDt, .01, 0, -1, 0);
    }
    if (key == "k") {
        starmapVecDt = _applyDeltaToVec(starmapVecDt, .01, 0, 1, 0);
    }
    if (key == "u") {
        starmapVecDt = _applyDeltaToVec(starmapVecDt, .01, 0, 0, -1);
    }
    if (key == "o") {
        starmapVecDt = _applyDeltaToVec(starmapVecDt, .01, 0, 0, 1);
    }

    saveGD(UI_STARMAP_ROTATION_VEC_DT, starmapVecDt);

    if (key == "Escape") {
        resetZoom();
    }
}

export function keydown(e) {
    // e.preventDefault();
    lastKeypressTime = Date.now();
    keyPressMap[e.key] = true;
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