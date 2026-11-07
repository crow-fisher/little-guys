import { rgbToRgba } from "../../../../color/color.js";

export class Square {
    constructor(posX, posY, color) {
        this.posX = posX;
        this.posY = posY;
        this.color = color;
        this.renderColor = rgbToRgba(...color);
        this.width = 1;
        this.height = 1;
    }

    update(planeManager) {
    }
    
    render(planeManager) {
        planeManager.canvasManager.context.fillStyle = this.renderColor;
        planeManager.canvasManager.renderSquare2D(this.posX, this.posY, this.width, this.height);
    }
}