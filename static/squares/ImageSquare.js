import { getBaseSize, zoomCanvasFillRect } from "../canvas.js";
import { rgbToRgba } from "../common.js";
import { MAIN_CONTEXT } from "../index.js";
import { BaseSquare } from "./BaseSqaure.js";
import { SoilSquare } from "./parameterized/SoilSquare.js";

export class ImageSquare extends SoilSquare {
    constructor(posX, posY, r, g, b, a) {
        super(posX, posY);
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        this.color = rgbToRgba(r, g, b, a);
        this.cachedRgba = this.color;
        this.sand = 0.333;
        this.silt = 0.333;
        this.clay = 1 - (this.sand + this.silt);
    }

    renderWithVariedColors() {
        MAIN_CONTEXT.fillStyle = this.color;
        zoomCanvasFillRect(
            (this.offsetX + this.posX) * getBaseSize(),
            (this.offsetY + this.posY) * getBaseSize(),
            getBaseSize(),
            getBaseSize()
        );
    }
}