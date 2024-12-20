import { BaseSquare } from "./BaseSqaure.js";
import {
    wds_sq_waterContainmentMax,
    wds_sq_waterTransferRate
    } from "../config/config.js"
    
class WaterDistributionSquare extends BaseSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "WaterDistributionSquare";
        this.colorBase = "#000500";
        this.physicsEnabled = false;
        this.waterContainmentMax = wds_sq_waterContainmentMax;
        this.waterContainmentTransferRate = wds_sq_waterTransferRate;
    }

}

export {WaterDistributionSquare}