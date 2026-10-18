import { clamp, hsvaToRgba, hsvToHex, hsvToRgb, invlerp } from "../../../common.js";
import { getVec2Length } from "../../../util/vector.js";
import { loadGD, UI_COLORPICKER_CONFIG } from "../../UIData.js";
import { WindowElement } from "../../Window.js";

export class ColorInputTarget extends WindowElement {
    constructor(window, sizeX, sizeY) {
        super(window, sizeX, sizeY);
        this.midpoint = [0, 0];
    }

    render(startX, startY) {
        this.midpoint[0] = this.sizeX / 2;
        this.midpoint[1] = this.sizeY / 2;
    }
    hover(posX, posY) {
        this.colorConfig = loadGD(UI_COLORPICKER_CONFIG);

        let clickLocRelMid = [posX - this.midpoint[0], posY - this.midpoint[1]];
        let clickLocDist = getVec2Length(clickLocRelMid);

        if (clickLocDist > (this.sizeX / 2.5) && clickLocDist < (this.sizeX / 2)) {
            let angle = Math.atan2(clickLocRelMid[1], clickLocRelMid[0]);
            this.colorConfig.h = angle * (180 / Math.PI);
            this.colorConfig.rgbaArr = hsvaToRgba(this.colorConfig.h, this.colorConfig.s, this.colorConfig.v, this.colorConfig.a ?? 1);

            return;
        }
        let s = this.sizeX / 3.5;

        if (Math.abs(clickLocRelMid[0] < s) && Math.abs(clickLocRelMid[0] < s)) {
            this.colorConfig.s = clamp(invlerp(-s, s, clickLocRelMid[0]));
            this.colorConfig.v = clamp(1 - invlerp(-s, s, clickLocRelMid[1]));
        }
        this.colorConfig.rgbaArr = hsvaToRgba(this.colorConfig.h, this.colorConfig.s, this.colorConfig.v, this.colorConfig.a ?? 1);
        return;
    }


}