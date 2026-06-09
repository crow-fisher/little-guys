import { loadGD, UI_CAMERA_OFFSET_VEC } from "../../ui/UIData.js";
import { addVec3Dest, copyVecValue, getVec3Length, subtractVectorsDest } from "../../util/vector.js";

export class CoordinateSet {
    constructor(cameraManager, world, worldOffset=null) {
        this.cameraManager = cameraManager;
        this.worldOffset = worldOffset;

        this.world = [0, 0, 0];
        this.offset = [0, 0, 0];
        this.camera = [0, 0, 0];
        this.screen = [0, 0, 0];
        this.renderNorm = [0, 0];
        this.renderScreen = [0, 0, 0];
        this.distToCamera = 0;

        if (world != null) {
            if (worldOffset == null)
                copyVecValue(world, this.world)
            else
                addVec3Dest(world, worldOffset, this.world);

            this.process();
        }
    }

    setWorld(newWorld) {
        copyVecValue(newWorld, this.world);
        this.process();
    }

    process() {
        subtractVectorsDest(this.world, this.cameraManager.cameraOffset, this.offset);
        this.cameraManager.cartesianToScreenInplace(this.offset, this.camera, this.screen);
        this.distToCamera = getVec3Length(this.offset);

        if (this.screen[2] > 0) {
            this.cameraManager.screenToRenderScreen(this.screen, this.renderNorm, this.renderScreen);
        } else {
            this.renderScreen[2] = this.screen[2]
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