import { COLOR_BLACK } from "../../colors.js";
import { rgbToHex } from "../../common.js";
import { MAIN_CONTEXT } from "../../index.js";
import { isLeftMouseClicked } from "../../mouse.js";
import { getBaseRockColor } from "../../squares/parameterized/RockSquare.js";
import { getBaseNutrientRate, getBasePercolationRate, getBaseSoilColor } from "../../squares/parameterized/SoilSquare.js";
import { loadUI, saveUI, UI_SOIL_COMPOSITION, UI_SOIL_VIEWMODE } from "../UIData.js";
import { WindowElement } from "../Window.js";

export const R_COLORS = "🎨";
export const R_PERCOLATION_RATE = "💦";
export const R_NUTRIENTS = "⚡";

export class SoilPickerElement extends WindowElement {
    constructor(window, key, sizeX, sizeY) {
        super(window, key, sizeX, sizeY);
        this.pickerSize = Math.min(sizeX, sizeY);
        this.hoverColor = {r: 100, g: 100, b: 100};
        this.clickColor = {r: 100, g: 100, b: 100};
        this.clickLoc = null;
    }

    render(startX, startY) {
        for (let i = 0; i < this.pickerSize; i++) {
            for (let j = 0; j < this.pickerSize; j++) {
                this.renderSingleSquare(startX, startY, i, j);
            }
        }

        if (this.clickLoc != null) {
            MAIN_CONTEXT.fillStyle = COLOR_BLACK;
            MAIN_CONTEXT.fillRect(startX + this.clickLoc[0] - 2, startY + this.clickLoc[1] - 2, 4, 4);
        }

        var colorSize = (this.sizeX - this.pickerSize) / 2;

        MAIN_CONTEXT.fillStyle = rgbToHex(this.hoverColor.r, this.hoverColor.g, this.hoverColor.b);
        MAIN_CONTEXT.fillRect(startX + this.pickerSize, startY, colorSize, this.sizeY);
        MAIN_CONTEXT.fillStyle = rgbToHex(this.clickColor.r, this.clickColor.g, this.clickColor.b);
        MAIN_CONTEXT.fillRect(startX + this.pickerSize + colorSize, startY, colorSize, this.sizeY);
        return [this.sizeX, this.sizeY]
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

    getBaseColor(sand, silt, clay) {
        if (this.func == UI_SOIL_COMPOSITION) {
            return getBaseSoilColor(sand, silt, clay);
        } else {
            return getBaseRockColor(sand, silt, clay);
        }
    }

    getSquareColor(i, j) {
        var arr = this.getSquareComposition(i, j);
        if (arr != null) {
            let val, val_max, mult;
            switch (loadUI(UI_SOIL_VIEWMODE)) {
                case R_COLORS:
                    return this.getBaseColor(arr[0], arr[1], arr[2]);
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
                this.window.locked = true;
                this.clickColor = c;
                this.clickLoc = [posX, posY];
                saveUI(this.func, this.getSquareComposition(posX, posY))
            }
        }
    }
}
