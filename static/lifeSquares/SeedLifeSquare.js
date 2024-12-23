
import { BaseLifeSquare } from "./BaseLifeSquare.js";

import {
    p_seed_ls_sproutGrowthRate,
    p_seed_ls_neighborWaterContainmentRequiredToGrow,
    p_seed_ls_neighborWaterContainmentRequiredToDecay,
    p_seed_ls_darkeningStrength
    } from "../config/config.js"
import { getDirectNeighbors, getSquares } from "../squares/_sqOperations.js";
import { getNeighbors } from "../squares/_sqOperations.js";
import { hexToRgb, rgbToHex } from "../common.js";
import { BASE_SIZE } from "../index.js";
class SeedLifeSquare extends BaseLifeSquare {
    constructor(square, organism) {
        super(square, organism);
        this.proto = "SeedLifeSquare";
        this.type = "seed";
        this.sproutStatus = 0;
        this.sproutGrowthRate = p_seed_ls_sproutGrowthRate;
        this.p_seed_ls_neighborWaterContainmentRequiredToGrow = p_seed_ls_neighborWaterContainmentRequiredToGrow;
        this.neighborWaterContainmentRequiredToDecay = p_seed_ls_neighborWaterContainmentRequiredToDecay;
        this.colorBase = "#A1CCA5";
        this.height = BASE_SIZE / 4;

        this.baseColor = "#98817B";
        this.darkColor = "#8B8589";
        this.accentColor = "#848482";
    }

    tick() {
        var totalSurroundingWater = this.linkedSquare.waterContainment + 
            getDirectNeighbors(this.posX, this.posY)
                .map((neighbor) => neighbor.waterContainment)
                .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

        if (totalSurroundingWater < this.neighborWaterContainmentRequiredToDecay.value) {
            this.sproutStatus -= this.sproutGrowthRate.value;
        }
        if (totalSurroundingWater > this.p_seed_ls_neighborWaterContainmentRequiredToGrow.value) {
            this.sproutStatus += this.sproutGrowthRate.value;
        }
        this.sproutStatus = Math.max(0, this.sproutStatus);
    }

    calculateColor() {
        var baseColorRGB = hexToRgb(this.colorBase);
        var darkeningStrength = p_seed_ls_darkeningStrength.value;
        // Water Saturation Calculation
        // Apply this effect for 20% of the block's visual value. 
        // As a fraction of 0 to 255, create either perfect white or perfect grey.

        var num = this.sproutStatus;
        var numMax = 1;

        var featureColor255 = (1 - (num / numMax)) * 255;
        var darkeningColorRGB = { r: featureColor255, b: featureColor255, g: featureColor255 };

        ['r', 'g', 'b'].forEach((p) => {
            darkeningColorRGB[p] *= darkeningStrength;
            baseColorRGB[p] *= (1 - darkeningStrength);
        });

        var resColor = {
            r: darkeningColorRGB.r + baseColorRGB.r,
            g: darkeningColorRGB.g + baseColorRGB.g,
            b: darkeningColorRGB.b + baseColorRGB.b
        }

        return rgbToHex(Math.floor(resColor.r), Math.floor(resColor.g), Math.floor(resColor.b));
    }


}
export {SeedLifeSquare};