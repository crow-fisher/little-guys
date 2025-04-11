import { COLOR_BLACK, COLOR_OTHER_BLUE, COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { MAIN_CONTEXT } from "../../index.js";
import { isLeftMouseClicked } from "../../mouse.js";
import { loadGD, saveGD, UI_CENTER } from "../UIData.js";
import { WindowElement } from "../Window.js";

export class TextBackground extends WindowElement {
    constructor(window, sizeX, sizeY, offsetX, colorFunc, sizeMult, text) {
        super(window, sizeX, sizeY);
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.offsetX = offsetX;
        this.colorFunc = colorFunc;
        this.sizeMult = sizeMult;
        this.text = text;
    }

    render(startX, startY) {
        MAIN_CONTEXT.font = this.sizeY * this.sizeMult + "px couier"
        MAIN_CONTEXT.textBaseline = 'middle';
        MAIN_CONTEXT.fillStyle = this.colorFunc();
        MAIN_CONTEXT.fillRect(startX, startY, this.sizeX, this.sizeY);
        MAIN_CONTEXT.fillStyle = "#000000"
        MAIN_CONTEXT.strokeStyle = "#000000"
        if (this.offsetX == UI_CENTER) {
            MAIN_CONTEXT.textAlign = 'center';
            MAIN_CONTEXT.fillText(this.text, startX + this.sizeX / 2, startY + (this.sizeY / 2))
        } else {
            MAIN_CONTEXT.textAlign = 'left';
            MAIN_CONTEXT.fillText(this.text, startX + this.offsetX, startY + (this.sizeY / 2))
        }
        return [this.sizeX, this.sizeY];
    }
}