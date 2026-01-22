import { getSingletonMouseWheelState } from "../../../canvas.js";
import { gsh } from "../../../climate/time.js";
import { COLOR_WHITE } from "../../../colors.js";
import { calculateStatistics, invlerp, processRangeToOne, rgbToRgba } from "../../../common.js";
import { MAIN_CONTEXT } from "../../../index.js";
import { isKeyPressed, KEY_CONTROL, KEY_SHIFT } from "../../../keyboard.js";
import { isLeftMouseClicked } from "../../../mouse.js";
import { loadGD, saveGD, UI_PLOTCONTAINER_AXISLABELS, UI_PLOTCONTAINER_MAXPOINTS, UI_PLOTCONTAINER_OFFSET_X, UI_PLOTCONTAINER_OFFSET_Y, UI_PLOTCONTAINER_POINTOPACITY, UI_PLOTCONTAINER_POINTSIZE, UI_PLOTCONTAINER_XKEY, UI_PLOTCONTAINER_XPADDING, UI_PLOTCONTAINER_YKEY, UI_PLOTCONTAINER_YPADDING, UI_PLOTCONTAINER_ZOOM_X, UI_PLOTCONTAINER_ZOOM_Y } from "../../UIData.js";
import { WindowElement } from "../../Window.js";

export class PlotStarScatter extends WindowElement {
    constructor(window, sizeX, sizeY) {
        super(window, sizeX, sizeY);
        this.lengthCap = loadGD(UI_PLOTCONTAINER_MAXPOINTS);
        this.xValues = new Array(this.lengthCap);
        this.yValues = new Array(this.lengthCap);
        this.cValues = new Array(this.lengthCap);
        this.numStars = 0;
    }

    update() {
        this.lengthCap = loadGD(UI_PLOTCONTAINER_MAXPOINTS);
        this.xValues = new Array(this.lengthCap);
        this.yValues = new Array(this.lengthCap);
        this.cValues = new Array(this.lengthCap);
        this.xKey = null;
        this.yKey = null;
    }

    render(startX, startY) {
        if (gsh()?.stars == null) {
            return;
        }

        if (this.xKey == null || this.yKey == null || this.numStars != gsh().stars.length) {
            this.reloadGraph();
            return;
        }
        if (this.xKey != loadGD(UI_PLOTCONTAINER_XKEY) || this.yKey != loadGD(UI_PLOTCONTAINER_YKEY)) {
            this.reloadGraph();
        }

        this.renderGraph(startX, startY);
    }

    reloadGraph() {
        this.xKey = loadGD(UI_PLOTCONTAINER_XKEY);
        this.yKey = loadGD(UI_PLOTCONTAINER_YKEY);
        this.numStars = gsh().stars.length;

        if (this.xKey == null || this.yKey == null || gsh().stars.length == 0) {
            return;
        }

        let i = 0;
        let idxMult = gsh().stars.length / (this.lengthCap);

        let opacity = processRangeToOne(loadGD(UI_PLOTCONTAINER_POINTOPACITY) * this.lengthCap);

        let star, iO;
        for (let i = 0; i < this.lengthCap; i++) {
            star = null, iO = -1;
            while (star == null && iO < 5) {
                iO += 1;
                star = gsh().stars[Math.floor(i * idxMult) + iO];
            }
            if (star == null) {
                continue;
            }

            let x = star[this.xKey];
            let y = star[this.yKey];
            if (isNaN(x) || isNaN(y) || !isFinite(x) || !isFinite(y)) {
                continue;
            }
            this.xValues[i] = x;
            this.yValues[i] = y;
            this.cValues[i] = rgbToRgba(...star.color, opacity);
        }

        this.xS = calculateStatistics(this.xValues);
        this.yS = calculateStatistics(this.yValues);

    }

    processValue(value, zoom, offset) {
        let minValue = offset;
        let range = 1 / Math.max(zoom, 1);
        let maxValue = minValue + range;
        if (value < minValue || value > maxValue) {
            return null;
        } else {
            return invlerp(minValue, maxValue, value);
        }

    }

