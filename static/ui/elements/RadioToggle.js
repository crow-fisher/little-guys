import { getBaseUISize } from "../../canvas.js";
import { COLOR_BLACK, COLOR_OTHER_BLUE, COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { MAIN_CONTEXT } from "../../index.js";
import { getLastMouseDown, isLeftMouseClicked } from "../../mouse.js";
import { loadUI, saveUI, UI_CENTER } from "../UIData.js";
import { WindowElement } from "../Window.js";

export class RadioToggle extends WindowElement {
    constructor(window, sizeX, sizeY, offsetX, key, value, colorInactiveFunc, colorActiveFunc, textSizeMult = 0.75) {
        super(window, sizeX, sizeY);
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.offsetX = offsetX;
        this.key = key;
        this.value = value;
        this.lastClick = 0;
        this.colorActiveFunc = colorActiveFunc;
        this.colorInactiveFunc = colorInactiveFunc;
        this.textSizeMult = textSizeMult;
    }

    render(startX, startY) {
        MAIN_CONTEXT.font = this.sizeY * this.textSizeMult + "px courier"
        MAIN_CONTEXT.textAlign = 'center';
        MAIN_CONTEXT.textBaseline = 'middle';
        if (loadUI(this.key) == this.value) {
            MAIN_CONTEXT.fillStyle = this.colorActiveFunc();
        } else {
            MAIN_CONTEXT.fillStyle = this.colorInactiveFunc();
        }
        MAIN_CONTEXT.fillRect(startX, startY, this.sizeX, this.sizeY);

        if (this.offsetX == UI_CENTER) {
            MAIN_CONTEXT.textAlign = 'center';
            MAIN_CONTEXT.strokeText(this.value, startX + this.sizeX / 2, startY + (this.sizeY / 2))
        } else {
            MAIN_CONTEXT.textAlign = 'left';
            MAIN_CONTEXT.strokeText(this.value, startX + this.offsetX, startY + (this.sizeY / 2))
        }
        return [this.sizeX, this.sizeY];
    }

    hover(posX, posY) {
        super.hover(posX, posY);
        if (!isLeftMouseClicked()) {
            return;
        } 
        if (this.lastClick != getLastMouseDown()) {
            saveUI(this.key, this.value);
            this.lastClick = getLastMouseDown();
        }
    }

}