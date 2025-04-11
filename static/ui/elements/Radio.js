import { COLOR_BLACK, COLOR_OTHER_BLUE, COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { MAIN_CONTEXT } from "../../index.js";
import { isLeftMouseClicked } from "../../mouse.js";
import { getMapEntry, loadGD, saveGD, saveMapEntry, UI_CENTER } from "../UIData.js";
import { WindowElement } from "../Window.js";

export class Radio extends WindowElement {
    constructor(window, sizeX, sizeY, elementOffsetX, map, key, choices, colorInactiveFunc, colorActiveFunc) {
        super(window, sizeX, sizeY);
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.elementOffsetX = elementOffsetX;
        this.map = map;
        this.key = key;
        this.choices = choices;
        this.colorActiveFunc = colorActiveFunc;
        this.colorInactiveFunc = colorInactiveFunc;
    }

    render(startX, startY) {
        let curX = 0;
        MAIN_CONTEXT.font = this.sizeY - 10 + "px couier"
        MAIN_CONTEXT.textBaseline = 'middle';
        let step = this.sizeX / this.choices.length;
        for (let i = 0; i < this.choices.length; i++) {
            if (i == this.choices.indexOf(getMapEntry(this.map, this.key))) {
                MAIN_CONTEXT.fillStyle = this.colorActiveFunc();
            } else {
                MAIN_CONTEXT.fillStyle = this.colorInactiveFunc();
            }
            MAIN_CONTEXT.fillRect(startX + curX, startY, step, this.sizeY);
            MAIN_CONTEXT.fillStyle = COLOR_BLACK;

            if (this.elementOffsetX == UI_CENTER) {
                MAIN_CONTEXT.textAlign = 'center';
                MAIN_CONTEXT.fillText(this.choices[i], startX + (i * step) + step / 2, 2 + startY + (this.sizeY / 2))
            } else {
                MAIN_CONTEXT.textAlign = 'left';
                MAIN_CONTEXT.fillText(this.choices[i], startX + (i * step) + this.elementOffsetX, 2 + startY + (this.sizeY / 2))
            }
            curX += step;
        }
        return [this.sizeX, this.sizeY];
    }

    hover(posX, posY) {
        super.hover(posX, posY);
        if (!isLeftMouseClicked()) {
            return;
        }
        let curX = 0;
        let step = this.sizeX / this.choices.length;
        for (let i = 0; i < this.choices.length; i++) {
            if (posX > curX && posX < curX + step) {
                saveMapEntry(this.map, this.key, this.choices[i]);
            }
            curX += step;
        }
    }

}