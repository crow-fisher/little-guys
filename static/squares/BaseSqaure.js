

import { getNeighbors, addSquare, getSquares, isSqColChanged, isSqRowChanged, getSqColChangeLocation } from "./_sqOperations.js";
import {
    getNextGroupId,
    getMixArrLen,
    getTargetMixIdx,
    setGroupGrounded,
    isGroupGrounded,
    regSquareToGroup,
    getNextBlockId
} from "../globals.js";

import { MAIN_CONTEXT } from "../index.js";

import { hexToRgb, hsv2rgb, randNumber, randRange, removeItemAll, rgb2hsv, rgbToHex, rgbToRgba } from "../common.js";
import { removeSquare } from "../globalOperations.js";
import { calculateColorTemperature, getTemperatureAtWindSquare, temperatureHumidityFlowrateFactor, updateWindSquareTemperature } from "../climate/simulation/temperatureHumidity.js";
import { getWindSquareAbove } from "../climate/simulation/wind.js";
import { COLOR_BLACK, GROUP_BROWN, GROUP_BLUE, GROUP_MAUVE, GROUP_TAN, GROUP_GREEN, RGB_COLOR_BLUE, RGB_COLOR_RED } from "../colors.js";
import { getDaylightStrengthFrameDiff, getFrameDt, getTimeScale } from "../climate/time.js";
import { applyLightingFromSource, getDefaultLighting, processLighting } from "../lighting/lightingProcessing.js";
import { fillCanvasPointArr, getBaseSize, getCanvasHeight, getCanvasSquaresY, getCanvasWidth, getCurZoom, isSquareOnCanvas, transformCanvasSquaresToPixels, zoomCanvasFillCircle, zoomCanvasFillRect, zoomCanvasSquareText } from "../canvas.js";
import { loadGD, UI_PALETTE_BLOCKS, UI_PALETTE_SELECT, UI_PALETTE_SURFACE, UI_LIGHTING_ENABLED, UI_VIEWMODE_LIGHTING, UI_VIEWMODE_MOISTURE, UI_VIEWMODE_NORMAL, UI_VIEWMODE_SELECT, UI_VIEWMODE_SURFACE, UI_VIEWMODE_TEMPERATURE, UI_VIEWMODE_ORGANISMS, UI_LIGHTING_WATER_OPACITY, UI_VIEWMODE_WIND, UI_PALETTE_SURFACE_OFF, UI_GAME_MAX_CANVAS_SQUARES_X, UI_GAME_MAX_CANVAS_SQUARES_Y, UI_VIEWMODE_WATERTICKRATE, UI_SIMULATION_CLOUDS, UI_VIEWMODE_WATERMATRIC, UI_VIEWMODE_GROUP, UI_PALETTE_SPECIAL_SHOWINDICATOR, UI_PALETTE_MODE, UI_PALLETE_MODE_SPECIAL, UI_VIEWMODE_DEV1, UI_VIEWMODE_DEV2, UI_VIEWMODE_EVOLUTION, UI_VIEWMODE_NUTRIENTS, UI_VIEWMODE_AIRTICKRATE, UI_CAMERA_EXPOSURE, UI_VIEWMODE_DEV3, UI_VIEWMODE_DEV4, UI_VIEWMODE_DEV5, UI_PALETTE_STRENGTH, UI_LIGHTING_SURFACE, UI_PALETTE_SURFACE_MATCH, UI_VIEWMODE_3D } from "../ui/UIData.js";
import { deregisterSquare, registerSquare } from "../waterGraph.js";
import { STAGE_DEAD } from "../organisms/Stages.js";
import { cartesianToScreen } from "../camera.js";

export class BaseSquare {
    constructor(posX, posY) {
        this.proto = "BaseSquare";
        this.posX = posX;
        this.posY = posY;
        this.z = 0;

        this.id = getNextBlockId();

        this.posHistoryRetentionLength = 10;
        this.posHistoryMap = new Array(this.posHistoryRetentionLength);
        this.posHistoryCur = this.posHistoryRetentionLength;
        for (let i = 0; i < this.posHistoryRetentionLength; i++)
            this.posHistoryMap[i] = [this.posX, this.posY];

        this.color = hexToRgb("#00FFFF");

        this.solid = true;
        this.spawnedEntityId = 0;
        // block properties - overridden by block type
        this.physicsEnabled = true;
        this.gravity = 1;
        this.hasBonked = false;
        this.blockHealthMax = 1;
        this.blockHealth = Math.min(loadGD(UI_PALETTE_STRENGTH), this.blockHealthMax); // when reaches zero, delete
        // water flow parameters

        this.currentPressureDirect = -1;
        this.waterContainment = 0;
        this.waterContainmentMax = 0.5;
        this.speedX = 0;
        this.speedY = 0;
        this.rootable = false;
        this.group = -1;
        this.groupSetThisFrame = false;
        this.organic = false;
        this.collision = true;
        this.visible = true;
        this.darken = true;
        this.special = false;
        this.randoms = [];
        this.linkedOrganisms = new Array();
        this.linkedOrganismSquares = new Array();
        this.lighting = new Array();
        this.spawnTime = Date.now();
        this.opacity = 1;
        this.cachedRgba = null;
        this.distToFront = 0;
        this.distToFrontLastUpdated = -(10 ** 8);
        this.miscBlockPropUpdateInterval = Math.random() * 1000;

        this.surface = (loadGD(UI_PALETTE_SURFACE_OFF));
        this.surfaceLightingFactor = (1 - loadGD(UI_LIGHTING_SURFACE));
        this.temperature = 273;

        this.thermalMass = 2; // e.g., '2' means one degree of this would equal 2 degrees of air temp for a wind square 

        this.state = 0; // 0 = solid, 1 = liquid
        this.fusionHeat = 10 ** 8; // kJ/mol
        this.vaporHeat = 10 ** 8; // kJ/mol
        this.fusionTemp = 0; // freezing point 
        this.vaporTemp = 10 ** 8; // boiling point

        this.water_fusionHeat = 6;
        this.water_vaporHeat = .000047;
        this.water_fusionTemp = 273;
        this.water_vaporTemp = 373;

        this.lastColorCacheTime = 0;
        this.lastColorCacheOpacity = 1;
        this.colorCacheHoldTime = 0.10;

        this.blockHealth_color1 = RGB_COLOR_RED;
        this.blockHealth_color2 = RGB_COLOR_BLUE;
        this.mixIdx = -1;

        this.blockHealthGravityCoef = 2;

        this.initTemperature();
        this.setFrameCartesians();
    };

