import { BaseLifeSquare } from "./BaseLifeSquare.js";
import { getDirectNeighbors } from "../squares/_sqOperations.js";
import { hexToRgb } from "../common.js";


class CactusRootLifeSquare extends BaseLifeSquare {
    constructor(square, organism) {
        super(square, organism);
        this.proto = "CactusRootLifeSquare";
        this.opacity = 0.4;
        this.colorBase = "#D1E231";
        this.type = "root";
        this.rootCoef = 3;
        this.waterCoef = 20;
    }
    tick() {
        getDirectNeighbors(this.posX, this.posY)
            .filter((n) => n.solid)
            .forEach((neighbor) => {
                this.addDirtNutrient(neighbor.nutrientValue.value);
                this.addWaterNutrient(neighbor.suckWater(this.maxWaterDt - this.waterNutrients));
            });
    }

    calculateColor() {
        var colorRgb = hexToRgb(this.colorBase);
        return "rgba(" + colorRgb.r + "," + colorRgb.g + "," + colorRgb.b + "," + this.opacity + ")";
    }
}

export { CactusRootLifeSquare }