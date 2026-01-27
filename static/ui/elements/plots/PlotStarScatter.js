import { getBaseUISize, getSingletonMouseWheelState } from "../../../canvas.js";
import { getFrameDt, gsh } from "../../../climate/time.js";
import { COLOR_WHITE } from "../../../colors.js";
import { calculateStatistics, hexToRgb, invlerp, processRangeToOne, rgbToRgba, rgbToRgbaObj } from "../../../common.js";
import { MAIN_CONTEXT } from "../../../index.js";
import { isKeyPressed, KEY_CONTROL, KEY_SHIFT } from "../../../keyboard.js";
import { getLastLastMoveOffset, getLastMouseDownStart, getLastMouseUpEvent, getLastMoveOffset, isLeftMouseClicked } from "../../../mouse.js";
import { resetViewportButtonOffset } from "../../components/AstronomyAtlas/modes/AstronomyAtlasModeFuncPlot.js";
import { loadGD, saveGD, UI_AA_PLOT_AXISLABELS, UI_AA_PLOT_MAXPOINTS, UI_AA_PLOT_OFFSET_X, UI_AA_PLOT_OFFSET_Y, UI_AA_PLOT_POINTOPACITY, UI_AA_PLOT_POINTSIZE, UI_AA_SELECT_FILTERMODE_STARS, UI_AA_PLOT_XKEY, UI_AA_PLOT_XPADDING, UI_AA_PLOT_YKEY, UI_AA_PLOT_YPADDING, UI_AA_PLOT_ZOOM_X, UI_AA_PLOT_ZOOM_Y, UI_AA_LABEL_STARS, UI_AA_SELECT_FILTERMODE_GRAPH, UI_AA_LABEL_GRAPH, UI_STARMAP_VIEWMODE, UI_AA_SETUP_COLORMODE, UI_AA_SETUP_DISPLAYTYPE_NAME_MULT, UI_AA_SETUP_NAME_MULT, UI_AA_PLOT_SELECT_NAMED_STARS } from "../../UIData.js";
import { WindowElement } from "../../Window.js";

export class PlotStarScatter extends WindowElement {
    constructor(window, plotSizeX, plotSizeY) {
        super(window, plotSizeX, plotSizeY);
        this.lengthCap = loadGD(UI_AA_PLOT_MAXPOINTS);
        this.xValues = new Array(this.lengthCap);
        this.yValues = new Array(this.lengthCap);
        this.sValues = new Array(this.lengthCap);
        this.rValues = new Array(this.lengthCap);

        this.pixelStarMap = new Map();

        this.numStars = 0;
        this.plottedStars = 0;
        this.lastFrameStarsRenderedColorCalc = 0;

        this.valueRange = [0, 1, 0, 1];
        this.preparePointFlag = true;
    }

    resetCameraPosition() {
        saveGD(UI_CAMERA_OFFSET_VEC, [0, 0, 0, 0]);
        saveGD(UI_CAMERA_OFFSET_VEC_DT, [0, 0, 0, 0]); 
        getAstronomyAtlasComponent().plotStarScatter.flagRepreparePoints();
    }

    resetValueRange() {
        this.valueRange = [0, 1, 0, 1];
        this.flagRepreparePoints();
    }

    flagRepreparePoints() {
        this.preparePointFlag = true;
    }

    update() {
        this.lengthCap = loadGD(UI_AA_PLOT_MAXPOINTS);
        this.xValues = new Array(this.lengthCap);
        this.yValues = new Array(this.lengthCap);
        this.sValues = new Array(this.lengthCap);
        this.rValues = new Array(this.lengthCap);
        this.xKey = null;
        this.yKey = null;
    }

