import { getBaseUISize } from "../../canvas.js";
import { COLOR_BLACK, COLOR_OTHER_BLUE, COLOR_VERY_FUCKING_RED, COLOR_WHITE } from "../../colors.js";
import { MAIN_CONTEXT } from "../../index.js";
import { isLeftMouseClicked } from "../../mouse.js";
import { loadGD, saveGD, UI_CENTER } from "../UIData.js";
import { WindowElement } from "../Window.js";

export class IBODEventViewer extends WindowElement {
    constructor(window, sizeX, sizeY) {
        super(window, sizeX, sizeY);
        this.sizeX = sizeX;
        this.sizeY = sizeY;
                
        this.half = sizeX / 2;
        this.third = sizeX / 3;
        this.quarter = sizeX / 4;
        this.offsetX = getBaseUISize() * 0.8;
        this.h1 = getBaseUISize() * 3;
        this.h2 = getBaseUISize() * 2.5;
        this.br = getBaseUISize() * .5;
    }

    render(startX, startY) {
        MAIN_CONTEXT.font = this.sizeY * this.fontSizeMult + "px " + this.font;
        MAIN_CONTEXT.textBaseline = 'middle';
        MAIN_CONTEXT.fillStyle = COLOR_WHITE;
        MAIN_CONTEXT.fillText("IBOD EVENT", startX + this.sizeX / 2, startY + (this.sizeY / 2))
        return [this.sizeX, this.sizeY];
    }
}