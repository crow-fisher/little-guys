import { loadGD, UI_CAMERA_OFFSET_VEC_DT } from "../../ui/UIData.js";
import { CameraControlManager } from "./cameraControlManager.js";

export class KeyboardCameraControlManager extends CameraControlManager {
    isActive() {
        return this.cameraManager.isPointerLocked();
    }
    controlRoutine() {
        this.rate = 0.8;
        if (this.cameraManager.isKeyPressed("q")) {
            this.cameraManager.cameraOffsetDt[1] += this.rate;
        }
        if (this.cameraManager.isKeyPressed("e")) {
            this.cameraManager.cameraOffsetDt[1] -= this.rate;
        }
        if (this.cameraManager.isKeyPressed("d")) {
            this.cameraManager.cameraOffsetDt[0] += this.rate;
        }
        if (this.cameraManager.isKeyPressed("a")) {
            this.cameraManager.cameraOffsetDt[0] -= this.rate;
        }
        if (this.cameraManager.isKeyPressed("s")) {
            this.cameraManager.cameraOffsetDt[2] += this.rate;
        }
        if (this.cameraManager.isKeyPressed("w")) {
            this.cameraManager.cameraOffsetDt[2] -= this.rate;
        }
        this.cameraManager.cameraOffsetDt[0] -= this.cameraManager.getFrameMouseMove().x / 1;
        this.cameraManager.cameraOffsetDt[1] -= this.cameraManager.getFrameMouseMove().y / 1;
    }
}