    render(startX, startY) {
        if (gsh()?.stars == null) {
            return;
        }
        if (loadGD(UI_AA_SELECT_FILTERMODE_GRAPH) == 2) {
            if (gsh()?.frameCache?.newStarSelected) {
                this.reloadGraph();
                gsh().frameCache.newStarSelected = false;
            }
        }
        if (this.xKey == null || this.yKey == null || this.numStars != gsh().stars.length) {
            this.reloadGraph();
            return;
        }
        if (this.xKey != loadGD(UI_AA_PLOT_XKEY) || this.yKey != loadGD(UI_AA_PLOT_YKEY)) {
            this.reloadGraph();
        }
        if (loadGD(UI_AA_SELECT_FILTERMODE_GRAPH) != 2 && this._modeWasSelect) {
            this.reloadGraph();
        }

        if (this.preparePointFlag) {
            this.preparePointFlag = false;
            this.prepareGraphPoints();
        }

        this.renderGraph(startX, startY);
    }

    _reloadGraphSelect() {
        console.log("reloadGraphSelect");
        if (this.xKey == null || this.yKey == null || gsh().stars.length == 0) {
            return;
        }
        let opacity = processRangeToOne(loadGD(UI_AA_PLOT_POINTOPACITY) * this.lengthCap);
        let namedStarOpacityAddition = loadGD(UI_AA_PLOT_SELECT_NAMED_STARS) ? processRangeToOne(loadGD(UI_AA_SETUP_NAME_MULT)) : 0;
        let star;
        let selectNamedStars = loadGD(UI_AA_PLOT_SELECT_NAMED_STARS);

        let filteredStars = Array.from(gsh().stars.filter((star) =>
            (selectNamedStars ? star.name != null : false)
            || star.selected
            || star.localitySelect));

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
            this.rValues[i] = this.colorFromRenderModeStar(star, opacity, namedStarOpacityAddition);
        }

