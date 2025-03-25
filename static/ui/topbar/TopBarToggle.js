import { COLOR_OTHER_BLUE, COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { MAIN_CONTEXT } from "../../index.js";
import { getLastMouseDown, isLeftMouseClicked } from "../../mouse.js";
import { loadGD, saveGD, UI_BOOLEAN } from "../UIData.js";
import { TopBarElementBase } from "./TopBarElementBase.js";

export class TopBarToggle extends TopBarElementBase{
    constructor(fontSize, textAlign, key, value, labelFunc) {
        super(fontSize, textAlign);
        this.key = key;
        this.value = value;
        this.labelFunc = labelFunc;
        this.lastClick = 0;
    }

    measure() {
        if (this.labelFunc() == "") {
            return [0, 0];
        }
        this.prepareStyle();
        let measured = MAIN_CONTEXT.measureText(this.labelFunc());
        return [measured.width, measured.fontBoundingBoxAscent];
    }

    render(startX, startY) {
        if (this.labelFunc() == "") {
            return;
        }
        
        this.prepareStyle();

        let checked = false;
        if (this.value == UI_BOOLEAN) {
            checked = loadGD(this.key);
        } else {
            checked = loadGD(this.key) == this.value;
        }
        if (checked)
            MAIN_CONTEXT.fillStyle = "#FFFFFF";
        else
            MAIN_CONTEXT.fillStyle = "#999999";
        MAIN_CONTEXT.fillText(this.labelFunc(), startX, startY)
    }

    hover(posX, posY) {
        if (!isLeftMouseClicked()) {
            return;
        } 
        if (this.lastClick != getLastMouseDown()) {
            this.lastClick = getLastMouseDown();
            if (this.value == UI_BOOLEAN) {
                saveGD(this.key, !loadGD(this.key));
            } else {
                saveGD(this.key, this.value);
            }
        }
    }
}