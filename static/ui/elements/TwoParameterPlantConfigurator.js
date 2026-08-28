import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { calculateColor } from "../../climate/simulation/temperatureHumidity.js";
import { COLOR_BLACK, COLOR_BLUE, COLOR_OTHER_BLUE, COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { hexToRgb } from "../../common.js";
import { MAIN_CONTEXT } from "../../index.js";
import { isLeftMouseClicked } from "../../mouse.js";
import { loadGD, saveGD, UI_ORGANISM_CONFIGURATOR, UI_ORGANISM_GRASS_CATTAIL, UI_ORGANISM_GRASS_KBLUE, UI_ORGANISM_GRASS_WHEAT, UI_ORGANISM_SELECT } from "../UIData.js";
import { WindowElement } from "../Window.js";

export function getCurPlantConfiguratorVal() {
    let curKey = loadGD(UI_ORGANISM_SELECT);
    let curMap = loadGD(UI_ORGANISM_CONFIGURATOR);
    if (curMap[curKey] == null) {
        curMap[curKey] = 0.5;
    }
    return curMap[curKey];
}

export function setCurPlantConfiguratorValue(v1, v2) {
    let curMap = loadGD(UI_ORGANISM_CONFIGURATOR);
    let curKey = loadGD(UI_ORGANISM_SELECT);
    curMap[curKey] = curMap[curKey] ?? [0, 0];
    curMap[curKey][0] = v1;
    curMap[curKey][1] = v2;
}

export class TwoParameterPlantConfigurator extends WindowElement {
    constructor(window, sizeX, sizeY) {
        super(window, sizeX, sizeY);
        this.sizeX = sizeX;
        this.sizeY = sizeY;
    }

    render(startX, startY) {
        MAIN_CONTEXT.fillStyle = getActiveClimate().getUIColorInactive(1);
        MAIN_CONTEXT.fillRect(startX, startY, this.sizeX, this.sizeY);
    }

    hover(posX, posY) {
        super.hover(posX, posY, true);
        if (!isLeftMouseClicked()) {
            return;
        }
        // let min = 0;
        // let max = this.sizeX;
        // posX = Math.max((this.sizeY / 2), posX);
        // posX = Math.min(this.sizeX - (this.sizeY / 2), posX);
        // let p = (posX - min) / (max - min);
        // p = Math.min(Math.max(0, p), 1)
        // setCurPlantConfiguratorValue(p);
    }

}