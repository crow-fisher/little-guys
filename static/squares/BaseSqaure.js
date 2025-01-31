import {
    dirt_baseColorAmount,
    dirt_darkColorAmount,
    dirt_accentColorAmount,
    b_sq_nutrientValue,
    base_waterContainmentTransferRate,
    base_waterContainmentEvaporationRate,
    b_sq_darkeningStrength,
} from "../config/config.js"

import { getNeighbors, getDirectNeighbors, addSquare, addSquareOverride, getSquares, getCollidableSquareAtLocation, iterateOnSquares } from "./_sqOperations.js"
import {
    ALL_SQUARES, ALL_ORGANISMS, ALL_ORGANISM_SQUARES, stats, WATERFLOW_TARGET_SQUARES, WATERFLOW_CANDIDATE_SQUARES, darkeningColorCache,
    getNextGroupId, updateGlobalStatistic, getGlobalStatistic
} from "../globals.js";

import { MAIN_CANVAS, MAIN_CONTEXT, CANVAS_SQUARES_X, CANVAS_SQUARES_Y, BASE_SIZE, selectedViewMode, getBlockModification_val, zoomCanvasFillRect } from "../index.js";

import { hexToRgb, processColorStdev, processColorStdevMulticolor, rgbToHex, rgbToRgba } from "../common.js";

import { getCountOfOrganismsSquaresOfTypeAtPosition } from "../lifeSquares/_lsOperations.js";
import { getOrganismSquaresAtSquare } from "../lifeSquares/_lsOperations.js";
import { getOrganismsAtSquare } from "../organisms/_orgOperations.js";
import { removeItemAll } from "../common.js";
import { getObjectArrFromMap } from "../common.js";
import { addOrganism, addNewOrganism } from "../organisms/_orgOperations.js";
import { addOrganismSquare } from "../lifeSquares/_lsOperations.js";

import { purge, reset, physics, physicsBefore, processOrganisms, renderOrganisms, doWaterFlow, removeSquare, getSquareStdevForGetter } from "../globalOperations.js"

import { removeOrganismSquare } from "./_sqOperations.js";
import { removeOrganism } from "../organisms/_orgOperations.js";

