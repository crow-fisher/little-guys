import { gsh } from "../../../climate/time.js";
import { COLOR_WHITE } from "../../../colors.js";
import { calculateStatistics, invlerp, rgbToRgba } from "../../../common.js";
import { MAIN_CONTEXT } from "../../../index.js";
import { loadGD, UI_PLOTCONTAINER_AXISLABELS, UI_PLOTCONTAINER_MAXPOINTS, UI_PLOTCONTAINER_POINTOPACITY, UI_PLOTCONTAINER_POINTSIZE, UI_PLOTCONTAINER_XKEY, UI_PLOTCONTAINER_XPADDING, UI_PLOTCONTAINER_YKEY, UI_PLOTCONTAINER_YPADDING, UI_PLOTCONTAINER_ZOOM_X, UI_PLOTCONTAINER_ZOOM_Y } from "../../UIData.js";
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

        let opacity = Math.atan(loadGD(UI_PLOTCONTAINER_POINTOPACITY) * this.lengthCap) / Math.PI + 0.5;

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

    renderGraph(startX, startY) {
        this.xBounds = [
            this.xS[2],
            Math.min(this.xS[3], this.xS[0] + Math.exp(loadGD(UI_PLOTCONTAINER_ZOOM_X)) * this.xS[1])
        ];
        this.yBounds =  [
            this.yS[2],
            Math.min(this.yS[3], this.yS[0] + Math.exp(loadGD(UI_PLOTCONTAINER_ZOOM_Y)) * this.yS[1])
        ];

        this.paddingX = this.sizeX / loadGD(UI_PLOTCONTAINER_XPADDING);
        this.paddingY = this.sizeY / loadGD(UI_PLOTCONTAINER_YPADDING);

        let size = Math.exp(loadGD(UI_PLOTCONTAINER_POINTSIZE));
        let x, y;

        for (let i = 0; i < this.lengthCap; i++) {
            x = invlerp(...this.xBounds, this.xValues[i]);
            y = invlerp(...this.yBounds, this.yValues[i]);

            if (x < 0 || x > 1 || y < 0 || y > 1)
                continue;

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
    }
}