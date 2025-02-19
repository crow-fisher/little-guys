

import { getNeighbors, addSquare, getSquares } from "./_sqOperations.js";
import {
    getNextGroupId
} from "../globals.js";

import { MAIN_CONTEXT } from "../index.js";

import { hexToRgb, rgbToRgba } from "../common.js";

import { getOrganismsAtSquare } from "../organisms/_orgOperations.js";
import { addOrganism } from "../organisms/_orgOperations.js";
import { addOrganismSquare } from "../lifeSquares/_lsOperations.js";

import { removeSquare } from "../globalOperations.js";

import { removeOrganismSquare } from "./_sqOperations.js";
import { removeOrganism } from "../organisms/_orgOperations.js";

import { calculateColorTemperature, getTemperatureAtWindSquare, updateWindSquareTemperature } from "../climate/temperatureHumidity.js";
import { getAdjacentWindSquareToRealSquare, getWindSquareAbove } from "../climate/wind.js";
import { RGB_COLOR_BLUE, RGB_COLOR_RED } from "../colors.js";
import { getCurDay, timeScaleFactor } from "../climate/time.js";
import { processLighting } from "../lighting/lightingProcessing.js";
import { getBaseSize, zoomCanvasFillRect } from "../canvas.js";
import { loadUI, UI_VIEWMODE_LIGHTIHNG, UI_VIEWMODE_MOISTURE, UI_VIEWMODE_NORMAL, UI_VIEWMODE_SELECT, UI_VIEWMODE_SURFACE, UI_VIEWMODE_TEMPERATURE } from "../ui/UIData.js";

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
        this.validPlantHome = false;
        this.group = -1;
        this.organic = false;
        this.collision = true;
        this.visible = true;
        this.darken = true;
        this.special = false;
        this.randoms = [];
        this.linkedOrganism = null;
        this.linkedOrganismSquares = new Array();
        this.lighting = this.getNeighborLightingArr();
        // for ref - values from dirt
        this.opacity = 1;
        this.waterSinkRate = 0.8;
        this.cachedRgba = null;
        this.frameFrozen = false;

        this.distToFront = 0;
        this.distToFrontLastUpdated = -(10 ** 8);

        this.miscBlockPropUpdateInterval = Math.random() * 1000;

        this.surface = false;

        this.temperature = 273;
        
        this.thermalConductivity = 1;  // watts/meter kelvin. max is 10
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
        this.colorCacheHoldTime = 0.10;

        this.blockHealth_color1 = RGB_COLOR_RED;
        this.blockHealth_color2 = RGB_COLOR_BLUE;

        this.lightingSumDay = Math.floor(getCurDay());
        this.lightingSum = {r: 0, g: 0, b: 0}
        this.lightingSumCount = 0;

        this.initTemperature();

    };
    lightFilterRate() {
        return 0.00017;
    }

    initTemperature() {
        var adjacentWindSquare = getAdjacentWindSquareToRealSquare(this.posX, this.posY);

        var x = adjacentWindSquare[0];
        var y = adjacentWindSquare[1];

        if (x < 0 || y < 0) {
            return;
        }
        this.temperature = getTemperatureAtWindSquare(x, y);

        if (this.solid) {
            // hotfix for really annoying cloud bug
            this.temperature += 5;
        }
    }

    getSoilWaterPressure() { return -(10 ** 8); }

    getLightFilterRate() {
        if (this.surface) {
            return this.lightFilterRate() / 1.5;
        } else {
            return this.lightFilterRate();
        }
    }

    temperatureRoutine() {
        if (this.organic) {
            return;
        }
        var adjacentWindSquare = getWindSquareAbove(this.posX, this.posY);

        var x = adjacentWindSquare[0];
        var y = adjacentWindSquare[1];

        if (x < 0 || y < 0) {
            return;
        }

        var adjacentTemp = getTemperatureAtWindSquare(x, y);
        var diff = this.thermalConductivity * ((adjacentTemp - this.temperature));
        diff /= timeScaleFactor();
        diff /= (1 + this.currentPressureDirect);
        this.temperature += diff / this.thermalMass;
        updateWindSquareTemperature(x, y, getTemperatureAtWindSquare(x, y) - diff);
    }

    waterEvaporationRoutine() {
    }


    destroy() {
        removeSquare(this);
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
        this.speedY += 1;
        this.frameFrozen = false;
        
        if (Math.floor(getCurDay() + 0.15) != this.lightingSumDay) {
            if (this.lightingSum == null) {
                this.lightingSum = {r: 0, g: 0, b: 0}
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
        if (!this.visible) {
            return;
        }
        let selectedViewMode = loadUI(UI_VIEWMODE_SELECT);
        if (selectedViewMode == UI_VIEWMODE_NORMAL) {
            this.renderWithVariedColors();
        }
        if (selectedViewMode == UI_VIEWMODE_LIGHTIHNG) {
            this.renderWithVariedColors();
            this.renderLightingView();
        }
        else if (selectedViewMode == UI_VIEWMODE_MOISTURE) {
            this.renderWaterSaturation();
        }
        else if (selectedViewMode.startsWith("organism")) {
            this.renderAsGrey();
        } else if (selectedViewMode == UI_VIEWMODE_SURFACE) {
            this.renderWithVariedColors();
            this.renderSurface();
        }
        else if (selectedViewMode == UI_VIEWMODE_TEMPERATURE) {
            this.renderTemperature();
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
        MAIN_CONTEXT.fillStyle = this.surface ? "rgba(172, 35, 226, 0.25)" : "rgba(30, 172, 58, 0.25)";
        zoomCanvasFillRect(
            (this.offsetX + this.posX) * getBaseSize(),
            (this.offsetY + this.posY) * getBaseSize(),
            getBaseSize(),
            getBaseSize()
        );
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
        this.renderSpecialViewModeLinearOpacity(color1, color2, value, valueMax, 1)
    }

    renderSpecialViewModeLinearOpacity(color1, color2, value, valueMax, opacity) {
        var frac = value / valueMax;
        var outColor = {
            r: color1.r * frac + color2.r * (1 - frac),
            g: color1.g * frac + color2.g * (1 - frac),
            b: color1.b * frac + color2.b * (1 - frac)
        }
        var outRgba = rgbToRgba(Math.floor(outColor.r), Math.floor(outColor.g), Math.floor(outColor.b), opacity);
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
        var t1 = this.randoms;
        this.randoms = otherSquare.randoms;
        otherSquare.randoms = t1;
        this.cachedRgba = null;
        otherSquare.cachedRgba = null;
    }

    getColorBase() {
        return this.color;
    }

    processLighting() {
        let lighting = processLighting(this.lighting);
        this.lightingSum.r += lighting.r; 
        this.lightingSum.g += lighting.g; 
        this.lightingSum.b += lighting.b;
        this.lightingSumCount += 1;
        return lighting;
    }

    renderLightingView() {
        var outRgba = rgbToRgba(
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

    renderWithVariedColors() {
        this.lastColorCacheTime = Date.now();
        var outColorBase = this.getColorBase();
        var outColor = { r: 0, g: 0, b: 0 }
        var lightingColor = this.processLighting(); 
        var outColor = {r: lightingColor.r * outColorBase.r / 255, g: lightingColor.g * outColorBase.g / 255, b: lightingColor.b * outColorBase.b / 255};
        var outRgba = rgbToRgba(Math.floor(outColor.r), Math.floor(outColor.g), Math.floor(outColor.b), this.opacity);
        MAIN_CONTEXT.fillStyle = outRgba;
        zoomCanvasFillRect(
            (this.offsetX + this.posX) * getBaseSize(),
            (this.offsetY + this.posY) * getBaseSize(),
            getBaseSize(),
            getBaseSize()
        );
    }

    getNeighborLightingArr() {
        var ret = getNeighbors(this.posX, this.posY).map((sq) => sq.lighting).find((light) => light != []);
        if (ret != null) {
            return ret;
        } return [];
    }

    updatePosition(newPosX, newPosY) {
        if (newPosX == this.posX && newPosY == this.posY) {
            return true;
        }
        newPosX = Math.floor(newPosX);
        newPosY = Math.floor(newPosY);

        if (getSquares(newPosX, newPosY)
            .some((sq) => this.collision && sq.collision && !sq.surface)) {
            return false;
        }

        if (this.linkedOrganism != null) {
            if (getOrganismsAtSquare(newPosX, newPosY).some((org) => true)) {
                console.log("Found an existing organism at target block; destroying this organism");
                console.log(this.linkedOrganism);
                this.linkedOrganism.destroy()

                return false;
            }
        }

        this.linkedOrganismSquares.forEach((lsq) => {
            removeOrganismSquare(lsq);
            lsq.posX = newPosX;
            lsq.posY = newPosY;
            addOrganismSquare(lsq);
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

        this.initTemperature();
        return true;
    }

    _percolateGroup(group) {
        if (this.group != group) {
            this.group = group;
            var toVisit = new Set();
            var visited = new Set();

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

    gravityPhysics() {
        if (!this.physicsEnabled || this.linkedOrganismSquares.some((sq) => sq.type == "root")) {
            return false;
        }

        if (this.frameFrozen) {
            return;
        }

        if (this.gravity == 0) {
            return;
        }
        var finalXPos = this.posX;
        var finalYPos = this.posY;
        var bonked = false;

        for (let i = 1; i < this.speedY + 1; i += (1 / this.gravity)) {
            for (let j = 0; j < Math.abs(this.speedX) + 1; j++) {
                var jSigned = (this.speedX > 0) ? j : -j;
                var jSignedMinusOne = (this.speedX == 0 ? 0 : (this.speedX > 0) ? (j - 1) : -(j - 1));
                if (getSquares(this.posX + jSigned, this.posY + i)
                    .some((sq) =>
                        (!this.organic && sq.collision) ||
                        this.organic && sq.collision && sq.currentPressureDirect > 0 && Math.random() > 0.9
                    )) {
                    finalYPos = this.posY + (i - 1);
                    finalXPos = this.posX + jSignedMinusOne;
                    this.speedX = 0;
                    this.speedY = 0;
                    bonked = true;
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

        if (finalXPos != this.posX | this.posY != finalYPos) {
            this.updatePosition(finalXPos, finalYPos);
        }
    }

    physics() {
        this.percolateInnerMoisture();
        this.waterEvaporationRoutine();
        this.temperatureRoutine();
        this.transferHeat();
        this.waterSinkPhysics();
        this.gravityPhysics();
    }

    waterSinkPhysics() {
        if (this.gravity == 0) {
            return;
        }
        if (!this.solid) {
            if (Math.random() < 0.9) {
                return;
            }
            getSquares(this.posX + 1, this.posY)
                .filter((sq) => sq.proto == "WaterSquare")
                .forEach((sq) => {
                    if (Math.random() > this.waterSinkRate) {
                        removeSquare(sq);
                        sq.posX -= 1;
                        this.updatePosition(this.posX + 1, this.posY);
                        addSquare(sq);
                    }
                });
            return;
        }
        getSquares(this.posX, this.posY + 1)
            .filter((sq) => sq.proto == "WaterSquare")
            .forEach((sq) => {
                if (Math.random() > this.waterSinkRate) {
                    removeSquare(sq);
                    sq.posY -= 1;
                    this.updatePosition(this.posX, this.posY + 1);
                    addSquare(sq);
                }
            });
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
        if (this.surface) {
            this.currentPressureDirect = 0;
            return 0;
        }
        if (this.currentPressureDirect != -1) {
            return this.currentPressureDirect;
        } else {
            var filtered = getSquares(this.posX, this.posY - 1)
                .filter((sq) => sq.collision);

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
        getNeighbors(this.posX, this.posY)
            .filter((sq) => sq.collision)
            .forEach((sq) => {
                var diff = this.temperature - sq.temperature;
                diff /= timeScaleFactor();
                this.temperature -= diff / this.thermalMass;
                sq.temperature += diff / sq.thermalMass;
            })
    }

    suckWater(rootRequestedWater) {
        if (rootRequestedWater <= 0) {
            return 0;
        }
        var ret = Math.min(rootRequestedWater, this.waterContainment);
        this.waterContainment -= ret;
        return ret;
    }
}

