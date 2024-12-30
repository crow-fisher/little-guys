import { BaseLifeSquare } from "./BaseLifeSquare.js";
import { getDirectNeighbors, getNeighbors } from "../squares/_sqOperations.js";
import { BASE_SIZE, MAIN_CANVAS, MAIN_CONTEXT } from "../index.js";
import { loadImage } from "../common.js";
import { dirt_baseColorAmount, dirt_darkColorAmount, dirt_accentColorAmount } from "../config/config.js";

import {
    airNutrientsPerEmptyNeighbor,
} from "../config/config.js"
import { getOrganismSquaresAtSquare } from "./_lsOperations.js";


class HydrangeaGreenLifeSquare extends BaseLifeSquare {
    constructor(square, organism) {
        super(square, organism);
        this.proto = "HydrangeaGreenLifeSquare";
        this.colorBase = "#157F1F";
        this.type = "green";
        this.width = .99;

        this.baseColor = "#0d4613";
        this.darkColor = "#39a12c";
        this.accentColor = "#d6f482";
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
        this.addAirNutrient(
            airNutrientsPerEmptyNeighbor.value *
            (
                getNeighbors(this.posX, this.posY)
                    .filter((sq) => sq.organic)
                    .map((sq) => 0.85)
                    .reduce(
                        (accumulator, currentValue) => accumulator + currentValue,
                        0,
                    ))
        );
    }
}



export { HydrangeaGreenLifeSquare }