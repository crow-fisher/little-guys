import { MAIN_CANVAS, MAIN_CONTEXT, CANVAS_SQUARES_X, CANVAS_SQUARES_Y, BASE_SIZE } from "../index.js";
import { getZPercent, hexToRgb, rgbToHex, rgbToRgba } from "../common.js";

import { getCurTime } from "../globals.js";
import { dirt_baseColorAmount, dirt_darkColorAmount, dirt_accentColorAmount } from "../config/config.js";
import { getSquares, removeOrganismSquare } from "../squares/_sqOperations.js";
import { airNutrientsPerEmptyNeighbor } from "../config/config.js";
 
import { selectedViewMode } from "../index.js";
import { RGB_COLOR_BLUE, RGB_COLOR_BROWN, RGB_COLOR_GREEN, RGB_COLOR_BLACK, RGB_COLOR_RED } from "../colors.js";

class BaseLifeSquare {
    constructor(square, organism) {
        this.proto = "BaseLifeSquare";
        this.posX = square.posX;
        this.posY = square.posY;
        this.type = "base";
        this.colorBase = "#1D263B";

        this.maxAirDt = 0.1;
        this.maxWaterDt = 0.05;
        this.maxDirtDt = 0.05;

        this.airNutrients = 0;
        this.waterNutrients = 0;
        this.dirtNutrients = 0;

        this.storedWater = 0;
        this.storedWaterMax = 5;
        this.storedWaterTransferRate = 1;

        this.airCoef = 1;
        this.waterCoef = 1;
        this.dirtCoef = 1;

        this.linkedSquare = square;
        this.linkedOrganism = organism;
        this.spawnedEntityId = organism.spawnedEntityId;
        this.childLifeSquares = new Array();

        this.height = BASE_SIZE;

        if (square.organic) {
            square.spawnedEntityId = organism.spawnedEntityId;
        }

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

        this.renderWithColorRange = false;
        // for ref - values from plant
        this.baseColor = "#9A8873";
        this.baseColorAmount = dirt_baseColorAmount;
        this.darkColor = "#46351D";
        this.darkColorAmount = dirt_darkColorAmount;
        this.accentColor = "#246A73";
        this.accentColorAmount = dirt_accentColorAmount;
    }

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

    getCost() {
        return (this.airCoef * this.waterCoef * this.dirtCoef) ** 0.5;
    }

    addChild(lifeSquare) {
        if (lifeSquare in this.childLifeSquares) {
            console.warn("Error state: lifeSquare in this.childLifeSquares");
            return;
        }
        this.childLifeSquares.push(lifeSquare);
        this.width = 1;
        this.height = 1;
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
        }
        removeOrganismSquare(this);
    }


    addDirtNutrient(nutrientAmount) {
        nutrientAmount *= this.dirtCoef;
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
        nutrientAmount *= this.airCoef;
        var start = this.airNutrients;
        this.airNutrients += Math.min(this.maxAirDt, this.airNutrients + nutrientAmount);
        return this.airNutrients - start;
    }

    addWaterNutrient(nutrientAmount) {
        nutrientAmount *= this.waterCoef;
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

    processColorStdev(val_max, val, val_stdev, color) {
        var z = (val_max - val) / val_stdev;
        var p = getZPercent(z);
        return {
            r: Math.floor(color.r * (1 - p) + 255 * (p)), 
            g: Math.floor(color.g * (1 - p) + 255 * (p)), 
            b: Math.floor(color.b * (1 - p) + 255 * (p))
        }
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
                    val_max = this.linkedOrganism.getMaxAllNutrients(); 
                    val_stdev = this.linkedOrganism.getStdevAllNutrients();
                    break;
                case "organismSquareDirt":
                    color = RGB_COLOR_BROWN;
                    val = this.dirtNutrients;
                    val_max = this.linkedOrganism.getMaxDirtNutrient();
                    val_stdev = this.linkedOrganism.getStdevDirtNutrient();
                    break;
                case "organismSquareWater":
                    color = RGB_COLOR_BLUE;
                    val = this.waterNutrients;
                    val_max = this.linkedOrganism.getMaxWaterNutrient();
                    val_stdev = this.linkedOrganism.getStdevWaterNutrient();
                    break;
                case "organismSquareAir":
                    color = RGB_COLOR_GREEN;
                    val = this.airNutrients;
                    val_max = this.linkedOrganism.getMaxAirNutrient();
                    val_stdev = this.linkedOrganism.getStdevAirNutrient();
                    break;
                case "organismSquareWaterStored":
                    color = RGB_COLOR_BLUE;
                    val = this.storedWater;
                    val_max = this.storedWaterMax;
                    val_stdev = this.storedWaterMax / 4;
                    break;
                case "organismHealth":
                    color = RGB_COLOR_RED;
                    val = this.healthIndicated; 
                    val_max = 1;
                    val_stdev = 2;
                    break;
                case "organismEnergy":
                    color = RGB_COLOR_GREEN;
                    val = this.energyIndicated; 
                    val_max = 1;
                    val_stdev = 2;
                    break;
                case "organismLifetime":
                    color = RGB_COLOR_BLACK;
                    val = this.lifetimeIndicated; 
                    val_max = 1;
                    val_stdev = 2;
                    break;
                case "organismNutrients":
                    color = {
                        r: 50 + (1 - this.dirtIndicated) * 180,
                        g: 50 + (1 - this.airIndicated) * 180,
                        b: 50 + (1 - this.waterIndicated) * 180
                    }
                    MAIN_CONTEXT.fillStyle = rgbToHex(color.r, color.g, color.b);
                    MAIN_CONTEXT.fillRect(
                        this.posX * BASE_SIZE,
                        this.posY * BASE_SIZE,
                        this.width * BASE_SIZE,
                        this.height * BASE_SIZE
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
                    val_stdev = 2;
                    break;
                case "organismAir":
                    color = RGB_COLOR_GREEN;
                    val = this.airIndicated;
                    val_max = 1;
                    val_stdev = 2;
                    break;
            }

            var colorProcessed = this.processColorStdev(val_max, val, val_max, color);

            MAIN_CONTEXT.fillStyle = rgbToHex(colorProcessed.r, colorProcessed.g, colorProcessed.b);
            MAIN_CONTEXT.fillRect(
                this.posX * BASE_SIZE,
                this.posY * BASE_SIZE,
                this.width * BASE_SIZE,
                this.height * BASE_SIZE
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
            this.cachedRgba = outRgba;
            // this.height = (1 + this.getStaticRand(3));
        }

        var startPos = this.posX * BASE_SIZE + (1 - this.width) * BASE_SIZE * this.xOffset;

        MAIN_CONTEXT.fillRect(
            startPos,
            this.posY * BASE_SIZE,
            this.width * BASE_SIZE,
            this.height * BASE_SIZE
        );
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
export { BaseLifeSquare }