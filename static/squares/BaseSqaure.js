import {
    dirt_baseColorAmount,
    dirt_darkColorAmount,
    dirt_accentColorAmount,
    b_sq_nutrientValue
} from "../config/config.js";

import { getNeighbors, addSquare, getSquares } from "./_sqOperations.js";
import {
    getNextGroupId
} from "../globals.js";

import { MAIN_CONTEXT, BASE_SIZE, selectedViewMode, getBlockModification_val, zoomCanvasFillRect } from "../index.js";

import { hexToRgb, processLighting, rgbToRgba } from "../common.js";

import { getOrganismsAtSquare } from "../organisms/_orgOperations.js";
import { addOrganism } from "../organisms/_orgOperations.js";
import { addOrganismSquare } from "../lifeSquares/_lsOperations.js";

import { removeSquare } from "../globalOperations.js";

import { removeOrganismSquare } from "./_sqOperations.js";
import { removeOrganism } from "../organisms/_orgOperations.js";

import { addWaterSaturationPascals, calculateColorTemperature, getTemperatureAtWindSquare, getWaterSaturation, pascalsPerWaterSquare, saturationPressureOfWaterVapor, updateSquareTemperature } from "../temperature_humidity.js";
import { getWindSquareAbove } from "../wind.js";

export class BaseSquare {
    constructor(posX, posY) {
        this.proto = "BaseSquare";
        this.posX = Math.floor(posX);
        this.posY = Math.floor(posY);

        this.offsetX = posX % 1;
        this.offsetY = posY % 1;

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
        this.nutrientValue = b_sq_nutrientValue;
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
        this.baseColor = "#7FDDDF";
        this.baseColorAmount = dirt_baseColorAmount;
        this.darkColor = "#29CEB8";
        this.darkColorAmount = dirt_darkColorAmount;
        this.accentColor = "#63E8F7";
        this.accentColorAmount = dirt_accentColorAmount;
        this.opacity = 1;
        this.waterSinkRate = 0.8;
        this.cachedRgba = null;
        this.frameFrozen = false;

        this.distToFront = 0;
        this.distToFrontLastUpdated = -(10 ** 8);

        this.miscBlockPropUpdateInterval = Math.random() * 1000;

        this.surface = false;
        this.lightFilterRate = 0.0004;

        this.temperature = 273 + 20; // start temperature in kelvin 
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
        this.colorCacheHoldTime = 2;
    };

    getSoilWaterPressure() { return -(10 ** 8); }

