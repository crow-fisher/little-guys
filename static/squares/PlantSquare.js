import { BaseSquare } from "./BaseSqaure.js";
import {
    static_sq_waterContainmentMax,
    static_sq_waterContainmentTransferRate
    } from "../config/config.js"
    

class PlantSquare extends BaseSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "PlantSquare";
        // this.colorBase = "#4CB963";
        this.colorBase = "#FF3366";
        this.waterContainmentMax = static_sq_waterContainmentMax;
        this.waterContainmentTransferRate = static_sq_waterContainmentTransferRate;
        this.organic = true;
        this.collision = false;
        this.visible = false;
    }
}

export {PlantSquare}