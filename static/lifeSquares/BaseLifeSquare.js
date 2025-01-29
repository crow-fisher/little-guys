import { MAIN_CANVAS, MAIN_CONTEXT, CANVAS_SQUARES_X, CANVAS_SQUARES_Y, BASE_SIZE, zoomCanvasFillRect } from "../index.js";
import { getZPercent, hexToRgb, processColorLerp, processColorStdev, rgbToHex, rgbToRgba } from "../common.js";

import { getCurTime, getDaylightStrength } from "../time.js";
import { dirt_baseColorAmount, dirt_darkColorAmount, dirt_accentColorAmount, b_sq_darkeningStrength } from "../config/config.js";
import { addSquare, getSquares, removeOrganismSquare } from "../squares/_sqOperations.js";
import { airNutrientsPerEmptyNeighbor } from "../config/config.js";

import { selectedViewMode } from "../index.js";
import { RGB_COLOR_BLUE, RGB_COLOR_BROWN, RGB_COLOR_GREEN, RGB_COLOR_BLACK, RGB_COLOR_RED, COLOR_BLUE, COLOR_GREEN, COLOR_RED } from "../colors.js";
import { addOrganismSquare } from "./_lsOperations.js";
import { removeSquare } from "../globalOperations.js";


class BaseLifeSquare {
    constructor(square, organism) {
        this.proto = "BaseLifeSquare";
        this.posX = square.posX;
        this.posY = square.posY;
        this.xOffset = 0;
        this.yOffset = 0;
        this.type = "base";
        this.subtype = "";
        this.colorBase = "#1D263B";
        this.motivation = null; // if specified - 'air', 'water', 'dirt'
        this.spawnTime = getCurTime();


        this.maxAirDt = 0.005;
        this.maxWaterDt = 0.005;
        this.maxDirtDt = 0.005;

        this.airNutrients = 0;
        this.waterNutrients = 0;
        this.dirtNutrients = 0;

        this.storedWater = 0;
        this.storedWaterMax = 5;
        this.storedWaterTransferRate = 1;

        this.deflectionStrength = 0;
        this.deflectionXOffset = 0;
        this.deflectionYOffset = 0;

        this.linkedSquare = square;
        this.linkedOrganism = organism;
        this.spawnedEntityId = organism.spawnedEntityId;
        this.childLifeSquares = new Array();
        this.parentLifeSquare = null;

        this.height = BASE_SIZE;

        if (square.organic) {
            square.spawnedEntityId = organism.spawnedEntityId;
        }

        this.strength = 1;

        this.opacity = 1;
        this.width = 1;
        this.height = 1;
        this.xOffset = 0.5;
        this.randoms = [];

        this.energyIndicated = 0;
        this.healthIndicated = 0;
        this.lifetimeIndicated = 0;
        this.airIndicated = 0;
        this.waterIndicated = 0;
        this.dirtIndicated = 0;

        this.cachedRgba = null;

        this.flowering = false;
        this.flowerColor = "#000000";
        this.flowerColorRgba = "rgba(0, 0, 0, 0)";
        this.flowerColorRgb = { r: 0, g: 0, b: 0 };
        this.shouldFlower = 0;
        this.shouldFlowerFlag = false;
        this.numAdjacentFlowers = 0;

        this.distFromOrigin = 0;
        this.distToFront = 0;
        this.component = null;

        this.renderWithColorRange = false;
        // for ref - values from plant
        this.baseColor = "#9A8873";
        this.baseColor_rgb = hexToRgb(this.baseColor);
        this.baseColorAmount = dirt_baseColorAmount;
        this.darkColor = "#46351D";
        this.darkColor_rgb = hexToRgb(this.darkColor);
        this.darkColorAmount = dirt_darkColorAmount;
        this.accentColor = "#246A73";
        this.accentColor_rgb = hexToRgb(this.accentColor);
        this.accentColorAmount = dirt_accentColorAmount;

        this.LSQ_RENDER_SIZE_MULT = Math.SQRT2;

    }

    getLsqRenderSizeMult() {
        if (this.type == "green") {
            return this.LSQ_RENDER_SIZE_MULT;
        } else {
            return 1;
        }
    }

    makeRandomsSimilar(otherSquare) {
        for (let i = 0; i < this.randoms.length; i++) {
            this.randoms[i] = otherSquare.randoms[i] * 0.9 + this.randoms[i] * 0.1;
        }
    }

    updatePositionDifferential(dx, dy) {
        removeOrganismSquare(this);
        removeSquare(this.linkedSquare);
        this.posX += dx;
        this.posY += dy;
        addOrganismSquare(this);
        addSquare(this.linkedSquare);
    }

    shiftUp() {
        this.updatePositionDifferential(0, -1);
    }

