import { getCurDay, millis_per_day } from "../../climate/time.js";
import { MAIN_CONTEXT } from "../../index.js";
import { TopBarElementBase } from "./TopBarElementBase.js";

export class Time extends TopBarElementBase {
    constructor(fontSize) {
        super(fontSize);
    }
    measure() {
        this.prepareStyle();
        let curDay = getCurDay();
        let curDate = new Date(curDay * millis_per_day);
        let text = curDate.toLocaleString();
        var measured = MAIN_CONTEXT.measureText(text);
        return [measured.width, measured.fontBoundingBoxAscent];
    }

    render(startX, startY) {
        this.prepareStyle();
        let curDay = getCurDay();
        let curDate = new Date(curDay * millis_per_day);
        let text = curDate.toLocaleString();
        MAIN_CONTEXT.fillStyle = "#FFFFFF"
        MAIN_CONTEXT.fillText(text, startX, startY)
    }
}