import { BaseLifeSquare } from "./BaseLifeSquare.js";
import { getDirectNeighbors, getNeighbors } from "../squares/_sqOperations.js";
import { BASE_SIZE, MAIN_CANVAS, MAIN_CONTEXT } from "../index.js";
import { loadImage } from "../common.js";
import { dirt_baseColorAmount, dirt_darkColorAmount, dirt_accentColorAmount } from "../config/config.js";

import {
    airNutrientsPerEmptyNeighbor,
} from "../config/config.js"


class CactusGreenLifeSquare extends BaseLifeSquare {
    constructor(square, organism) {
        super(square, organism);
        this.proto = "CactusGreenLifeSquare";
        this.type = "green";
        this.width = .99;

        this.storedWaterMax = 10;

        this.airCoef = 25;

        this.baseColor = "#DA9100";
        this.baseColorAmount = dirt_baseColorAmount;
        this.darkColor = "#74C365";
        this.darkColorAmount = dirt_darkColorAmount;
        this.accentColor = "#C2B280";
        this.accentColorAmount = dirt_accentColorAmount;
    }

    tick() {
        this.addAirNutrient(
            airNutrientsPerEmptyNeighbor.value *
            (
                8 - getNeighbors(this.posX, this.posY)
                    .map((sq) => 1)
                    .reduce(
                        (accumulator, currentValue) => accumulator + currentValue,
                        0,
                    ))
        );


    }
}



export { CactusGreenLifeSquare }