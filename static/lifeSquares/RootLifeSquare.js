import { BaseLifeSquare } from "./BaseLifeSquare.js";
import { getDirectNeighbors } from "../squares/_sqOperations.js";
import { hexToRgb } from "../common.js";


class RootLifeSquare extends BaseLifeSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "RootLifeSquare";
        this.opacity = 0.6;
        this.colorBase = "#554640";
        this.type = "root";
    }
    tick() {
        this.rootNutrients = 0;
        getDirectNeighbors(this.posX, this.posY)
            .filter((n) => n != null && n.solid)
            .forEach((neighbor) => {
                this.rootNutrients += neighbor.nutrientValue.value;
                this.waterNutrients += neighbor.suckWater(this.waterNutrients);
            });
    }

    calculateColor() {
        var colorRgb = hexToRgb(this.colorBase);
        return "rgba(" + colorRgb.r + "," + colorRgb.g + "," + colorRgb.b + "," + this.opacity + ")";
    }
}

export { RootLifeSquare }