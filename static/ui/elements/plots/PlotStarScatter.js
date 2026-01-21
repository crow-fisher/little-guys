import { getCurDay, gsh } from "../../../climate/time.js";
import { COLOR_VERY_FUCKING_RED } from "../../../colors.js";
import { calculateMeanStandardDev, invlerp, rgbToRgba } from "../../../common.js";
import { MAIN_CONTEXT } from "../../../index.js";
import { loadGD, UI_PLOTCONTAINER_MAXPOINTS, UI_PLOTCONTAINER_POINTOPACITY, UI_PLOTCONTAINER_POINTSIZE, UI_PLOTCONTAINER_XKEY, UI_PLOTCONTAINER_YKEY, UI_PLOTCONTAINER_ZOOM } from "../../UIData.js";
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

        if (this.xKey == null || this.yKey == null) {
            return;
        }

        let i = 0;

        let opacity = Math.atan(loadGD(UI_PLOTCONTAINER_POINTOPACITY)) / Math.PI + 0.5;

        gsh().stars.forEach((star) => {
            let x = star[this.xKey];
            let y = star[this.yKey];

            if (isNaN(x) || isNaN(y)) {
                return;
            }
            this.xValues[i] = x;
            this.yValues[i] = y;
            this.cValues[i] = rgbToRgba(...star.color, opacity);
            i = (i + 1) % this.lengthCap;
        });

        this.xS = calculateMeanStandardDev(this.xValues);
        this.yS = calculateMeanStandardDev(this.yValues);

    }

    renderGraph(startX, startY) {
        this.xBounds = [this.xS[0] - loadGD(UI_PLOTCONTAINER_ZOOM) * this.xS[1], this.xS[0] + loadGD(UI_PLOTCONTAINER_ZOOM) * this.xS[1]];
        this.yBounds =  [this.yS[0] - loadGD(UI_PLOTCONTAINER_ZOOM) * this.yS[1], this.yS[0] + loadGD(UI_PLOTCONTAINER_ZOOM) * this.yS[1]];

        let size = Math.exp(loadGD(UI_PLOTCONTAINER_POINTSIZE));
        for (let i = 0; i < this.lengthCap; i++) {
            MAIN_CONTEXT.fillStyle = this.cValues[i];
            MAIN_CONTEXT.beginPath();
            MAIN_CONTEXT.arc(
                invlerp(...this.xBounds, this.xValues[i]) * this.sizeX + startX,
                invlerp(...this.yBounds, this.yValues[i]) * this.sizeY + startY,
                size, 0, 2 * Math.PI, false);
            MAIN_CONTEXT.fill();
        }

    }

    hover(posX, posY) {
    }
}