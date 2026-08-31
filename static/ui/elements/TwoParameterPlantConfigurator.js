import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { calculateColor } from "../../climate/simulation/temperatureHumidity.js";
import { COLOR_BLACK, COLOR_BLUE, COLOR_OTHER_BLUE, COLOR_VERY_FUCKING_GREEN, COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { hexToRgb, hsvToHex, invlerp } from "../../common.js";
import { HUE_CHARTREUSE } from "../../hue.js";
import { MAIN_CONTEXT } from "../../index.js";
import { isLeftMouseClicked } from "../../mouse.js";
import { loadGD, saveGD, UI_ORGANISM_CONFIGURATOR, UI_ORGANISM_GRASS_CATTAIL, UI_ORGANISM_GRASS_KBLUE, UI_ORGANISM_GRASS_WHEAT, UI_ORGANISM_SELECT } from "../UIData.js";
import { WindowElement } from "../Window.js";

export function getCurPlantConfiguratorVal() {
    let curKey = loadGD(UI_ORGANISM_SELECT);
    let curMap = loadGD(UI_ORGANISM_CONFIGURATOR);
    if (curMap[curKey] == null) {
        curMap[curKey] = [0.5, 0.5];
    }
    return curMap[curKey];
}

export function setCurPlantConfiguratorValue(v1, v2) {
    if (v2 == null) {
        v2 = v1[1]
        v1 = v1[0]
    }
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
        MAIN_CONTEXT.beginPath();
        MAIN_CONTEXT.fillStyle = getActiveClimate().getUIColorInactive(1);
        MAIN_CONTEXT.fillRect(startX, startY, this.sizeX, this.sizeY);

        MAIN_CONTEXT.fillStyle = hsvToHex(HUE_CHARTREUSE, 0.8, 0.8);
        let cp = getCurPlantConfiguratorVal();

        MAIN_CONTEXT.arc(startX + cp[0] * this.sizeX, startY + cp[1] * this.sizeY, 4, 0, 2 * Math.PI, false);
        MAIN_CONTEXT.fill();
        MAIN_CONTEXT.beginPath();

    }

    hover(posX, posY) {
        super.hover(posX, posY, true);
        if (!isLeftMouseClicked()) {
            return;
        }
        setCurPlantConfiguratorValue(
            posX / this.sizeX,
            posY / this.sizeY
        );
    }

}