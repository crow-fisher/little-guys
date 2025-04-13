import { COLOR_BLACK, COLOR_OTHER_BLUE, COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { UI_TINYDOT } from "../../common.js";
import { MAIN_CONTEXT } from "../../index.js";
import { getTimeSinceLastKeypress } from "../../keyboard.js";
import { isLeftMouseClicked } from "../../mouse.js";
import { loadGD, saveGD, UI_CENTER, UI_TEXTEDIT_ACTIVE } from "../UIData.js";
import { WindowElement } from "../Window.js";

export class EditableText extends WindowElement {
    constructor(window, sizeX, sizeY, offsetX, key, regex, fontSizeMult=0.75) {
        super(window, sizeX, sizeY);
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.offsetX = offsetX;
        this.key = key;
        this.regex = regex;
        this.fontSizeMult = fontSizeMult;
    }

    render(startX, startY) {
        MAIN_CONTEXT.font = this.sizeY * this.fontSizeMult + "px courier"
        MAIN_CONTEXT.textBaseline = 'middle';
        MAIN_CONTEXT.fillStyle = "#FFFFFF";

        let renderLine = (loadGD(UI_TEXTEDIT_ACTIVE) == this.key) && ((getTimeSinceLastKeypress() < 500 || ((Date.now() % 1000) < 500)));
        let renderedText = UI_TINYDOT + (renderLine ? loadGD(this.key) + "|" : loadGD(this.key) + " ");
        if (this.offsetX == UI_CENTER) {
            MAIN_CONTEXT.textAlign = 'center';
            MAIN_CONTEXT.fillText(renderedText, startX + this.sizeX / 2, startY + (this.sizeY / 2))
        } else {
            MAIN_CONTEXT.textAlign = 'left';
            MAIN_CONTEXT.fillText(renderedText, startX + this.offsetX, startY + (this.sizeY / 2))
        }
        return [this.sizeX, this.sizeY];
    }

    hover(posX, posY) {
        if (isLeftMouseClicked()) {
            saveGD(UI_TEXTEDIT_ACTIVE, this.key);
        }
    }
}