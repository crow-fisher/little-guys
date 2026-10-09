import { getBaseUISize } from "../../canvas.js";
import { calculateColor } from "../../climate/simulation/temperatureHumidity.js";
import { COLOR_BLACK, COLOR_BLUE, COLOR_OTHER_BLUE, COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { invlerp } from "../../common.js";
import { getCurBackgroundColor, MAIN_CONTEXT } from "../../index.js";
import { getLastMouseDown, isLeftMouseClicked } from "../../mouse.js";
import { loadGD, saveGD } from "../UIData.js";
import { WindowElement } from "../Window.js";

export class SliderGradientBackgroundRange extends WindowElement {
    constructor(window, ref1, ref2, sizeX, sizeY, min, max, minColorFunc, maxColorFunc, renderSkyBackground=false) {
        super(window, sizeX, sizeY);
        this.ref1 = ref1;
        this.ref2 = ref2;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.min = min;
        this.max = max;
        this.minColorFunc = minColorFunc;
        this.maxColorFunc = maxColorFunc;
        this.renderSkyBackground = renderSkyBackground;

        let range = (max - min);
        this.min -= (sizeY / sizeX) * range;
        this.max += (sizeY / sizeX) * range;

        this.minStep = range / 5;
    }

    renderBackground(startX, startY) {
        if (this.renderSkyBackground) {
            MAIN_CONTEXT.fillStyle = getCurBackgroundColor();
            MAIN_CONTEXT.fillRect(startX, startY, this.sizeX, this.sizeY);
        }
        let gradient = MAIN_CONTEXT.createLinearGradient(startX, startY, this.sizeX + startX, startY);
        gradient.addColorStop(0, this.minColorFunc());
        gradient.addColorStop(1, this.maxColorFunc());
        MAIN_CONTEXT.fillStyle = gradient;
        MAIN_CONTEXT.fillRect(startX, startY, this.sizeX, this.sizeY);
    }

    renderBlockValue(startX, startY, value) {
        let blockSize = this.sizeY;
        let invlerp = (value - this.min) / (this.max - this.min);
        let lerp = invlerp * this.sizeX;

        if (!this.renderSkyBackground) {
            MAIN_CONTEXT.fillStyle = calculateColor(invlerp, 0, 1, this.minColorFunc, this.maxColorFunc);
            MAIN_CONTEXT.fillRect(startX + lerp - (blockSize / 2), startY, blockSize, this.sizeY);
            MAIN_CONTEXT.fill();
        }

        let lineWidth = getBaseUISize() * 0.1;
        MAIN_CONTEXT.strokeStyle = COLOR_BLACK;        // set the color for the circle to 'green'
        MAIN_CONTEXT.lineWidth = lineWidth;

        MAIN_CONTEXT.strokeRect((startX + lineWidth /2) + lerp - (blockSize / 2), startY + (lineWidth / 2), blockSize - lineWidth, this.sizeY - (lineWidth));

        return [this.sizeX, this.sizeY]
    }

    render(startX, startY) {
        this.renderBackground(startX, startY);
        this.renderBlockValue(startX, startY, this.ref1());
        this.renderBlockValue(startX, startY, this.ref2());
    }

    hover(posX, posY) {
        if (this._lmd != getLastMouseDown()) {
            this.aRef = null;
            this._lmd = getLastMouseDown();
        }

        if (this.aRef != null) {
            this.hoverBlock(posX, posY, this.aRef);
        } else {
            this._r1i = this.getClickDistToRef(posX, posY, this.ref1)
            this._r2i = this.getClickDistToRef(posX, posY, this.ref2)
            this.aRef = (this._r1i < this._r2i) ? this.ref1 : this.ref2;

            console.log(this._r1i, this._r2i);
        }
        // this.hoverBlock(posX, posY, this.ref1);
        // this.hoverBlock(posX, posY, this.ref2);

        this.ref1(Math.min(this.ref1(), this.ref2() - this.minStep));
    }

    getClickDistToRef(posX, posY, ref) {
        return Math.abs((posX / this.sizeX) - (invlerp(this.min, this.max, ref())));
    }

    hoverBlock(posX, posY, ref) {
        super.hover(posX, posY);
        this.window.locked = true;
        let min = 0;
        let max = this.sizeX;
        posX = Math.max((this.sizeY / 2), posX);
        posX = Math.min(this.sizeX - (this.sizeY / 2), posX);
        let p = (posX - min) / (max - min);
        p = Math.min(Math.max(0, p), 1)
        ref(this.min + (p * (this.max - this.min)));
    }
}