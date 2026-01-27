import { getBaseUISize, getSingletonMouseWheelState } from "../../../canvas.js";
import { getFrameDt, gsh } from "../../../climate/time.js";
import { COLOR_WHITE } from "../../../colors.js";
import { calculateStatistics, hexToRgb, invlerp, processRangeToOne, rgbToRgba, rgbToRgbaObj } from "../../../common.js";
import { MAIN_CONTEXT } from "../../../index.js";
import { isKeyPressed, KEY_CONTROL, KEY_SHIFT } from "../../../keyboard.js";
import { getLastLastMoveOffset, getLastMouseDownStart, getLastMouseUpEvent, getLastMoveOffset, isLeftMouseClicked } from "../../../mouse.js";
import { loadGD, saveGD, UI_PLOTCONTAINER_AXISLABELS, UI_PLOTCONTAINER_MAXPOINTS, UI_PLOTCONTAINER_OFFSET_X, UI_PLOTCONTAINER_OFFSET_Y, UI_PLOTCONTAINER_POINTOPACITY, UI_PLOTCONTAINER_POINTSIZE, UI_PLOTCONTAINER_FILTERMODE_STARS, UI_PLOTCONTAINER_XKEY, UI_PLOTCONTAINER_XPADDING, UI_PLOTCONTAINER_YKEY, UI_PLOTCONTAINER_YPADDING, UI_PLOTCONTAINER_ZOOM_X, UI_PLOTCONTAINER_ZOOM_Y, UI_AA_LABEL_STARS, UI_PLOTCONTAINER_FILTERMODE_GRAPH, UI_AA_LABEL_GRAPH, UI_STARMAP_VIEWMODE, UI_AA_SETUP_COLORMODE, UI_AA_SETUP_DISPLAYTYPE_NAME_MULT, UI_AA_SETUP_NAME_MULT } from "../../UIData.js";
import { WindowElement } from "../../Window.js";

export class PlotStarScatter extends WindowElement {
    constructor(window, plotSizeX, plotSizeY) {
        super(window, plotSizeX, plotSizeY);
        this.lengthCap = loadGD(UI_PLOTCONTAINER_MAXPOINTS);
        this.xValues = new Array(this.lengthCap);
        this.yValues = new Array(this.lengthCap);
        this.sValues = new Array(this.lengthCap);
        this.rValues = new Array(this.lengthCap);
        this.pixelStarMap = new Map();
        this.numStars = 0;
        this.plottedStars = 0;
        this.lastFrameStarsRenderedColorCalc = 0;
        this.vr = [0, 1, 0, 1];
    }

    update() {
        this.lengthCap = loadGD(UI_PLOTCONTAINER_MAXPOINTS);
        this.xValues = new Array(this.lengthCap);
        this.yValues = new Array(this.lengthCap);
        this.sValues = new Array(this.lengthCap);
        this.xKey = null;
        this.yKey = null;
    }

    render(startX, startY) {
        if (gsh()?.stars == null) {
            return;
        }

        if (loadGD(UI_PLOTCONTAINER_FILTERMODE_GRAPH) == 2) {
            if (gsh()?.frameCache?.newStarSelected) {
                this.reloadGraph();
                gsh().frameCache.newStarSelected = false;
            }
        }
        if (this.xKey == null || this.yKey == null || this.numStars != gsh().stars.length) {
            this.reloadGraph();
            return;
        }
        if (this.xKey != loadGD(UI_PLOTCONTAINER_XKEY) || this.yKey != loadGD(UI_PLOTCONTAINER_YKEY)) {
            this.reloadGraph();
        }
        if (loadGD(UI_PLOTCONTAINER_FILTERMODE_GRAPH) != 2 && this._modeWasSelect) {
            this.reloadGraph();
        }

        this.renderGraph(startX, startY);
    }

    reloadGraphSelect() {
        console.log("reloadGraphSelect");
        if (this.xKey == null || this.yKey == null || gsh().stars.length == 0) {
            return;
        }
        let opacity = processRangeToOne(loadGD(UI_PLOTCONTAINER_POINTOPACITY) * this.lengthCap);
        let im = loadGD(UI_AA_LABEL_STARS);
        let starRenderMode = loadGD(UI_STARMAP_VIEWMODE);
        let namedStarOpacityAddition = processRangeToOne(loadGD(UI_AA_SETUP_NAME_MULT))
        let star;

        let filteredStars = Array.from(gsh().stars.filter((star) => star.selected || star.localitySelect));
        let filteredStarsIdx = 0;

        for (let i = 0; i < this.lengthCap; i++) {
            if (filteredStarsIdx < filteredStars.length) {
                star = filteredStars.at(i);
            } else {
                this.sValues[i] = null;
                continue;
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
            this.sValues[i] = star;
            this.rValues[i] = this.colorFromRenderModeStar(this.sValues[i], opacity, namedStarOpacityAddition);
        }

        this.lastFrameStarsRenderedColorCalc = this.lengthCap;

        this.xS = calculateStatistics(this.xValues);
        this.yS = calculateStatistics(this.yValues);
    }

    reloadGraph() {
        this.xKey = loadGD(UI_PLOTCONTAINER_XKEY);
        this.yKey = loadGD(UI_PLOTCONTAINER_YKEY);
        this.numStars = gsh().stars.length;


        if (this.xKey == null || this.yKey == null || gsh().stars.length == 0) {
            return;
        }

        if (loadGD(UI_PLOTCONTAINER_FILTERMODE_GRAPH) == 2) {
            this.reloadGraphSelect();
            this._modeWasSelect = true;
            return;
        }

        let idxMult = gsh().stars.length / (this.lengthCap);
        let opacity = processRangeToOne(loadGD(UI_PLOTCONTAINER_POINTOPACITY) * this.lengthCap);
        let namedStarOpacityAddition = processRangeToOne(loadGD(UI_AA_SETUP_NAME_MULT))

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
            this.sValues[i] = star;
            this.rValues[i] = this.colorFromRenderModeStar(this.sValues[i], opacity, namedStarOpacityAddition);
        }

        this.lastFrameStarsRenderedColorCalc = this.lengthCap;

        this.xS = calculateStatistics(this.xValues);
        this.yS = calculateStatistics(this.yValues);
    }

