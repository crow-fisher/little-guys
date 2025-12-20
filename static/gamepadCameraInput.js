import { reset3DCameraTo2DScreen } from "./camera.js";
import { getFrameDt } from "./climate/time.js";
import { GBA, GBDD, GBDL, GBDR, GBDU, GBSL, GBSR, getLeftStick, getRightStick, getTriggers, isButtonPressed } from "./gamepad.js";
import { loadGD, saveGD, UI_CAMERA_FOV, UI_CAMERA_OFFSET_VEC_DT, UI_CAMERA_ROTATION_VEC_DT, UI_STARMAP_CONSTELATION_BRIGHTNESS, UI_STARMAP_NORMAL_BRIGTNESS } from "./ui/UIData.js";


function boundValue(min, max, value) {
    return Math.min(max, Math.max(min, value));
}

export function gamepadCameraInput() {
    let ls = getLeftStick();
    let rs = getRightStick();
    let lsb = isButtonPressed(GBSL) ? .75 : 0;
    let rsb = isButtonPressed(GBSR) ? .75 : 0;
    let triggers = getTriggers();

    let offset = 1 * (getFrameDt() / 10);
    let applied = [0, 0, 0, 0]; 

    applied[0] += offset * ls[1];
    applied[1] -= offset * ls[0];
    applied[2] += offset * rsb;
    applied[2] -= offset * lsb;

    let ct = loadGD(UI_CAMERA_OFFSET_VEC_DT);
    ct[0] += applied[0];
    ct[1] -= applied[1];
    ct[2] += applied[2];
    saveGD(UI_CAMERA_OFFSET_VEC_DT, ct)

    let crd = loadGD(UI_CAMERA_ROTATION_VEC_DT);
    offset = .003 * (getFrameDt() / 10);
    crd[0] += offset * rs[0];
    crd[1] += offset * rs[1];
    saveGD(UI_CAMERA_ROTATION_VEC_DT, crd)

    // hotkeys 

    if (isButtonPressed(GBA)) {
        reset3DCameraTo2DScreen();
    }

    if (triggers[0] > 0) {
        saveGD(UI_CAMERA_FOV, loadGD(UI_CAMERA_FOV) + triggers[0]);
    }

    if (triggers[1] > 0) {
        saveGD(UI_CAMERA_FOV, loadGD(UI_CAMERA_FOV) - triggers[1]);
    }

    offset = 0.05;
    if (isButtonPressed(GBDU)) {
        saveGD(UI_STARMAP_NORMAL_BRIGTNESS, loadGD(UI_STARMAP_NORMAL_BRIGTNESS) + offset);
    }
    if (isButtonPressed(GBDD)) {
        saveGD(UI_STARMAP_NORMAL_BRIGTNESS, loadGD(UI_STARMAP_NORMAL_BRIGTNESS) - offset);
    }

    offset = .07;
    if (isButtonPressed(GBDL)) {
        saveGD(UI_STARMAP_CONSTELATION_BRIGHTNESS, loadGD(UI_STARMAP_CONSTELATION_BRIGHTNESS) - offset);
    }
    if (isButtonPressed(GBDR)) {
        saveGD(UI_STARMAP_CONSTELATION_BRIGHTNESS, loadGD(UI_STARMAP_CONSTELATION_BRIGHTNESS) + offset);
    }
    saveGD(UI_STARMAP_CONSTELATION_BRIGHTNESS, Math.max(0, loadGD(UI_STARMAP_CONSTELATION_BRIGHTNESS)));

    saveGD(UI_CAMERA_FOV, boundValue(10, 160,loadGD(UI_CAMERA_FOV)));
    // UI_STARMAP_NORMAL_BRIGTNESS
    // UI_STARMAP_CONSTELATION_BRIGHTNESS
}