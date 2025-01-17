import { getNeighbors } from "../../../squares/_sqOperations.js";
import { BaseLifeSquare } from "../../BaseLifeSquare.js";
import { airNutrientsPerEmptyNeighbor } from "../../../config/config.js";

export class PalmTreeGreenSquare extends BaseLifeSquare {
    constructor(square, organism) {
        super(square, organism);
        this.proto = "PalmTreeGreenSquare";
        this.type = "green";
    }

    tick() {
        this.addAirNutrient(
            airNutrientsPerEmptyNeighbor.value *
            (
                8 - getNeighbors(this.posX, this.posY)
                    .filter((sq) => !sq.surface)
                    .map((sq) => 1)
                    .reduce(
                        (accumulator, currentValue) => accumulator + currentValue,
                        0,
                    ))
        );
    }
}