    dist(testX, testY) { // manhattan
        return Math.abs(this.posX - testX) + Math.abs(this.posY - testY);
    }

    getCost() {
        return 1;
    }

    flower() { }

    storeWater(amountToAdd) {
        if (this.storedWater >= this.storedWaterMax) {
            return 0;
        }
        var amountToStore = Math.min(this.storedWaterMax - this.storedWater, Math.min(amountToAdd, this.storedWaterTransferRate));
        this.storedWater += amountToStore;
        return amountToStore;
    }

    retrieveWater() {
        var amountToRetrieve = Math.min(this.storedWaterTransferRate, this.storedWater);
        this.storedWater -= amountToRetrieve;
        return amountToRetrieve;
    }

    addChild(lifeSquare) {
        if (lifeSquare == null) {
            console.warn("lifesquare is null", lifeSquare);
            return;
        }
        if (lifeSquare in this.childLifeSquares) {
            console.warn("Error state: lifeSquare in this.childLifeSquares");
            return;
        }
        this.childLifeSquares.push(lifeSquare);
        lifeSquare.parentLifeSquare = this;
        lifeSquare.deflectionXOffset = this.deflectionXOffset;
        lifeSquare.deflectionYOffset = this.deflectionYOffset;
    }

    removeChild(lifeSquare) {
        this.childLifeSquares = Array.from(this.childLifeSquares.filter((lsq) => lsq != lifeSquare));
    }

    linkSquare(square) {
        this.linkedSquare = square;
    }
    unlinkSquare() {
        this.linkedSquare = null;
    }
    destroy() {
        if (this.linkedSquare.organic) {
            this.linkedSquare.destroy();
        } else {
            this.linkedSquare.unlinkOrganismSquare(this);
        }
        if (this.parentLifeSquare != null) {
            this.parentLifeSquare.removeChild(this);
        }
        removeOrganismSquare(this);
    }


    addDirtNutrient(nutrientAmount) {
        nutrientAmount = Math.max(nutrientAmount, 0);
        var amountOfDirtToAdd = this.linkedOrganism.getAmountOfDirtNutrientsToCollect();
        if (amountOfDirtToAdd < nutrientAmount / 2) {
            return this._addDirtNutrient(nutrientAmount / 2);
        } else {
            if (amountOfDirtToAdd < nutrientAmount) {
                return this._addDirtNutrient(amountOfDirtToAdd);
            }
            return this._addDirtNutrient(nutrientAmount);;
        }
    }

    _addDirtNutrient(nutrientAmount) {
        var start = this.dirtNutrients;
        this.dirtNutrients += Math.min(this.maxDirtDt, this.dirtNutrients + nutrientAmount);
        return this.waterNutrients - start;
    }

    addAirNutrient(nutrientAmount) {
        nutrientAmount = Math.max(nutrientAmount, 0);
        var start = this.airNutrients;
        this.airNutrients += Math.min(this.maxAirDt, this.airNutrients + nutrientAmount);
        return this.airNutrients - start;
    }

    addWaterNutrient(nutrientAmount) {
        nutrientAmount = Math.max(nutrientAmount, 0);
        var start = this.waterNutrients;
        this.waterNutrients += Math.min(this.maxWaterDt, this.waterNutrients + nutrientAmount);
        return this.waterNutrients - start;
    }


    preTick() {
        this.airNutrients = 0;
        this.waterNutrients = 0;
        this.dirtNutrients = 0;

        this.healthIndicated = 0;
        this.energyIndicated = 0;
        this.lifetimeIndicated = 0;

        this.waterIndicated = 0;
        this.airIndicated = 0;
        this.dirtIndicated = 0;
    }

    tick() {
    }

    getStaticRand(randIdx) {
        while (randIdx > this.randoms.length - 1) {
            this.randoms.push(Math.random());
        }
        return this.randoms[randIdx];
    }

    getScore() {
        var outScore = 0;
        var orgMeanNutrient = this.linkedOrganism.getMeanNutrient();
        if (this.linkedOrganism.dirtNutrients < orgMeanNutrient) {
            outScore += this.dirtNutrients * this.linkedOrganism.dirtCoef;
        }
        if (this.linkedOrganism.waterNutrients < orgMeanNutrient) {
            outScore += this.waterNutrients * this.linkedOrganism.waterCoef;
        }
        if (this.linkedOrganism.airNutrients < orgMeanNutrient) {
            outScore += this.airNutrients * this.linkedOrganism.airCoef;
        }
        return outScore;
    }

    getPosX() {
        return this.posX - (this.deflectionXOffset + this.xOffset);
    }

    getPosY() {
        return this.posY - (this.deflectionYOffset + this.yOffset);
    }

