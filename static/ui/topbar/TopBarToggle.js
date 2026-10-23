import { getBaseUISize } from "../../canvas.js";
import { COLOR_OTHER_BLUE, COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { MAIN_CONTEXT } from "../../index.js";
import { getLastMouseDownStart, isLeftMouseClicked } from "../../mouse.js";
import { loadGD, saveGD, UI_BOOLEAN } from "../UIData.js";
import { TopBarElementBase } from "./TopBarElementBase.js";

export class TopBarToggle extends TopBarElementBase{
    constructor(fontSize, textAlign, key, value, labelFunc, startMaxWidth=0) {
        super(fontSize, textAlign);
        this.key = key;
        this.value = value;
        this.labelFunc = labelFunc;
        this.lastClick = 0;
        this.maxWidth = startMaxWidth;
    }

    measure() {
        if (this.labelFunc() == "") {
            return [0, 0];
        }
        this.prepareStyle();
        let measured = MAIN_CONTEXT.measureText(this.labelFunc());
        this.maxWidth = Math.max(measured.width, this.maxWidth);
        return [this.maxWidth, measured.fontBoundingBoxAscent];
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
        if (this.lastClick != getLastMouseDownStart()) {
            this.lastClick = getLastMouseDownStart();
            if (this.value == UI_BOOLEAN) {
                saveGD(this.key, !loadGD(this.key));
            } else {
                saveGD(this.key, this.value);
            }
        }
    }
}