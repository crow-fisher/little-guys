import { UI_CAMERA_OFFSET_VEC } from "../../ui/UIData.js";
import { CameraControlManager } from "./cameraControlManager.js";

export class KeyboardCameraControlManager extends CameraControlManager {
    isActive() {
        return true;
    }
    controlRoutine() {
        this.ref = loadGD(UI_CAMERA_OFFSET_VEC);

        if (this.)
        this.ref[0] -= this.cameraManager.getFrameMouseMove().x / 1;
        this.ref[1] -= this.cameraManager.getFrameMouseMove().y / 1;
    }
}