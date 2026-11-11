import { rgbToRgba } from "../../../../../color/color.js";

export class LightSource {
    constructor(config) {
        this.color = config.colorConfig.rgbaArr;
        this.renderColor = rgbToRgba(...this.color);
    }

    render(planeManager, box) {
        planeManager.canvasManager.context.fillStyle = this.renderColor;
        planeManager.canvasManager.renderSquare2D(box.posX, box.posY, 1, 1);
    }
}