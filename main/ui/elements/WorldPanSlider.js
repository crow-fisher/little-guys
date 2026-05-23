import { getBaseSize, getBaseUISize, getCanvasSquaresX, getCanvasWidth, recacheCanvasPositions, setCanvasSquaresX } from "../../canvas.js";
import { calculateColor, initTemperatureHumidity } from "../../climate/simulation/temperatureHumidity.js";
import { initWindPressure } from "../../climate/simulation/wind.js";
import { initWeather } from "../../climate/weather/weatherManager.js";
import { COLOR_BLACK, COLOR_BLUE, COLOR_OTHER_BLUE, COLOR_VERY_FUCKING_RED, COLOR_WHITE } from "../../colors.js";
import { randRange } from "../../common.js";
import { getCurBackgroundColor, getTotalCanvasPixelHeight, getTotalCanvasPixelWidth, indexCanvasSize, MAIN_CONTEXT } from "../../index.js";
import { getLastMoveEventTime, getLastMoveOffset, isLeftMouseClicked } from "../../mouse.js";
import { addUIFunctionMap, loadGD, saveGD, UI_CANVAS_VIEWPORT_CENTER_X, UI_GAME_MAX_CANVAS_SQUARES_X } from "../UIData.js";
import { WindowElement } from "../Window.js";

export class WorldPanSlider extends WindowElement {
    constructor(window, key, sizeX, sizeY, min, max, minColor, maxColor, renderSkyBackground=false) {
        super(window, sizeX, sizeY);
        this.key = key;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.min = min;
        this.max = max;
        this.minColor = minColor;
        this.maxColor = maxColor;
        this.renderSkyBackground = renderSkyBackground;
    }

    render(startX, startY, opacity) {
        // console.log(t, moveHeight * Math.max(0, 1 - Math.exp(c1 * t - c2)));
        // this.lastRenderOffset += moveHeight * Math.max(0, 1 - Math.exp(c1 * t - c2));

        let gradient = MAIN_CONTEXT.createLinearGradient(startX, startY, this.sizeX + startX, startY);
        gradient.addColorStop(0, this.minColor + opacity + ")");
        gradient.addColorStop(1, this.maxColor + opacity + ")");
        MAIN_CONTEXT.fillStyle = gradient;
        MAIN_CONTEXT.fillRect(startX, startY, this.sizeX, this.sizeY);

        let blockSize = this.sizeY;
        let invlerp = (loadGD(this.key) - this.min) / (this.max - this.min);
        let lerp = invlerp * this.sizeX;

        let lineWidth = getBaseUISize() * 0.1;
        MAIN_CONTEXT.strokeStyle =  "rgba(35, 35, 35, " + opacity + ")";
        MAIN_CONTEXT.fillStyle = "rgba(195, 195, 195, " + opacity + ")";
        MAIN_CONTEXT.lineWidth = lineWidth * opacity;
        MAIN_CONTEXT.strokeRect((startX + lineWidth /2) + lerp - (blockSize / 2), startY + (lineWidth / 2), blockSize - lineWidth, this.sizeY - (lineWidth));
        MAIN_CONTEXT.fillRect((startX + lineWidth /2) + lerp - (blockSize / 2), startY + (lineWidth / 2), blockSize - lineWidth, this.sizeY - (lineWidth));

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
        p = Math.min(Math.max(0, p), 1);

        let v = this.min + (p * (this.max - this.min));
        v = Math.floor(v);
        v -= v % getBaseSize();

        saveGD(this.key, v);
        recacheCanvasPositions();
    }
}
