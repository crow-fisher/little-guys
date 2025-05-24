import { getBaseUISize } from "../../canvas.js";
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

export function setCurPlantConfiguratorValue(value) {
    let curKey = loadGD(UI_ORGANISM_SELECT);
    let curMap = loadGD(UI_ORGANISM_CONFIGURATOR);
    curMap[curKey] = value;
}

export class SliderGradientBackgroundPlantConfigurator extends WindowElement {
    constructor(window, sizeX, sizeY) {
        super(window, sizeX, sizeY);
        this.sizeX = sizeX;
        this.sizeY = sizeY;
    }

    minColorFunc() {
        switch (loadGD(UI_ORGANISM_SELECT)) {
            case UI_ORGANISM_GRASS_CATTAIL:
                return this.generalBrightnessFunc(0.2);
            case UI_ORGANISM_GRASS_KBLUE:
                return this.generalBrightnessFunc(0.3);
            case UI_ORGANISM_GRASS_WHEAT:
                return this.generalBrightnessFunc(0.4);
            default:
                return this.generalBrightnessFunc(0.1);
        }
    }

    maxColorFunc() {
        switch (loadGD(UI_ORGANISM_SELECT)) {
            case UI_ORGANISM_GRASS_CATTAIL:
                return this.generalBrightnessFunc(0.2 + 0.6);
            case UI_ORGANISM_GRASS_KBLUE:
                return this.generalBrightnessFunc(0.3 + 0.6);
            case UI_ORGANISM_GRASS_WHEAT:
                return this.generalBrightnessFunc(0.4 + 0.6);
            default:
                return this.generalBrightnessFunc(0.1 + 0.6);
        }
    }

    generalBrightnessFunc(brightness) {
        return calculateColor(brightness, 0, 1, hexToRgb("#000000"), hexToRgb("#FFFFFF"));
    }

    render(startX, startY) {
        let gradient = MAIN_CONTEXT.createLinearGradient(startX, startY, this.sizeX + startX, startY);
        gradient.addColorStop(0, this.minColorFunc());
        gradient.addColorStop(1, this.maxColorFunc());
        MAIN_CONTEXT.fillStyle = gradient;
        MAIN_CONTEXT.fillRect(startX, startY, this.sizeX, this.sizeY);

        let blockSize = this.sizeY;
        let invlerp = getCurPlantConfiguratorVal();
        let lerp = invlerp * this.sizeX;

        MAIN_CONTEXT.fillStyle = calculateColor(invlerp, 0, 1, this.minColorFunc(), this.maxColorFunc());
        MAIN_CONTEXT.fillRect(startX + lerp - (blockSize / 2), startY, blockSize, this.sizeY);
        MAIN_CONTEXT.fill();

        let lineWidth = getBaseUISize() * 0.1;
        MAIN_CONTEXT.strokeStyle = COLOR_BLACK;        // set the color for the circle to 'green'
        MAIN_CONTEXT.lineWidth = lineWidth;

        MAIN_CONTEXT.strokeRect((startX + lineWidth /2) + lerp - (blockSize / 2), startY + (lineWidth / 2), blockSize - lineWidth, this.sizeY - (lineWidth));

        return [this.sizeX, this.sizeY]
    }

    hover(posX, posY) {
        super.hover(posX, posY);
        if (!isLeftMouseClicked()) {
            return;
        }
        this.window.locked = true;
        let min = 0;
        let max = this.sizeX;
        posX = Math.max((this.sizeY / 2), posX);
        posX = Math.min(this.sizeX - (this.sizeY / 2), posX);
        let p = (posX - min) / (max - min);
        p = Math.min(Math.max(0, p), 1)
        setCurPlantConfiguratorValue(p);
    }

}