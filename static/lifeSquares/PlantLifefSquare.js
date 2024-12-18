import { BaseLifeSquare } from "./BaseLifeSquare.js";
import { getDirectNeighbors } from "../squares/_sqOperations.js";
import { BASE_SIZE, MAIN_CANVAS, MAIN_CONTEXT } from "../index.js";
import { loadImage } from "../common.js";

import {
    p_ls_airNutrientsPerExposedNeighborTick,
    } from "../config/config.js"


class PlantLifeSquare extends BaseLifeSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "PlantLifeSquare";
        this.colorBase = "#157F1F";
        this.type = "green";

        // width and xOffset are scaled between 0 and 1
        // width of 0.8 means it occupies 80% of the X width 
        // xOffset of 0 means the left block side is all the way to the left
        // xOffset of 1 means the right block side is all the way to the right 
        this.width = 0.8; // scaled between 0 and 1
    }

    tick() {
        this.airNutrients = 0;
        this.airNutrients = getDirectNeighbors(this.posX, this.posY)
                .filter((nb) => nb != null)
                .map((sq) => p_ls_airNutrientsPerExposedNeighborTick.value)
                .reduce(
                    (accumulator, currentValue) => accumulator + currentValue,
                    0,
                );
    }
}



export {PlantLifeSquare}