    colorFromRenderModeStar(star, opacity, namedStarOpacityAddition) {
        if (star.name) {
            return rgbToRgba(...(star.alt_color_arr ?? star.color), Math.min(1, opacity + namedStarOpacityAddition));
        }
        return rgbToRgba(...(star.alt_color_arr ?? star.color), opacity);
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

        let size = Math.exp(loadGD(UI_PLOTCONTAINER_POINTSIZE)), sizeCur = size;
        let x, y, xo, yo, xa, ya, star;
        let fm = loadGD(UI_PLOTCONTAINER_FILTERMODE_GRAPH);
        let namedStarOpacityAddition = processRangeToOne(loadGD(UI_AA_SETUP_NAME_MULT))
        let im = loadGD(UI_AA_LABEL_GRAPH);
        let starRenderMode = loadGD(UI_AA_SETUP_COLORMODE);

        let frameStarsRendered = 0;
        for (let i = 0; i < this.lengthCap; i++) {
            star = this.sValues[i];
            if (star == null || this.rValues[i] == null) {
                continue;
            }
            x = invlerp(...this.xBounds, this.xValues[i]);
            y = invlerp(...this.yBounds, this.yValues[i]);
            if (x < this.vr[0] || x > this.vr[1] || y < this.vr[2] || y > this.vr[3]) {
                star.graphVisible = false;
                continue;
            } else {
                star.graphVisible = true;
            }

            if (fm == 1) {
                if (!star.mmVisible || !star.fovVisible) {
                    continue;
                }
            } else if (fm == 2) {
                if (!(star.selected || star.localitySelect)) {
                    continue;
                }
            }

            x = invlerp(this.vr[0], this.vr[1], x);
            y = invlerp(this.vr[2], this.vr[3], y);

            xo = x * (this.sizeX - 2 * this.paddingX);
            yo = y * (this.sizeY - 2 * this.paddingY);

            xa = xo + startX + this.paddingX;
            ya = yo + startY + this.paddingY;

            star.graphX = xo;
            star.graphY = yo;

            if (this.sValues[i].selected) {
                sizeCur = size * 3;
            } else {
                sizeCur = size;
            }

            MAIN_CONTEXT.fillStyle = this.rValues[i];
            MAIN_CONTEXT.beginPath();
            MAIN_CONTEXT.arc(xa, ya, sizeCur, 0, 2 * Math.PI, false);
            MAIN_CONTEXT.fill();

            if (star.graphLabel) {
                MAIN_CONTEXT.font = getBaseUISize() * 3 + "px courier";
                MAIN_CONTEXT.fillStyle = hexToRgb(...(star.alt_color_arr ?? star.color));
                MAIN_CONTEXT.fillText(star.graphLabel, xa + MAIN_CONTEXT.measureText(star.graphLabel).width * 0.65, ya);
            }
            frameStarsRendered += 1;
        }

        if (this._shouldRecalculateColor || frameStarsRendered / this.lastFrameStarsRenderedColorCalc < 0.95 || this.lastFrameStarsRenderedColorCalc / frameStarsRendered < 0.95) {
            let opacity = processRangeToOne(loadGD(UI_PLOTCONTAINER_POINTOPACITY) * frameStarsRendered);
            for (let i = 0; i < this.lengthCap; i++) {
                if (this.sValues[i] != null) {
                    this.rValues[i] = this.colorFromRenderModeStar(this.sValues[i], opacity, namedStarOpacityAddition);
                }
            }
            this.lastFrameStarsRenderedColorCalc = frameStarsRendered;
        }

        this.renderGridLines(startX, startY);
        this.renderAxisLabels(startX, startY);

        MAIN_CONTEXT.fillStyle = COLOR_WHITE;
    }

    triggerRecalculateColor() {
        this._shouldRecalculateColor = true;
    }

    renderGridLines() {

    }
    renderAxisLabels() {
        if (!loadGD(UI_PLOTCONTAINER_AXISLABELS)) {
            return;
        }
        MAIN_CONTEXT.strokeStyle = COLOR_WHITE;

    }

