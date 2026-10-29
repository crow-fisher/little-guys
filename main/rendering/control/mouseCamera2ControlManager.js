import { loadGD, UI_CAMERA_ROTATION_VEC } from "../../ui/UIData.js";
import { CameraControlManager } from "./cameraControlManager.js";

export class MouseCamera2ControlManager extends CameraControlManager {
    isActive() {
        if (this.cameraManager.isPointerLocked()) {
            return false;
        }

        return true;
    }
    controlRoutine() {

        if (this.cameraManager.mouseManager.isButtonPressed(1)) {
            this.cameraManager.camera2Offset[0] += this.cameraManager.mouseManager.doffset.x;
            this.cameraManager.camera2Offset[1] += this.cameraManager.mouseManager.doffset.y;
        }

        this.cameraManager.camera2Zoom += this.cameraManager.mouseManager.wheel / 10000;
    }
}