import { rgbToHex } from "../common.js";
import { isLeftMouseClicked, MAIN_CANVAS, MAIN_CONTEXT } from "../index.js";
import { clayColorRgb, getBaseSoilColor, sandColorRgb } from "../squares/parameterized/SoilSquare.js";
import { saveUI, UI_SOIL_COMPOSITION } from "./UIData.js";
import { WindowElement } from "./Window.js";

export class SoilPickerElement extends WindowElement {
    constructor(sizeX, sizeY) {
        super(sizeX, sizeY);
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
            return getBaseSoilColor(arr[0], arr[1], arr[2]);
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

