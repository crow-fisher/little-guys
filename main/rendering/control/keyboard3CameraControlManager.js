import { loadGD, UI_CAMERA_OFFSET_VEC_DT } from "../../ui/UIData.js";
import { CameraControlManager } from "./cameraControlManager.js";

export class KeyboardCamera3ControlManager extends CameraControlManager {
    isActive() {
        return this.cameraManager.isPointerLocked();
    }
    controlRoutine() {
        this.rate = .0008 * this.cameraManager.mainManager.timeManager.dt;

        if (this.cameraManager.isKeyPressed("shift")) {
            this.rate *= 16;
        }
        if (this.cameraManager.isKeyPressed("control")) {
            this.rate /= 4;
        }
        if (this.cameraManager.isKeyPressed("q")) {
            this.cameraManager.camera3OffsetDt[1] += this.rate;
        }
        if (this.cameraManager.isKeyPressed("e")) {
            this.cameraManager.camera3OffsetDt[1] -= this.rate;
        }
        if (this.cameraManager.isKeyPressed("d")) {
            this.cameraManager.camera3OffsetDt[0] += this.rate;
        }
        if (this.cameraManager.isKeyPressed("a")) {
            this.cameraManager.camera3OffsetDt[0] -= this.rate;
        }
        if (this.cameraManager.isKeyPressed("s")) {
            this.cameraManager.camera3OffsetDt[2] += this.rate;
        }
        if (this.cameraManager.isKeyPressed("w")) {
            this.cameraManager.camera3OffsetDt[2] -= this.rate;
        }
        this.cameraManager.camera3OffsetDt[0] -= this.cameraManager.getFrameMouseMove().x / 1;
        this.cameraManager.camera3OffsetDt[1] -= this.cameraManager.getFrameMouseMove().y / 1;
    }
}