    darkeningRender() { 
        MAIN_CONTEXT.fillStyle = this.calculateDarkeningColorImpl((10 - 8 * getDaylightStrength()) + this.linkedSquare.currentPressureDirect, 10);
        zoomCanvasFillRect(
            this.getPosX() * BASE_SIZE,
            this.getPosY() * BASE_SIZE,
            this.width * BASE_SIZE * this.getLsqRenderSizeMult(),
            this.height * BASE_SIZE * this.getLsqRenderSizeMult()
        );
    }

    distToFrontBlockModDarken() { 
        // TODO: optimize, this is dinky dinky slow rn
        return;
        if (this.linkedOrganism.getLowestGreen() == null) {
            return;
        }
        MAIN_CONTEXT.fillStyle = this.calculateDarkeningColorImpl(Math.max(0, this.linkedOrganism.linkedSquare.distToFront - this.linkedOrganism.getLowestGreen().linkedSquare.currentPressureDirect), 32);
        zoomCanvasFillRect(
            this.getPosX() * BASE_SIZE,
            this.getPosY() * BASE_SIZE,
            this.width * BASE_SIZE * this.getLsqRenderSizeMult(),
            this.height * BASE_SIZE * this.getLsqRenderSizeMult()
        );
    }


    calculateDarkeningColorImpl(darkVal, darkValMax) {
        var c;
        if (this.flowering) {
            c = hexToRgb(this.flowerColor);
            c.r /= 3;
            c.g /= 3;
            c.b /= 3;
        } else {
            c = this.darkColor_rgb;
        }
        if (darkVal == 0) {
            return rgbToRgba(c.r, c.g, c.b, 0);
        }
        var darkeningStrength = (darkVal / darkValMax) * b_sq_darkeningStrength.value;
        if (this.flowering) {
            darkeningStrength /= 3;
        }
        return rgbToRgba(c.r, c.g, c.b, darkeningStrength * this.opacity);
    }

