import { rgbToHex } from "../../../../../color/color.js";

export class Square {
    constructor() {
        this.renderColor = [128, 128, 128];
        this.width = 1;
        this.height = 1;
    }

    render(canvasManager, posX, posY, blockSize) {
        canvasManager.context.fillStyle = rgbToHex(...this.renderColor);
        canvasManager.context.fillRect(posX * blockSize, posY * blockSize, this.width * blockSize, this.height * blockSize);
    }
}