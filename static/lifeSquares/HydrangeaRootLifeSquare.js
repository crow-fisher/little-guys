import { BaseLifeSquare } from "./BaseLifeSquare.js";
import { getDirectNeighbors } from "../squares/_sqOperations.js";
import { hexToRgb } from "../common.js";


class HydrangeaRootLifeSquare extends BaseLifeSquare {
    constructor(square, organism) {
        super(square, organism);
        this.proto = "HydrangeaRootLifeSquare";
        this.opacity = 0.4;
        this.type = "root";
    }
    tick() {
        getDirectNeighbors(this.posX, this.posY)
            .filter((n) => n.rootable)
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

export { HydrangeaRootLifeSquare }