    render() {
        if (selectedViewMode.startsWith("organism") && selectedViewMode != "organismStructure") {
            var color = null;
            var val;
            var val_max;
            var val_stdev;
            switch (selectedViewMode) {
                case "organismSquareNutrients":
                    color = {
                        r: 255 * (this.dirtNutrients / this.linkedOrganism.getMaxDirtNutrient()),
                        g: 255 * (this.airNutrients / this.linkedOrganism.getMaxAirNutrient()),
                        b: 255 * (this.waterNutrients / this.linkedOrganism.getMaxWaterNutrient())
                    }
                    val = this.dirtNutrients + this.airNutrients + this.waterNutrients;
                    val_max = this.maxAirDt + this.maxWaterDt + this.maxDirtDt;
                    break;
                case "organismSquareDirt":
                    color = RGB_COLOR_BROWN;
                    val = this.dirtNutrients;
                    val_max = this.maxDirtDt;
                    break;
                case "organismSquareWater":
                    color = RGB_COLOR_BLUE;
                    val = this.waterNutrients;
                    val_max = this.maxWaterDt;
                    break;
                case "organismSquareAir":
                    color = RGB_COLOR_GREEN;
                    val = this.airNutrients;
                    val_max = this.maxAirDt;
                    break;
                case "organismSquareWaterStored":
                    color = RGB_COLOR_BLUE;
                    val = this.storedWater;
                    val_max = this.storedWaterMax;
                    break;
                case "organismHealth":
                    color = RGB_COLOR_RED;
                    val = this.healthIndicated;
                    val_max = 1;
                    break;
                case "organismEnergy":
                    color = RGB_COLOR_GREEN;
                    val = this.energyIndicated;
                    val_max = 1;
                    break;
                case "organismLifetime":
                    color = RGB_COLOR_BLACK;
                    val = this.lifetimeIndicated;
                    val_max = 1;
                    break;
                case "organismNutrients":
                    color = {
                        r: 100 + (1 - this.dirtIndicated) * 130,
                        g: 100 + (1 - this.airIndicated) * 130,
                        b: 100 + (1 - this.waterIndicated) * 130
                    }
                    MAIN_CONTEXT.fillStyle = rgbToHex(color.r, color.g, color.b);
                    zoomCanvasFillRect(
                        this.getPosX() * BASE_SIZE,
                        this.getPosY() * BASE_SIZE,
                        this.width * BASE_SIZE * this.getLsqRenderSizeMult(),
                        this.height * BASE_SIZE * this.getLsqRenderSizeMult()
                    );
                    return;

                case "organismDirt":
                    color = RGB_COLOR_BROWN;
                    val = this.dirtIndicated;
                    val_max = 1;
                    val_stdev = 2;
                    break;
                case "organismWater":
                    color = RGB_COLOR_BLUE;
                    val = this.waterIndicated;
                    val_max = 1;
                    break;
                case "organismAir":
                    color = RGB_COLOR_GREEN;
                    val = this.airIndicated;
                    val_max = 1;
                    break;
            }
            var colorProcessed = processColorLerp((val_max - val), -0.5, val_max + 0.5, color);
            MAIN_CONTEXT.fillStyle = rgbToHex(colorProcessed.r, colorProcessed.g, colorProcessed.b);
            zoomCanvasFillRect(
                this.getPosX() * BASE_SIZE,
                this.getPosY() * BASE_SIZE,
                this.width * BASE_SIZE * this.getLsqRenderSizeMult(),
                this.height * BASE_SIZE * this.getLsqRenderSizeMult()
            );
            return;
        }
        if (selectedViewMode == "watersaturation") {
            var color1 = null;
            var color2 = null;
        
            var val = this.linkedOrganism.waterPressure;
            var valMin = -100;
            var valMax = 0;

            if (this.linkedOrganism.waterPressure > -2) {
                color1 = RGB_COLOR_BLUE;
                color2 = RGB_COLOR_GREEN;
                valMin = -2;
                valMax = this.linkedOrganism.waterPressureOverwaterThresh;

            } else if (this.linkedOrganism.waterPressure > this.linkedOrganism.waterPressureWiltThresh) {
                color1 = RGB_COLOR_GREEN;
                color2 = RGB_COLOR_BROWN;
                valMin = this.linkedOrganism.waterPressureWiltThresh;
                valMax = -2;
            } else {
                color1 = RGB_COLOR_BROWN;
                color2 = RGB_COLOR_RED;
                valMin = this.waterPressureDieThresh;
                valMax = this.linkedOrganism.waterPressureWiltThresh;
            }
            var valInvLerp = (val - valMin) / (valMax - valMin);
            var out = {
                r: color1.r * valInvLerp + color2.r * (1 - valInvLerp),
                g: color1.g * valInvLerp + color2.g * (1 - valInvLerp),
                b: color1.b * valInvLerp + color2.b * (1 - valInvLerp),
            }
            MAIN_CONTEXT.fillStyle = rgbToHex(out.r, out.g, out.b);
            zoomCanvasFillRect(
                this.getPosX() * BASE_SIZE,
                this.getPosY() * BASE_SIZE,
                this.width * BASE_SIZE * this.getLsqRenderSizeMult(),
                this.height * BASE_SIZE * this.getLsqRenderSizeMult()
            );
            return;
        }
        if (this.cachedRgba) {
            MAIN_CONTEXT.fillStyle = this.cachedRgba;
        } else {
            var res = this.getStaticRand(1) * (parseFloat(this.accentColorAmount.value) + parseFloat(this.darkColorAmount.value) + parseFloat(this.baseColorAmount.value));
            var primaryColor = null;
            var altColor1 = null;
            var altColor2 = null;

            if (res < parseFloat(this.accentColorAmount.value)) {
                primaryColor = this.accentColor;
                altColor1 = this.darkColor;
                altColor2 = this.colorBase;
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

            var outColor = {
                r: baseColorRgb.r * 0.5 + ((altColor1Rgb.r * rand + altColor2Rgb.r * (1 - rand)) * 0.5),
                g: baseColorRgb.g * 0.5 + ((altColor1Rgb.g * rand + altColor2Rgb.g * (1 - rand)) * 0.5),
                b: baseColorRgb.b * 0.5 + ((altColor1Rgb.b * rand + altColor2Rgb.b * (1 - rand)) * 0.5)
            }

            var outRgba = rgbToRgba(Math.floor(outColor.r), Math.floor(outColor.g), Math.floor(outColor.b), this.opacity);
            MAIN_CONTEXT.fillStyle = outRgba;
        }

        zoomCanvasFillRect(
            this.getPosX() * BASE_SIZE,
            this.getPosY() * BASE_SIZE,
            this.width * BASE_SIZE * this.getLsqRenderSizeMult(),
            this.height * BASE_SIZE * this.getLsqRenderSizeMult()
        );

        this.darkeningRender();
        this.distToFrontBlockModDarken();
    }

    calculateColor() {
        var baseColorRGB = hexToRgb(this.colorBase);
        return rgbToHex(Math.floor(baseColorRGB.r), Math.floor(baseColorRGB.g), Math.floor(baseColorRGB.b));
    }

    setSpawnedEntityId(id) {
        this.spawnedEntityId = id;
        if (this.linkedSquare != null) {
            this.linkedSquare.spawnedEntityId = id;
        }
    }

    getMinNutrient() {
        return Math.min(Math.min(this.airNutrients, this.dirtNutrients), this.waterNutrients);
    }

    getMaxNutrient() {
        return Math.max(Math.max(this.airNutrients, this.dirtNutrients), this.waterNutrients);
    }
    getMeanNutrient() {
        return (this.airNutrients + this.dirtNutrients + this.waterNutrients) / 3;
    }

}
export { BaseLifeSquare };