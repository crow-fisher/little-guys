import { getVec3Length, subtractVectorsDest } from "../../climate/stars/matrix.js";
import { getTotalCanvasPixelHeight, getTotalCanvasPixelWidth } from "../../index.js";
import { cartesianToScreenInplace, gfc, screenToRenderScreen } from "../camera.js";

export class CoordinateSet {
    constructor(world) {
        this.world = world;
        this.offset = [0, 0, 0];
        this.camera = [0, 0, 0];
        this.screen = [0, 0, 0];
        this.renderNorm = [0, 0];
        this.renderScreen = [0, 0, 0];
        this.distToCamera = 0;
        
        this.process(); // why did you...not do this!!!
    }

    process() {
        subtractVectorsDest(this.world, gfc().cameraOffset, this.offset);
        cartesianToScreenInplace(this.offset, this.camera, this.screen);
            screenToRenderScreen(this.screen, this.renderNorm, this.renderScreen,
                gfc()._xOffset, gfc()._yOffset, gfc()._s);
        this.distToCamera = getVec3Length(this.offset);
    }

    isVisibleOnScreen() {
        return this.renderScreen[0] > 0 &&
                this.renderScreen[0] < getTotalCanvasPixelWidth() &&
                this.renderScreen[1] > 0 && 
                this.renderScreen[1] < getTotalCanvasPixelHeight() && 
                this.renderScreen[2] > 0
    }
}