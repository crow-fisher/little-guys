import { subtractVectorsDest } from "../../climate/stars/matrix.js";
import { cartesianToScreenInplace, gfc, screenToRenderScreen } from "../camera.js";

export class CoordinateSet {
    constructor(world) {
        this.world = world;
        this.offset = [0, 0, 0];
        this.camera = [0, 0, 0];
        this.screen = [0, 0, 0];
        this.renderNorm = [0, 0];
        this.renderScreen = [0, 0, 0];
    }

    process() {
        subtractVectorsDest(this.world, gfc().cameraOffset, this.offset);
        cartesianToScreenInplace(this.offset, this.camera, this.screen);
            screenToRenderScreen(this.screen, this.renderNorm, this.renderScreen,
                gfc()._xOffset, gfc()._yOffset, gfc()._s);
    }
}