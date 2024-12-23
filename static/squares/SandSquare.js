import { BaseSquare } from "./BaseSqaure.js";
import { sand_nutrientValue, sand_waterContainmentMax, sand_waterContainmentTransferRate } from "../config/config.js";
import { dirt_baseColorAmount, dirt_darkColorAmount, dirt_accentColorAmount } from "../config/config.js";
class SandSquare extends BaseSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "SandSquare";
        this.colorBase = "#B06C49";
        this.nutrientValue = sand_nutrientValue;
        this.rootable = true;
        this.waterContainmentMax = sand_waterContainmentMax;
        this.waterContainmentTransferRate = sand_waterContainmentTransferRate
        this.waterSinkRate = 0.6;
        this.validPlantHome = true;
        
        this.baseColor = "#C19A6B";
        this.baseColorAmount = dirt_baseColorAmount;
        this.darkColor = "#A0785A";
        this.darkColorAmount = dirt_darkColorAmount;
        this.accentColor = "#E1A95F";
        this.accentColorAmount = dirt_accentColorAmount;

    }
}

export {SandSquare}