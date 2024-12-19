import { BaseLifeSquare } from "./BaseLifeSquare.js";
import { getDirectNeighbors } from "../squares/_sqOperations.js";
import { BASE_SIZE, MAIN_CANVAS, MAIN_CONTEXT } from "../index.js";
import { loadImage } from "../common.js";
import { dirt_baseColorAmount, dirt_darkColorAmount, dirt_accentColorAmount } from "../config/config.js";

import {
    p_ls_airNutrientsPerExposedNeighborTick,
    } from "../config/config.js"


class PlantLifeSquare extends BaseLifeSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "PlantLifeSquare";
        this.colorBase = "#157F1F";
        this.type = "green";
        this.width =.99;

        this.baseColor = "#50C878";
        this.baseColorAmount = dirt_baseColorAmount;
        this.darkColor = "#00563B";
        this.darkColorAmount = dirt_darkColorAmount;
        this.accentColor = "#138808";
        this.accentColorAmount = dirt_accentColorAmount;
        this.renderWithColorRange = true;

        // width and xOffset are scaled between 0 and 1
        // width of 0.8 means it occupies 80% of the X width 
        // xOffset of 0 means the left block side is all the way to the left
        // xOffset of 1 means the right block side is all the way to the right 
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