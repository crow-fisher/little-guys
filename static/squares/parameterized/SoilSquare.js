import { BaseSquare } from "../BaseSqaure.js";
import { dirtNutrientValuePerDirectNeighbor } from "../../config/config.js";

import { dirt_baseColorAmount, dirt_darkColorAmount, dirt_accentColorAmount } from "../../config/config.js";
import { getNeighbors } from "../_sqOperations.js";

export class SoilSquare extends BaseSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "SoilSquare";
        this.colorBase = "#B06C49";
        this.nutrientValue = dirtNutrientValuePerDirectNeighbor;
        this.rootable = true;
        this.validPlantHome = true;
        
        this.baseColor = "#b88a5f";
        this.baseColorAmount = dirt_baseColorAmount;
        this.darkColor = "#855c48";
        this.darkColorAmount = dirt_darkColorAmount;
        this.accentColor = "#bf9e7c";
        this.accentColorAmount = dirt_accentColorAmount;


        // generic loam
        this.sand = 0.40;
        this.silt = 0.40;
        this.clay = 0.20;
        this.waterContainment = 0;
    }

    getPressureGeneric(waterCapacity, refArr) {
        if (refArr.length === 0) {
            return 0;
        }
    
        var lower = refArr[0];
        var upper = refArr[refArr.length - 1];

        if (waterCapacity <= lower[0]) {
            return lower[1];
        }
        if (waterCapacity >= upper[0]) {
            return upper[1];
        }
    
        for (var i = 0; i < refArr.length; i++) {
            var entry = refArr[i];
            if (entry[0] < waterCapacity && entry[0] > lower[0]) {
                lower = entry;
            }
            if (entry[0] > waterCapacity && entry[0] < upper[0]) {
                upper = entry;
            }
        }
    
        var t = (waterCapacity - lower[0]) / (upper[0] - lower[0]);
        var interpolated = lower[1] + t * (upper[1] - lower[1]);
        return interpolated;
    }
    

    getMatricPressure() {
        var clayMap = [
            [0, -7],
            [0.28, -4.2],
            [0.45, -2.5],
            [0.48, -2],
            [0.49, 0]
        ];
        // using "loam" number as silt
        var siltMap = [
            [0, -7],
            [0.09, -4.2],
            [0.15, -2.3],
            [0.26, -2],
            [0.42, 0]
        ];
        var sandMap = [
            [0, -7],
            [0.06, -2],
            [0.40, 0]
        ]

        return (
            this.clay * this.getPressureGeneric(this.waterContainment, clayMap)
             + this.silt * this.getPressureGeneric(this.waterContainment, siltMap)
             + this.sand * this.getPressureGeneric(this.waterContainment, sandMap)
        );
    }

    getGravitationalPressure() {
        // -10 * 9.8 * (height in meters) and one block is one meter for hpa 
        return -0.1 * 9.8 * this.currentPressureDirect; 
    }

    getSoilWaterPressure() {
        return this.getGravitationalPressure() + this.getMatricPressure();
    }

    percolateInnerMoisture() {
        getNeighbors(this.posX, this.posY)
            .filter((sq) => sq.proto == this.proto)
            .forEach((sq) => {
                var thisWaterPressure = this.getSoilWaterPressure();
                var sqWaterPressure = sq.getSoilWaterPressure();
                if (thisWaterPressure > sqWaterPressure) {
                    var diff = (this.waterContainment - sq.waterContainment) / 3;
                    this.waterContainment -= diff;
                    sq.waterContainment += diff;
                }
            })
    }

    renderWaterSaturation() {
        var v = -this.getSoilWaterPressure();
        // var v = -this.getMatricPressure();
        // var v = -this.getGravitationalPressure();
        v = Math.max(0, Math.min(v, 10));
        
        this.renderSpecialViewModeLinear(this.blockHealth_color2, this.blockHealth_color1,v, 10);
    }

}
