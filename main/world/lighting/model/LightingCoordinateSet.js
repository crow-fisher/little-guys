import { addVec3Dest, copyVecValue, getVec3Length, subtractVectorsDest } from "../../../util/vector.js";

export class LightingCoordinateSet {
    constructor(lightingManager, world, worldOffset=null) {
        this.lightingManager = lightingManager;
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
        subtractVectorsDest(this.world, this.lightingManager.cameraOffset, this.offset);
        this.lightingManager.cartesianToScreenInplace(this.offset, this.camera, this.screen);
        this.distToCamera = getVec3Length(this.offset);

        if (this.screen[2] > 0) {
            this.lightingManager.screenToRenderScreen(this.screen, this.renderNorm, this.renderScreen);
        } else {
            this.renderScreen[2] = this.screen[2]
        }

        this.renderScreen[2] = this.camera[2]

    }

    isVisibleOnScreen() {
        return this.screen[2] > 0 &&
            this.renderScreen[0] > 0 &&
            this.renderScreen[0] < this.lightingManager.getCanvasWidth() &&
            this.renderScreen[1] > 0 &&
            this.renderScreen[1] < this.lightingManager.getCanvasHeight();
    }
}