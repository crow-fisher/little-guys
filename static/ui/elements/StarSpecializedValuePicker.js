import { COLOR_BLACK, COLOR_BLUE, COLOR_GREEN, COLOR_OTHER_BLUE, COLOR_VERY_FUCKING_RED, COLOR_WHITE } from "../../colors.js";
import { invlerp, lerp } from "../../common.js";
import { MAIN_CONTEXT } from "../../index.js";
import { getStarHandler } from "../../main.js";
import { isLeftMouseClicked } from "../../mouse.js";
import { resetStarStyle } from "../components/AstronomyAtlas/modes/AstronomyAtlasUIFunctionMaps.js";
import { loadGD, saveGD, UI_SH_STYLE_BRIGHTNESS_SHIFT, UI_STARMAP_STAR_CONTROL_TOGGLE_MODE, UI_SH_STYLE_BRIGHTNESS_FACTOR, UI_SH_STYLE_SIZE_SHIFT, UI_SH_STYLE_SIZE_FACTOR } from "../UIData.js";
import { WindowElement } from "../Window.js";

export class StarSpecializedValuePicker extends WindowElement {
    constructor(window, sizeX, sizeY) {
        super(window, sizeX, sizeY);
        this.sizeX = sizeX;
        this.sizeY = sizeY;

        this.pointSize = 6;

        this.keys = [
            [UI_SH_STYLE_SIZE_SHIFT, UI_SH_STYLE_SIZE_FACTOR],
            [UI_SH_STYLE_BRIGHTNESS_SHIFT, UI_SH_STYLE_BRIGHTNESS_FACTOR]
        ];
        this.valueRanges = [
            [
                [-50, 50], [-10, 5]
            ], 
            [
                [-50, 50], [-10, 5]
            ]
        ];
        this.colors = [COLOR_GREEN, "#6d9e6d"]
        this.clicked = [false, false];

        this.vX0, this.vY0, this.pX0, this.pY0;
        this.vX1, this.vY1, this.pX1, this.pY1;

    }

    render(startX, startY) {
        let key, valueRange;
        key = this.keys[0], valueRange = this.valueRanges[0];

        this.vX0 = loadGD(key[0]);
        this.vY0 = loadGD(key[1]);
        this.pX0 = invlerp(valueRange[0][0], valueRange[0][1], this.vX0);
        this.pY0 = invlerp(valueRange[1][0], valueRange[1][1], this.vY0);

        MAIN_CONTEXT.beginPath();
        MAIN_CONTEXT.fillStyle = this.colors[loadGD(UI_STARMAP_STAR_CONTROL_TOGGLE_MODE)];
        MAIN_CONTEXT.arc(startX + this.pX0 * this.sizeX, startY + this.pY0 * this.sizeY, this.pointSize, 0, 2 * Math.PI, false);
        MAIN_CONTEXT.fill();

        key = this.keys[1], valueRange = this.valueRanges[1];

        this.vX1 = loadGD(key[0]);
        this.vY1 = loadGD(key[1]);
        this.pX1 = invlerp(valueRange[0][0], valueRange[0][1], this.vX1);
        this.pY1 = invlerp(valueRange[1][0], valueRange[1][1], this.vY1);

        MAIN_CONTEXT.beginPath();
        MAIN_CONTEXT.fillStyle = this.colors[1 - loadGD(UI_STARMAP_STAR_CONTROL_TOGGLE_MODE)];
        MAIN_CONTEXT.arc(startX + this.pX1 * this.sizeX, startY + this.pY1 * this.sizeY, this.pointSize, 0, 2 * Math.PI, false);
        MAIN_CONTEXT.fill();
        MAIN_CONTEXT.beginPath();


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
        resetStarStyle();
        getStarHandler().resetStarLabels();
    }

}