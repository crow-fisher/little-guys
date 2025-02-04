
import { BaseLifeSquare } from "./BaseLifeSquare.js";

import {
    p_seed_ls_sproutGrowthRate,
    p_seed_ls_neighborWaterContainmentRequiredToGrow,
    p_seed_ls_darkeningStrength
    } from "../config/config.js"
import { getDirectNeighbors, getSquares } from "../squares/_sqOperations.js";
import { getNeighbors } from "../squares/_sqOperations.js";
import { hexToRgb, rgbToHex } from "../common.js";
import { BASE_SIZE } from "../index.js";
import { getCurDay } from "../time.js";
class SeedLifeSquare extends BaseLifeSquare {
    constructor(square, organism) {
        super(square, organism);
        this.proto = "SeedLifeSquare";
        this.type = "seed";
        this.height = 0.25;

        this.baseColor = "#ecb55a";
        this.darkColor = "#a96831";
        this.accentColor = "#8c6249";
    }

}
export {SeedLifeSquare};