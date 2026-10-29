import { loadGD, UI_CAMERA_ROTATION_VEC } from "../../ui/UIData.js";
import { clamp } from "../../util/func.js";
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
            this.cameraManager.camera2ViewportCenter[0] -= this.cameraManager.mouseManager.doffset.x;
            this.cameraManager.camera2ViewportCenter[1] -= this.cameraManager.mouseManager.doffset.y;
        }

        this.cameraManager.camera2Zoom -= Math.round(this.cameraManager.mouseManager.wheel / 100);
        this.cameraManager.camera2Zoom = clamp(this.cameraManager.camera2Zoom, 1, 12);
    }
}