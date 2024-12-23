import { MAIN_CANVAS, MAIN_CONTEXT, CANVAS_SQUARES_X, CANVAS_SQUARES_Y, BASE_SIZE } from "../index.js";
import { hexToRgb, rgbToHex, rgbToRgba } from "../common.js";

import { getCurTime } from "../globals.js";
import { dirt_baseColorAmount, dirt_darkColorAmount, dirt_accentColorAmount } from "../config/config.js";
import { getSquares, removeOrganismSquare } from "../squares/_sqOperations.js";
import { airNutrientsPerEmptyNeighbor } from "../config/config.js";

class BaseLifeSquare {
    constructor(square, organism) {
        this.proto = "BaseLifeSquare";
        this.posX = square.posX;
        this.posY = square.posY;
        this.type = "base";
        this.colorBase = "#1D263B";

        this.maxAirDt = airNutrientsPerEmptyNeighbor;
        this.maxWaterDt = 0.05;
        this.maxDirtDt = 0.05;

        this.airNutrients = 0;
        this.waterNutrients = 0;
        this.dirtNutrients = 0;

        this.storedWater = 0;
        this.storedWaterMax = 2;
        this.storedWaterTransferRate = 0.5;

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
        return Math.min(this.storedWaterTransferRate, this.storedWater);
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

    addNutrientSmart(maxNutrientValue, curValue, setter) {
        if (curValue == this.getMinNutrient()) {
            setter(maxNutrientValue);
        }
        var meanNutrient = this.getMeanNutrient();
        var diffToMean = meanNutrient - curValue;
        var amountToAdd = Math.max(maxNutrientValue / 2, diffToMean);
        setter(amountToAdd);

    }

    addAirNutrient(nutrientAmount) {
        this.addNutrientSmart(nutrientAmount, this.airNutrients, (val) => this._addAirNutrient(val));
    }

    addWaterNutrient(nutrientAmount) {
        this.addNutrientSmart(nutrientAmount, this.waterNutrients, (val) => this._addWaterNutrient(val));
    }

    addDirtNutrient(nutrientAmount) {
        this.addNutrientSmart(nutrientAmount, this.dirtNutrients, (val) => this._addDirtNutrient(val));
    }


    _addAirNutrient(nutrientAmount) {
        nutrientAmount *= this.airCoef;
        var start = this.airNutrients;
        this.airNutrients += Math.min(this.maxAirDt.value * 7, this.airNutrients + nutrientAmount);
        return this.airNutrients - start;
    }

    _addWaterNutrient(nutrientAmount) {
        nutrientAmount *= this.waterCoef;
        var start = this.waterNutrients;
        this.waterNutrients += Math.min(this.maxWaterDt, this.waterNutrients + nutrientAmount);
        return this.waterNutrients - start;
    }

    _addDirtNutrient(nutrientAmount) {
        nutrientAmount *= this.dirtCoef;
        var start = this.dirtNutrients;
        this.dirtNutrients += Math.min(this.maxDirtDt, this.dirtNutrients + nutrientAmount);
        return this.dirtNutrients - start;
    }

    preTick() {
        this.airNutrients = 0;
        this.waterNutrients = 0;
        this.dirtNutrients = 0;
    }

    tick() {
    }

    getStaticRand(randIdx) {
        while (randIdx > this.randoms.length - 1) {
            this.randoms.push(Math.random());
        }
        return this.randoms[randIdx];
    }

    render() {
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

        // getSquares(this.posX, this.posY - 1).forEach((x) => height = BASE_SIZE);

        if (getSquares(this.posX, this.posY - 1))
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