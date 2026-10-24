import { COLOR_OTHER_BLUE, COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { hsv2rgb, rgbToHex, rgbToHexMult } from "../../common.js";
import { MAIN_CONTEXT } from "../../_index.js";
import { getLastMouseDownStart, isLeftMouseClicked } from "../../mouse.js";
import { loadSlot } from "../../saveAndLoad.js";
import { loadGD, saveGD, UI_BOOLEAN, UI_GLOBAL_THETA_BASE } from "../UIData.js";
import { TopBarElementBase } from "./TopBarElementBase.js";

export class TopBarThetaSlider {
    constructor(sizeX, sizeY) {
        this.sizeX = sizeX;
        this.sizeY = sizeY;
    }

    measure() {
        return [this.sizeX, this.sizeY]
    }

    render(startX, startY) {
        MAIN_CONTEXT.fillStyle = rgbToHexMult(...hsv2rgb(3 * loadGD(UI_GLOBAL_THETA_BASE), 0.75, 0.75), 255);
        MAIN_CONTEXT.fillRect(startX, startY - this.sizeY, this.sizeX, this.sizeY);
    }

    hover(posX, posY) {
        if (!isLeftMouseClicked()) {
            return;
        }

        saveGD(UI_GLOBAL_THETA_BASE, Math.PI * 2 * posX / this.sizeX);
    }
}