    getLightFilterRate() {
        if (this.surface) {
            return 0;
        } else {
            return this.lightFilterRate;
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
        var diff = this.thermalConductivity * ((adjacentTemp - this.temperature) / 100);
        this.temperature += diff / this.thermalMass;
        updateSquareTemperature(x, y, getTemperatureAtWindSquare(x, y) - diff);
    }

    waterEvaporationRoutine() {
        if (this.organic) {
            return;
        }

        var adjacentWindSquare = getWindSquareAbove(this.posX, this.posY);

        var x = adjacentWindSquare[0];
        var y = adjacentWindSquare[1];

        if (x < 0 || y < 0) {
            return;
        }

        var waterPascalsAbove = getWaterSaturation(x, y);
        var vaporPressure = saturationPressureOfWaterVapor(this.temperature);

        if (waterPascalsAbove < 0) {
            console.warn("Water pressure above was below zero!")
        }
        if (waterPascalsAbove > vaporPressure) {
            return;
        }

        var diff = vaporPressure - waterPascalsAbove;

        // diff /= 30;

        if (this.solid) {
            var amount = Math.min(this.waterContainment, (diff / pascalsPerWaterSquare));
            this.waterContainment -= amount;
            this.temperature -= amount * pascalsPerWaterSquare * this.water_vaporHeat;
            addWaterSaturationPascals(x, y, amount * pascalsPerWaterSquare);
            // addWindPressure(x * 4, y * 4, amount * pascalsPerWaterSquare);
        } else {
            // evaporating water
            this.blockHealth -= (diff / pascalsPerWaterSquare);
            updateSquareTemperature(x, y, getTemperatureAtWindSquare(x, y) - 0.2 * diff * this.water_vaporHeat);
            addWaterSaturationPascals(x, y, diff);
            // addWindPressure(x * 4, y * 4, diff);

        }

        if (this.temperature < 0) {
            console.warn("This temperature got under 0");
            this.temperature = 5;
        }
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
    }
    render() {
        if (!this.visible) {
            return;
        }
        if (selectedViewMode == "normal") {
            this.renderWithVariedColors();
            if (getBlockModification_val() == "markSurface") {
                this.renderSurface();
            }
        }
        else if (selectedViewMode == "watersaturation") {
            this.renderWaterSaturation();
        }
        else if (selectedViewMode.startsWith("organism")) {
            this.renderAsGrey();
        } else if (selectedViewMode == "surface") {
            this.renderWithVariedColors();
            this.renderSurface();
        }
        else if (selectedViewMode == "blockhealthliquid") {
            if (this.solid) {
                this.renderAsGrey();
            } else {
                this.renderBlockHealth();
            }
        }
        else if (selectedViewMode == "temperature") {
            this.renderTemperature();
        }
    };

    renderTemperature() {
        MAIN_CONTEXT.fillStyle = calculateColorTemperature(this.temperature);
        zoomCanvasFillRect(
            this.posX * BASE_SIZE,
            this.posY * BASE_SIZE,
            BASE_SIZE,
            BASE_SIZE
        );
    }

    renderSurface() {
        MAIN_CONTEXT.fillStyle = this.surface ? "rgba(172, 35, 226, 0.25)" : "rgba(30, 172, 58, 0.25)";
        zoomCanvasFillRect(
            (this.offsetX + this.posX) * BASE_SIZE,
            (this.offsetY + this.posY) * BASE_SIZE,
            BASE_SIZE,
            BASE_SIZE
        );
    }

    renderAsGrey() {
        MAIN_CONTEXT.fillStyle = "rgba(50, 50, 50, 0.2)";
        zoomCanvasFillRect(
            (this.offsetX + this.posX) * BASE_SIZE,
            (this.offsetY + this.posY) * BASE_SIZE,
            BASE_SIZE,
            BASE_SIZE
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
        var color1Rgb = hexToRgb(color1);
        var color2Rgb = hexToRgb(color2);
        var frac = value / valueMax;
        var outColor = {
            r: color1Rgb.r * frac + color2Rgb.r * (1 - frac),
            g: color1Rgb.g * frac + color2Rgb.g * (1 - frac),
            b: color1Rgb.b * frac + color2Rgb.b * (1 - frac)
        }
        var outRgba = rgbToRgba(Math.floor(outColor.r), Math.floor(outColor.g), Math.floor(outColor.b), opacity);
        MAIN_CONTEXT.fillStyle = outRgba;
        zoomCanvasFillRect(
            (this.offsetX + this.posX) * BASE_SIZE,
            (this.offsetY + this.posY) * BASE_SIZE,
            BASE_SIZE,
            BASE_SIZE
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
        var res = this.getStaticRand(1) * (parseFloat(this.accentColorAmount.value) + parseFloat(this.darkColorAmount.value) + parseFloat(this.baseColorAmount.value));
        var primaryColor = null;
        var altColor1 = null;
        var altColor2 = null;

        if (res < parseFloat(this.accentColorAmount.value)) {
            primaryColor = this.accentColor;
            altColor1 = this.darkColor;
            altColor2 = this.baseColor;
        } else if (res < parseFloat(this.accentColorAmount.value) + parseFloat(this.darkColorAmount.value)) {
            primaryColor = this.darkColor;
            altColor1 = this.baseColor;
            altColor2 = this.darkColor;
        } else {
            altColor1 = this.darkColor;
            altColor2 = this.darkColor;
            primaryColor = this.baseColor;
        }

        var rand = this.getStaticRand(2);
        var baseColorRgb = hexToRgb(primaryColor);
        var altColor1Rgb = hexToRgb(altColor1);
        var altColor2Rgb = hexToRgb(altColor2);

        var outColorBase = {
            r: baseColorRgb.r * 0.5 + ((altColor1Rgb.r * rand + altColor2Rgb.r * (1 - rand)) * 0.5),
            g: baseColorRgb.g * 0.5 + ((altColor1Rgb.g * rand + altColor2Rgb.g * (1 - rand)) * 0.5),
            b: baseColorRgb.b * 0.5 + ((altColor1Rgb.b * rand + altColor2Rgb.b * (1 - rand)) * 0.5)
        }
        return outColorBase;
    }

    renderWithVariedColors() {
        if (Date.now() - this.lastColorCacheTime > this.colorCacheHoldTime * 1000) {
            this.lastColorCacheTime = Date.now();
            var outColorBase = this.getColorBase();
            var outColor = { r: 0, g: 0, b: 0 }
            var lightingColor = processLighting(this.lighting);
            var outColor = {r: lightingColor.r * outColorBase.r / 255, g: lightingColor.g * outColorBase.g / 255, b: lightingColor.b * outColorBase.b / 255};
            var outRgba = rgbToRgba(Math.floor(outColor.r), Math.floor(outColor.g), Math.floor(outColor.b), this.opacity);
            this.cachedRgba = outRgba;
        }
        MAIN_CONTEXT.fillStyle = this.cachedRgba;
        zoomCanvasFillRect(
            (this.offsetX + this.posX) * BASE_SIZE,
            (this.offsetY + this.posY) * BASE_SIZE,
            BASE_SIZE,
            BASE_SIZE
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

    physics() {

        // minimum is 33 

        // free
        // soil squares
        this.percolateInnerMoisture();
        // 51 ms
        this.waterEvaporationRoutine();
        this.transferHeat();

        // 62ms 
        if (!this.physicsEnabled || this.linkedOrganismSquares.some((sq) => sq.type == "root")) {
            return false;
        }

        if (this.frameFrozen) {
            return;
        }

        this.waterSinkPhysics();
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
                        (this.organic && this.spawnedEntityId == sq.spawnedEntityId) ||
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

        return true;
    }

    waterSinkPhysics() {
        if (this.gravity == 0) {
            return;
        }
        if (!this.solid) {
            if (Math.random() < 0.9) {
                return;
            }
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
        this.temperatureRoutine();
        this.calculateDirectPressure();
    }

    percolateFromWater(waterBlock) {
        return 0;
    }

    calculateDirectPressure() {
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
        if (isNaN(this.currentPressureDirect)) {
            console.warn("poopie woopie");
        }
        return this.currentPressureDirect;
    }

    transferHeat() {
        getNeighbors(this.posX, this.posY)
            .filter((sq) => sq.collision)
            .forEach((sq) => {
                var diff = this.temperature - sq.temperature;
                var diffSmall = diff / 10;
                this.temperature -= diffSmall / this.thermalMass;
                sq.temperature += diffSmall / sq.thermalMass;
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

