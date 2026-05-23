import { COLOR_BLACK, COLOR_OTHER_BLUE, COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { MAIN_CONTEXT } from "../../index.js";
import { isLeftMouseClicked } from "../../mouse.js";
import { loadGD, saveGD, UI_CENTER } from "../UIData.js";
import { WindowElement } from "../Window.js";

export class TextFunctionalBackground extends WindowElement {
    constructor(window, sizeX, sizeY, offsetX, textFunc, fillFillStyleFunc, fontSizeMult=0.75, textFillStyle=COLOR_BLACK) {
        super(window, sizeX, sizeY);
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.offsetX = offsetX;
        this.textFunc = textFunc;
        this.fillFillStyleFunc = fillFillStyleFunc;
        this.fontSizeMult = fontSizeMult;
        this.textFillStyle = textFillStyle;
    }

    render(startX, startY) {
        MAIN_CONTEXT.fillStyle = this.fillFillStyleFunc();
        MAIN_CONTEXT.fillRect(startX, startY, this.sizeX, this.sizeY);
        MAIN_CONTEXT.font = this.sizeY * this.fontSizeMult + "px courier"
        MAIN_CONTEXT.textBaseline = 'middle';
        MAIN_CONTEXT.fillStyle = this.textFillStyle;
        if (this.offsetX == UI_CENTER) {
            MAIN_CONTEXT.textAlign = 'center';
            MAIN_CONTEXT.fillText(this.textFunc(), startX + this.sizeX / 2, startY + (this.sizeY / 2))
        } else {
            MAIN_CONTEXT.textAlign = 'left';
            MAIN_CONTEXT.fillText(this.textFunc(), startX + this.offsetX, startY + (this.sizeY / 2))
        }
        return [this.sizeX, this.sizeY];
    }
}