    handleClick(posX, posY) {
        if (this.clickCounter != 2) {
            return;
        }

        posX -= this.paddingX;
        posY -= this.paddingY;

        let closestStar = null;
        let closestStarDist = 25;
        let curDist;
        for (let i = 0; i < this.numStars; i++) {
            if (this.sValues[i] != null && this.sValues[i].graphVisible) {
                curDist = ((this.sValues[i].graphX - posX) ** 2 + (this.sValues[i].graphY - posY) ** 2) ** 0.5;
                if (curDist < closestStarDist) {
                    closestStar = this.sValues[i];
                    closestStarDist = curDist;
                }
            }
        }

        if (closestStar != null) {
            closestStar.selected = !closestStar.selected;
            this.clickCounter += 1;
        }
    }

    hover(posX, posY) {
        if (posX < this.paddingX || posX > (this.sizeX - this.paddingX)) {
            return;
        }
        if (posY < this.paddingY || posY > (this.sizeY - this.paddingY)) {
            return;
        }

        this.lmo = getLastMoveOffset();
        this.plmo = (this.plmo ?? this.lmo);

        let dx = this.plmo.x - this.lmo.x;
        let dy = this.plmo.y - this.lmo.y;

        if (isLeftMouseClicked()) {
            this.window.locked = true;
            if (this.lastMouseDownStart != getLastMouseDownStart()) {
                this.clickCounter += 1;
                this.lastMouseDownStart = getLastMouseDownStart();
            }
        } else {
            if (Math.abs(dx * dy) > 4) {
                this.clickCounter = 0;
            } else {
                if (Date.now() - getLastMouseUpEvent() > 100) {
                    this.clickCounter = 0;
                }
            }
        }
        this.handlePan(dx, dy);
        this.handleClick(posX, posY)

        this.plmo = this.lmo;
        this.curLastMouseWheelEvent = getSingletonMouseWheelState();

        let shouldX = true, shouldY = true;
        if (isKeyPressed(KEY_SHIFT) && isKeyPressed(KEY_CONTROL)) {
            // then we should do both of them, which is the same as defualt. so keep default
        } else if (isKeyPressed(KEY_SHIFT)) {
            shouldY = false;
        } else if (isKeyPressed(KEY_CONTROL)) {
            shouldX = false;
        }

        let mpx = invlerp(this.paddingX, this.sizeX - this.paddingX, posX);
        let mpy = invlerp(this.paddingY, this.sizeY - this.paddingY, posY);

        if (this.curLastMouseWheelEvent != 0) {
            this.handleZoom(shouldX, shouldY, mpx, mpy, this.curLastMouseWheelEvent)
        }

        // if (shouldX) {
        //     let izx = loadGD(UI_PLOTCONTAINER_ZOOM_X);
        //     saveGD(UI_PLOTCONTAINER_ZOOM_X, izx * (1 - .001 * this.curLastMouseWheelEvent))
        //     let fzx = loadGD(UI_PLOTCONTAINER_ZOOM_X);
        //     let dzx = fzx - izx;
        //     let iox = loadGD(UI_PLOTCONTAINER_OFFSET_X);
        //     saveGD(UI_PLOTCONTAINER_OFFSET_X, iox += iox * (mpx) * dzx / fzx);
        // }
        // if (shouldY) {
        //     let izy = loadGD(UI_PLOTCONTAINER_ZOOM_Y);
        //     saveGD(UI_PLOTCONTAINER_ZOOM_Y, izy * (1 - .001 * this.curLastMouseWheelEvent))
        //     let fzy = loadGD(UI_PLOTCONTAINER_ZOOM_Y);
        //     let dzy = fzy - izy;
        //     let ioy = loadGD(UI_PLOTCONTAINER_OFFSET_Y);
        //     saveGD(UI_PLOTCONTAINER_OFFSET_Y, ioy += ioy * (mpy) * dzy / fzy);
        // }
    }

    handlePan(dx, dy) {
        let sX = 1 / (this.vr[1] - this.vr[0]);
        let sY = 1 / (this.vr[3] - this.vr[2]);

        if (this.clickCounter == 1) {
            this.vr[0] += 1 / this.sizeX * dx / sX;
            this.vr[1] += 1 / this.sizeX * dx / sX;
            this.vr[2] += 1 / this.sizeY * dy / sY;
            this.vr[3] += 1 / this.sizeY * dy / sY;
        }

    }

    handleZoom(shouldX, shouldY, mpx, mpy, scrollAmount) {
        let offset = invlerp(-720, 720, scrollAmount);
        offset = Math.max(Math.min(1, offset), 0) - 0.5;

        let gapX = (this.vr[1] - this.vr[0]);
        let gapY = (this.vr[3] - this.vr[2]);

        let gapFracX = ((gapX) * offset / 2);
        let gapFracY = ((gapY) * offset / 2);

        if (shouldX) {
            this.vr[0] -= gapFracX;
            this.vr[1] += gapFracX;
        }
        if (shouldY) {
            this.vr[2] -= gapFracY;
            this.vr[3] += gapFracY;
        }
    }
}