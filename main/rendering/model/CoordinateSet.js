import { loadGD, UI_CAMERA_OFFSET_VEC } from "../../ui/UIData.js";
import { copyVecValue, getVec3Length, subtractVectorsDest } from "../../util/vector.js";

export class CoordinateSet {
    constructor(cameraManager, world) {
        this.cameraManager = cameraManager;
        this.world = [0, 0, 0];
        this.offset = [0, 0, 0];
        this.camera = [0, 0, 0];
        this.screen = [0, 0, 0];
        this.renderNorm = [0, 0];
        this.renderScreen = [0, 0, 0];
        this.distToCamera = 0;
        
        if (world != null) {
            copyVecValue(world, this.world)
            this.process();
        }
    }

    setWorld(newWorld) {
        copyVecValue(newWorld, this.world);
        this.process();
    }

    process() {
        subtractVectorsDest(this.world, loadGD(UI_CAMERA_OFFSET_VEC), this.offset);
        this.cameraManager.cartesianToScreenInplace(this.offset, this.camera, this.screen);
        if (this.screen[2] > 0) {
            this.cameraManager.screenToRenderScreen(this.screen, this.renderNorm, this.renderScreen);
            this.distToCamera = getVec3Length(this.offset);
        }
    }

    isVisibleOnScreen() {
        return this.screen[2] > 0 &&
            this.renderScreen[0] > 0 &&
            this.renderScreen[0] < this.cameraManager.getCanvasWidth() && 
            this.renderScreen[1] > 0 && 
            this.renderScreen[1] < this.cameraManager.getCanvasHeight();
    }
}