    getSurfaceLightingFactor() {
        return Math.min(1, Math.max(0, this.surfaceLightingFactor));
    }

    purgeLighting() {
        this.lighting = new Array();
        this.linkedOrganisms.forEach((org) => {
            org.lighting = new Array();
            org.greenLifeSquares.forEach((lsq) => lsq.lighting = new Array());
        });
    }
    mossSpaceRemaining() {
        return 1 - this.linkedOrganismSquares
            .filter((lsq) => lsq.type == "moss")
            .map((lsq) => lsq.opacity)
            .reduce((a, b) => a + b, 0);
    }

    initLightingFromNeighbors() {
        return;
        let neighbor = getNeighbors(this.posX, this.posY).find((sq) => sq.lighting.length > 0);
        let curY = this.posY + 1;
        while (neighbor == null) {
            neighbor = getSquares(this.posX, curY).find((sq) => sq.lighting.length > 0);
            curY += 1;
            if (curY > getCanvasSquaresY()) {
                this.lighting = [];
                return;
            }
        }
        applyLightingFromSource(neighbor, this);
    }

    initTemperature() {
        this.temperature = 273 + 25;
    }

    processFrameLightingTemperature() {
        let tickFrac = 4;
        if (Math.random() < 1 - (1 / tickFrac)) {
            return;
        }
        let lightingColor = this.processLighting();
        let lightingApplied = Math.max(0, lightingColor.r + lightingColor.g / 2 + lightingColor.b / 4);

        if (isNaN(lightingApplied)) {
            return;
        }
        lightingApplied /= (15000 / tickFrac);
        this.temperature = Math.min(370, this.temperature + lightingApplied);
    }

    getSoilWaterPressure() { return -(10 ** 8); }

    getLightFilterRate() {
        return 0.00017;
    }

    temperatureRoutine() {
        if (this.organic) {
            return;
        }
        let adjacentWindSquare = getWindSquareAbove(this.posX, this.posY);

        let x = adjacentWindSquare[0];
        let y = adjacentWindSquare[1];

        if (x < 0 || y < 0) {
            return;
        }
        let adjacentTemp = getTemperatureAtWindSquare(x, y);
        let diff = (adjacentTemp - this.temperature);
        diff /= temperatureHumidityFlowrateFactor();
        diff /= 50;
        diff /= Math.max(1, (1 + this.currentPressureDirect));
        this.temperature += diff;
        updateWindSquareTemperature(x, y, getTemperatureAtWindSquare(x, y) - (diff / 4));
    }

    waterEvaporationRoutine() {
    }

    destroy(deep = false) {
        if (deep) {
            this.linkedOrganisms.forEach((org) => org.destroy());
            this.linkedOrganismSquares.forEach((lsq) => lsq.destroy());
        }
        removeSquare(this);
        this.lighting = [];
        this.linkedOrganismSquares = [];
    }
    linkOrganism(organism) {
        this.linkedOrganisms.push(organism);
    }
    unlinkOrganism(organism) {
        this.linkedOrganisms = removeItemAll(this.linkedOrganisms, organism);
    }
    linkOrganismSquare(organismSquare) {
        this.linkedOrganismSquares.push(organismSquare);
    }
    unlinkOrganismSquare(organismSquare) {
        this.linkedOrganismSquares = removeItemAll(this.linkedOrganismSquares, organismSquare);
    }
    reset() {
        if (this.blockHealth <= 0) {
            removeSquare(this);
        }

        if (Math.random() > 0.5) {
            this.groupSetThisFrame = false;
        }

        if (Math.random() > 0.99) // yeahh....this is a hack. :( 
            this.linkedOrganismSquares = Array.from(this.linkedOrganismSquares.filter((lsq) => lsq.linkedOrganism.stage != STAGE_DEAD));


    }

    spawnParticle(dx, dy, sx, sy, blockHealth) {
        return 0;
    }


