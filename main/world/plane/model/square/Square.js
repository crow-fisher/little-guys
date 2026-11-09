import { rgbToRgba } from "../../../../color/color.js";

export class Square {
    constructor(posX, posY) {
        this.PID = -1;
        this.posX = posX;
        this.posY = posY;
        this.width = 1;
        this.height = 1;
        this.renderColor = "rgba(173, 25, 173, 0.5)";
    }

    update(box, planeManager) {
    }
    
    render(planeManager) {
        planeManager.canvasManager.context.fillStyle = this.renderColor;
        planeManager.canvasManager.renderSquare2D(this.posX, this.posY, this.width, this.height);
    }
}