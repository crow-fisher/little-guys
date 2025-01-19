import { getDirectNeighbors } from "../../../squares/_sqOperations.js";
import { BaseLifeSquare } from "../../BaseLifeSquare.js";

export class ElephantEarRootSquare extends BaseLifeSquare {
    constructor(square, organism) {
        super(square, organism);
        this.proto = "ElephantEarRootSquare";
        this.type = "root";
        this.opacity = 0.4;
        this.colorBase = "#D1E231";
    }

    tick() {
        getDirectNeighbors(this.posX, this.posY)
            .filter((n) => n.solid)
            .forEach((neighbor) => {
                this.addDirtNutrient(neighbor.nutrientValue.value);
                this.addWaterNutrient(neighbor.suckWater(this.maxWaterDt - this.waterNutrients));
            });
    }
}