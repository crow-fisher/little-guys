import { COLOR_OTHER_BLUE, COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { MAIN_CONTEXT } from "../../index.js";
import { getLastMouseDown, isLeftMouseClicked } from "../../mouse.js";
import { loadUI, saveUI, UI_BOOLEAN } from "../UIData.js";
import { TopBarElementBase } from "./TopBarElementBase.js";

export class TopBarToggle extends TopBarElementBase{
    constructor(fontSize, textAlign, key, value, label) {
        super(fontSize, textAlign);
        this.key = key;
        this.value = value;
        this.label = label;
        this.lastClick = 0;
    }

    measure() {
        this.prepareStyle();
        var measured = MAIN_CONTEXT.measureText(this.label);
        return [measured.width, measured.fontBoundingBoxAscent];
    }

    render(startX, startY) {
        this.prepareStyle();

        if (loadUI(this.key) == this.value)
            MAIN_CONTEXT.fillStyle = "#FFFFFF";
        else
            MAIN_CONTEXT.fillStyle = "#999999";
        MAIN_CONTEXT.fillText(this.label, startX, startY)
    }

    hover(posX, posY) {
        if (!isLeftMouseClicked()) {
            return;
        } 
        if (this.lastClick != getLastMouseDown()) {
            this.lastClick = getLastMouseDown();
            if (this.value == UI_BOOLEAN) {
                saveUI(this.key, !loadUI(this.key));
            } else {
                saveUI(this.key, this.value);
            }
        }
    }
}