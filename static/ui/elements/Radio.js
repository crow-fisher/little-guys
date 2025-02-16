import { COLOR_BLACK, COLOR_OTHER_BLUE, COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { isLeftMouseClicked, MAIN_CONTEXT } from "../../index.js";
import { WindowElement } from "../Window.js";

export class Radio extends WindowElement {
    constructor(sizeX, sizeY, keyName, choices) {
        super(sizeX, sizeY);
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.keyName = keyName;
        this.choices = choices;
        this.selected = 0;
    }

    render(startX, startY) {
        var curX = 0;
        MAIN_CONTEXT.font = this.sizeY + "px courier"
        MAIN_CONTEXT.textAlign = 'center';
        MAIN_CONTEXT.textBaseline = 'middle';
        let step = this.sizeX / this.choices.length;
        for (let i = 0; i < this.choices.length; i++) {
            if (i == this.selected) {
                MAIN_CONTEXT.fillStyle = COLOR_VERY_FUCKING_RED;
            } else {
                MAIN_CONTEXT.fillStyle = COLOR_OTHER_BLUE;
            }
            MAIN_CONTEXT.fillRect(startX + curX, startY, step, this.sizeY);
            MAIN_CONTEXT.strokeText(this.choices[i], startX + (i * step) + step / 2, startY + (this.sizeY / 2))
            curX += step;
        }
    }

    hover(posX, posY) {
        super.hover(posX, posY);
        if (!isLeftMouseClicked()) {
            return;
        }
        var curX = 0;
        let step = this.sizeX / this.choices.length;
        for (let i = 0; i < this.choices.length; i++) {
            if (posX > curX && posX < curX + step) {
                this.selected = i;
            }
            curX += step;
        }
    }

}