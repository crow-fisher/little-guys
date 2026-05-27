import { loadGD, UI_CAMERA_ROTATION_VEC } from "../../ui/UIData.js";
import { CameraControlManager } from "./cameraControlManager.js";

export class MouseCameraControlManager extends CameraControlManager {
    isActive() {
        if (this.cameraManager.isPointerLocked()) {
            if (this.cameraManager.isFrameButtonPressed(2)) {
                this.cameraManager.unlockPointer();
                return false;
            }
        } else {
            if (this.cameraManager.isFrameButtonPressed(0)) {
                this.cameraManager.lockPointer();
            } else {
                return false;
            }
        }
        return true;
    }
    controlRoutine() {
        this.ref = loadGD(UI_CAMERA_ROTATION_VEC);
        this.ref[0] += this.cameraManager.getFrameMouseMove().x / 1;
        this.ref[1] += this.cameraManager.getFrameMouseMove().y / 1;
    }
}