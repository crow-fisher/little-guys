import { COLOR_OTHER_BLUE, COLOR_VERY_FUCKING_RED, COLOR_WHITE } from "../../colors.js";
import { invlerp, lerp } from "../../common.js";
import { MAIN_CONTEXT } from "../../index.js";
import { isLeftMouseClicked } from "../../mouse.js";
import { loadGD, saveGD, UI_STARMAP_BRIGHTNESS_SHIFT, UI_STARMAP_STAR_CONTROL_TOGGLE_MODE, UI_STARMAP_STAR_OPACITY_FACTOR, UI_STARMAP_STAR_OPACITY_SHIFT, UI_STARMAP_STAR_SIZE_FACTOR } from "../UIData.js";
import { WindowElement } from "../Window.js";

export class StarSpecializedValuePicker extends WindowElement {
    constructor(window, sizeX, sizeY) {
        super(window, sizeX, sizeY);
        this.sizeX = sizeX;
        this.sizeY = sizeY;

        this.pointSize = 6;

        this.keys = [
            [UI_STARMAP_STAR_OPACITY_SHIFT, UI_STARMAP_STAR_SIZE_FACTOR],
            [UI_STARMAP_BRIGHTNESS_SHIFT, UI_STARMAP_STAR_OPACITY_FACTOR]
        ];
        this.valueRanges = [
            [
                [-30, 30], [-1.5, 1.5]
            ], 
            [
                [-20, 20], [-1.5, 1.5]
            ]
        ];
        this.colors = [COLOR_VERY_FUCKING_RED, COLOR_OTHER_BLUE];
        this.clicked = [false, false];

        this.vX0, this.vY0, this.pX0, this.pY0;
        this.vX1, this.vY1, this.pX1, this.pY1;

    }

    render(startX, startY) {
        let key, valueRange, color;
        key = this.keys[0], valueRange = this.valueRanges[0], color = this.colors[0];

        this.vX0 = loadGD(key[0]);
        this.vY0 = loadGD(key[1]);
        this.pX0 = invlerp(valueRange[0][0], valueRange[0][1], this.vX0);
        this.pY0 = invlerp(valueRange[1][0], valueRange[1][1], this.vY0);

        MAIN_CONTEXT.beginPath();
        MAIN_CONTEXT.fillStyle = color;
        MAIN_CONTEXT.arc(startX + this.pX0 * this.sizeX, startY + this.pY0 * this.sizeY, this.pointSize, 0, 2 * Math.PI, false);
        MAIN_CONTEXT.fill();

        key = this.keys[1], valueRange = this.valueRanges[1], color = this.colors[1];

        this.vX1 = loadGD(key[0]);
        this.vY1 = loadGD(key[1]);
        this.pX1 = invlerp(valueRange[0][0], valueRange[0][1], this.vX1);
        this.pY1 = invlerp(valueRange[1][0], valueRange[1][1], this.vY1);

        MAIN_CONTEXT.beginPath();
        MAIN_CONTEXT.fillStyle = color;
        MAIN_CONTEXT.arc(startX + this.pX1 * this.sizeX, startY + this.pY1 * this.sizeY, this.pointSize, 0, 2 * Math.PI, false);
        MAIN_CONTEXT.fill();
    }

    hover(posX, posY) {
        super.hover(posX, posY);
        if (!isLeftMouseClicked()) {
            return;
        }
        this.window.locked = true;
        let pX = invlerp(0, this.sizeX, posX);
        let pY = invlerp(0, this.sizeY, posY);
        let idx = loadGD(UI_STARMAP_STAR_CONTROL_TOGGLE_MODE);
        saveGD(this.keys[idx][0], lerp(...this.valueRanges[idx][0], pX));
        saveGD(this.keys[idx][1], lerp(...this.valueRanges[idx][1], pY));
    }

}