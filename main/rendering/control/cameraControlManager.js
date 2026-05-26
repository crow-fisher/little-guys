import { loadGD, saveGD, UI_CAMERA_CENTER_SELECT_OFFSET, UI_CAMERA_OFFSET_VEC, UI_CAMERA_ROTATION_VEC } from "../../ui/UIData.js";

export class CameraControlManager {
    constructor(cameraManager) {
        this.cameraManager = cameraManager;
    }
    isActive() {
        return false;
    }

    process() {
        if (this.isActive()) {
            this.controlRoutine();
        }
    }
    
    controlRoutine() {
        loadGD(UI_CAMERA_OFFSET_VEC)[0] = 0;
        loadGD(UI_CAMERA_OFFSET_VEC)[1] = 0;
        loadGD(UI_CAMERA_OFFSET_VEC)[2] = 0;

        loadGD(UI_CAMERA_ROTATION_VEC)[0] = Date.now() / 1000;
        loadGD(UI_CAMERA_ROTATION_VEC)[1] = Date.now() / 1000;
    }

    isPointerLocked() {
        return this.mainManager.canvasManager.pointerLock;
    }
}