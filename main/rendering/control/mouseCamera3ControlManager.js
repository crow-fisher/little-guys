import { loadGD, UI_CAMERA_ROTATION_VEC } from "../../ui/UIData.js";
import { CameraControlManager } from "./cameraControlManager.js";

export class MouseCamera3ControlManager extends CameraControlManager {
    isActive() {
        if (this.cameraManager.isPointerLocked()) {
            if (this.cameraManager.isFrameButtonPressed(2)) {
                this.cameraManager.unlockPointer();
                return false;
            }
        } else {
            if (this.cameraManager.isFrameButtonPressed(0) && this.cameraManager.isButtonPressed(2)) {
                this.cameraManager.lockPointer();
            } else {
                return false;
            }
        }
        return true;
    }
    controlRoutine() {
        this.cameraManager.camera3Rotation[0] += this.cameraManager.getFrameMouseMove().x * 10;
        this.cameraManager.camera3Rotation[1] += this.cameraManager.getFrameMouseMove().y * 10; 
        this.cameraManager.camera3Rotation[1] = Math.min(Math.max(this.cameraManager.camera3Rotation[1], -Math.PI / 2), Math.PI / 2)
        this.cameraManager.mainManager.uiManager.astronomyAtlasComponent.dirtyConfig = true;
    }
}