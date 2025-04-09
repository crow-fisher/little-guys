

import { getNeighbors, addSquare, getSquares } from "./_sqOperations.js";
import {
    getNextGroupId,
    getMixArrLen,
    getTargetMixIdx
} from "../globals.js";

import { MAIN_CONTEXT } from "../index.js";

import { hexToRgb, hsv2rgb, randRange, rgb2hsv, rgbToRgba } from "../common.js";

import { getOrganismsAtSquare } from "../organisms/_orgOperations.js";
import { addOrganism } from "../organisms/_orgOperations.js";
import { addOrganismSquare } from "../lifeSquares/_lsOperations.js";

import { removeSquare } from "../globalOperations.js";

import { removeOrganism } from "../organisms/_orgOperations.js";

import { calculateColorTemperature, getRestingTemperatureAtSq, getTemperatureAtWindSquare, temperatureHumidityFlowrateFactor, updateWindSquareTemperature } from "../climate/temperatureHumidity.js";
import { getAdjacentWindSquareToRealSquare, getWindSquareAbove } from "../climate/wind.js";
import { COLOR_GREEN, RGB_COLOR_BLUE, RGB_COLOR_GREEN, RGB_COLOR_RED, RGB_COLOR_VERY_FUCKING_RED } from "../colors.js";
import { getCurDay, getCurrentLightColorTemperature, getDaylightStrengthFrameDiff, getTimeScale, timeScaleFactor } from "../climate/time.js";
import { applyLightingFromSource, getDefaultLighting, processLighting } from "../lighting/lightingProcessing.js";
import { getBaseSize, getCanvasSquaresX, getCanvasSquaresY, zoomCanvasFillCircle, zoomCanvasFillRect, zoomCanvasSquareText } from "../canvas.js";
import { loadGD, UI_PALETTE_ACTIVE, UI_PALETTE_SELECT, UI_PALETTE_SURFACE, UI_LIGHTING_ENABLED, UI_VIEWMODE_LIGHTIHNG, UI_VIEWMODE_MOISTURE, UI_VIEWMODE_NORMAL, UI_VIEWMODE_SELECT, UI_VIEWMODE_SURFACE, UI_VIEWMODE_TEMPERATURE, UI_VIEWMODE_ORGANISMS, UI_LIGHTING_WATER_OPACITY, UI_LIGHTING_WATER_VALUE, UI_LIGHTING_WATER_SATURATION, UI_LIGHTING_WATER_HUE, UI_LIGHTING_SUN, UI_VIEWMODE_WIND, UI_PALETTE_SURFACE_OFF } from "../ui/UIData.js";
import { isLeftMouseClicked } from "../mouse.js";

export class BaseSquare {
    constructor(posX, posY) {
        this.proto = "BaseSquare";
        this.posX = Math.floor(posX);
        this.posY = Math.floor(posY);

        this.offsetX = posX % 1;
        this.offsetY = posY % 1;

        this.color = hexToRgb("#00FFFF");

        this.solid = true;
        this.spawnedEntityId = 0;
        // block properties - overridden by block type
        this.physicsEnabled = true;
        this.gravity = 1;
        this.blockHealthMax = 1;
        this.blockHealth = this.blockHealthMax; // when reaches zero, delete
        // water flow parameters

        this.currentPressureDirect = -1;

        this.waterContainment = 0;
        this.waterContainmentMax = 0.5;
        this.speedX = 0;
        this.speedY = 0;
        this.rootable = false;
        this.group = -1;
        this.organic = false;
        this.collision = true;
        this.visible = true;
        this.darken = true;
        this.special = false;
        this.randoms = [];
        this.linkedOrganism = null;
        this.linkedOrganismSquares = new Array();
        this.lighting = new Array();
        this.spawnTime = Date.now();

        // for ref - values from dirt
        this.opacity = 1;
        this.cachedRgba = null;

        this.distToFront = 0;
        this.distToFrontLastUpdated = -(10 ** 8);

        this.miscBlockPropUpdateInterval = Math.random() * 1000;

        this.surface = false;

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

        this.lightingSumDay = Math.floor(getCurDay());
        this.lightingSum = { r: 0, g: 0, b: 0 }
        this.lightingSumCount = 0;

        this.surfaceLightingFactor = 0.1;

        this.mixIdx = -1;
        this.initTemperature();

        this.frameLighting = {r: 0, g: 0, b: 0};

        this.activeParticles = new Array();
    };

