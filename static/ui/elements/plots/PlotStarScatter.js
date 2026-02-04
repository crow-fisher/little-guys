import { getBaseUISize, getSingletonMouseWheelState } from "../../../canvas.js";
import { COLOR_VERY_FUCKING_RED, COLOR_WHITE } from "../../../colors.js";
import { calculateStatistics, hexToRgb, invlerp, processRangeToOne, rgbToRgba, rgbToRgbaObj } from "../../../common.js";
import { MAIN_CONTEXT } from "../../../index.js";
import { isKeyPressed, KEY_CONTROL, KEY_SHIFT } from "../../../keyboard.js";
import { getStarHandler } from "../../../main.js";
import { getLastLastMoveOffset, getLastMouseDownStart, getLastMouseUpEvent, getLastMoveOffset, isLeftMouseClicked } from "../../../mouse.js";
import { resetViewportButtonOffset } from "../../components/AstronomyAtlas/modes/AstronomyAtlasModeFuncPlot.js";
import { loadGD, saveGD, UI_AA_PLOT_AXISLABELS, UI_AA_PLOT_MAXPOINTS, UI_AA_PLOT_OFFSET_X, UI_AA_PLOT_OFFSET_Y, UI_AA_PLOT_POINTOPACITY, UI_AA_PLOT_POINTSIZE, UI_AA_SELECT_FILTERMODE_STARS, UI_AA_PLOT_XKEY, UI_AA_PLOT_XPADDING, UI_AA_PLOT_YKEY, UI_AA_PLOT_YPADDING, UI_AA_PLOT_ZOOM_X, UI_AA_PLOT_ZOOM_Y, UI_AA_LABEL_STARS, UI_AA_SELECT_FILTERMODE_GRAPH, UI_AA_LABEL_GRAPH, UI_STARMAP_VIEWMODE, UI_AA_SETUP_COLORMODE, UI_AA_SETUP_DISPLAYTYPE_NAME_MULT, UI_AA_SETUP_SELECT_MULT, UI_AA_PLOT_SELECT_NAMED_STARS, UI_AA_SELECT_FILTERMODE_GRAPH_PREPARED } from "../../UIData.js";
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
        this.lastNumRenderedPoints = 0;

        this.valueRange = [0, 1, 0, 1];
        this.preparePointFlag = true;
        this.recalculateColorFlag = false;
        this.reloadGraphFlag = false;

        this.paddingX = 0;
        this.paddingY = 0;
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

    flagRepreparePoints(color) {
        this.preparePointFlag = true;
        this.recalculateColorFlag |= color;
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
        if (getStarHandler()?.sectors == null) {
            return;
        }
        if (loadGD(UI_AA_SELECT_FILTERMODE_GRAPH) == 2) {
            if (getStarHandler()?.frameCache?.newStarSelected) {
                this.reloadGraph();
                getStarHandler().frameCache.newStarSelected = false;
            }
        }
        if (this.xKey != loadGD(UI_AA_PLOT_XKEY) || this.yKey != loadGD(UI_AA_PLOT_YKEY)) {
            this.reloadGraph();
        }

        if (this.preparePointFlag) {
            this.preparePointFlag = false;
            this.prepareGraphPoints();
        }
        if (this.recalculateColorFlag) {
            this.preparePointColor();
            this.recalculateColorFlag = false;
        }

        this.renderGraph(startX, startY);
    }

    reloadGraphSelect() {
        if (this.xKey == null || this.yKey == null || getStarHandler().stars.length == 0) {
            return;
        }
        let star;
        let selectNamedStars = loadGD(UI_AA_PLOT_SELECT_NAMED_STARS);
        let filteredStars = new Array();
        getStarHandler().iterateOnSectors(((sector) => sector.loadedStars
            .filter((selectNamedStars ? star.name != null : false)
                || star.selected
                || star.localitySelect).forEach((star) => filteredStars.push(star))));

        let filteredStarsIdx = 0;
        for (let i = 0; i < this.lengthCap; i++) {
            if (filteredStarsIdx < filteredStars.length) {
                star = filteredStars.at(i);
            } else {
                this.sValues[i] = null;
                continue;
            }

            this.addStarToValueSet(i, star);
        }
        this.xS = calculateStatistics(this.xValues);
        this.yS = calculateStatistics(this.yValues);
    }

    preparePointColor() {
        let opacity = processRangeToOne(loadGD(UI_AA_PLOT_POINTOPACITY) * this.numRenderedPoints);
        let namedStarOpacityAddition = processRangeToOne(loadGD(UI_AA_SETUP_SELECT_MULT));
        for (let i = 0; i < this.lengthCap; i++) {
            if (this.sValues[i] != null) {
                this.rValues[i] = this.colorFromRenderModeStar(this.sValues[i], opacity, namedStarOpacityAddition);
            }
        };

    }
    prepareGraphPoints() {
        let graphFilterMode = loadGD(UI_AA_SELECT_FILTERMODE_GRAPH);
        this.xBounds = [
            this.xS[2],
            this.xS[3]
        ];
        this.yBounds = [
            this.yS[2],
            this.yS[3]
        ];
        let x, y, xo, yo, star;

        this.numRenderedPoints = 0;

        for (let i = 0; i < this.numStars; i++) {
            if (this.sValues[i] == null) {
                continue;
            }
            star = this.sValues[i];
            x = invlerp(...this.xBounds, star[this.xKey]);
            y = invlerp(...this.yBounds, star[this.yKey]);

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
            yo = y * this.sizeY;

            star.graphX = xo;
            star.graphY = yo;

            this.numRenderedPoints++;
        }

        if ((this.numRenderedPoints / this.lastNumRenderedPoints < 0.95 || this.lastNumRenderedPoints / this.numRenderedPoints < 0.95)) {
            this.recalculateColorFlag = true;
        }

        if (loadGD(UI_AA_LABEL_GRAPH)) {
            getStarHandler().resetStarLabels();
        }
    }

    addStarToValueSet(i, star) {
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
        return true;
    }

    reloadGraph() {
        this.xKey = loadGD(UI_AA_PLOT_XKEY);
        this.yKey = loadGD(UI_AA_PLOT_YKEY);

        if (this.xKey == null || this.yKey == null || getStarHandler().sectors.length == 0) {
            return;
        }

        let filterModeGraph = loadGD(UI_AA_SELECT_FILTERMODE_GRAPH);

        if (filterModeGraph == 2) {
            this.reloadGraphSelect();
            this._modeWasSelect = true;
            return;
        }

        let star, iO;

        let namedStars = new Array();
        let nonNamedStars = new Array();
        getStarHandler().iterateOnSectors(((sector) => sector.loadedStars
            .forEach((star) => ((star.name != null) ? namedStars : nonNamedStars).push(star))));
        this.numStars = namedStars.length + nonNamedStars.length;
        console.log("Reloading graph; ", this.numStars + " stars");
        let idxMult = this.numStars / this.lengthCap;

        for (let i = 0; i < this.lengthCap; i++) {
            this.xValues[i] = null;
            this.yValues[i] = null;
            this.sValues[i] = null;

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
            this.addStarToValueSet(i, star);
        }
        this.lastNumRenderedPoints = this.lengthCap;
        this.xS = calculateStatistics(this.xValues);
        this.yS = calculateStatistics(this.yValues);
    }

    colorFromRenderModeStar(star, opacity, namedStarOpacityMult, nameSelect) {
        if (nameSelect && star.name || star.selected || star.localitySelect) {
            return rgbToRgba(...(star.alt_color_arr ?? star.color), Math.min(1, opacity * namedStarOpacityMult));
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
        this.prepareGraphPoints();
        let size = Math.exp(loadGD(UI_AA_PLOT_POINTSIZE)), sizeCur = size;
        let star;
        let filterMode = loadGD(UI_AA_SELECT_FILTERMODE_GRAPH);
        let preparedFilter = loadGD(UI_AA_SELECT_FILTERMODE_GRAPH_PREPARED);
        for (let i = 0; i < this.lengthCap; i++) {
            star = this.sValues[i];
            if (star == null || !star.graphVisible) {
                continue;
            }


            if (filterMode == 1 && !star._renderedThisFrame) {
                continue;
            }
            if (filterMode == 2 && !(star.selected || star.localitySelect)) {
                continue;
            }

            if (star.selected) {
                sizeCur = size * 3;
            } else {
                sizeCur = size;
            }

            if (preparedFilter) {
                if (!star._preparedThisFrame) {
                    continue;
                }
            }

            MAIN_CONTEXT.fillStyle = this.rValues[i];
            MAIN_CONTEXT.beginPath();
            MAIN_CONTEXT.arc(startX + star.graphX, startY + star.graphY, sizeCur, 0, 2 * Math.PI, false);
            MAIN_CONTEXT.fill();

            if (star.graphX == null) {
                console.log(star.id);
            }

            if (star.graphLabel) {
                MAIN_CONTEXT.font = getBaseUISize() * 3 + "px courier";
                MAIN_CONTEXT.fillStyle = hexToRgb(...(star.alt_color_arr ?? star.color));
                MAIN_CONTEXT.fillText(
                    star.graphLabel,
                    startX + star.graphX + MAIN_CONTEXT.measureText(star.graphLabel).width * 0.65, startY + star.graphY);
            }
        }

    }

    _renderGraph(startX, startY) {

    }

    triggerRecalculateColor() {
        this.recalculateColorFlag = true;
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
        let closestStarDist = 10;
        let curDist;

        let preparedFilter = loadGD(UI_AA_SELECT_FILTERMODE_GRAPH_PREPARED);
        let star;
        for (let i = 0; i < this.lengthCap; i++) {
            star = this.sValues[i];
            if (star != null && star.graphVisible) {
                if (!preparedFilter || star._preparedThisFrame) {
                    curDist = ((star.graphX - posX) ** 2 + (star.graphY - posY) ** 2) ** 0.5;
                    if (curDist < closestStarDist) {
                        closestStar = star;
                        closestStarDist = curDist;
                    }
                }
            }
        }

        if (closestStar != null) {
            console.log("Selecting star ", closestStar.id, " ", closestStar.selected, ", with distance ", closestStarDist);
            closestStar.selected = !closestStar.selected;
            getStarHandler().resetStarLabels();
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
                if (Date.now() - getLastMouseUpEvent() > 250) {
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