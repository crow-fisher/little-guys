import { getBaseSize, getBaseUISize, getCanvasWidth, recacheCanvasPositions } from "../../canvas.js";
import { calculateColor } from "../../climate/simulation/temperatureHumidity.js";
import { COLOR_BLACK, COLOR_BLUE, COLOR_OTHER_BLUE, COLOR_VERY_FUCKING_RED, COLOR_WHITE } from "../../colors.js";
import { randRange } from "../../common.js";
import { getCurBackgroundColor, getTotalCanvasPixelHeight, getTotalCanvasPixelWidth, MAIN_CONTEXT } from "../../index.js";
import { getLastMoveEventTime, getLastMoveOffset, isLeftMouseClicked } from "../../mouse.js";
import { addUIFunctionMap, loadGD, saveGD, UI_CANVAS_VIEWPORT_CENTER_X } from "../UIData.js";
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
        this.lastRenderOffset = 0;
        this.lastOpacity = 0;

        this.window.mouseOffsetY = () => -this.lastRenderOffset;
    }

    render(startX, startY) {
        let lastMoveOffset = getLastMoveOffset();
        if (lastMoveOffset == null)
            return;
        let y = lastMoveOffset.y;
        let height = getTotalCanvasPixelHeight();

        if (lastMoveOffset == null || y > height || y < height / 2) {
            return;
        }

        let min = 0.75 * height;
        let max = 0.85 * height;

        if (y > max) {
            this.lastOpacity = 1;
        } else {
            this.lastOpacity = (y - min) / (max - min);
        }

        let moveHeight = 1.5 * this.sizeY;

        // exponential decay 
        let c1 = .01;
        let c2 = 12; 
        let t = Date.now() - getLastMoveEventTime();

        let expFrac = Math.max(0, 1 - Math.exp(c1 * t - c2));
        this.lastOpacity *= expFrac;

        this.lastRenderOffset = moveHeight * this.lastOpacity;

        // console.log(t, moveHeight * Math.max(0, 1 - Math.exp(c1 * t - c2)));
        // this.lastRenderOffset += moveHeight * Math.max(0, 1 - Math.exp(c1 * t - c2));
        
        startY -= this.lastRenderOffset;

        let gradient = MAIN_CONTEXT.createLinearGradient(startX, startY, this.sizeX + startX, startY);
        gradient.addColorStop(0, this.minColor + this.lastOpacity + ")");
        gradient.addColorStop(1, this.maxColor + this.lastOpacity + ")");
        MAIN_CONTEXT.fillStyle = gradient;
        MAIN_CONTEXT.fillRect(startX, startY, this.sizeX, this.sizeY);

        let blockSize = this.sizeY;
        let invlerp = (loadGD(this.key) - this.min) / (this.max - this.min);
        let lerp = invlerp * this.sizeX;

        let lineWidth = getBaseUISize() * 0.1;
        MAIN_CONTEXT.strokeStyle =  "rgba(35, 35, 35, " + this.lastOpacity + ")";
        MAIN_CONTEXT.fillStyle = "rgba(195, 195, 195, " + this.lastOpacity + ")";
        MAIN_CONTEXT.lineWidth = lineWidth * this.lastOpacity;
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
