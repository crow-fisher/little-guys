import { getBaseUISize } from "../../canvas.js";
import { COLOR_BLACK, COLOR_OTHER_BLUE, COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { UI_BIGDOTHOLLOW, UI_BIGDOTSOLID, UI_TINYDOT } from "../../common.js";
import { MAIN_CONTEXT } from "../../index.js";
import { getLastMouseDown, isLeftMouseClicked } from "../../mouse.js";
import { loadGD, saveGD, UI_CENTER, UI_PALETTE_COMPOSITION, UI_PALETTE_SELECT, UI_PALETTE_SOILROCK } from "../UIData.js";
import { WindowElement } from "../Window.js";

export class SoilPickerDotElement extends WindowElement {
    constructor(window, sizeX, sizeY) {
        super(window, sizeX, sizeY);
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.textSizeMult = 0.15;
    }

    size() {
        return [this.sizeX, 0];
    }

    render(startX, startY) {
        MAIN_CONTEXT.font = this.sizeY * this.textSizeMult + "px courier"
        MAIN_CONTEXT.textBaseline = 'middle';
        MAIN_CONTEXT.fillStyle = COLOR_VERY_FUCKING_RED;

        let arr = loadGD(UI_PALETTE_COMPOSITION);
        let y = 1 - arr[2];
        let x = 1 - (arr[0] / (y));

        x -= 0.5;
        x /= y;
        x *= 0.8;
        x += 0.5;
        
        MAIN_CONTEXT.textAlign = 'center';
        let label = UI_BIGDOTHOLLOW;
        if (loadGD(UI_PALETTE_SELECT) == UI_PALETTE_SOILROCK) {
            label = UI_BIGDOTSOLID;
        }
        let xLoc = startX + x * this.sizeX;
        let yLoc = startY + y * this.sizeY - this.sizeY;
        MAIN_CONTEXT.fillStyle = COLOR_BLACK;
        MAIN_CONTEXT.fillText(label, xLoc, yLoc);
        return [this.sizeX, 0];
    }
}