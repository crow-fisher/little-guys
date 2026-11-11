import { rgbToRgba } from "../../../../../color/color.js";
import { multiplyVectorByScalarCopy } from "../../../../../util/vector.js";

export class LightSource {
    constructor(config) {
        this.color = config.colorConfig.rgbaArr;
        this.renderColor = rgbToRgba(...this.color);
    }

    update(plane) {
        plane.tickBoxes.forEach((box) => box.lighting = multiplyVectorByScalarCopy([1, 1, 1], .8 + .1 * Math.sin(Date.now() / 100 + .05 * ((box.posX ** 2 + box.posY ** 2)))));
    }

    render(planeManager, box) {
        planeManager.canvasManager.context.fillStyle = this.renderColor;
        planeManager.canvasManager.renderSquare2D(box.posX, box.posY, 1, 1);
    }
}