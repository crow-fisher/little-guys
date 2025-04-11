import { COLOR_BLACK, COLOR_OTHER_BLUE, COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { MAIN_CONTEXT } from "../../index.js";
import { getLastMouseDown, isLeftMouseClicked } from "../../mouse.js";
import { loadGD, saveGD, UI_CENTER } from "../UIData.js";
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
        return [this.sizeX, this.sizeY];
    }

    render(startX, startY) {
        MAIN_CONTEXT.font = this.sizeY * 0.75 + "px couier"
        MAIN_CONTEXT.textBaseline = 'middle';
        MAIN_CONTEXT.fillStyle = this.colorFunc();
        MAIN_CONTEXT.fillRect(startX, startY, this.sizeX, this.sizeY);
        MAIN_CONTEXT.strokeStyle = COLOR_BLACK;

        if (this.offsetX == UI_CENTER) {
            MAIN_CONTEXT.textAlign = 'center';
            MAIN_CONTEXT.fillText(this.label, startX + this.sizeX / 2, startY + this.sizeY / 2);
        } else {
            MAIN_CONTEXT.textAlign = 'left';
            MAIN_CONTEXT.fillText(this.label, startX + this.offsetX, startY + this.sizeY / 2);
        }
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