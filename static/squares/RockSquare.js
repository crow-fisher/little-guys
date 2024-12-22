import { BaseSquare } from "./BaseSqaure.js";

import {
    static_sq_waterContainmentMax,
    static_sq_waterContainmentTransferRate,
} from "../config/config.js"

import { rock_baseColorAmount, rock_darkColorAmount, rock_accentColorAmount } from "../config/config.js";

class RockSquare extends BaseSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "RockSquare";
        this.colorBase = "#000100";
        this.physicsEnabled = false;
        this.waterContainmentMax = static_sq_waterContainmentMax;
        this.waterContainmentTransferRate = static_sq_waterContainmentTransferRate;
        this.darken = false;
        this.renderWithColorRange = true;
        this.baseColor = "#dbdadf";
        this.baseColorAmount = rock_baseColorAmount;
        this.darkColor = "#65666a";
        this.darkColorAmount = rock_darkColorAmount;
        this.accentColor = "#b5a7a6";
        this.accentColorAmount = rock_accentColorAmount;
    }
    physics() {}
    physicsBefore() {}
    calculateGroup() {}
}

export { RockSquare }