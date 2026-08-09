import { hsvToHex, hsvToRgba } from "../../../color/color.js";
import { invlerp } from "../../../common.js";
import { tau } from "../../../util/const.js";
import { addVectors, getVec2Length, getVec3Length } from "../../../util/vector.js";
import { WindowElement } from "../../WindowElement.js";

export class ColorInputTarget extends WindowElement {
    constructor(window, sizeXFunc, sizeYFunc) {
        super(window, sizeXFunc, sizeYFunc);
        this.uiManager = this.window.component.uiManager;
        this.colorConfig = this.window.component.config().colorConfig;
        this.mouseManager = this.window.component.uiManager.mainManager.inputManager.mouseManager;

        this.midpoint = [0, 0];
    }

    render(startX, startY) {
        this.midpoint[0] = this.sizeXFunc() / 2;
        this.midpoint[1] = this.sizeYFunc() / 2;
    }
    interact(posX, posY) {
        let clickLocRelMid = [posX - this.midpoint[0], posY - this.midpoint[1]];
        let clickLocDist = getVec2Length(clickLocRelMid);

        if (clickLocDist > (this.sizeXFunc() / 2.5) && clickLocDist < (this.sizeXFunc() / 2)) {
            let angle = Math.atan2(clickLocRelMid[1], clickLocRelMid[0]);
            this.colorConfig.h = angle * (180 / Math.PI);
            this.uiManager.colorUpdate();
            return;
        }
        let s = this.sizeXFunc() / 3.5;

        if (Math.abs(clickLocRelMid[0] < s) && Math.abs(clickLocRelMid[0] < s)) {
            this.colorConfig.s = invlerp(-s, s, clickLocRelMid[0]);
            this.colorConfig.v = 1 - invlerp(-s, s, clickLocRelMid[1]);
        }

        this.uiManager.colorUpdate();
        return;
    }


}