import { rgbToHex, rgbToRgba } from "../../../../../color/color.js";

export class LiveSquare {
    constructor(posX, posY, color) {
        this.posX = posX;
        this.posY = posY;
        this.renderColor = structuredClone(color);
        this.width = 1;
        this.height = 1;

        // simulation parameters
        this.spGravity = false;
    }

    update() {

    }

    render(canvasManager) {
        canvasManager.context.fillStyle = rgbToRgba(...this.renderColor);
        canvasManager.renderSquare2D(this.posX, this.posY, this.width, this.height);
    }
}