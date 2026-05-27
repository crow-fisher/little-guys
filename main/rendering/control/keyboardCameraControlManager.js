import { loadGD, UI_CAMERA_OFFSET_VEC } from "../../ui/UIData.js";
import { CameraControlManager } from "./cameraControlManager.js";

export class KeyboardCameraControlManager extends CameraControlManager {
    isActive() {
        return this.cameraManager.isPointerLocked();
    }
    controlRoutine() {
        this.ref = loadGD(UI_CAMERA_OFFSET_VEC);
        if (this.cameraManager.isKeyPressed("w")) {
            this.ref[0] += 1;
        }
        if (this.cameraManager.isKeyPressed("s")) {
            this.ref[0] -= 1;
        }

        if (this.cameraManager.isKeyPressed("a")) {
            this.ref[1] += 1;
        }
        if (this.cameraManager.isKeyPressed("d")) {
            this.ref[1] -= 1;
        }
        if (this.cameraManager.isKeyPressed("q")) {
            this.ref[2] += 1;
        }
        if (this.cameraManager.isKeyPressed("e")) {
            this.ref[2] -= 1;
        }
        this.ref[0] -= this.cameraManager.getFrameMouseMove().x / 1;
        this.ref[1] -= this.cameraManager.getFrameMouseMove().y / 1;
    }
}