import { getCurDay, millis_per_day } from "../../climate/time.js";
import { MAIN_CONTEXT } from "../../index.js";
import { TopBarElementBase } from "./TopBarElementBase.js";

export class TopBarTime extends TopBarElementBase {
    constructor(fontSize, textFunc) {
        super(fontSize, "left");
        this.textFunc = textFunc;
    }
    measure() {
        this.prepareStyle();
        var measured = MAIN_CONTEXT.measureText(this.textFunc());
        return [measured.width, measured.fontBoundingBoxAscent];
    }

    render(startX, startY) {
        this.prepareStyle();
        MAIN_CONTEXT.fillStyle = "#FFFFFF"
        MAIN_CONTEXT.fillText(this.textFunc(), startX, startY)
    }

}