import { addSquareByName } from "../index.js";
import { getCurTime, getDaylightStrength } from "../time.js";
import { addTemperature, addWaterSaturation, addWaterSaturationPascals, applySquareTemperatureDelta, calculateColorTemperature, cloudRainThresh, getTemperatureAtSquare, getTemperatureAtWindSquare, getWaterSaturation, pascalsPerWaterSquare, saturationPressureOfWaterVapor, updateSquareTemperature } from "../temperature_humidity.js";
import { addWindPressure, getWindSquareAbove } from "../wind.js";

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
        this.waterContainment = 0;
        this.waterContainmentMax = 0.5;
        this.waterContainmentTransferRate = base_waterContainmentTransferRate;
        this.waterContainmentEvaporationRate = base_waterContainmentEvaporationRate;
        this.speedX = 0;
        this.speedY = 0;
        this.nutrientValue = b_sq_nutrientValue;
        this.rootable = false;
        this.validPlantHome = false;
        this.group = -1;
        this.calculateGroupFlag = false;
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
        this.baseColor = "#9A8873";
        this.baseColorAmount = dirt_baseColorAmount;
        this.darkColor = "#46351D";
        this.darkColorAmount = dirt_darkColorAmount;
        this.accentColor = "#246A73";
        this.accentColorAmount = dirt_accentColorAmount;
        this.opacity = 1;
        this.waterSinkRate = 0.8;
        this.cachedRgba = null;
        this.frameFrozen = false;

        // for special view modes
        this.waterSaturation_color1 = "#103783";
        this.waterSaturation_color2 = "#9bafd9";

        this.blockHealth_color1 = "#45caff";
        this.blockHealth_color2 = "#ff1b6b";

        this.currentPressureDirect = 0;
        this.blockModDarkenVal = 0;
        this.distToFront = 0;
        this.distToFrontLastUpdated = -(10 ** 8);

        this.miscBlockPropUpdateInterval = Math.random() * 1000;

        this.surface = false;
        this.lightFilterRate = 0.0005;

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
    };

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

    renderWithVariedColors() {
        if (this.cachedRgba != null) {
            MAIN_CONTEXT.fillStyle = this.cachedRgba;
        } else {
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
            
            var outColor = {r: 0, g: 0, b: 0}
            this.lighting.filter((light) => light != null && light.length == 2).forEach((light) => {
                var strength = light[0].map((f) => f()).reduce(
                    (accumulator, currentValue) => accumulator + currentValue,
                    0,
                );
                var color = light[1];
                outColor = {
                    r: Math.min(255, outColor.r + (outColorBase.r / 255) * strength * color.r),
                    g: Math.min(255, outColor.g + (outColorBase.g / 255) * strength * color.g),
                    b: Math.min(255, outColor.b + (outColorBase.b / 255) * strength * color.b)
                }
            });

            var outRgba = rgbToRgba(Math.floor(outColor.r), Math.floor(outColor.g), Math.floor(outColor.b), this.opacity);
            this.cachedRgba = outRgba;
            // var outHex = rgbToHex(Math.floor(outColor.r), Math.floor(outColor.g), Math.floor(outColor.b));
            MAIN_CONTEXT.fillStyle = outRgba;
        }

        zoomCanvasFillRect(
            (this.offsetX + this.posX) * BASE_SIZE,
            (this.offsetY + this.posY) * BASE_SIZE,
            BASE_SIZE,
            BASE_SIZE
        );
        if (this.solid) {
            this.waterContainmentDarken();
        }
        this.blockPressureAndModDarken();
        this.distToFrontBlockModDarken();
    }
    waterContainmentDarken() {
        MAIN_CONTEXT.fillStyle = this.calculateDarkeningColorImpl(this.waterContainment, this.waterContainmentMax);
        zoomCanvasFillRect(
            (this.offsetX + this.posX) * BASE_SIZE,
            (this.offsetY + this.posY) * BASE_SIZE,
            BASE_SIZE,
            BASE_SIZE
        );
    }

    blockPressureAndModDarken() {
        var pressureMax = 12;
        var pressureMod = (this.blockModDarkenVal != null ? this.blockModDarkenVal : 0) * pressureMax;
        MAIN_CONTEXT.fillStyle = this.calculateDarkeningColorImpl((12 - 10 * getDaylightStrength()) + this.currentPressureDirect + pressureMod, 12);
        zoomCanvasFillRect(
            (this.offsetX + this.posX) * BASE_SIZE,
            (this.offsetY + this.posY) * BASE_SIZE,
            BASE_SIZE,
            BASE_SIZE
        );
    }

    distToFrontBlockModDarken() {
        if (!this.surface) {
            return;
        }
        MAIN_CONTEXT.fillStyle = this.calculateDarkeningColorImpl(this.distToFront, 8);
        zoomCanvasFillRect(
            (this.offsetX + this.posX) * BASE_SIZE,
            (this.offsetY + this.posY) * BASE_SIZE,
            BASE_SIZE,
            BASE_SIZE
        );
    }

    calculateDarkeningColorImpl(darkVal, darkValMax) {
        if (darkVal == 0) {
            return "rgba(67,58,63, 0)";
        }
        var waterColor255 = Math.floor((darkVal / darkValMax) * 255) * this.opacity;
        if (waterColor255 in darkeningColorCache) {
            return darkeningColorCache[waterColor255];
        }
        var darkeningStrength = (darkVal / darkValMax) * b_sq_darkeningStrength.value;
        var res = "rgba(67,58,63," + darkeningStrength + ")";

        darkeningColorCache[waterColor255] = res;

        return res;
    }

    getNeighborLightingArr() {
        var ret = getDirectNeighbors(this.posX, this.posY).map((sq) => sq.lighting).find((light) => light != []);
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

        this.lighting = this.getNeighborLightingArr();

        // this.calculateGroup();
        return true;
    }

    calculateGroup() {
        if (this.group != -1) {
            return;
        }
        if (!this.calculateGroupFlag) {
            return;
        }
        var visited = new Set();
        var groupNeighbors = new Set(getDirectNeighbors(this.posX, this.posY).filter((sq) => this.proto == sq.proto));
        groupNeighbors.add(this);
        while (true) {
            var startGroupNeighborsSize = groupNeighbors.size;
            groupNeighbors.forEach((neighbor) => {
                if (neighbor in visited) {
                    return;
                }
                getDirectNeighbors(neighbor.posX, neighbor.posY).filter((sq) => this.proto == sq.proto)
                    .forEach((neighborGroupNeighbor) => groupNeighbors.add(neighborGroupNeighbor));

                visited.add(neighbor);
            })
            var endGroupNeighborsSize = groupNeighbors.size;
            if (startGroupNeighborsSize == endGroupNeighborsSize) {
                break;
            }
        }

        var group = Array.from(groupNeighbors).map((x) => x.group).find((x) => x != -1);
        if (group != null) {
            // then we have already set this group, somehow
            // probably some physics shenanigans
            groupNeighbors.forEach((x) => x.group = group);
            this.group = group;
            return;
        }

        var nextGroupId = getNextGroupId();
        groupNeighbors.forEach((x) => x.group = nextGroupId);

    }

    physics() {
        this.calculateDirectPressure();
        this.calculateDistToFront();
        this.percolateInnerMoisture();
        this.waterEvaporationRoutine();
        this.transferHeat();

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
        this.temperatureRoutine();
        this.calculateGroup();
    }

    /* god i fucking hate water physics */
    physicsBefore2() { }

    percolateFromWater(waterBlock) {
        if (this.waterContainmentMax == 0 || this.waterContainment >= this.waterContainmentMax) {
            return 0;
        }
        var heightDiff = this.posY - waterBlock.posY; // bigger number == lower, so if this is negative we are percolating up
        var maxAmountToPercolateFromBlock = 0;
        var amountToPercolate = 0;
        if (heightDiff > 0) {
            maxAmountToPercolateFromBlock = Math.min(this.waterContainmentMax - this.waterContainment, this.waterContainmentTransferRate.value);
            amountToPercolate = Math.min(maxAmountToPercolateFromBlock, waterBlock.blockHealth);
            this.waterContainment += amountToPercolate;
            // flowing down
            return amountToPercolate;
        } else if (heightDiff == 0) {
            maxAmountToPercolateFromBlock = Math.min(this.waterContainmentMax - this.waterContainment, this.waterContainmentTransferRate.value);
            amountToPercolate = Math.min(maxAmountToPercolateFromBlock, waterBlock.blockHealth);
            this.waterContainment += amountToPercolate;
            return amountToPercolate;
        } else {
            // flowing up
            // nvm
            return 0;
        }
    }

    percolateFromBlock(otherBlock) {
        var heightDiff = this.posY - otherBlock.posY; // bigger number == lower, so if this is negative we are percolating up
        // water only flows from wet to dry
        if (moistureDiff > 0 || this.waterContainment >= this.waterContainmentMax) {
            return 0;
        }

        /* 

        percolation goals: 
            * water should flow downwards, decaying by 20%
                * eg., if water is added above some blocks with max water containment 1, 
                * 
                * ...
                * 0.49
                * 0.7
                * 1
            * if water is flowing to the side, tend towards equalization
            * if water is flowing up, aim for a lower fraction similar to above (eg, mult of 0.5)
        */


        var targetWaterDiff = 0.5; // value between 0 and 1. 
        // if 0.5, try to balance water equally between this and otherBlock.
        // if 0, put all water into this. 
        // if 1, put all water into otherBlock.  

        if (heightDiff > 0) {
            targetWaterDiff = 0.45;
        }
        else if (heightDiff < 0) {
            targetWaterDiff = 0.55;
        }

        var moistureDiff = ((otherBlock.waterContainment * (1 - targetWaterDiff)) - (this.waterContainment * targetWaterDiff)) / 2;
        if (moistureDiff < 0) {
            return 0;
        }
        var maxAmountToPercolateFromBlock = Math.min(this.waterContainmentMax - this.waterContainment, Math.min(this.waterContainmentTransferRate.value, otherBlock.waterContainmentTransferRate.value));

        var amountToPercolate = Math.min(moistureDiff, maxAmountToPercolateFromBlock);
        this.waterContainment += amountToPercolate;
        return amountToPercolate;

    }

    calculateDirectPressure() {
        this.currentPressureDirect = 0;
        if (this.surface) {
            return;
        }
        if (this.organic) {
            if (this.linkedOrganismSquares.some((sq) => sq.type == "green" && sq.subtype == "leaf")) {
                this.linkedOrganismSquares
                    .filter((lsq) => lsq.type == "green" && lsq.subtype == "leaf")
                    .forEach((lsq) => this.currentPressureDirect = lsq.parentLifeSquare.linkedSquare.currentPressureDirect);
                return;
            }
        }
        getSquares(this.posX, this.posY - 1)
            .filter((sq) => sq.solid)
            .forEach((sq) => this.currentPressureDirect = Math.max(this.currentPressureDirect,
                sq.currentPressureDirect + (sq.organic ? 0.55 : 1)));
    }

    calculateDistToFront() {
        if (!this.surface) {
            return 0;
        }

        if (getCurTime() < this.distToFrontLastUpdated + this.miscBlockPropUpdateInterval) {
            return this.distToFront;
        }

        this.distToFrontLastUpdated = getCurTime();
        this.distToFront = 0 + Math.max(getSquares(this.posX, this.posY + 1)
            .filter((sq) => sq.surface && sq.collision)
            .map((sq) => sq.calculateDistToFront() + 1));

        return this.distToFront;
    }

    percolateInnerMoisture() {
        if (this.waterContainment <= 0) {
            return 0;
        }
        getDirectNeighbors(this.posX, this.posY).filter((sq) => sq.solid).forEach((sq) => this.waterContainment -= sq.percolateFromBlock(this));
        this.doBlockOutflow();
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

    doBlockOutflow() {
        if (this.waterContainment < this.waterContainmentMax / 2) {
            return;
        }

        for (let side = -1; side <= 1; side += 2) {
            getSquares(this.posX + side, this.posY).filter((sq) => sq.proto == "WaterSquare")
                .forEach((sq) => {
                    sq.frameFrozen = false;
                    sq.physics();
                });

            if (getSquares(this.posX + side, this.posY).some((sq) => sq.collision)) {
                continue;
            }
            if (getNeighbors(this.posX, this.posY)
                .filter((sq) => sq.group == this.group)
                .some((sq) => sq.waterContainment != sq.waterContainmentMax)) {
                return;
            }
            var newWater = addSquareByName(this.posX + side, this.posY, "water");
            if (newWater) {
                newWater.blockHealth = this.waterContainmentTransferRate.value;
                this.waterContainment -= this.waterContainmentTransferRate.value;
            }
        }
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

