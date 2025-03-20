import { COLOR_OTHER_BLUE, COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { MAIN_CONTEXT } from "../../index.js";
import { getLastMouseDown, isLeftMouseClicked } from "../../mouse.js";
import { loadUI, saveUI, UI_CENTER } from "../UIData.js";
import { WindowElement } from "../Window.js";

export class Button extends WindowElement {
    constructor(window, sizeX, sizeY, offsetX, func, label, colorFunc) {
        super(window, sizeX, sizeY);
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.offsetX = offsetX;
        this.func = func;
        this.label = label;
        this.lastClick = 0;
        this.colorFunc = colorFunc;
    }

    size() {
        return [this.sizeX + this.offsetX, this.sizeY];
    }

    render(startX, startY) {
        MAIN_CONTEXT.font = this.sizeY * 0.75 + "px courier"
        MAIN_CONTEXT.textAlign = 'left';
        MAIN_CONTEXT.textBaseline = 'middle';
        MAIN_CONTEXT.fillStyle = this.colorFunc();
        MAIN_CONTEXT.fillRect(startX, startY, this.sizeX + this.offsetX, this.sizeY);
        MAIN_CONTEXT.strokeText(this.label, startX + this.offsetX, startY + this.sizeY / 2);
        return [this.sizeX, this.sizeY];
    }

    hover(posX, posY) {
        super.hover(posX, posY);
        if (!isLeftMouseClicked()) {
            return;
        } 
        if (this.lastClick != getLastMouseDown()) {
            this.func();
            this.lastClick = getLastMouseDown();
        }
    }

}