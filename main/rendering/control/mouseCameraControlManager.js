import { loadGD, UI_CAMERA_ROTATION_VEC } from "../../ui/UIData.js";
import { CameraControlManager } from "./cameraControlManager.js";

export class MouseCameraControlManager extends CameraControlManager {
    isActive() {

        if (this.cameraManager.triggerLockedPointer()) {
            this.cameraManager.getCanvas().requestPointerLock({unadjustedMovement: true}); 
        }
        return true;
    }
    controlRoutine() {
        this._ref = loadGD(UI_CAMERA_ROTATION_VEC);
        this._ref[0] += this.cameraManager.getFrameMouseMove().x / 1000;
        this._ref[1] -= this.cameraManager.getFrameMouseMove().y / 1000;
    }
}