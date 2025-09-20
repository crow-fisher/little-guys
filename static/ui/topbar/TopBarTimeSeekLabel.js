import { getBaseUISize } from "../../canvas.js";
import { COLOR_OTHER_BLUE, COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { MAIN_CONTEXT } from "../../index.js";
import { getLastMouseDown, isLeftMouseClicked } from "../../mouse.js";
import { loadGD, saveGD, UI_BOOLEAN, UI_SPEED, UI_SPEED_10, UI_SPEED_11, UI_SPEED_12, UI_SPEED_13, UI_SPEED_14, UI_SPEED_15, UI_SPEED_16, UI_SPEED_17, UI_SPEED_18, UI_SPEED_19 } from "../UIData.js";
import { TopBarElementBase } from "./TopBarElementBase.js";

export class TopBarTimeSeekLabel extends TopBarElementBase{
    constructor(fontSize, textAlign, labelFunc, startMaxWidth=0) {
        super(fontSize, textAlign);
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
        let checked = [UI_SPEED_10,UI_SPEED_11,UI_SPEED_12,UI_SPEED_13,UI_SPEED_14,UI_SPEED_15,UI_SPEED_16,UI_SPEED_17,UI_SPEED_18,UI_SPEED_19].includes(loadGD(UI_SPEED))
        if (checked)
            MAIN_CONTEXT.fillStyle = "#FFFFFF";
        else
            MAIN_CONTEXT.fillStyle = "#999999";
        MAIN_CONTEXT.font = this.fontSize * 1.25 + "px courier"
        MAIN_CONTEXT.fillText(this.labelFunc(), startX, startY)
    }

    hover(posX, posY) {
        if (!isLeftMouseClicked()) {
            return;
        } 
        if (this.lastClick != getLastMouseDown()) {
            this.lastClick = getLastMouseDown();
            saveGD(UI_SPEED, UI_SPEED_10);
        }
    }
}