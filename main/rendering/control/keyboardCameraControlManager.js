import { loadGD, UI_CAMERA_OFFSET_VEC_DT } from "../../ui/UIData.js";
import { CameraControlManager } from "./cameraControlManager.js";

export class KeyboardCameraControlManager extends CameraControlManager {
    isActive() {
        return this.cameraManager.isPointerLocked();
    }
    controlRoutine() {
        this.ref = loadGD(UI_CAMERA_OFFSET_VEC_DT);
        this.rate = 0.8;
        if (this.cameraManager.isKeyPressed("q")) {
            this.ref[1] += this.rate;
        }
        if (this.cameraManager.isKeyPressed("e")) {
            this.ref[1] -= this.rate;
        }
        if (this.cameraManager.isKeyPressed("d")) {
            this.ref[0] += this.rate;
        }
        if (this.cameraManager.isKeyPressed("a")) {
            this.ref[0] -= this.rate;
        }
        if (this.cameraManager.isKeyPressed("s")) {
            this.ref[2] += this.rate;
        }
        if (this.cameraManager.isKeyPressed("w")) {
            this.ref[2] -= this.rate;
        }
        this.ref[0] -= this.cameraManager.getFrameMouseMove().x / 1;
        this.ref[1] -= this.cameraManager.getFrameMouseMove().y / 1;
    }
}