import { getCurDay, gsh } from "../../../climate/time.js";
import { COLOR_VERY_FUCKING_RED } from "../../../colors.js";
import { MAIN_CONTEXT } from "../../../index.js";
import { loadGD, UI_PLOTCONTAINER_MAXPOINTS, UI_PLOTCONTAINER_XKEY, UI_PLOTCONTAINER_YKEY } from "../../UIData.js";
import { WindowElement } from "../../Window.js";

export class PlotStarScatter extends WindowElement {
    constructor(window, sizeX, sizeY) {
        super(window, sizeX, sizeY);
        this.lengthCap = loadGD(UI_PLOTCONTAINER_MAXPOINTS);
        this.xValues = new Array(this.lengthCap);
        this.yValues = new Array(this.lengthCap);
        this.reloadGraph();
    }

    render(startX, startY) {
        if (this.xKey == null || this.yKey == null) {
            this.reloadGraph();
            return;
        }
        if (this.xKey != loadGD(UI_PLOTCONTAINER_XKEY) || this.yKey != loadGD(UI_PLOTCONTAINER_YKEY)) {
            this.reloadGraph();
        }

        this.reloadGraph();
        this.renderGraph(startX, startY);
    }

    reloadGraph() {
        if (gsh() == null) {
            return;
        }

        this.xKey = loadGD(UI_PLOTCONTAINER_XKEY);
        this.yKey = loadGD(UI_PLOTCONTAINER_YKEY);

        if (this.xKey == null || this.yKey == null) {
            return;
        }

        for (let i = 0; i < this.lengthCap; i++) {
            let x = i / this.lengthCap;
            let y = Math.abs(Math.sin(x * 20 + getCurDay() * 400));
            this.xValues[i] = x;
            this.yValues[i] = y;
        }
    }

    renderGraph(startX, startY) {
        MAIN_CONTEXT.fillStyle = COLOR_VERY_FUCKING_RED;
        for (let i = 0; i < this.lengthCap; i++) {
            MAIN_CONTEXT.beginPath();
            MAIN_CONTEXT.arc(
                this.xValues[i] * this.sizeX + startX,
                this.yValues[i] * this.sizeY + startY,
                1, 0, 2 * Math.PI, false);
            MAIN_CONTEXT.fill();
        }

    }

    hover(posX, posY) {
    }
}