import { BaseSquare } from "../BaseSqaure.js";
import { dirtNutrientValuePerDirectNeighbor } from "../../config/config.js";

import { dirt_baseColorAmount, dirt_darkColorAmount, dirt_accentColorAmount } from "../../config/config.js";
import { getNeighbors, getSquares } from "../_sqOperations.js";
import { hexToRgb, rgbToHex, rgbToRgba } from "../../common.js";
import { addSquareByName, BASE_SIZE, MAIN_CONTEXT, selectedViewMode, zoomCanvasFillRect } from "../../index.js";
import { getDaylightStrength, timeScaleFactor } from "../../time.js";
import { getAdjacentWindSquareToRealSquare, getWindSquareAbove } from "../../wind.js";
import { addWaterSaturationPascals, getTemperatureAtWindSquare, getWaterSaturation, pascalsPerWaterSquare, saturationPressureOfWaterVapor, updateWindSquareTemperature } from "../../temperatureHumidity.js";

// maps in form "water containment" / "matric pressure in atmospheres"
const clayMap = [
    [0, -7],
    [0.28, -4.2],
    [0.45, -2.5],
    [0.48, -2],
    [0.49, 0]
];
const siltMap = [
    [0, -7],
    [0.09, -4.2],
    [0.15, -2.3],
    [0.26, -2],
    [0.42, 0]
];
const sandMap = [
    [0, -7],
    [0.06, -2],
    [0.40, 0]
]

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

        this.clayColorRgb = hexToRgb("#773319");
        this.siltColorRgb = hexToRgb("#33251b");
        this.sandColorRgb = hexToRgb("#c99060");

        this.lightDarkeningColor = hexToRgb("#3C3A04");
        this.moonlightColor = hexToRgb("#F0F8FF");

        // generic loam
        this.sand = 0.40;
        this.silt = 0.40;
        this.clay = 0.20;
        // nutrients normalized to "pounds per acre" per farming websites
        this.ph = 7;
        this.nitrogen = 50;
        this.phosphorus = 25;
    }

    setType(type) {
        switch (type) {
            case "pureclay":
                this.clay = 100
                this.silt = 0
                break;
            case "clay":
                this.clay = 60;
                this.silt = 20;
                break;
            case "siltyclay":
                this.clay = 50;
                this.silt = 50;
                break;
            case "siltyclayloam":
                this.clay = 35;
                this.silt = 60;
                break;
            case "clayloam":
                this.clay = 35;
                this.silt = 35;
                break;
            case "siltloam":
                this.clay = 20;
                this.silt = 70;
                break;
            case "silt":
                this.silt = 90;
                this.clay = 5;
                break;
            case "sandyclay":
                this.clay = 40;
                this.silt = 10;
                break;
            case "sandyloam":
                this.clay = 10;
                this.silt = 0;
                break;
            case "sandyclayloam":
                this.clay = 30;
                this.silt = 20;
                break;
            case "sand": 
                this.clay = 10;
                this.silt = 10;
                break;
            case "loam":
                this.clay = 20;
                this.silt = 40;
                break;
        }
        this.clay /= 100;
        this.silt /= 100;
        this.sand = 1 - (this.clay + this.silt);
        this.randomize();
    }

    randomize() {
        var rand1 = (Math.random() - 0.5) * 0.3;
        var rand2 = (Math.random() - 0.5) * 0.3;
        var rand3 = (Math.random() - 0.5) * 0.3;
        this.clay *= (1 + rand1);
        this.silt *= (1 + rand2);
        this.sand *= (1 + rand3);

        var sum = this.clay + this.silt + this.sand;

        this.clay *= (1 / sum);
        this.silt *= (1 / sum);
        this.sand *= (1 / sum);

        this.clay = Math.min(Math.max(this.clay, 0), 1);
        this.silt = Math.min(Math.max(this.silt, 0), 1);
        this.sand = Math.min(Math.max(this.sand, 0), 1);

        this.initWaterContainment();
    }

    initWaterContainment() {
        this.waterContainment = this.getInverseMatricPressure(-3);
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
            this.clay * this.getInversePressureGeneric(waterPressure, clayMap)
             + this.silt * this.getInversePressureGeneric(waterPressure, siltMap)
             + this.sand * this.getInversePressureGeneric(waterPressure, sandMap)
        )
    }

    getMatricPressure() {
        return (
            this.clay * this.getPressureGeneric(this.waterContainment, clayMap)
             + this.silt * this.getPressureGeneric(this.waterContainment, siltMap)
             + this.sand * this.getPressureGeneric(this.waterContainment, sandMap)
        )
    }
    getGravitationalPressure() {
        return -0.02 * 9.8 * this.currentPressureDirect; 
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

                if (isNaN(thisWaterPressure) || isNaN(sqWaterPressure)) {
                    return;
                }
                if (thisWaterPressure < sqWaterPressure || thisWaterPressure < -2) {
                    return;
                }
                var meanPressure = (thisWaterPressure + sqWaterPressure) / 2;
                var meanPressureWaterContainment = this.getInverseMatricPressure(meanPressure);
                var thisDiff = (this.waterContainment - meanPressureWaterContainment) / this.getWaterflowRate();
                var sqDiff = (this.waterContainment - meanPressureWaterContainment) / sq.getWaterflowRate();
                var diff = Math.min(thisDiff, sqDiff) / 2;
                diff = Math.min(this.waterContainment, Math.max(0, Math.min(diff, sq.waterContainmentMax - sq.waterContainment)));
                this.waterContainment -= diff;
                sq.waterContainment += diff;
            });
        this.doBlockOutflow();
    }

    doBlockOutflow() {
        return;
        var thisWaterPressure = this.getMatricPressure(); 

        if (thisWaterPressure < -2) {
            return;
        }

        for (let side = -1; side <= 1; side += 2) {
            getSquares(this.posX + side, this.posY).filter((sq) => sq.proto == "WaterSquare")
                .forEach((sq) => {
                    sq.frameFrozen = false;
                    sq.physics();
                });

            if (getSquares(this.posX + side, this.posY).some((sq) => sq.collision)) {
                continue;
            }

            var pressureToOutflowWaterContainment = this.getInverseMatricPressure(thisWaterPressure + 2);
            var diff = (this.waterContainment - pressureToOutflowWaterContainment) / this.getWaterflowRate();
            diff *= Math.abs(thisWaterPressure - -2);

            var newWater = addSquareByName(this.posX + side, this.posY, "water");
            if (newWater) {
                newWater.blockHealth = diff;
                this.waterContainment -= diff;
            }
        }
    }
    percolateFromWater(waterBlock) {
        if (this.waterContainmentMax == 0 || this.waterContainment >= this.waterContainmentMax) {
            return 0;
        }
        var maxWaterflowRate = (this.waterContainmentMax - this.waterContainment) / (this.getWaterflowRate() ** 0.5);
        var amountToPercolate = Math.min(waterBlock.blockHealth, maxWaterflowRate);
        this.waterContainment += amountToPercolate;
        return amountToPercolate;
    }

    getWaterflowRate() {
        // https://docs.google.com/spreadsheets/d/1MWOde96t-ruC5k1PLL4nex0iBjdyXKOkY7g59cnaEj4/edit?gid=0#gid=0
        var clayRate = 2;
        var siltRate = 1.5;
        var sandRate = 0.92;
        var power = 10;
        return (this.sand * sandRate + 
                this.silt * siltRate + 
                this.clay * clayRate) ** power;

    }

    getColorBase() {
        var outColor = {
            r: this.clay * this.clayColorRgb.r + this.silt * this.siltColorRgb.r + this.sand * this.sandColorRgb.r, 
            g: this.clay * this.clayColorRgb.g + this.silt * this.siltColorRgb.g + this.sand * this.sandColorRgb.g, 
            b: this.clay * this.clayColorRgb.b + this.silt * this.siltColorRgb.b + this.sand * this.sandColorRgb.b
        }

        var darkeningColorMult = (this.waterContainment / this.waterContainmentMax);

        outColor.r *= (1 - 0.24 * darkeningColorMult);
        outColor.g *= (1 - 0.30 * darkeningColorMult);
        outColor.b *= (1 - 0.383 * darkeningColorMult);
        return outColor;
    }

    // soil nutrients

    takeNitrogen(requestedAmount, growthCycleFrac) {
        let meanAmount = this.nitrogen * growthCycleFrac;
        requestedAmount = Math.max(meanAmount / 2, requestedAmount);
        requestedAmount = Math.min(meanAmount * 2, requestedAmount);
        this.nitrogen -= requestedAmount;
        return requestedAmount;
    }

    takePhosphorus(requestedAmount, growthCycleFrac) {
        let meanAmount = this.phosphorus * growthCycleFrac;
        requestedAmount = Math.max(meanAmount / 2, requestedAmount);
        requestedAmount = Math.min(meanAmount * 2, requestedAmount);
        this.phosphorus -= requestedAmount;
        return requestedAmount;
    }

    waterEvaporationRoutine() {
        return;
        var adjacentWindSquare = getAdjacentWindSquareToRealSquare(this.posX, this.posY);
        var x = adjacentWindSquare[0];
        var y = adjacentWindSquare[1];

        if (x < 0 || y < 0) {
            return;
        }
        var airWaterPressure = getWaterSaturation(x, y);
        var myVaporPressure = saturationPressureOfWaterVapor(this.temperature);
        if (airWaterPressure > myVaporPressure) {
            return;
        }
        var diff = (myVaporPressure - airWaterPressure) / 10;
        diff /= (this.getSoilWaterPressure()) ** 2;
        diff /= timeScaleFactor();
        var amount = Math.min(this.waterContainment, (diff / pascalsPerWaterSquare));
        this.waterContainment -= amount;
        this.temperature -= amount * this.water_vaporHeat;
        addWaterSaturationPascals(x, y, amount * pascalsPerWaterSquare);
    }
}
