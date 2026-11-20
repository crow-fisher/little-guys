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
        
        if (world != null) {
            this.process();
        }
    }

    setWorld(newWorld) {

        if (newWorld.some(isNaN)) {
            // alert("Something nan tha tshouldn't be!");
        }
        this.world = newWorld;
        this.process();
    }

    process() {
        subtractVectorsDest(this.world, gfc().cameraOffset, this.offset);
        cartesianToScreenInplace(this.offset, this.camera, this.screen);
            screenToRenderScreen(this.screen, this.renderNorm, this.renderScreen,
                gfc()._xOffset, gfc()._yOffset, gfc()._s);
        this.distToCamera = getVec3Length(this.offset);
    }

    isVisibleOnScreen() {
        return true;
        return this.renderScreen[0] > 0 &&
                this.renderScreen[0] < getTotalCanvasPixelWidth() * 10 &&
                this.renderScreen[1] > 0 && 
                this.renderScreen[1] < getTotalCanvasPixelHeight() * 10 && 
                this.renderScreen[2] > 0
    }
}