    renderGraph(startX, startY) {
        this.xBounds = [
            this.xS[2],
            this.xS[3]// Math.min(this.xS[3], this.xS[0] + Math.exp(loadGD(UI_PLOTCONTAINER_ZOOM_X)) * this.xS[1])
        ];
        this.yBounds = [
            this.yS[2],
            this.yS[3]//Math.min(this.yS[3], this.yS[0] + Math.exp(loadGD(UI_PLOTCONTAINER_ZOOM_Y)) * this.yS[1])
        ];

        this.paddingX = this.sizeX / loadGD(UI_PLOTCONTAINER_XPADDING);
        this.paddingY = this.sizeY / loadGD(UI_PLOTCONTAINER_YPADDING);

        this.xMin = loadGD(UI_PLOTCONTAINER_OFFSET_X);
        this.yMin = loadGD(UI_PLOTCONTAINER_OFFSET_Y);

        this.xRange = 1 / loadGD(UI_PLOTCONTAINER_ZOOM_X);
        this.yRange = 1 / loadGD(UI_PLOTCONTAINER_ZOOM_Y);

        this.xMax = this.xMin + this.xRange;
        this.yMax = this.yMin + this.yRange;

        let size = Math.exp(loadGD(UI_PLOTCONTAINER_POINTSIZE));
        let x, y;

        for (let i = 0; i < this.lengthCap; i++) {
            x = invlerp(...this.xBounds, this.xValues[i]);
            y = invlerp(...this.yBounds, this.yValues[i]);
            if (x < this.xMin || x > this.xMax || y < this.yMin || y > this.yMax)
                continue;

            x = invlerp(this.xMin, this.xMax, x);
            y = invlerp(this.yMin, this.yMax, y);

            MAIN_CONTEXT.fillStyle = this.cValues[i];
            MAIN_CONTEXT.beginPath();
            MAIN_CONTEXT.arc(x * (this.sizeX - 2 * this.paddingX) + startX + this.paddingX, y * (this.sizeY - 2 * this.paddingY) + startY + this.paddingY, size, 0, 2 * Math.PI, false);
            MAIN_CONTEXT.fill();
        }

        this.renderGridLines(startX, startY);
        this.renderAxisLabels(startX, startY);

        MAIN_CONTEXT.fillStyle = COLOR_WHITE;
    }

    renderGridLines() {

    }
    renderAxisLabels() {
        if (!loadGD(UI_PLOTCONTAINER_AXISLABELS)) {
            return;
        }
        MAIN_CONTEXT.strokeStyle = COLOR_WHITE;

    }

    hover(posX, posY) {
        if (posX < this.paddingX || posX > (this.sizeX - this.paddingX)) {
            return;
        }
        if (posY < this.paddingY || posY > (this.sizeY - this.paddingY)) {
            return;
        }

        if (isLeftMouseClicked()) {
            this.window.locked = true;
        }

        this.curLastMouseWheelEvent = getSingletonMouseWheelState();

        let shouldX = true, shouldY = true;
        if (isKeyPressed(KEY_SHIFT) && isKeyPressed(KEY_CONTROL)) {
            // do nothing
        } else if (isKeyPressed(KEY_SHIFT)) {
            shouldY = false;
        } else if (isKeyPressed(KEY_CONTROL)) {
            shouldX = false;
        }

        console.log(shouldX, shouldY);
        let mpx = invlerp(this.paddingX, this.sizeX - this.paddingX, posX);
        let mpy = invlerp(this.paddingY, this.sizeY - this.paddingY, posY);
        if (this.curLastMouseWheelEvent != 0) {
            if (shouldX) {
                let izx = loadGD(UI_PLOTCONTAINER_ZOOM_X);
                saveGD(UI_PLOTCONTAINER_ZOOM_X, izx * (1 - .001 * this.curLastMouseWheelEvent))
                let fzx = loadGD(UI_PLOTCONTAINER_ZOOM_X);
                let dzx = fzx - izx;
                let iox = loadGD(UI_PLOTCONTAINER_OFFSET_X);
                saveGD(UI_PLOTCONTAINER_OFFSET_X, iox += iox * (mpx) * dzx / fzx);
            }
            if (shouldY) {
                let izy = loadGD(UI_PLOTCONTAINER_ZOOM_Y);
                saveGD(UI_PLOTCONTAINER_ZOOM_Y, izy * (1 - .001 * this.curLastMouseWheelEvent))
                let fzy = loadGD(UI_PLOTCONTAINER_ZOOM_Y);
                let dzy = fzy - izy;
                let ioy = loadGD(UI_PLOTCONTAINER_OFFSET_Y);
                saveGD(UI_PLOTCONTAINER_OFFSET_Y, ioy += ioy * (mpy) * dzy / fzy);
            }
        }
    }
}