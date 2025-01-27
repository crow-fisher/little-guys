import { BaseSquare } from "../BaseSqaure.js";
import { dirtNutrientValuePerDirectNeighbor } from "../../config/config.js";

import { dirt_baseColorAmount, dirt_darkColorAmount, dirt_accentColorAmount } from "../../config/config.js";
import { getNeighbors } from "../_sqOperations.js";
import { rgbToHex } from "../../common.js";
import { BASE_SIZE, MAIN_CONTEXT, zoomCanvasFillRect } from "../../index.js";

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

        // maps in form "water containment" / "matric pressure in atmospheres"
        this.clayMap = [
            [0, -7],
            [0.28, -4.2],
            [0.45, -2.5],
            [0.48, -2],
            [0.49, 0]
        ];
        this.siltMap = [
            [0, -7],
            [0.09, -4.2],
            [0.15, -2.3],
            [0.26, -2],
            [0.42, 0]
        ];
        this.sandMap = [
            [0, -7],
            [0.06, -2],
            [0.40, 0]
        ]
    }

    loadInverseMatricPressureMap() {
        for (let i = 0; i < 0.5; i += 0.001) {
            var pressure = this._getMatricPressure(i);
            this.inverseMatricPressureMap[pressure] = i; 
        }
    }

    getInversePressureGeneric(waterCapacity, refArr) {
        return this.getPressureGeneric(waterCapacity, Array.from(refArr.map((vec) => [vec[1], vec[0]])));
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
    
    getInverseMatricPressure(waterPressure) {
        return (
            this.clay * this.getInversePressureGeneric(waterPressure, this.clayMap)
             + this.silt * this.getInversePressureGeneric(waterPressure, this.siltMap)
             + this.sand * this.getInversePressureGeneric(waterPressure, this.sandMap)
        )
    }

    getMatricPressure() {
        return (
            this.clay * this.getPressureGeneric(this.waterContainment, this.clayMap)
             + this.silt * this.getPressureGeneric(this.waterContainment, this.siltMap)
             + this.sand * this.getPressureGeneric(this.waterContainment, this.sandMap)
        )
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
                var thisWaterPressure = this.getMatricPressure(); 
                var sqWaterPressure = sq.getMatricPressure() + (sq.getGravitationalPressure() - this.getGravitationalPressure());

                if (thisWaterPressure < sqWaterPressure || thisWaterPressure < -2) {
                    return;
                }
                var meanPressure = (thisWaterPressure + sqWaterPressure) / 2;
                var meanPressureWaterContainment = this.getInverseMatricPressure(meanPressure);
                var diff = (this.waterContainment - meanPressureWaterContainment) / 20;
                this.waterContainment -= diff;
                sq.waterContainment += diff;
            })
    }

    // renderWaterSaturation() {
    //     // var v = -this.getSoilWaterPressure();
    //     var v = -this.getMatricPressure();
    //     // var v = -this.getGravitationalPressure();
    //     v = Math.max(0, Math.min(v, 10)); 

    //     this.renderSpecialViewModeLinear(this.blockHealth_color2, this.blockHealth_color1,v, 10);
    // }

    waterEvaporationRoutine() {}
    
    renderWaterSaturation() {
        var r = Math.min(((-this.getSoilWaterPressure()) / 7) * 255, 255)
        var g = Math.min(((-this.getMatricPressure(this.waterContainment)) / 7) * 255, 255)
        var b = Math.min(((-this.getGravitationalPressure()) / 7) * 255, 255)

        r = 0;
        // g = 0;
        b = 0;
        MAIN_CONTEXT.fillStyle = rgbToHex(r, g, b);
        zoomCanvasFillRect(
            (this.offsetX + this.posX) * BASE_SIZE,
            (this.offsetY + this.posY) * BASE_SIZE,
            BASE_SIZE,
            BASE_SIZE
        );
    }

}
