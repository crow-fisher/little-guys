import { rgbToRgba } from "../../../../../color/color.js";
import { Square } from "./Square.js";

export class LiveSquare extends Square {
    constructor(posX, posY, color) {
        super(posX, posY, color);
        this.spGravity = false;
    }

    update() {

    }

    render(canvasManager) {
        canvasManager.context.fillStyle = rgbToRgba(...this.renderColor);
        canvasManager.renderSquare2D(this.posX, this.posY, this.width, this.height);
    }
}