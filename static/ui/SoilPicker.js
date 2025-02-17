import { rgbToHex } from "../common.js";
import { isLeftMouseClicked, MAIN_CANVAS, MAIN_CONTEXT } from "../index.js";
import { clayColorRgb, getBaseNutrientRate, getBasePercolationRate, getBaseSoilColor, sandColorRgb } from "../squares/parameterized/SoilSquare.js";
import { loadUI, saveUI, UI_SOIL_COMPOSITION, UI_SOIL_VIEWMODE } from "./UIData.js";
import { WindowElement } from "./Window.js";

export const R_COLORS = "🎨";
export const R_PERCOLATION_RATE = "💦";
export const R_NUTRIENTS = "⚡";

export class SoilPickerElement extends WindowElement {
    constructor(window, sizeX, sizeY) {
        super(window, sizeX, sizeY);
        this.pickerSize = Math.min(sizeX, sizeY);

        this.hoverColor = sandColorRgb;
        this.clickColor = clayColorRgb;
    }

    render(startX, startY) {
        for (let i = 0; i < this.pickerSize; i++) {
            for (let j = 0; j < this.pickerSize; j++) {
                this.renderSingleSquare(startX, startY, i, j);
            }
        }
        var colorSize = (this.sizeX - this.pickerSize) / 2;

        MAIN_CONTEXT.fillStyle = rgbToHex(this.hoverColor.r, this.hoverColor.g, this.hoverColor.b);
        MAIN_CONTEXT.fillRect(startX + this.pickerSize, startY, colorSize, this.sizeY);
        MAIN_CONTEXT.fillStyle = rgbToHex(this.clickColor.r, this.clickColor.g, this.clickColor.b);
        MAIN_CONTEXT.fillRect(startX + this.pickerSize + colorSize, startY, colorSize, this.sizeY);
    }

    getSquareComposition(i, j) {
        var xp = i / this.pickerSize;
        var yp = j / this.pickerSize;
        var clayPercent = 1 - yp;
        
        var xp50 = (0.5 - xp);
        if (2 * (Math.abs(xp50)) > 1 - clayPercent) {
            return;
        }

        var siltPercent = (1 - clayPercent) * xp;
        var sandPercent = (1 - clayPercent) - siltPercent;

        return [sandPercent, siltPercent, clayPercent];
    }

    getSquareColor(i, j) {
        var arr = this.getSquareComposition(i, j);
        if (arr != null) {
            let val, val_max, mult;
            switch (loadUI(UI_SOIL_VIEWMODE)) {
                case R_COLORS:
                    return getBaseSoilColor(arr[0], arr[1], arr[2]);
                case R_PERCOLATION_RATE:
                    val = getBasePercolationRate(arr[0], arr[1], arr[2]);
                    val_max = getBasePercolationRate(0, 0, 1);
                    mult = (val / val_max) ** 0.4;
                    break;
                case R_NUTRIENTS:
                default:
                    val = getBaseNutrientRate(arr[0], arr[1], arr[2]);
                    val_max = getBaseNutrientRate(0, 0, 1);
                    mult = val / val_max;
                    break;
            }
            return {
                r: Math.floor(mult * 255),
                g: Math.floor(mult * 255),
                b: Math.floor(mult * 255)
            }

        }
    }

    renderSingleSquare(startX, startY, i, j) {
        var colorRGB = this.getSquareColor(i, j);
        if (colorRGB != null) {
            MAIN_CONTEXT.fillStyle = rgbToHex(colorRGB.r, colorRGB.g, colorRGB.b);
            MAIN_CONTEXT.fillRect(startX + i, startY + j, 1, 1);
        }
       
    }

    hover(posX, posY) {
        super.hover(posX, posY);
        var c = this.getSquareColor(posX, posY);
        if (c != null) {
            this.hoverColor = c;
            if (isLeftMouseClicked()) {
                this.clickColor = c;
                saveUI(UI_SOIL_COMPOSITION, this.getSquareComposition(posX, posY))
            }
        }
    }
}
