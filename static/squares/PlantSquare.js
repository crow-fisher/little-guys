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
        this.baseColor = "#FF8873";
        this.darkColor = "#46FF1D";
        this.accentColor = "#246AFF";

        this.waterContainmentMax = static_sq_waterContainmentMax;
        this.waterContainmentTransferRate = static_sq_waterContainmentTransferRate;
        this.organic = true;
        this.physicsEnabled = false;
        this.collision = false;
        this.visible = true;
    }
}

export {PlantSquare}