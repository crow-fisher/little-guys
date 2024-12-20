import  {MAIN_CANVAS, MAIN_CONTEXT, CANVAS_SQUARES_X, CANVAS_SQUARES_Y, BASE_SIZE} from "../index.js";
import { hexToRgb, rgbToHex } from "../common.js";

import { getCurTime } from "../globals.js";
import { dirt_baseColorAmount, dirt_darkColorAmount, dirt_accentColorAmount } from "../config/config.js";
import { getSquares } from "../squares/_sqOperations.js";

class BaseLifeSquare {
    constructor(posX, posY) {
        this.proto = "BaseLifeSquare";
        this.posX = posX;
        this.posY = posY;
        this.type = "base";
        this.colorBase = "#1D263B";
        this.spawnedEntityId = 0;

        this.maxNutrientDt = 0.05;

        this.airNutrients = 0;
        this.waterNutrients = 0;
        this.dirtNutrients = 0;
    
        this.linkedSquare = null;
        this.opacity = 1;
        this.width = 1;
        this.xOffset = 0.5;
        this.randoms = [];

        this.renderWithColorRange = false;
        // for ref - values from plant
        this.baseColor = "#9A8873";
        this.baseColorAmount = dirt_baseColorAmount;
        this.darkColor = "#46351D";
        this.darkColorAmount = dirt_darkColorAmount;
        this.accentColor = "#246A73";
        this.accentColorAmount = dirt_accentColorAmount;
    }

    addAirNutrient(nutrientAmount) {
        var start = this.airNutrients;
        this.airNutrients += Math.min(this.maxNutrientDt, this.airNutrients + nutrientAmount);
        return this.airNutrients - start;
    }

    addWaterNutrient(nutrientAmount) {
        var start = this.waterNutrients;
        this.waterNutrients += Math.min(this.maxNutrientDt, this.waterNutrients + nutrientAmount);
        return this.waterNutrients - start;
    }

    addDirtNutrient(nutrientAmount) {
        var start = this.dirtNutrients;
        this.dirtNutrients += Math.min(this.maxNutrientDt, this.dirtNutrients + nutrientAmount);
        return this.dirtNutrients - start;
    }

    adjacentWater(waterBlockHealth) {
        return this.addWaterNutrient(waterBlockHealth);
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

    renderWithVariedColors() {
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

        var outHex = rgbToHex(Math.floor(outColor.r), Math.floor(outColor.g), Math.floor(outColor.b));

        MAIN_CONTEXT.fillStyle = outHex;

        var startPos = this.posX * BASE_SIZE + (1 - this.width) * BASE_SIZE * this.xOffset;
        
        var height = BASE_SIZE * (1 + this.getStaticRand(3));

        // getSquares(this.posX, this.posY - 1).forEach((x) => height = BASE_SIZE);

        if (getSquares(this.posX, this.posY - 1))
        MAIN_CONTEXT.fillRect(
            startPos,
            this.posY * BASE_SIZE - (height - BASE_SIZE),
            this.width * BASE_SIZE,
            height
        );
    }


    render() {
        if (this.renderWithColorRange) {
            this.renderWithVariedColors();
            return;
        }

        MAIN_CONTEXT.fillStyle = this.calculateColor();
        MAIN_CONTEXT.fillRect(
            this.posX * BASE_SIZE,
            this.posY * BASE_SIZE,
            BASE_SIZE,
            BASE_SIZE
        );
    };

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

}
export {BaseLifeSquare}