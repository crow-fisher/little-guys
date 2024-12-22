import { BaseSquare } from "./BaseSqaure.js";
import { gravel_waterContainmentMax, gravel_waterContainmentTransferRate, noNutrientValuePerDirectNeighbor } from "../config/config.js";

class GravelSquare extends BaseSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "GravelSquare";
        this.nutrientValue = noNutrientValuePerDirectNeighbor;
        this.rootable = false;
        this.validPlantHome = false;
        this.waterContainmentMax = gravel_waterContainmentMax;
        this.waterContainmentTransferRate = gravel_waterContainmentTransferRate;
        this.baseColor = "#91A3B0";
        this.darkColor = "#536878";
        this.accentColor = "#AA98A9";
    }
}

export {GravelSquare}