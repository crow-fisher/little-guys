import { BaseSquare } from "./BaseSqaure.js";

import {
    drain_sq_waterTransferRate,
    rock_accentColorAmount,
    rock_baseColorAmount,
    rock_darkColorAmount
    } from "../config/config.js"
    
import { WaterSquare } from "./WaterSquare.js";
import { addSquare } from "./_sqOperations.js";
class DrainSquare extends BaseSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "DrainSquare";
        this.physicsEnabled = false;
        this.waterContainmentMax = 1;
        this.waterContainmentTransferRate = drain_sq_waterTransferRate;
        this.baseColor = "#dbdadf";
        this.baseColorAmount = rock_baseColorAmount;
        this.darkColor = "#65666a";
        this.darkColorAmount = rock_darkColorAmount;
        this.accentColor = "#b5a7a6";
        this.accentColorAmount = rock_accentColorAmount;
    }

    percolateInnerMoisture() {
        if (this.waterContainment <= 0) {
            return 0;
        }
        if (this.waterContainment >= 1) {
            var sq = new WaterSquare(this.posX, this.posY + 1);
            if (addSquare(sq)) {
                sq.blockHealth = Math.min(sq.blockHealth, this.waterContainment);
                this.waterContainment -= sq.blockHealth;
                }
        }
    }

    calculateColor() {
        var baseColorRGB = hexToRgb(this.colorBase);
        return rgbToHex(Math.floor(baseColorRGB.r), Math.floor(baseColorRGB.g), Math.floor(baseColorRGB.b));
    }
}

export {DrainSquare}