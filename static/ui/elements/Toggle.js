import { COLOR_OTHER_BLUE, COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { MAIN_CONTEXT } from "../../index.js";
import { getLastMouseDown, isLeftMouseClicked } from "../../mouse.js";
import { loadUI, saveUI } from "../UIData.js";
import { WindowElement } from "../Window.js";

export class Toggle extends WindowElement {
    constructor(window, sizeX, sizeY, key, label) {
        super(window, sizeX, sizeY);
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.key = key;
        this.label = label;
        this.lastClick = 0;
    }

    render(startX, startY) {
        var curX = 0;
        MAIN_CONTEXT.font = this.sizeY - 10 + "px courier"
        MAIN_CONTEXT.textAlign = 'center';
        MAIN_CONTEXT.textBaseline = 'middle';
        if (loadUI(this.key)) {
            MAIN_CONTEXT.fillStyle = COLOR_VERY_FUCKING_RED;
        } else {
            MAIN_CONTEXT.fillStyle = COLOR_OTHER_BLUE;
        }
        MAIN_CONTEXT.fillRect(startX, startY, this.sizeX, this.sizeY);
        MAIN_CONTEXT.strokeText(this.label, startX + this.sizeX / 2, startY + this.sizeY / 2);
        return [this.sizeX, this.sizeY];
    }

    hover(posX, posY) {
        super.hover(posX, posY);
        if (!isLeftMouseClicked()) {
            return;
        } 
        if (this.lastClick != getLastMouseDown()) {
            saveUI(this.key, !loadUI(this.key));
            this.lastClick = getLastMouseDown();
        }
    }

}