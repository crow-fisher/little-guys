import { BaseSquare } from "../BaseSqaure.js";
import { getNeighbors, getSquares } from "../_sqOperations.js";
import { hexToRgb } from "../../common.js";
import { timeScaleFactor } from "../../climate/time.js";
import { getPressure, getWindSquareAbove } from "../../climate/wind.js";
import { addWaterSaturationPascals, getWaterSaturation, pascalsPerWaterSquare, saturationPressureOfWaterVapor } from "../../climate/temperatureHumidity.js";
import { loadUI, UI_SOIL_COMPOSITION, UI_SOIL_INITALWATER } from "../../ui/UIData.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { addSquareByName } from "../../manipulation.js";

// maps in form "water containment" / "matric pressure in atmospheres"
export const clayMatricPressureMap = [
    [0, -7],
    [0.28, -4.2],
    [0.45, -2.5],
    [0.48, -2],
    [0.49, 0]
];
export const siltMatricPressureMap = [
    [0, -7],
    [0.09, -4.2],
    [0.15, -2.3],
    [0.26, -2],
    [0.42, 0]
];
export const sandMatricPressureMap = [
    [0, -7],
    [0.06, -2],
    [0.40, 0]
]

export function getBaseSoilColor(sand, silt, clay) {
    let clayColorRgb = getActiveClimate().soilColorClay;
    let siltColorRgb = getActiveClimate().soilColorSilt;
    let sandColorRgb = getActiveClimate().soilColorSand;
    return {
        r: clay * clayColorRgb.r + silt * siltColorRgb.r + sand * sandColorRgb.r, 
        g: clay * clayColorRgb.g + silt * siltColorRgb.g + sand * sandColorRgb.g, 
        b: clay * clayColorRgb.b + silt * siltColorRgb.b + sand * sandColorRgb.b
    }
}

// https://docs.google.com/spreadsheets/d/1MWOde96t-ruC5k1PLL4nex0iBjdyXKOkY7g59cnaEj4/edit?gid=0#gid=0
export function getBasePercolationRate(sand, silt, clay) {
    var clayRate = 2;
    var siltRate = 1.5;
    var sandRate = 0.92;
    var power = 10;
    return (sand * sandRate +
        silt * siltRate +
        clay * clayRate) ** power;
}

export function getBaseNutrientRate(sand, silt, clay) {
    return sand + silt * 2 + clay * 4
}

export class SoilSquare extends BaseSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "SoilSquare";
        this.colorBase = "#B06C49";
        this.rootable = true;

        this.clayColorRgb = getActiveClimate().clayColorRgb;
        this.siltColorRgb = getActiveClimate().siltColorRgb;
        this.sandColorRgb = getActiveClimate().sandColorRgb;

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

        this.soilWaterPressureAbove = -1;

        this.setVariant();
    }

    reset() {
        super.reset();
        this.soilWaterPressureAbove = -1;
    }

    calculateWaterPressureAboveFieldCapacity() {
        return Math.max(0, this.getSoilWaterPressure() + 2);
    }

    getSoilWaterPressureAbove() {
        this.soilWaterPressureAbove = 0;
        if (getSquares(this.posX, this.posY - 1).some((sq) => sq.proto == "WaterSquare")) {
            this.soilWaterPressureAbove = 2;
        }
        else if (this.currentPressureDirect != 0) {
            this.soilWaterPressureAbove = 0;
            getSquares(this.posX, this.posY - 1)
                .filter((sq) => sq.proto == "SoilSquare" || sq.proto == "RockSquare")
                .forEach((sq) => {
                    let sqAboveExtraPressure = sq.calculateWaterPressureAboveFieldCapacity();
                    if (sqAboveExtraPressure == 0) {
                        return;
                    }
                    this.soilWaterPressureAbove = sqAboveExtraPressure + sq.getSoilWaterPressureAbove();
                });
        }
        return this.soilWaterPressureAbove;
    }

    setVariant() {
        let arr = loadUI(UI_SOIL_COMPOSITION);
        this.sand = arr[0];
        this.silt = arr[1];
        this.clay = arr[2];
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
        this.waterContainment = this.getInverseMatricPressure(loadUI(UI_SOIL_INITALWATER));
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
            this.clay * this.getInversePressureGeneric(waterPressure, clayMatricPressureMap)
             + this.silt * this.getInversePressureGeneric(waterPressure, siltMatricPressureMap)
             + this.sand * this.getInversePressureGeneric(waterPressure, sandMatricPressureMap)
        )
    }

    getMatricPressure() {
        return (
            this.clay * this.getPressureGeneric(this.waterContainment, clayMatricPressureMap)
             + this.silt * this.getPressureGeneric(this.waterContainment, siltMatricPressureMap)
             + this.sand * this.getPressureGeneric(this.waterContainment, sandMatricPressureMap)
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
            .filter((sq) => sq.waterContainment < sq.waterContainmentMax)
            .forEach((sq) => {
                var thisWaterPressure = this.getMatricPressure();
                var sqWaterPressure = sq.getMatricPressure() + 
                    (sq.getGravitationalPressure() - this.getGravitationalPressure());

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
                    sq.physics();
                });

            if (getSquares(this.posX + side, this.posY).some((sq) => sq.collision)) {
                continue;
            }

            var pressureToOutflowWaterContainment = this.getInverseMatricPressure(thisWaterPressure - 2);
            var diff = (this.waterContainment - pressureToOutflowWaterContainment) / this.getWaterflowRate();

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
        var outColor = getBaseSoilColor(this.sand, this.silt, this.clay);
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
        var adjacentWindSquare = getWindSquareAbove(this.posX, this.posY);
        var x = adjacentWindSquare[0];
        var y = adjacentWindSquare[1];

        var xd = this.posX % 4;
        var yd = this.posY % 4;

        if (x < 0 || y < 0 || this.waterContainment <= 0.01) {
            return;
        }

        if (getPressure(x + xd, y + yd) > 0) {
            x += xd;
            y += yd;
        }

        var airWaterPressure = getWaterSaturation(x, y);
        var myVaporPressure = (this.waterContainment / this.waterContainmentMax) * saturationPressureOfWaterVapor(this.temperature) / ((this.currentPressureDirect + 1) ** 0.2);
        if (airWaterPressure > myVaporPressure) {
            return;
        }
        
        var pascals = (myVaporPressure - airWaterPressure);
        pascals /= timeScaleFactor();

        var amount = Math.min(this.waterContainment, (pascals / (pascalsPerWaterSquare / timeScaleFactor())));
        this.waterContainment -= amount;
        addWaterSaturationPascals(x, y, pascals);
    }
}