    renderBlockHealth() {
        let base = this.getColorBase();
        let hsv = rgb2hsv(base.r, base.g, base.b);
        hsv[0] += 360 * this.blockHealth;
        let out = hsv2rgb(...hsv);
        MAIN_CONTEXT.fillStyle = rgbToHex(...out);
        zoomCanvasFillRect(this.posX * getBaseSize(), this.posY * getBaseSize(), getBaseSize(), getBaseSize());
    }
    render() {
        if (!this.visible) {
            return;
        }

        if (loadGD(UI_LIGHTING_ENABLED) && this.lighting.length == 0) {
            this.initLightingFromNeighbors();
        }

        let selectedViewMode = loadGD(UI_VIEWMODE_SELECT);
        if (selectedViewMode == UI_VIEWMODE_NORMAL) {
            this.renderWithVariedColors(1);
        } else if (selectedViewMode == UI_VIEWMODE_3D) {
            this.render3D(1);
        } else if (selectedViewMode == UI_VIEWMODE_ORGANISMS || selectedViewMode == UI_VIEWMODE_EVOLUTION || selectedViewMode == UI_VIEWMODE_NUTRIENTS) {
            this.renderWithVariedColors(0.35);
        } else if (selectedViewMode == UI_VIEWMODE_GROUP) {
            this.renderGroup();
        } else if (selectedViewMode == UI_VIEWMODE_LIGHTING) {
            this.renderWithVariedColors(1);
            if (this.solid)
                this.renderLightingView();
        } else if (selectedViewMode == UI_VIEWMODE_MOISTURE) {
            this.renderWaterSaturation();
        } else if (selectedViewMode == UI_VIEWMODE_WATERTICKRATE) {
            this.renderWaterTickrate();
        } else if (selectedViewMode == UI_VIEWMODE_WATERMATRIC) {
            this.renderMatricPressure();
        }
        else if (selectedViewMode == UI_VIEWMODE_DEV3) {
            return this.renderBlockHealth();
        }
        if (selectedViewMode == UI_VIEWMODE_SURFACE || (loadGD(UI_PALETTE_BLOCKS) && (loadGD(UI_PALETTE_MODE) == UI_PALLETE_MODE_SPECIAL) && [UI_PALETTE_SURFACE, UI_PALETTE_SURFACE_OFF, UI_PALETTE_SURFACE_MATCH].includes(loadGD(UI_PALETTE_SELECT)))) {
            if (this.solid) {
                this.renderWithVariedColors(1);
                this.renderSurface();
            } else {
                this.renderWithVariedColors(0.25);
            }
        }
        else if (selectedViewMode == UI_VIEWMODE_TEMPERATURE) {
            this.renderTemperature();
        } else if (selectedViewMode == UI_VIEWMODE_WIND || selectedViewMode == UI_VIEWMODE_AIRTICKRATE) {
            this.renderWithVariedColors(0.25);
        } else if (selectedViewMode == UI_VIEWMODE_DEV1 || selectedViewMode == UI_VIEWMODE_DEV2) {
            this.renderWithVariedColors(0.5);
        } else if (selectedViewMode == UI_VIEWMODE_DEV4) {
            this.renderSpeed(true, true);
            this.renderBlockId();
        } else if (selectedViewMode == UI_VIEWMODE_DEV5) {
            this.renderWithVariedColors(1);
            this.renderHistory();
        }
    };

    renderBlockId() {
        MAIN_CONTEXT.font = .35 * getBaseSize() * getCurZoom() + "px courier"
        MAIN_CONTEXT.textAlign = 'center';
        MAIN_CONTEXT.textBaseline = 'middle';
        MAIN_CONTEXT.strokeStyle = "rgba(35, 35, 35, 1)";
        zoomCanvasSquareText(
            (this.posX + 0.5) * getBaseSize(),
            (this.posY + 0.5) * getBaseSize(),
            this.id % 10000);
    }

    renderSpeed(x = true, y = true) {
        let res = 0;

        if (x)
            res += this.speedX;
        if (y)
            res += this.speedY;

        let base = this.getColorBase();
        let hsv = rgb2hsv(base.r, base.g, base.b);
        hsv[0] += 360.0 * res;
        let out = hsv2rgb(...hsv);
        MAIN_CONTEXT.fillStyle = rgbToRgba(...out, 0.1);

        if (this.linkedOrganismSquares.length > 0)
            MAIN_CONTEXT.fillStyle = rgbToRgba(225, 35, 10, .8);

        zoomCanvasFillRect(this.posX * getBaseSize(), this.posY * getBaseSize(), getBaseSize(), getBaseSize());
    }

    renderGroup() {
        let colorArr = [
            GROUP_BROWN,
            GROUP_MAUVE,
            GROUP_BLUE,
            GROUP_GREEN,
            GROUP_TAN
        ]
        MAIN_CONTEXT.fillStyle = colorArr[this.group % colorArr.length];
        zoomCanvasFillRect(
            this.posX * getBaseSize(),
            this.posY * getBaseSize(),
            getBaseSize(),
            getBaseSize()
        );

    }

    renderTemperature() {
        MAIN_CONTEXT.fillStyle = calculateColorTemperature(this.temperature);
        zoomCanvasFillRect(
            this.posX * getBaseSize(),
            this.posY * getBaseSize(),
            getBaseSize(),
            getBaseSize()
        );
    }