        this.lastFrameStarsRenderedColorCalc = this.lengthCap;
        this.xS = calculateStatistics(this.xValues);
        this.yS = calculateStatistics(this.yValues);
    }

    reloadGraphDefault() {
        this.xKey = loadGD(UI_AA_PLOT_XKEY);
        this.yKey = loadGD(UI_AA_PLOT_YKEY);
        this.numStars = gsh().stars.length;

        if (this.xKey == null || this.yKey == null || this.numStars == 0) {
            return;
        }

        let idxMult = gsh().stars.length / (this.lengthCap);
        let opacity = processRangeToOne(loadGD(UI_AA_PLOT_POINTOPACITY) * this.lengthCap);
        let namedStarOpacityAddition = processRangeToOne(loadGD(UI_AA_SETUP_NAME_MULT));
        let star, iO;

        gsh().stars.forEach((star) => star.recalculateAltColor());
        let namedStars = Array.from(gsh().stars.filter((star) => star.name != null));
        let nonNamedStars = Array.from(gsh().stars.filter((star) => star.name == null));

        for (let i = 0; i < this.lengthCap; i++) {
            star = namedStars.pop(), iO = -1;
            if (star == null) {
                while (star == null && iO < 5) {
                    iO += 1;
                    star = nonNamedStars.at(Math.floor(i * idxMult) + iO);
                }
                if (star == null) {
                    continue;
                }
            }
            this.addStarToValueSet(i, star, opacity, namedStarOpacityAddition);
        }

    }

    reloadGraphSelect() {

    }

    prepareGraphPoints() {
        this.xS = calculateStatistics(this.xValues);
        this.yS = calculateStatistics(this.yValues);
        let graphFilterMode = loadGD(UI_AA_SELECT_FILTERMODE_GRAPH);

        this.xBounds = [
            this.xS[2],
            this.xS[3]
        ];
        this.yBounds = [
            this.yS[2],
            this.yS[3]
        ];
        let x, y, xo, yo, xp, yp, star;

        for (let i = 0; i < this.numStars; i++) {
            if (this.sValues[i] == null) {
                continue;
            }
            star = this.sValues[i];
            x = invlerp(...this.xBounds, this.xValues[i]);
            y = invlerp(...this.yBounds, this.yValues[i]);
            if (x < this.valueRange[0] || x > this.valueRange[1] || y < this.valueRange[2] || y > this.valueRange[3]) {
                star.graphVisible = false;
                continue;
            } else {
                star.graphVisible = true;
            }
            if (graphFilterMode == 1) {
                if (!star._fovVisible) {
                    continue;
                }
            } else if (graphFilterMode == 2) {
                if (!(star.selected || star.localitySelect)) {
                    continue;
                }
            }

            x = invlerp(this.valueRange[0], this.valueRange[1], x);
            y = invlerp(this.valueRange[2], this.valueRange[3], y);

            xo = x * this.sizeX;
            yo = y * ((this.sizeY + resetViewportButtonOffset));

            star.graphX = xo;
            star.graphY = yo;
        }
    }

    addStarToValueSet(i, star, opacity, namedStarOpacityAddition) {
        if (star == null) {
            return false;
        }
        let x = star[this.xKey];
        let y = star[this.yKey];
        if (isNaN(x) || isNaN(y) || !isFinite(x) || !isFinite(y)) {
            return false;
        }
        this.xValues[i] = x;
        this.yValues[i] = y;
        this.sValues[i] = star;
        this.rValues[i] = this.colorFromRenderModeStar(star, opacity, namedStarOpacityAddition);
        return true;
    }

    reloadGraph() {
        this.xKey = loadGD(UI_AA_PLOT_XKEY);
        this.yKey = loadGD(UI_AA_PLOT_YKEY);
        this.numStars = gsh().stars.length;

        if (this.xKey == null || this.yKey == null || gsh().stars.length == 0) {
            return;
        }

        if (loadGD(UI_AA_SELECT_FILTERMODE_GRAPH) == 2) {
            this.reloadGraphSelect();
            this._modeWasSelect = true;
            return;
        }

        let idxMult = gsh().stars.length / (this.lengthCap);
        let opacity = processRangeToOne(loadGD(UI_AA_PLOT_POINTOPACITY) * this.lengthCap);
        let namedStarOpacityAddition = processRangeToOne(loadGD(UI_AA_SETUP_NAME_MULT))
        let star, iO;

        gsh().stars.forEach((star) => star.recalculateAltColor());
        let namedStars = Array.from(gsh().stars.filter((star) => star.name != null));
        let nonNamedStars = Array.from(gsh().stars.filter((star) => star.name == null));

        for (let i = 0; i < this.lengthCap; i++) {
            star = namedStars.pop(), iO = -1;
            if (star == null) {
                while (star == null && iO < 5) {
                    iO += 1;
                    star = nonNamedStars.at(Math.floor(i * idxMult) + iO);
                }
                if (star == null) {
                    continue;
                }
            }

            let x = star[this.xKey];
            let y = star[this.yKey];
            if (isNaN(x) || isNaN(y) || !isFinite(x) || !isFinite(y)) {
                continue;
            }
            this.xValues[i] = x;
            this.yValues[i] = y;
            this.sValues[i] = star;
            this.rValues[i] = this.colorFromRenderModeStar(star, opacity, namedStarOpacityAddition);
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
        let frameStarsRendered = 0;
        let size = Math.exp(loadGD(UI_AA_PLOT_POINTSIZE)), sizeCur = size;
        let star;
        for (let i = 0; i < this.lengthCap; i++) {
            star = this.sValues[i];
            if (star == null || !star.graphVisible) {
                continue;
            }
            
            if (star.selected) {
                sizeCur = size * 3;
            } else {
                sizeCur = size;
            }

            MAIN_CONTEXT.fillStyle = this.rValues[i];
            MAIN_CONTEXT.beginPath();
            MAIN_CONTEXT.arc(startX + star.graphX, startY + star.graphY, sizeCur, 0, 2 * Math.PI, false);
            MAIN_CONTEXT.fill();

            // if (star.graphLabel) {
            //     MAIN_CONTEXT.font = getBaseUISize() * 3 + "px courier";
            //     MAIN_CONTEXT.fillStyle = hexToRgb(...(star.alt_color_arr ?? star.color));
            //     MAIN_CONTEXT.fillText(star.graphLabel, xa + MAIN_CONTEXT.measureText(star.graphLabel).width * 0.65, ya);
            // }

        }
    }

    _renderGraph(startX, startY) {
        this.xBounds = [
            this.xS[2],
            this.xS[3]
        ];
        this.yBounds = [
            this.yS[2],
            this.yS[3]
        ];

        this.paddingX = loadGD(UI_AA_PLOT_POINTSIZE) * 2;
        this.paddingY = loadGD(UI_AA_PLOT_POINTSIZE) * 2;

        let size = Math.exp(loadGD(UI_AA_PLOT_POINTSIZE)), sizeCur = size;
        let x, y, xo, yo, xa, ya, star;
        let graphFilterMode = loadGD(UI_AA_SELECT_FILTERMODE_GRAPH);
        let namedStarOpacityAddition = processRangeToOne(loadGD(UI_AA_SETUP_NAME_MULT))

        let frameStarsRendered = 0;
        for (let i = 0; i < this.lengthCap; i++) {
            star = this.sValues[i];
            if (star == null || this.rValues[i] == null) {
                continue;
            }
            x = invlerp(...this.xBounds, this.xValues[i]);
            y = invlerp(...this.yBounds, this.yValues[i]);
            if (x < this.valueRange[0] || x > this.valueRange[1] || y < this.valueRange[2] || y > this.valueRange[3]) {
                star.graphVisible = false;
                continue;
            } else {
                star.graphVisible = true;
            }

            if (graphFilterMode == 1) {
                if (!star._fovVisible) {
                    continue;
                }
            } else if (graphFilterMode == 2) {
                if (!(star.selected || star.localitySelect)) {
                    continue;
                }
            }

            x = invlerp(this.valueRange[0], this.valueRange[1], x);
            y = invlerp(this.valueRange[2], this.valueRange[3], y);

            xo = x * (this.sizeX - 2 * this.paddingX);
            yo = y * ((this.sizeY + resetViewportButtonOffset));

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
            let opacity = processRangeToOne(loadGD(UI_AA_PLOT_POINTOPACITY) * frameStarsRendered);
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
        if (!loadGD(UI_AA_PLOT_AXISLABELS)) {
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
    }

    handlePan(dx, dy) {
        let sX = 1 / (this.valueRange[1] - this.valueRange[0]);
        let sY = 1 / (this.valueRange[3] - this.valueRange[2]);

        if (this.clickCounter == 1) {
            this.valueRange[0] += 1 / this.sizeX * dx / sX;
            this.valueRange[1] += 1 / this.sizeX * dx / sX;
            this.valueRange[2] += 1 / this.sizeY * dy / sY;
            this.valueRange[3] += 1 / this.sizeY * dy / sY;
        }
        this.flagRepreparePoints();

    }

    handleZoom(shouldX, shouldY, mpx, mpy, scrollAmount) {
        let offset = invlerp(-720, 720, scrollAmount);
        offset = Math.max(Math.min(1, offset), 0) - 0.5;

        let gapX = (this.valueRange[1] - this.valueRange[0]);
        let gapY = (this.valueRange[3] - this.valueRange[2]);

        let gapFracX = ((gapX) * offset / 2);
        let gapFracY = ((gapY) * offset / 2);

        if (shouldX) {
            this.valueRange[0] -= gapFracX;
            this.valueRange[1] += gapFracX;
        }
        if (shouldY) {
            this.valueRange[2] -= gapFracY;
            this.valueRange[3] += gapFracY;
        }
        this.preparePointFlag = true;
    }
}