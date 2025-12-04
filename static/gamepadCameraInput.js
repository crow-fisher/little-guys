import { GBSL, GBSR, getLeftStick, getRightStick, isButtonPressed } from "./gamepad.js";
import { loadGD, saveGD, UI_CAMERA_OFFSET_VEC_DT, UI_CAMERA_ROTATION_VEC_DT } from "./ui/UIData.js";


export function gamepadCameraInput() {
    let ls = getLeftStick();
    let rs = getRightStick();
    let lsb = isButtonPressed(GBSL) ? .45 : 0;
    let rsb = isButtonPressed(GBSR) ? .45 : 0;

    let offset = 10;
    let applied = [0, 0, 0, 0]; 

    applied[0] += offset * ls[1];
    applied[1] -= offset * ls[0];
    applied[2] += offset * lsb;
    applied[2] -= offset * rsb;

    let ct = loadGD(UI_CAMERA_OFFSET_VEC_DT);
    ct[0] += applied[0];
    ct[1] += applied[1];
    ct[2] += applied[2];
    saveGD(UI_CAMERA_OFFSET_VEC_DT, ct)

    let crd = loadGD(UI_CAMERA_ROTATION_VEC_DT);
    offset = .01;
    crd[0] -= offset * rs[0];
    crd[1] -= offset * rs[1];
    saveGD(UI_CAMERA_ROTATION_VEC_DT, crd)
}