    renderSurface() {
        if (!loadGD(UI_PALETTE_SPECIAL_SHOWINDICATOR)) {
            return;
        }
        if (!this.surface) {
            MAIN_CONTEXT.fillStyle = "rgba(90, 71, 97, 0.3)"
            zoomCanvasFillRect(
                (this.posX) * getBaseSize(),
                (this.posY) * getBaseSize(),
                getBaseSize(),
                getBaseSize()
            );
        } else {
            this.renderSpecialViewModeLinearOpacity({ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, 1 - this.surfaceLightingFactor, 1, 0.3);
        }

    }

    renderAsGrey() {
        MAIN_CONTEXT.fillStyle = "rgba(50, 50, 50, 0.2)";
        zoomCanvasFillRect(
            (this.posX) * getBaseSize(),
            (this.posY) * getBaseSize(),
            getBaseSize(),
            getBaseSize()
        );
    }

    renderWaterSaturation() {
        this.renderSpecialViewModeLinear(this.blockHealth_color1, this.blockHealth_color2, this.waterContainment, this.waterContainmentMax);
    }

    renderWaterTickrate() {
        if (this.percolationFactor != null) {
            this.renderSpecialViewModeLinear(this.blockHealth_color1, this.blockHealth_color2, this.percolationFactor, 1);
        }
    }

    renderMatricPressure() {
        if (this.proto == "SoilSquare" || this.proto == "RockSquare") {
            let sp = Math.abs(this.getSoilWaterPressure());
            this.renderSpecialViewModeLinear(this.blockHealth_color2, this.blockHealth_color1, sp, 5);
        }
    }

    renderSpecialViewModeLinear(color1, color2, value, valueMax) {
        this.renderSpecialViewModeLinearOpacity(color1, color2, value, valueMax, 0.4)
    }

    renderSpecialViewModeLinearOpacity(color1, color2, value, valueMax, opacity) {
        let frac = value / valueMax;
        let outColor = {
            r: color1.r * frac + color2.r * (1 - frac),
            g: color1.g * frac + color2.g * (1 - frac),
            b: color1.b * frac + color2.b * (1 - frac)
        }
        let outRgba = rgbToRgba(Math.floor(outColor.r), Math.floor(outColor.g), Math.floor(outColor.b), opacity);
        MAIN_CONTEXT.fillStyle = outRgba;
        zoomCanvasFillRect(
            this.posX * getBaseSize(),
            this.posY * getBaseSize(),
            getBaseSize(),
            getBaseSize()
        );
    }

    getStaticRand(randIdx) {
        while (randIdx > this.randoms.length - 1) {
            this.randoms.push(Math.random());
        }
        return this.randoms[randIdx];
    }

    getColorBase() {
        return this.color;
    }

    processLighting(override = false) {
        if (this.frameCacheLighting != null && !override) {
            return this.frameCacheLighting;
        }
        if (!loadGD(UI_LIGHTING_ENABLED)) {
            this.frameCacheLighting = getDefaultLighting();
            return this.frameCacheLighting;
        }
        this.frameCacheLighting = processLighting(this.lighting);
        return this.frameCacheLighting;
    }

    renderLightingView() {
        if (this.frameCacheLighting == null) {
            this.processLighting();
        }
        let outRgba = rgbToRgba(
            Math.floor(this.frameCacheLighting.r / loadGD(UI_CAMERA_EXPOSURE)),
            Math.floor(this.frameCacheLighting.g / loadGD(UI_CAMERA_EXPOSURE)),
            Math.floor(this.frameCacheLighting.b / loadGD(UI_CAMERA_EXPOSURE)),
            0.5);
        MAIN_CONTEXT.fillStyle = outRgba;
        zoomCanvasFillRect(
            this.posX * getBaseSize(),
            this.posY * getBaseSize(),
            getBaseSize(),
            getBaseSize()
        );
    }

    setFrameCartesians() { 
        let zs = this.z;
        let zd = this.surfaceLightingFactor;
        this.tl = [this.posX, (-1) * (this.posY), zs]
        this.tr = [this.posX + 1, (-1) * (this.posY), zs]
        this.bl = [this.posX, (-1) * (this.posY + 1), zs]
        this.br = [this.posX + 1, (-1) * (this.posY + 1), zs]
    }

    render3D(opacityMult) {
        let minTime = getFrameDt() * 128;
        if (isSqColChanged(this.posX)) {
            minTime /= 4;
        }
        if (isSqRowChanged(this.posY)) {
            minTime /= 4;
        }

        if (
            (opacityMult != this.lastColorCacheOpacity) ||
            (Date.now() > this.lastColorCacheTime + minTime * Math.random()) ||
            Math.abs(getDaylightStrengthFrameDiff()) > 0.005) {

            this.lastColorCacheTime = Date.now();
            let outColorBase = this.getColorBase();
            let lightingColor = this.processLighting(true);
            this.frameCacheLighting = lightingColor;
            this.outColor = { r: lightingColor.r * outColorBase.r / 255, g: lightingColor.g * outColorBase.g / 255, b: lightingColor.b * outColorBase.b / 255 };
            this.lastColorCacheOpacity = opacityMult;
            this.cachedRgba = rgbToRgba(Math.floor(this.outColor.r), Math.floor(this.outColor.g), Math.floor(this.outColor.b), opacityMult * this.opacity * this.blockHealth ** 0.2);
        }
        MAIN_CONTEXT.fillStyle = this.cachedRgba;

        let bottomSquare = getSquares(this.posX, this.posY + 1).find((sq) => sq.solid);
        this.z = bottomSquare != null ? (bottomSquare.z + Math.abs(bottomSquare.surfaceLightingFactor * .21)) : 0;
        
        this.setFrameCartesians();

        let tlsq = getSquares(this.posX - 1, this.posY).find((sq) => sq.solid && sq.visible && sq.tls != null) ?? this;
        let trsq = getSquares(this.posX + 1, this.posY).find((sq) => sq.solid && sq.visible && sq.trs != null) ?? this;
        let blsq = getSquares(this.posX - 1, this.posY + 1).find((sq) => sq.solid && sq.visible && sq.bls != null) ?? this;
        let brsq = getSquares(this.posX + 1, this.posY + 1).find((sq) => sq.solid && sq.visible && sq.brs != null) ?? this;

        this.tls = cartesianToScreen(...this.tl);
        this.trs = cartesianToScreen(...this.tr);
        this.bls = cartesianToScreen(...this.bl);
        this.brs = cartesianToScreen(...this.br);

        let p1 = this.combinePoints(this, tlsq, "tls");
        let p2 = this.combinePoints(this, trsq, "trs");
        let p3 = this.combinePoints(this, blsq, "bls");
        let p4 = this.combinePoints(this, brsq, "brs");

        let pArr = [p1, p2, p4, p3, p1];

        if (pArr.some((p) => p == null))
            return;

        fillCanvasPointArr(pArr);
    }

    combinePoints(p1, p2, getter) {
        if (p1[getter] == null || p2[getter] == null)
            return p1[getter] ?? p2[getter] ?? [0, 0, 0, 0];

        return [
            (p1[getter][0] + p2[getter][0]) * .5,
            (p1[getter][1] + p2[getter][1]) * .5,
            (p1[getter][2] + p2[getter][2]) * .5
        ]
    }

    renderWithVariedColors(opacityMult) {
        if (this.proto == "WaterSquare") {
            this.opacity = loadGD(UI_LIGHTING_WATER_OPACITY);
        }

        let minTime = getFrameDt() * 128;
        if (isSqColChanged(this.posX)) {
            minTime /= 4;
        }
        if (isSqRowChanged(this.posY)) {
            minTime /= 4;
        }

        if (
            (opacityMult != this.lastColorCacheOpacity) ||
            (Date.now() > this.lastColorCacheTime + minTime * Math.random()) ||
            Math.abs(getDaylightStrengthFrameDiff()) > 0.005) {

            this.lastColorCacheTime = Date.now();
            let outColorBase = this.getColorBase();
            let lightingColor = this.processLighting(true);
            this.frameCacheLighting = lightingColor;
            this.outColor = { r: lightingColor.r * outColorBase.r / 255, g: lightingColor.g * outColorBase.g / 255, b: lightingColor.b * outColorBase.b / 255 };
            this.lastColorCacheOpacity = opacityMult;
            this.cachedRgba = rgbToRgba(Math.floor(this.outColor.r), Math.floor(this.outColor.g), Math.floor(this.outColor.b), opacityMult * this.opacity * this.blockHealth ** 0.2);
        }
        MAIN_CONTEXT.fillStyle = this.cachedRgba;
        if (this.blockHealth < 0.5 && this.getMovementSpeed() > 0.5) {
            let size = this.blockHealth;
            if (size < 0.3) {
                size = 20 * (this.blockHealth);
            }
            zoomCanvasFillCircle(
                this.posX * getBaseSize(),
                this.posY * getBaseSize(),
                getBaseSize() * Math.max(this.blockHealth, 0.3));
        } else {
            let size = (this.blockHealth ** 0.5);

            zoomCanvasFillRect(
                this.posX * getBaseSize(),
                (this.posY + (1 - size)) * getBaseSize(),
                getBaseSize() * (size > 0.5 ? 1 : size),
                getBaseSize() * (size)
            );
        }

        if (this.mixIdx >= (getTargetMixIdx() - getMixArrLen())) {
            MAIN_CONTEXT.font = getBaseSize() + "px courier"
            MAIN_CONTEXT.textAlign = 'center';
            MAIN_CONTEXT.textBaseline = 'middle';
            MAIN_CONTEXT.fillStyle = COLOR_BLACK;
            zoomCanvasSquareText(
                (this.posX + 0.5) * getBaseSize(),
                (this.posY + 0.5) * getBaseSize(),
                this.mixIdx % getMixArrLen());
        }
    }
    updatePosition(newPosX, newPosY) {
        if (newPosX == this.posX && newPosY == this.posY) {
            return true;
        }
        if (getSquares(newPosX, newPosY).some((sq) => this.testCollidesWithSquare(sq))) {
            return false;
        }

        if (newPosX < 0 || newPosX >= loadGD(UI_GAME_MAX_CANVAS_SQUARES_X) || newPosY >= loadGD(UI_GAME_MAX_CANVAS_SQUARES_Y)) {
            this.destroy();
            return;
        }

        this.linkedOrganisms.forEach((org) => {
            org.posX = newPosX;
            org.posY = newPosY;
        });

        this.linkedOrganismSquares.forEach((lsq) => {
            lsq.posX = newPosX;
            lsq.posY = newPosY;
        });

        removeSquare(this);
        this.posX = newPosX;
        this.posY = newPosY;
        addSquare(this);

        this.lastColorCacheTime = 0;
        return true;
    }

    renderHistory() {
        if (this.speedX == 0 && this.speedY == 0 && this.renderCountDown == 0)
            return;

        this.renderCountDown = this.posHistoryRetentionLength * 2;
        this.posHistoryMap[(this.posHistoryCur % this.posHistoryRetentionLength)] = [this.posX, this.posY];
        this.posHistoryCur += 1;

        MAIN_CONTEXT.lineWidth = 4 * Math.max(0.5, this.blockHealth);
        MAIN_CONTEXT.beginPath();

        let p = this.posHistoryMap[(this.posHistoryCur - 1 + this.posHistoryRetentionLength) % this.posHistoryRetentionLength];

        let start = transformCanvasSquaresToPixels(p[0] * getBaseSize(), p[1] * getBaseSize());

        // console.log("START: ", p);

        let init = this.posHistoryCur - 1;
        let min = this.posHistoryCur - this.posHistoryRetentionLength;
        let thickEnd = Math.ceil(this.posHistoryCur - (this.posHistoryRetentionLength * 0.05));

        MAIN_CONTEXT.strokeStyle = rgbToRgba(this.outColor.r, this.outColor.g, this.outColor.b, 1)

        MAIN_CONTEXT.moveTo(start[0], start[1]);
        for (let i = init; i >= min; i--) {
            let loc = this.posHistoryMap[i % this.posHistoryRetentionLength];
            if (!isSquareOnCanvas(...loc)) {
                return;
            }
            let p2 = transformCanvasSquaresToPixels(loc[0] * getBaseSize(), loc[1] * getBaseSize());
            MAIN_CONTEXT.lineTo(p2[0], p2[1]);

            if (i == thickEnd) {
                MAIN_CONTEXT.stroke();
                MAIN_CONTEXT.lineTo(p2[0], p2[1]);
                MAIN_CONTEXT.lineWidth = 1 * Math.max(0.5, this.blockHealth);
            }

            // console.log("POINT: ", loc);
        }
        MAIN_CONTEXT.stroke();
        // console.log("END!")

        this.renderCountDown -= 1;
    }

    _percolateGroup(origGroup = null) {
        if (origGroup != null) {
            if (getNeighbors(this.posX, this.posY).some((sq) => sq.group == origGroup)) {
                return false;
            }
        }

        let toVisit = new Set();
        let visited = new Set();

        getNeighbors(this.posX, this.posY)
            .filter((sq) => sq.proto == this.proto)
            .filter((sq) => sq.posY <= this.posY)
            .filter((sq) => !sq.groupSetThisFrame)
            .forEach((sq) => toVisit.add(sq));

        toVisit.forEach((sq) => {
            if (sq == null || sq in visited) {
                return;
            } else {
                sq.updateGroup(this.group);
                visited.add(sq);
                getNeighbors(sq.posX, sq.posY)
                    .filter((ssq) => ssq.proto == sq.proto)
                    .filter((sq) => !sq.solid || sq.posY <= this.posY)
                    .filter((sq) => !sq.groupSetThisFrame)
                    .forEach((ssq) => toVisit.add(ssq));
            }
        });
        return true;
    }

    updateGroup(newGroup) {
        regSquareToGroup(this.group, -1);
        deregisterSquare(this.posX, this.posY, this.group);
        this.group = newGroup;
        this.groupSetThisFrame = true;
        regSquareToGroup(this.group);
        registerSquare(this.posX, this.posY, this.group);
    }

    calculateGroup() {
        if (this.proto == "SoilSquare") {
            return;
        }
        if (this.group != -1) {
            return;
        }
        this.updateGroup(getNextGroupId());
        regSquareToGroup(this.group);
        this._percolateGroup();
        if (this.proto == "RockSquare") {
            setGroupGrounded(this.group)
        }
    }

    percolateInnerMoisture() { }

    getMovementSpeed() {
        return (this.speedX ** 2 + this.speedY ** 2) ** 0.5;
    }
    testCollidesWithSquare(sq) {
        if (!this.collision || !sq.collision) {
            return false;
        }
        if (this.proto == "SeedSquare" && sq.proto == "SeedSquare") {
            return false;
        }
        if (this.proto == "WaterSquare" && sq.proto == "WaterSquare" && (getSquares(this.posX, this.posY).filter((sq) => sq.proto == "WaterSquare").map((sq) => sq.blockHealth).reduce((a, b) => a + b, sq.blockHealth) < 1)) {
            return false;
        }

        // if (this.proto == sq.proto && (this.blockHealth + sq.blockHealth) < 1 && this.getMovementSpeed() > 0.1 && sq.getMovementSpeed() > 0.1) {
        //     return false;
        // }

        if (this.organic) {
            if (!sq.solid) {
                return false;
            }
            if (!sq.surface && sq.collision) {
                return true;
            }
            if (sq.collision && sq.currentPressureDirect > 0 && Math.random() > 0.9) {
                return true;
            }
            return false;
        }
        if (sq.proto === this.proto) {
            return true;
        }
        if (this.solid) {
            if (!sq.solid) {
                if (this.surface) {
                    return !((this.waterContainment == this.waterContainmentMax || this.gravity == 0));
                }
                return true;
            }
            return true;
        }
        if (!this.solid) {
            if (sq.organic) {
                return false;
            }
            if ((!sq.solid) && (!this.hasBonked || !sq.hasBonked || this.speedY > 0 || sq.speedY > 0)) {
                return false;
            }
            if (!sq.collision) {
                return false;
            }
            if (!sq.solid) {
                return true;
            } else {
                if ((sq.surface && (sq.waterContainment == sq.waterContainmentMax || sq.gravity == 0))) {
                    return false;
                }
                return true;
            }
        }
        return true;
    }

    getNutrientRate(proto) {
        if (this.cachedNutrientRateSquares == this.linkedOrganismSquares.length) {
            return this.cachedNutrientRate;
        } else {
            this.cachedNutrientRate = 2 / (this.linkedOrganismSquares
                .filter((lsq) => lsq != null && lsq.linkedOrganism.proto == proto)
                .map((lsq) => 1)
                .reduce((a, b) => a + b, 1));
            this.cachedNutrientRateSquares = this.linkedOrganismSquares.length;
            return this.cachedNutrientRate;
        }
    }

    shouldFallThisFrame() {
        if (!this.physicsEnabled) {
            return false;
        }
        if (this.gravity == 0) {
            return false;
        }
        if (this.proto == "SoilSquare" && (this.linkedOrganismSquares.some((lsq) => lsq.type == "root"))) {
            return false;
        }
        return true;
    }

    getNextPath() {
        let gnpf = (v) => Math.max(1, Math.abs(v));
        let f = gnpf(this.speedX) * gnpf(this.speedY);

        let dsx = this.speedX / f;
        let dsy = this.speedY / f;

        let csx = 0;
        let csy = 0;

        let rcsx = 0;
        let rcsy = 0;

        let last, collSquare;

        let pathArr = new Array();
        pathArr.push([this.posX, this.posY]);

        for (let i = 0; i < f; i++) {
            csx += dsx;
            csy += dsy;

            rcsx = csx + this.posX;
            rcsy = csy + this.posY;

            last = pathArr[pathArr.length - 1];

            if (rcsx == last[0] && rcsy == last[1])
                continue;

            collSquare = getSquares(rcsx, rcsy).find((sq) => sq != this && sq.testCollidesWithSquare(this));

            if (collSquare != null) {
                return [collSquare, pathArr];
            }

            pathArr.push([rcsx, rcsy]);
        }

        return [null, pathArr];
    }

    consumeParticle(incomingSq) {
        let startBlockHeatlh = this.blockHealth;
        this.blockHealth = Math.min(1, this.blockHealth + incomingSq.blockHealth);
        let colSqHeatlhAdded = this.blockHealth - startBlockHeatlh;
        let res = colSqHeatlhAdded == incomingSq.blockHealth;
        incomingSq.blockHealth -= colSqHeatlhAdded;
        return [res, startBlockHeatlh, colSqHeatlhAdded];
    }


    gravityPhysics() {
        if (!this.shouldFallThisFrame()) {
            return;
        }
        // per-tick speed manipulation
        if (getTimeScale() != 0) {
            let sqBelow = getSquares(this.posX, this.posY + 1).find((sq) => sq.testCollidesWithSquare(this));
            if (sqBelow != null && sqBelow.speedX == 0 && sqBelow.speedY == 0) {
                if (Math.random() > .9) {
                    this.speedX = 0;
                    this.speedY = 0;
                }

            } else {
                this.speedY += (1 / (this.gravity / Math.max(.1, this.blockHealth) ** (this.blockHealthGravityCoef)));
            }
        }

        let shouldResetGroup = false;
        if (isGroupGrounded(this.group) && this.currentPressureDirect > 10) {
            if ((Math.random() * 1.5) < 1 - (1 / this.currentPressureDirect) && !getSquares(this.posX, this.posY + 2).some((sq) => sq.testCollidesWithSquare(this))) {
                return;
            }
            shouldResetGroup = true;
        }

        if (this.speedX == 0 && this.speedY == 0)
            return;

        let maxSpeed = 9;
        this.speedX = Math.min(maxSpeed, Math.max(-maxSpeed, this.speedX));
        this.speedY = Math.min(maxSpeed, Math.max(-maxSpeed, this.speedY));

        if (getSquares(this.posX - 1, this.posY).some((sq) => sq.testCollidesWithSquare(this)) && getSquares(this.posX + 1, this.posY).some((sq) => sq.testCollidesWithSquare(this)))
            this.speedX = 0;

        if (Math.abs(this.speedX) < .05)
            this.speedX = 0

        this.speedX += (this.speedX > 0 ? this.speedX * -.1 : this.speedX * .1);
        // end per-tick speed manipulation

        // within-block movement 
        let isWithinSquareX = false;
        let isWithinSquareY = false;
        if (Math.floor(this.posX + this.speedX) == Math.floor(this.posX)) {
            isWithinSquareX = true;
        }
        if (Math.floor(this.posY + this.speedY) == Math.floor(this.posY)) {
            isWithinSquareY = true;
        }
        if (isWithinSquareX && isWithinSquareY) {
            this.updatePosition(this.posX + this.speedX, this.posY + this.speedY);
            return;
        }

        // end case of within-block movement

        // standard movement 

        let nextPathRes = this.getNextPath();

        let colSq = nextPathRes[0];
        let nextPath = nextPathRes[1];

        if (colSq != null) {
            if (this.blockHealth < 1 && colSq.proto == this.proto) {
                let res = colSq.consumeParticle(this);
                if (res == null)
                    return;

                if (res[0]) {
                    this.destroy();
                    return;
                }

                if (res[2] == 0 && nextPath.length == 1) {
                    // error state - overlapping squares that cannot be merged 
                    let amount = colSq.spawnParticle(randNumber(-2, 2), randNumber(-2, 2), randRange(-1, 1), randRange(-1, 1), this.blockHealth);
                    if (amount == this.blockHealth) {
                        colSq.blockHealth += this.blockHealth;
                        this.destroy();
                    }
                }
            }
            this.speedX = colSq.speedX;
            this.speedY = colSq.speedY;
            this.hasBonked = true;

            if (this.getMovementSpeed() == 0) {
                this.posX = Math.floor(this.posX);
                this.posY = Math.floor(this.posY);
            }
        }

        let nextPos = nextPath.at(nextPath.length - 1);

        let finalXPos = nextPos[0];
        let finalYPos = nextPos[1];

        if (finalXPos != this.posX || this.posY != finalYPos) {
            this.updatePosition(finalXPos, finalYPos);

            if (!this.solid) {
                shouldResetGroup = true;
            }

            if (shouldResetGroup) {
                let origGroup = this.group;
                this.group = getNextGroupId();
                if (!this._percolateGroup(origGroup)) {
                    this.group = origGroup;
                };
            }
        }
    }

    slopePhysics() { }

    windPhysics() { }

    compactionPhysics() {
        if (this.speedX != 0 || this.speedY != 0)
            return;
        if (this.blockHealth < 1) {
            let neighbSquare = getSquares(this.posX + randNumber(-1, 1), this.posY - randNumber(1, 2)).find((sq) => sq.proto == this.proto);
            if (neighbSquare != null && this.linkedOrganismSquares.length == 0 && this.linkedOrganismSquares.length == 0) {
                let amount = Math.min(1 - this.blockHealth, neighbSquare.blockHealth);
                this.blockHealth += amount;
                neighbSquare.blockHealth -= amount;
                if (neighbSquare.blockHealth == 0) {
                    neighbSquare.destroy();
                }
            }
        } else {
            if (this.speedX == 0 && this.speedY == 0) {
                this.posX = Math.floor(this.posX);
                this.posY = Math.floor(this.posY);
            }
        }
    }

    physics() {
        if (!isSquareOnCanvas(this.posX, this.posY) || this.blockHealth <= 0) {
            return;
        }

        if (getTimeScale() != 0) {
            this.slopePhysics();
            this.compactionPhysics();
            this.gravityPhysics();
            this.windPhysics();
            this.percolateInnerMoisture();
            if (this.speedY > 0) {
                if (loadGD(UI_SIMULATION_CLOUDS)) {
                    // this.waterEvaporationRoutine();
                    // this.temperatureRoutine();
                }
                if (loadGD(UI_LIGHTING_ENABLED)) {
                    // this.transferHeat();
                    // this.processFrameLightingTemperature();
                }
            }
            if (!isSquareOnCanvas(this.posX + this.speedX, this.posY + this.speedY))
                this.destroy();
        }
    }

    /* Called before physics(), with blocks in strict order from top left to bottom right. */
    physicsBefore() {
        this.calculateGroup();
        this.calculateDirectPressure();
    }

    percolateFromWater(waterBlock) {
        return 0;
    }

    calculateDirectPressure() {
        if (this.gravity == 0) {
            this.currentPressureDirect = 0;
            return this.currentPressureDirect;
        }

        if (
            (!isSqColChanged(this.posX) || this.posY > getSqColChangeLocation(this.posX))
            && Math.random() < 0.95
            && this.currentPressureDirect != -1
        ) {
            return this.currentPressureDirect;
        }
        let filtered = getSquares(this.posX, this.posY - 1)
            .find((sq) => sq.proto == this.proto);
        if (filtered != null) {
            this.currentPressureDirect = filtered.calculateDirectPressure() + 1;
        } else {
            this.currentPressureDirect = 0;
        }
        return this.currentPressureDirect;
    }

    transferHeat() {
        if (Math.random() < 0.75) {
            return;
        }
        getNeighbors(this.posX, this.posY)
            .filter((sq) => sq.collision)
            .forEach((sq) => {
                let diff = this.temperature - sq.temperature;
                diff /= 8;
                this.temperature -= diff / this.thermalMass;
                sq.temperature += diff / sq.thermalMass;
            })
    }

}

