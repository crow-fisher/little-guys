import { rgbToRgba } from "../../../../color/color.js";
import { copyVecValue } from "../../../../util/vector.js";
import { Square } from "./Square.js";

export class StaticSquare extends Square {
    constructor(posX, posY, color) {
        super(posX, posY);
        this.renderColor = color;
        this.renderColorRgba = rgbToRgba(...color);
    }

    update(planeManager) {
    }

    updateColor() {
        this.renderColorRgba = rgbToRgba(...this.renderColor);
    }
    
    render(planeManager) {
        planeManager.canvasManager.context.fillStyle = this.renderColorRgba;
        planeManager.canvasManager.renderSquare2D(this.posX, this.posY, this.width, this.height);
    }
}