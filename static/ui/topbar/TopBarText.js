import { COLOR_OTHER_BLUE, COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { MAIN_CONTEXT } from "../../index.js";
import { getLastMouseDown, isLeftMouseClicked } from "../../mouse.js";
import { loadUI, saveUI, UI_BOOLEAN } from "../UIData.js";
import { TopBarElementBase } from "./TopBarElementBase.js";

export class TopBarText extends TopBarElementBase{
    constructor(fontSize, textAlign, labelFunc) {
        super(fontSize, textAlign);
        this.labelFunc = labelFunc;
        this.lastClick = 0;
    }

    measure() {
        if (this.labelFunc() == "") {
            return [0, 0];
        }
        this.prepareStyle();
        var measured = MAIN_CONTEXT.measureText(this.labelFunc());
        return [measured.width, measured.fontBoundingBoxAscent];
    }

    render(startX, startY) {
        if (this.labelFunc() == "") {
            return;
        }
        
        this.prepareStyle();

        let checked = false;
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
        }
    }
}