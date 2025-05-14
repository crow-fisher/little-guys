import { getBaseUISize } from "../../canvas.js";
import { calculateColor } from "../../climate/simulation/temperatureHumidity.js";
import { COLOR_BLACK, COLOR_BLUE, COLOR_OTHER_BLUE, COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { getCurBackgroundColor, MAIN_CONTEXT } from "../../index.js";
import { isLeftMouseClicked } from "../../mouse.js";
import { loadGD, saveGD } from "../UIData.js";
import { WindowElement } from "../Window.js";

export class SliderGradientBackground extends WindowElement {
    constructor(window, key, sizeX, sizeY, min, max, minColorFunc, maxColorFunc, renderSkyBackground=false) {
        super(window, sizeX, sizeY);
        this.key = key;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.min = min;
        this.max = max;
        this.minColorFunc = minColorFunc;
        this.maxColorFunc = maxColorFunc;
        this.renderSkyBackground = renderSkyBackground;
    }

    render(startX, startY) {
        if (this.renderSkyBackground) {
            MAIN_CONTEXT.fillStyle = getCurBackgroundColor();
            MAIN_CONTEXT.fillRect(startX, startY, this.sizeX, this.sizeY);
        }
        let gradient = MAIN_CONTEXT.createLinearGradient(startX, startY, this.sizeX + startX, startY);
        gradient.addColorStop(0, this.minColorFunc());
        gradient.addColorStop(1, this.maxColorFunc());
        MAIN_CONTEXT.fillStyle = gradient;
        MAIN_CONTEXT.fillRect(startX, startY, this.sizeX, this.sizeY);

        let blockSize = this.sizeY;
        let invlerp = (loadGD(this.key) - this.min) / (this.max - this.min);
        let lerp = invlerp * this.sizeX;

        MAIN_CONTEXT.fillStyle = calculateColor(invlerp, 0, 1, this.minColorFunc, this.maxColorFunc);
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
        saveGD(this.key, this.min + (p * (this.max - this.min)));
    }

}