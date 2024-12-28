import { BaseLifeSquare } from "./BaseLifeSquare.js";
import { getDirectNeighbors, getNeighbors } from "../squares/_sqOperations.js";
import { BASE_SIZE, MAIN_CANVAS, MAIN_CONTEXT } from "../index.js";
import { loadImage } from "../common.js";
import { dirt_baseColorAmount, dirt_darkColorAmount, dirt_accentColorAmount } from "../config/config.js";

import {
    airNutrientsPerEmptyNeighbor,
} from "../config/config.js"
import { getOrganismSquaresAtSquare } from "./_lsOperations.js";


class LilyPadWaterGreenLifeSquare extends BaseLifeSquare {
    constructor(square, organism) {
        super(square, organism);
        this.proto = "LilyPadWaterGreenLifeSquare";
        this.colorBase = "#157F1F";
        this.type = "green";
        this.width = .99;

        this.baseColor = "#ADFF2F";
        this.baseColorAmount = dirt_baseColorAmount;
        this.darkColor = "#A7FC00";
        this.darkColorAmount = dirt_darkColorAmount;
        this.accentColor = "#9ACD32";
        this.accentColorAmount = dirt_accentColorAmount;

        // width and xOffset are scaled between 0 and 1
        // width of 0.8 means it occupies 80% of the X width 
        // xOffset of 0 means the left block side is all the way to the left
        // xOffset of 1 means the right block side is all the way to the right 
    }

    tick() {
        this.addAirNutrient(
            airNutrientsPerEmptyNeighbor.value *
            getDirectNeighbors(this.posX, this.posY)
            .filter((sq) => getOrganismSquaresAtSquare(sq.posX, sq.posY).length == 0)
            .map((sq) => (sq.solid ? 0.05 : (1 * (0.9 ** (sq.currentPressureIndirect)))))
            .reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0,
            ));
    }
}



export { LilyPadWaterGreenLifeSquare }