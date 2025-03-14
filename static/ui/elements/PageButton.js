import { getBaseUISize } from "../../canvas.js";
import { COLOR_BLACK, COLOR_OTHER_BLUE, COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { MAIN_CONTEXT } from "../../index.js";
import { getLastMouseDown, isLeftMouseClicked } from "../../mouse.js";
import { loadUI, saveUI, UI_CENTER } from "../UIData.js";
import { WindowElement } from "../Window.js";

export class PageButton extends WindowElement {
    constructor(window, sizeX, sizeY, offsetX, keyFunc, colorFunc, textSizeMult = 0.75) {
        super(window, sizeX, sizeY);
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.offsetX = offsetX;
        this.keyFunc = keyFunc;
        this.colorFunc = colorFunc;
        this.textSizeMult = textSizeMult; 
        this.lastClick = 0;
    }

    render(startX, startY) {
        MAIN_CONTEXT.font = this.sizeY * this.textSizeMult + "px courier"
        MAIN_CONTEXT.textAlign = 'center';
        MAIN_CONTEXT.textBaseline = 'middle';
        MAIN_CONTEXT.fillStyle = this.colorFunc();
        MAIN_CONTEXT.fillRect(startX, startY, this.sizeX, this.sizeY);
        return [this.sizeX, this.sizeY];
    }

    hover(posX, posY) {
        super.hover(posX, posY);
        if (!isLeftMouseClicked()) {
            return;
        } 
        if (this.lastClick != getLastMouseDown()) {
            saveUI(this.keyFunc(), loadUI(this.keyFunc()) + 1);
            this.lastClick = getLastMouseDown();
        }
    }

}