import { rgbToHex } from "../../../../../color/color.js";

export class Square {
    constructor(blockSize, color) {
        this.blockSize = blockSize;
        this.renderColor = structuredClone(color);
        this.width = 1;
        this.height = 1;
    }

    render(canvasManager, posX, posY) {
        canvasManager.context.fillStyle = rgbToHex(...this.renderColor);
        canvasManager.context.fillRect(posX, posY, this.width * this.blockSize, this.height * this.blockSize);
    }
}