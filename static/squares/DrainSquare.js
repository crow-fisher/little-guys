import { BaseSquare } from "./BaseSqaure.js";

import {
    global_plantToRealWaterConversionFactor,
    b_sq_waterContainmentMax,
    b_sq_nutrientValue,
    static_sq_waterContainmentMax,
    static_sq_waterContainmentTransferRate,
    drain_sq_waterContainmentMax,
    drain_sq_waterTransferRate,
    wds_sq_waterContainmentMax,
    wds_sq_waterTransferRate,
    b_sq_waterContainmentTransferRate,
    b_sq_waterContainmentEvaporationRate,
    b_sq_darkeningStrength,
    d_sq_nutrientValue,
    rain_dropChance,
    heavyrain_dropChance,
    rain_dropHealth,
    water_evaporationRate,
    water_viscocity,
    water_darkeningStrength,
    po_airSuckFrac,
    po_waterSuckFrac,
    po_rootSuckFrac,
    po_perFrameCostFracPerSquare,
    po_greenSquareSizeExponentCost,
    po_rootSquareSizeExponentCost,
    p_ls_airNutrientsPerExposedNeighborTick,
    p_seed_ls_sproutGrowthRate,
    p_seed_ls_neighborWaterContainmentRequiredToGrow,
    p_seed_ls_neighborWaterContainmentRequiredToDecay,
    p_seed_ls_darkeningStrength
    } from "../config/config.js"
    
class DrainSquare extends BaseSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "DrainSquare";
        this.colorBase = "#555555";
        this.physicsEnabled = false;
        this.waterContainmentMax = drain_sq_waterContainmentMax;
        this.waterContainmentTransferRate = drain_sq_waterTransferRate;
    }

    percolateInnerMoisture() {
        if (this.waterContainment <= 0) {
            return 0;
        }

        for (var i = -1; i < 2; i++) {
            for (var j = -1; j < 2; j++) {
                if (i == 0 && j == 0) {
                    continue;
                }
                if (abs(i) == abs(j)) {
                    continue;
                }
                if (this.waterContainment >= 1) {
                    if (addSquare(new WaterSquare(this.posX + i, this.posY + j))) {
                        this.waterContainment -= 1;
                    }
                }
            }
        }
    }

    calculateColor() {
        var baseColorRGB = hexToRgb(this.colorBase);
        return rgbToHex(Math.floor(baseColorRGB.r), Math.floor(baseColorRGB.g), Math.floor(baseColorRGB.b));
    }
}

export {DrainSquare}