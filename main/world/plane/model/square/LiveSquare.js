import { rgbToRgba } from "../../../../../color/color.js";
import { Square } from "./Square.js";

export class LiveSquare extends Square {
    constructor(posX, posY, color) {
        super(posX, posY, color);
        this.spGravity = false;
    }

    update(planeManager) {
    }

    render(canvasManager) {
        super.render(canvasManager);
    }
}