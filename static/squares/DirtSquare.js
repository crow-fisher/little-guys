import { BaseSquare } from "./BaseSqaure.js";
import { dirtNutrientValuePerDirectNeighbor } from "../config/config.js";

import { dirt_baseColorAmount, dirt_darkColorAmount, dirt_accentColorAmount } from "../config/config.js";
class DirtSquare extends BaseSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "DirtSquare";
        this.colorBase = "#B06C49";
        this.nutrientValue = dirtNutrientValuePerDirectNeighbor;
        this.rootable = true;
        this.validPlantHome = true;
        
        this.renderWithColorRange = true;
        this.baseColor = "#b88a5f";
        this.baseColorAmount = dirt_baseColorAmount;
        this.darkColor = "#855c48";
        this.darkColorAmount = dirt_darkColorAmount;
        this.accentColor = "#bf9e7c";
        this.accentColorAmount = dirt_accentColorAmount;

    }
}

export {DirtSquare}