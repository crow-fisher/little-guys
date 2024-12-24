import { BaseLifeSquare } from "./BaseLifeSquare.js";
import { getDirectNeighbors, getNeighbors } from "../squares/_sqOperations.js";
import { BASE_SIZE, MAIN_CANVAS, MAIN_CONTEXT } from "../index.js";
import { loadImage } from "../common.js";
import { dirt_baseColorAmount, dirt_darkColorAmount, dirt_accentColorAmount } from "../config/config.js";

import {
    airNutrientsPerEmptyNeighbor,
} from "../config/config.js"


class LilyPadFlowerLifeSquare extends BaseLifeSquare {
    constructor(square, organism) {
        super(square, organism);
        this.proto = "LilyPadFlowerLifeSquare";
        this.colorBase = "#157F1F";
        this.type = "flower";
        this.width = .99;

        this.centerColor = "#FFEF00";
        this.petalColor = "#B284BE";

        // width and xOffset are scaled between 0 and 1
        // width of 0.8 means it occupies 80% of the X width 
        // xOffset of 0 means the left block side is all the way to the left
        // xOffset of 1 means the right block side is all the way to the right 
    }

    render() {
        var centerPos = [this.posX, this.posY - 1]
        var petals = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1]
        ];

        this.renderSquareWithColor(centerPos[0], centerPos[1], this.centerColor);
        petals.forEach((petal) => this.renderSquareWithColor(centerPos[0] + petal[0], centerPos[1] + petal[1], this.petalColor));
    }

    renderSquareWithColor(posX, posY, color) {
        MAIN_CONTEXT.fillStyle = color;
        MAIN_CONTEXT.fillRect(
            posX * BASE_SIZE,
            posY * BASE_SIZE,
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



export { LilyPadFlowerLifeSquare }