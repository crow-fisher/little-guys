import { rgbToHex } from "../common.js";
import { MAIN_CANVAS, MAIN_CONTEXT } from "../index.js";
import { getBaseSoilColor } from "../squares/parameterized/SoilSquare.js";
import { WindowElement } from "./Window.js";

export class SoilPickerElement extends WindowElement {
    render(startX, startY) {
        for (let i = 0; i < this.sizeX; i++) {
            for (let j = 0; j < this.sizeY; j++) {
                this.renderSingleSquare(startX, startY, i, j);
            }
        }
    }
    renderSingleSquare(startX, startY, i, j) {
        var xp = i / this.sizeX;
        var yp = j / this.sizeY;
        var clayPercent = 1 - yp;
        
        var xp50 = (0.5 - xp);
        if (2 * (Math.abs(xp50)) > 1 - clayPercent) {
            return;
        }

        var siltPercent = (1 - clayPercent) * xp;
        var sandPercent = (1 - clayPercent) - siltPercent;

        var colorRGB = getBaseSoilColor(sandPercent, siltPercent, clayPercent);
        MAIN_CONTEXT.fillStyle = rgbToHex(colorRGB.r, colorRGB.g, colorRGB.b);
        MAIN_CONTEXT.fillRect(startX + i, startY + j, 1, 1);
    }
}

