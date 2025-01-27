import { BaseSquare } from "./BaseSqaure.js";
import {gravel_waterContainmentTransferRate, noNutrientValuePerDirectNeighbor } from "../config/config.js";

class GravelSquare extends BaseSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "GravelSquare";
        this.nutrientValue = noNutrientValuePerDirectNeighbor;
        this.rootable = true;
        this.validPlantHome = false;
        this.waterContainmentMax = 1;
        this.waterContainmentTransferRate = gravel_waterContainmentTransferRate;
        this.baseColor = "#a59d96";
        this.darkColor = "#5f504b";
        this.accentColor = "#f3ede7";
        this.waterSinkRate = 0.4;
    }
}

export {GravelSquare}