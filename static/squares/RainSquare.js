import { BaseSquare } from "./BaseSqaure.js";
import { RockSquare } from "./RockSquare.js";
import {
    global_plantToRealWaterConversionFactor,
    b_sq_waterContainmentMax,
    b_sq_nutrientValue,
    static_sq_waterContainmentMax,
    static_sq_waterContainmentTransferRate,
    drain_sq_waterContainmentMax,
    drain_sq_waterTransferRate,
    wds_sq_waterContainmentMax,
    wds_sq_waterContainmentTransferRate,
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
    
import { addSquare, getSquares } from "./_sqOperations.js";
import { WaterSquare } from "./WaterSquare.js";
import { randNumber } from "../common.js";

class RainSquare extends RockSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "RainSquare";
        this.colorBase = "#59546C";
        this.collision = false;
    }
    physics() {
        if (Math.random() > (1 - rain_dropChance.value)) {
            var newSq = addSquare(new WaterSquare(this.posX, this.posY + 1));
            if (newSq) {
                newSq.blockHealth = rain_dropHealth.value;
                newSq.speedX = randNumber(-1, 1);
            };
        }
    }
}
class HeavyRainSquare extends RockSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "HeavyRainSquare";
        this.colorBase = "#38405F";
        this.collision = false;
    }
    physics() {
        if (Math.random() > (1 - heavyrain_dropChance.value)) {
            var newSq = addSquare(new WaterSquare(this.posX, this.posY + 1));
            if (newSq) {
                newSq.blockHealth = rain_dropHealth.value;
                newSq.speedX = randNumber(-2, 2);
            };
        }
    }
}

class AquiferSquare extends BaseSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.physicsEnabled = false;
        this.proto = "AquiferSquare";
        this.colorBase = "#0E131F";
    }
    physics() {
        if (getSquares(this.posX, this.posY + 1).length == 0) {
            var sq = addSquare(new WaterSquare(this.posX, this.posY + 1));
            if (sq) {
                sq.speedX = randNumber(-2, 2);
            }
        }
    }
}

export {RainSquare, HeavyRainSquare, AquiferSquare}