    initLightingFromNeighbors() {
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
        diff /= (1 + this.currentPressureDirect);
        this.temperature += diff;
        updateWindSquareTemperature(x, y, getTemperatureAtWindSquare(x, y) - (diff / 4));
    }

    waterEvaporationRoutine() {
    }

    destroy(deep = false) {
        if (deep && this.linkedOrganism != null) {
            this.linkedOrganism.destroy();
        }
        removeSquare(this);
        this.lighting = [];
    }
    linkOrganism(organism) {
        this.linkedOrganism = organism;
    }
    unlinkOrganism() {
        this.linkedOrganism = null;
    }
    linkOrganismSquare(organismSquare) {
        if (organismSquare in this.linkedOrganismSquares) {
            console.warn("Trying to link an organismSquare that it's already been attached to...odd state.");
        }
        this.linkedOrganismSquares.push(organismSquare);
    }
    unlinkOrganismSquare(organismSquare) {
        this.linkedOrganismSquares = Array.from(this.linkedOrganismSquares.filter((lsq) => lsq != organismSquare));
    }
    reset() {
        if (this.blockHealth <= 0) {
            removeSquare(this);
        }
        this.currentPressureDirect = -1;
        this.group = -1;
        this.speedY += (1 / this.gravity);
        if (Math.floor(getCurDay() + 0.15) != this.lightingSumDay) {
            if (this.lightingSum == null) {
                this.lightingSum = { r: 0, g: 0, b: 0 }
                this.lightingSumCount = 0;
            }
            let decayFactor = 3;

            this.lightingSum.r /= decayFactor;
            this.lightingSum.g /= decayFactor;
            this.lightingSum.b /= decayFactor;
            this.lightingSumCount /= decayFactor;
            this.lightingSumDay = Math.floor(getCurDay());
        }
    }
    render() {
        if (!this.visible || this.posY >= getCanvasSquaresY()) {
            return;
        }
        let selectedViewMode = loadGD(UI_VIEWMODE_SELECT);
        if (selectedViewMode == UI_VIEWMODE_NORMAL) {
            this.renderWithVariedColors(1);
        }
        else if (selectedViewMode == UI_VIEWMODE_ORGANISMS) {
            this.renderWithVariedColors(0.35);

        }
        if (selectedViewMode == UI_VIEWMODE_LIGHTIHNG) {
            this.renderWithVariedColors(1);
            this.renderLightingView();
        }
        else if (selectedViewMode == UI_VIEWMODE_MOISTURE) {
            this.renderWaterSaturation();
        } else if (selectedViewMode == UI_VIEWMODE_SURFACE || (loadGD(UI_PALETTE_ACTIVE) && (loadGD(UI_PALETTE_SELECT) == UI_PALETTE_SURFACE || loadGD(UI_PALETTE_SELECT) == UI_PALETTE_SURFACE_OFF))) {
            if (this.solid) {
                this.renderWithVariedColors(1);
                this.renderSurface();
            } else {
                this.renderWithVariedColors(0.25);
            }
        }
        else if (selectedViewMode == UI_VIEWMODE_TEMPERATURE) {
            this.renderTemperature();
        } else if (selectedViewMode == UI_VIEWMODE_WIND) {
            this.renderWithVariedColors(0.25);
        }
    };

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
        // MAIN_CONTEXT.fillStyle = this.surface ? "rgba(172, 35, 226, 0.12)" : "rgba(30, 172, 58, 0.12)";
        if (!this.surface) {
            MAIN_CONTEXT.fillStyle = "rgba(90, 71, 97, 0.3)"
            zoomCanvasFillRect(
                (this.offsetX + this.posX) * getBaseSize(),
                (this.offsetY + this.posY) * getBaseSize(),
                getBaseSize(),
                getBaseSize()
            );
        } else {
            this.renderSpecialViewModeLinearOpacity(RGB_COLOR_VERY_FUCKING_RED, RGB_COLOR_GREEN, this.surfaceLightingFactor, 1, 0.3);   
        }

    }

    renderAsGrey() {
        MAIN_CONTEXT.fillStyle = "rgba(50, 50, 50, 0.2)";
        zoomCanvasFillRect(
            (this.offsetX + this.posX) * getBaseSize(),
            (this.offsetY + this.posY) * getBaseSize(),
            getBaseSize(),
            getBaseSize()
        );
    }

    renderBlockHealth() {
        this.renderSpecialViewModeLinear(this.waterSaturation_color1, this.waterSaturation_color2, this.blockHealth, this.blockHealthMax);
    }

    renderWaterSaturation() {
        this.renderSpecialViewModeLinear(this.blockHealth_color1, this.blockHealth_color2, this.waterContainment, this.waterContainmentMax);
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
            (this.offsetX + this.posX) * getBaseSize(),
            (this.offsetY + this.posY) * getBaseSize(),
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

    swapColors(otherSquare) {
        let t1 = this.randoms;
        this.randoms = otherSquare.randoms;
        otherSquare.randoms = t1;
        this.cachedRgba = null;
        otherSquare.cachedRgba = null;
    }

    getColorBase() {
        return this.color;
    }

    processLighting() {
        if (this.frameCacheLighting != null) {
            return this.frameCacheLighting;
        }
        // console.log(335);

        if (!loadGD(UI_LIGHTING_ENABLED)) {
            this.frameCacheLighting = getDefaultLighting();
            return this.frameCacheLighting;
        }

        if (this.lighting.length == 0) {
            this.initLightingFromNeighbors();
        }
        this.frameCacheLighting = processLighting(this.lighting);
        this.lightingSum.r += this.frameCacheLighting.r;
        this.lightingSum.g += this.frameCacheLighting.g;
        this.lightingSum.b += this.frameCacheLighting.b;
        this.lightingSumCount += 1;
        return this.frameCacheLighting;
    }

    renderLightingView() {
        let outRgba = rgbToRgba(
            Math.floor(this.lightingSum.r / this.lightingSumCount),
            Math.floor(this.lightingSum.g / this.lightingSumCount),
            Math.floor(this.lightingSum.b / this.lightingSumCount),
            0.8);
        MAIN_CONTEXT.fillStyle = outRgba;
        zoomCanvasFillRect(
            (this.offsetX + this.posX) * getBaseSize(),
            (this.offsetY + this.posY) * getBaseSize(),
            getBaseSize(),
            getBaseSize()
        );
    }

    triggerParticles(bonkSpeed) {
    }

    processParticles() {
        let next = new Array();
        this.activeParticles.forEach((partArr) => {
            partArr[0] += partArr[3]; // px
            partArr[1] += partArr[4]; // py
            partArr[4] += 0.15;
            partArr[3] *= 0.99;

            let x = Math.round(partArr[0]);
            let y = Math.round(partArr[1]);
            if (x < 0 || y < 0 || x >= getCanvasSquaresX() || y >= getCanvasSquaresY() || getSquares(x, y).length > 0) {
                return;
            } else {
                next.push(partArr);
            }
        });
        this.activeParticles = next;
    }

    renderParticles() {
        MAIN_CONTEXT.fillStyle = this.cachedRgba;
        this.activeParticles.forEach((partArr) => {
            let px = partArr[0];
            let py = partArr[1];
            let size = partArr[5];
            zoomCanvasFillCircle(px * getBaseSize(), py * getBaseSize(), size)
        });
    }

    renderWithVariedColors(opacityMult) {
        if (this.proto == "WaterSquare") {
            this.opacity = loadGD(UI_LIGHTING_WATER_OPACITY);
        }
        if (
            (opacityMult != this.lastColorCacheOpacity) ||
            (Date.now() > this.lastColorCacheTime + (isLeftMouseClicked() ? 5000 : 10000) * Math.random()) ||
            Math.abs(getDaylightStrengthFrameDiff()) > 0.005) {
            this.lastColorCacheTime = Date.now();
            let outColorBase = this.getColorBase();

            this.frameCacheLighting = null;
            let lightingColor = this.processLighting();
            
            let outColor = { r: lightingColor.r * outColorBase.r / 255, g: lightingColor.g * outColorBase.g / 255, b: lightingColor.b * outColorBase.b / 255 };
            this.lastColorCacheOpacity = opacityMult;
            this.cachedRgba = rgbToRgba(Math.floor(outColor.r), Math.floor(outColor.g), Math.floor(outColor.b), opacityMult * this.opacity * (this.blockHealth ** 0.2));
            this.cachedRgbaParticle = rgbToRgba(Math.floor(outColor.r), Math.floor(outColor.g), Math.floor(outColor.b), .5 * (opacityMult * this.opacity * (this.blockHealth ** 0.2)));
        }
        MAIN_CONTEXT.fillStyle = this.cachedRgba;
        zoomCanvasFillRect(
            (this.offsetX + this.posX) * getBaseSize(),
            (this.offsetY + this.posY) * getBaseSize(),
            getBaseSize(),
            getBaseSize()
        );
        if (this.mixIdx >= (getTargetMixIdx() - getMixArrLen())) {
            MAIN_CONTEXT.font = getBaseSize() + "px courier"
            MAIN_CONTEXT.textAlign = 'center';
            MAIN_CONTEXT.textBaseline = 'middle';
            zoomCanvasSquareText(((this.offsetX + this.posX) + 0.5) * getBaseSize(),
                ((this.offsetY + this.posY) + 0.5) * getBaseSize(),
                this.mixIdx % getMixArrLen());
        }
        this.renderParticles();
    }
    updatePosition(newPosX, newPosY) {
        if (newPosX == this.posX && newPosY == this.posY) {
            return true;
        }
        newPosX = Math.floor(newPosX);
        newPosY = Math.floor(newPosY);

        if (getSquares(newPosX, newPosY).some((sq) => this.testCollidesWithSquare(sq))) {
            return false;
        }

        if (this.linkedOrganism != null) {
            if (getOrganismsAtSquare(newPosX, newPosY).some((org) => true)) {
                this.linkedOrganism.destroy()
                return false;
            }
        }

        this.linkedOrganismSquares.forEach((lsq) => {
            if (lsq != null && lsq.posX != null) {
                lsq.posX = newPosX;
                lsq.posY = newPosY;
            }
        })

        if (this.linkedOrganism != null) {
            removeOrganism(this.linkedOrganism);
            this.linkedOrganism.posX = newPosX;
            this.linkedOrganism.posY = newPosY;
            addOrganism(this.linkedOrganism);
        }

        removeSquare(this);
        this.posX = newPosX;
        this.posY = newPosY;
        addSquare(this);

        return true;
    }

    _percolateGroup(group) {
        if (this.group != group) {
            this.group = group;
            let toVisit = new Set();
            let visited = new Set();

            getNeighbors(this.posX, this.posY)
                .filter((sq) => sq.proto == this.proto)
                .forEach((sq) => toVisit.add(sq));

            toVisit.forEach((sq) => {
                if (sq == null || sq in visited) {
                    return;
                } else {
                    sq.group = this.group;
                    visited.add(sq);
                    getNeighbors(sq.posX, sq.posY)
                        .filter((ssq) => ssq.proto == sq.proto)
                        .forEach((ssq) => toVisit.add(ssq));
                }
            })

        }
    }

    calculateGroup() {
        if (this.proto != "WaterSquare") {
            return;
        }
        if (this.group != -1) {
            return;
        }
        this.group = getNextGroupId();
        this._percolateGroup(getNextGroupId())
    }

    percolateInnerMoisture() { }

    testCollidesWithSquare(sq) {
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

    gravityPhysics() {
        if (!this.physicsEnabled) {
            return false;
        }
        if (this.gravity == 0) {
            return;
        }
        let finalXPos = this.posX;
        let finalYPos = this.posY;
        let bonked = false;
        let particleSpeed = Math.sqrt(this.speedX ** 2 + this.speedY ** 2);
        for (let i = 1; i < this.speedY + 1; i += (1 / this.gravity)) {
            for (let j = 0; j < Math.abs(this.speedX) + 1; j++) {
                let jSigned = (this.speedX > 0) ? j : -j;
                let jSignedMinusOne = (this.speedX == 0 ? 0 : (this.speedX > 0) ? (j - 1) : -(j - 1));
                if (getSquares(this.posX + jSigned, this.posY + i)
                    .some((sq) => this.testCollidesWithSquare(sq))) {
                    finalYPos = this.posY + (i - 1);
                    finalXPos = this.posX + jSignedMinusOne;
                    this.speedX = 0;
                    this.speedY = 0;
                    this.offsetY = 0;
                    bonked = true;
                    if (this.lighting.length == 0 && loadGD(UI_LIGHTING_ENABLED)) {
                        this.initLightingFromNeighbors();
                    }
                    if (!this.solid) {
                        if (getSquares(this.posX + jSigned, this.posY + i)
                            .filter((sq) => sq.proto == this.proto)
                            .filter((sq) => sq.blockHealth + this.blockHealth < sq.blockHealthMax)
                            .some((sq) => {
                                sq.blockHealth = sq.blockHealth + this.blockHealth;
                                this.destroy();
                                return true;
                            })) {
                            return;
                        }
                    }
                }
                if (bonked)
                    break;
            } if (bonked)
                break;
        }
        if (!bonked) {
            finalXPos = this.posX + this.speedX;
            finalYPos = this.posY + this.speedY;
        }

        if (finalXPos < 0 || finalXPos > getCanvasSquaresX() || finalYPos < 0 || finalYPos >= getCanvasSquaresY()) {
            this.destroy(true);
            return;
        }

        if (finalXPos != this.posX | this.posY != finalYPos) {
            let finalYPosFloor = Math.floor(finalYPos);
            let finalYPosFrac = finalYPos - finalYPosFloor;
            this.offsetY = finalYPosFrac;
            this.updatePosition(finalXPos, finalYPosFloor);

            if (bonked) {
                this.triggerParticles(particleSpeed);
            }
        }
        this.processParticles();
    }

    slopePhysics() {
        return;
    }

    physics() {
        if (getTimeScale() != 0) {
            this.gravityPhysics();
            this.slopePhysics();
            this.percolateInnerMoisture();
            this.waterEvaporationRoutine();
            this.temperatureRoutine();
            this.transferHeat();
            this.processParticles();
            this.processFrameLightingTemperature();
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
        if (this.currentPressureDirect != -1) {
            return this.currentPressureDirect;
        } else {
            let filtered = getSquares(this.posX, this.posY - 1)
                .filter((sq) => sq.collision && sq.gravity > 0)

            if (filtered.some((sq) => true)) {
                this.currentPressureDirect = filtered
                    .map((sq) => 1 + sq.calculateDirectPressure())
                    .reduce(
                        (accumulator, currentValue) => accumulator + currentValue,
                        0,
                    );
            } else {
                this.currentPressureDirect = 0;
            }
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

