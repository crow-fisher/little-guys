import { BaseLifeSquare } from "./BaseLifeSquare.js";
import { getDirectNeighbors, getNeighbors } from "../squares/_sqOperations.js";
import { BASE_SIZE, MAIN_CANVAS, MAIN_CONTEXT } from "../index.js";
import { loadImage } from "../common.js";
import { dirt_baseColorAmount, dirt_darkColorAmount, dirt_accentColorAmount } from "../config/config.js";

import {
    airNutrientsPerEmptyNeighbor,
} from "../config/config.js"


class HydrangeaFlowerLifeSquare extends BaseLifeSquare {
    constructor(square, organism) {
        super(square, organism);
        this.proto = "HydrangeaFlowerLifeSquare";
        this.color = "#6393d5";
        this.type = "flower";
        this.width = .99;

        this.color = null;
        // width and xOffset are scaled between 0 and 1
        // width of 0.8 means it occupies 80% of the X width 
        // xOffset of 0 means the left block side is all the way to the left
        // xOffset of 1 means the right block side is all the way to the right 
    }

    render() {
        MAIN_CONTEXT.fillStyle = this.color;
        MAIN_CONTEXT.fillRect(
            this.posX * BASE_SIZE,
            this.posY * BASE_SIZE,
            BASE_SIZE,
            BASE_SIZE
        );
    }


    tick() {
        this.addAirNutrient(
            airNutrientsPerEmptyNeighbor.value *
            getDirectNeighbors(this.posX, this.posY)
            .filter((sq) => sq.proto == "WaterSquare")
            .map((sq) => 1 * (0.9 ** sq.currentPressureIndirect))
            .reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0,
            ));
    }
}



export { HydrangeaFlowerLifeSquare }