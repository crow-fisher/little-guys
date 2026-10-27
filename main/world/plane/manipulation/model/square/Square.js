import { rgbToHex, rgbToRgba } from "../../../../../color/color.js";

export class Square {
    constructor(blockSize, posX, posY, color) {
        this.blockSize = blockSize;
        this.posX = posX;
        this.posY = posY;
        this.renderColor = structuredClone(color);
        this.width = 1;
        this.height = 1;
    }

    render(canvasManager) {
        canvasManager.context.fillStyle = rgbToRgba(...this.renderColor);
        canvasManager.context.fillRect(this.posX, this.posY, this.width * this.blockSize, this.height * this.blockSize);
    }
}