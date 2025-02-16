import { MAIN_CANVAS, MAIN_CONTEXT } from "../index.js";
import { getBaseSoilColor } from "../squares/parameterized/SoilSquare.js";
import { WindowElement } from "./Window.js";

class SoilPickerElement extends WindowElement {
    render(startX, startY) {
        for (let i = 0; i < this.sizeX; i++) {
            for (let j = 0; j < this.sizeY; j++) {
                this.renderSingleSquare(startX, startY, i, j, color);
            }
        }
    }
    renderSingleSquare(startX, startY, i, j) {
        var xp = i / this.sizeX;
        var yp = j / this.sizeY;
        var clayPercent = 1 - yp;
        
        var xp50 = (0.5 - xp);
        if (Math.abs(xp50) > 1 - clayPercent) {
            return;
        }

        var siltPercent = (1 - clayPercent) * xp;
        var sandPercent = (1 - clayPercent) - siltPercent;

        var colorRGB = getBaseSoilColor(sandPercent, siltPercent, clayPercent);
        MAIN_CANVAS.fillStyle = rgbToHex(colorRGB);
        MAIN_CANVAS.fillRect(startX + i, startY + j, 1, 1);
    }
}

