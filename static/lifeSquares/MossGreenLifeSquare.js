import { BaseLifeSquare } from "./BaseLifeSquare.js";
import { getDirectNeighbors, getNeighbors } from "../squares/_sqOperations.js";
import { BASE_SIZE, MAIN_CANVAS, MAIN_CONTEXT } from "../index.js";
import { loadImage } from "../common.js";
import { dirt_baseColorAmount, dirt_darkColorAmount, dirt_accentColorAmount } from "../config/config.js";

import {
    airNutrientsPerEmptyNeighbor,
} from "../config/config.js"


class MossGreenLifeSquare extends BaseLifeSquare {
    constructor(square, organism) {
        super(square, organism);
        this.proto = "MossGreenLifeSquare";
        this.type = "root";

        this.opacity = 0.3;

        this.storedWaterMax = 0.01;
        this.storedWaterTransferRate = .001;

        this.baseColor = "#62771f";
        this.baseColorAmount = dirt_baseColorAmount;
        this.darkColor = "#576914";
        this.darkColorAmount = dirt_darkColorAmount;
        this.accentColor = "#202d05";
        this.accentColorAmount = dirt_accentColorAmount;
    }

    getCost() {
        return 0.001 * this.linkedOrganism.lifeSquares.length; // i am but a small pathetic boy
    }

    tick() {
        this.addAirNutrient(this.linkedOrganism.getAirNutrientsAtSquare(this.posX, this.posY));
        this.addWaterNutrient(this.linkedSquare.suckWater(this.maxWaterDt - this.waterNutrients));
        this.addDirtNutrient(this.linkedOrganism.getDirtNutrientsAtSquare(this.posX, this.posY));
         
    }

}

export { MossGreenLifeSquare }