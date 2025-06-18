import { BaseSquare } from "../BaseSqaure.js";
import { getNeighbors, getSquares } from "../_sqOperations.js";
import { cachedGetWaterflowRate, hexToRgb, randRange } from "../../common.js";
import { getCurTimeScale, getDt, getFrameDt, timeScaleFactor } from "../../climate/time.js";
import { getPressure, getWindSpeedAtLocation, getWindSquareAbove } from "../../climate/simulation/wind.js";
import { addWaterSaturationPascals, getTemperatureAtWindSquare, getWaterSaturation, pascalsPerWaterSquare, saturationPressureOfWaterVapor, temperatureHumidityFlowrateFactor } from "../../climate/simulation/temperatureHumidity.js";
import { loadGD, UI_LIGHTING_SURFACE, UI_PALETTE_COMPOSITION, UI_PALETTE_SOILIDX, UI_SOIL_COMPOSITION, UI_SOIL_INITALWATER } from "../../ui/UIData.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { addSquareByName } from "../../manipulation.js";
import { getBaseSize } from "../../canvas.js";
import { applyLightingFromSource, getDefaultLighting } from "../../lighting/lightingProcessing.js";

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

// https://docs.google.com/spreadsheets/d/1MWOde96t-ruC5k1PLL4nex0iBjdyXKOkY7g59cnaEj4/edit?gid=0#gid=0
export function getBasePercolationRate(sand, silt, clay) {
    let clayRate = 2;
    let siltRate = 1.5;
    let sandRate = 0.92;
    let power = 10;
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

        this.colorVariant = loadGD(UI_PALETTE_SOILIDX) % getActiveClimate().soilColors.length;

        // generic loam
        this.sand = 0.40;
        this.silt = 0.40;
        this.clay = 0.20;
        // nutrients normalized to "pounds per acre" per farming websites
        this.ph = 7;
        this.nitrogen = 50;
        this.phosphorus = 25;

        this.surface = true;
        this.surfaceLightingFactor = loadGD(UI_LIGHTING_SURFACE);
        this.percolationFactor = 0.99;

        this.setVariant();
    }

    reset() {
        super.reset();
    }

    setVariant() {
        let arr = loadGD(UI_PALETTE_COMPOSITION);
        this.sand = arr[0];
        this.silt = arr[1];
        this.clay = arr[2];
        this.randomize();
    }

    randomize() {
        let rand1 = (Math.random() - 0.5) * 0.3;
        let rand2 = (Math.random() - 0.5) * 0.3;
        let rand3 = (Math.random() - 0.5) * 0.3;
        this.clay *= (1 + rand1);
        this.silt *= (1 + rand2);
        this.sand *= (1 + rand3);

        let sum = this.clay + this.silt + this.sand;

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

    getInversePressureGeneric(waterContainment, refArr) {
        return this.getPressureGeneric(waterContainment, Array.from(refArr.map((vec) => [vec[1], vec[0]])));
    }

    getPressureGeneric(waterContainment, refArr) {
        if (refArr.length === 0) {
            return 0;
        }

        let lower = refArr[0];
        let upper = refArr[refArr.length - 1];

        if (waterContainment <= lower[0]) {
            return lower[1];
        }
        if (waterContainment >= upper[0]) {
            return upper[1];
        }

        for (let i = 0; i < refArr.length; i++) {
            let entry = refArr[i];
            if (entry[0] < waterContainment && entry[0] > lower[0]) {
                lower = entry;
            }
            if (entry[0] > waterContainment && entry[0] < upper[0]) {
                upper = entry;
            }
        }

        let t = (waterContainment - lower[0]) / (upper[0] - lower[0]);
        let interpolated = lower[1] + t * (upper[1] - lower[1]);
        return interpolated;
    }

    getInverseMatricPressure(waterPressure) {
        return (
            this.clay * this.getInversePressureGeneric(waterPressure, clayMatricPressureMap)
            + this.silt * this.getInversePressureGeneric(waterPressure, siltMatricPressureMap)
            + this.sand * this.getInversePressureGeneric(waterPressure, sandMatricPressureMap)
        );
    }

    getMatricPressure(waterContainment) {
        return (
            this.clay * this.getPressureGeneric(waterContainment, clayMatricPressureMap)
            + this.silt * this.getPressureGeneric(waterContainment, siltMatricPressureMap)
            + this.sand * this.getPressureGeneric(waterContainment, sandMatricPressureMap)
        );
    }
    getGravitationalPressure() {
        return -0.02 * 9.8 * this.posY;
    }

    getSoilWaterPressure() {
        return this.getMatricPressure(this.waterContainment);
    }

    percolateInnerMoisture() {
        if (Math.random() < this.percolationFactor) {
            return;
        }
        let startWaterContainment = this.waterContainment;
        getNeighbors(this.posX, this.posY)
            .filter((sq) => sq.proto == this.proto)
            .filter((sq) => {
                if (sq.waterContainment < sq.waterContainmentMax) {
                    return true;
                } else {
                    return false;
                }
            })
            .forEach((sq) => {
                let thisWaterPressure = this.getMatricPressure(this.waterContainment);
                let sqWaterPressure = sq.getMatricPressure(sq.waterContainment) + (sq.getGravitationalPressure() - this.getGravitationalPressure());

                if (isNaN(thisWaterPressure) || isNaN(sqWaterPressure)) {
                    return;
                }
                if (thisWaterPressure < sqWaterPressure || thisWaterPressure < -2) {
                    return;
                }
                let meanPressure = (thisWaterPressure + sqWaterPressure) / 2;
                let meanPressureWaterContainment = this.getInverseMatricPressure(meanPressure);
                let thisDiff = (this.waterContainment - meanPressureWaterContainment) / this.getWaterflowRate();
                let sqDiff = (this.waterContainment - meanPressureWaterContainment) / sq.getWaterflowRate();
                let diff = Math.min(thisDiff, sqDiff) / 2;
                diff = Math.min(this.waterContainment, Math.max(0, Math.min(diff, sq.waterContainmentMax - sq.waterContainment)));
                this.waterContainment -= diff;
                sq.waterContainment += diff;
            });

        let endWaterContainment = this.waterContainment;
        let diff = startWaterContainment - endWaterContainment;

        let min = 0.00001;
        let max = 0.001;
        let minP = 0.97;
        let maxP = 0;

        let nextPercolationFactor = null;
        if (diff < min) {
            nextPercolationFactor = minP;
        } else if (diff > max) {
            nextPercolationFactor = maxP;
        } else {
            let invLerp = (diff - min) / (max - min);
            nextPercolationFactor = (maxP - minP) * invLerp + minP;
        }

        nextPercolationFactor ** 0.1;
        this.percolationFactor = this.percolationFactor * 0.5 + 0.5 * nextPercolationFactor;

        if (this.waterContainment < this.waterContainmentMax) {
            return;
        }
        this.outflowNewWaterToLocation(this.posX, this.posY);
        this.outflowNewWaterToLocation(this.posX + 1, this.posY);
        this.outflowNewWaterToLocation(this.posX - 1, this.posY);
    }

    outflowNewWaterToLocation(posX, posY) {
        if (getSquares(posX, posY).some((sq) => (!sq.surface && sq.collision))) {
            return;
        }
        let outflowWaterAmount = (this.waterContainment - this.getInverseMatricPressure(-2)) / this.getWaterflowRate();
        if (outflowWaterAmount < Math.random() * 0.125) {
            return;
        }
        let newWater = addSquareByName(posX, posY, "water");
        if (newWater) {
            newWater.blockHealth = outflowWaterAmount;
            this.waterContainment -= outflowWaterAmount;
            applyLightingFromSource(this, newWater);
            newWater.frameCacheLighting = null;
            newWater.processLighting(true);
        }
    }

    percolateFromWater(waterBlock) {
        if (this.waterContainmentMax == 0 || this.waterContainment >= this.waterContainmentMax) {
            return 0;
        }
        let maxWaterflowRate = (this.waterContainmentMax) / (this.getWaterflowRate());
        let amountToPercolate = Math.min(this.waterContainmentMax - this.waterContainment, Math.min(waterBlock.blockHealth), maxWaterflowRate);
        this.waterContainment += amountToPercolate;
        return amountToPercolate;
    }

    slopeConditional() {
        if (this.gravity == 0 || this.speedY > 0) {
            return;
        }

        if (Math.random() < 0.2) {
            return;
        }

        if (!this.hasBonked) {
            return;
        }

        if (this.linkedOrganismSquares.some((lsq) => lsq.type == "root") || this.linkedOrganisms.length > 0) {
            return;
        }

        if (
            getSquares(this.posX + 1, this.posY).some((sq) => sq.testCollidesWithSquare(this)) &&
            getSquares(this.posX - 1, this.posY).some((sq) => sq.testCollidesWithSquare(this))
        ) {
            return;
        }

        let min = 0.7 * (this.getWaterflowRate() ** 0.3);
        let max = 1.5 * (this.getWaterflowRate() ** 0.3);

        if (this.currentPressureDirect < min) {
            return;
        }
        let shouldDo = false;
        if (this.currentPressureDirect > max) {
            shouldDo = true;
        } else {
            shouldDo = Math.random() < ((this.currentPressureDirect - min) / (max - min) ** 4);
        }

        shouldDo &= (Math.random() > 0.99 * (this.waterContainment / this.waterContainmentMax));
        return shouldDo;
    }

    slopePhysics() {
        if (!this.slopeConditional()) {
            return;
        }
        if (!getSquares(this.posX - 1, this.posY).some((sq) => sq.testCollidesWithSquare(this)))
            this.updatePosition(this.posX - 1, this.posY);
        else if (!getSquares(this.posX + 1, this.posY).some((sq) => sq.testCollidesWithSquare(this)))
            this.updatePosition(this.posX + 1, this.posY);
    }

    windPhysics() {
        if (getSquares(this.posX, this.posY - 1).some((sq) => sq.testCollidesWithSquare(this))) {
            return;
        }
        let ws = getWindSpeedAtLocation(this.posX, this.posY);
        let maxWindSpeed = 2;

        let wx = Math.min(Math.max(ws[0], -maxWindSpeed), maxWindSpeed);
        let wy = Math.min(Math.max(ws[1], -maxWindSpeed), maxWindSpeed);

        let px = Math.abs(wx) / maxWindSpeed;
        let py = Math.abs(wy) / maxWindSpeed;

        if (Math.random() < px) {
            this.speedX += Math.round(wx);
        }
        if (Math.random() < py) {
            this.speedY += Math.round(wy);

        }

    }
    getWaterflowRate() {
        return cachedGetWaterflowRate(this.sand, this.silt, this.clay);
    }
    triggerParticles(bonkSpeed) {
        return;
        if (Date.now() < this.spawnTime + 100) {
            return;
        }
        let numParticles = (bonkSpeed / (this.getWaterflowRate() ** 0.3));

        for (let i = 0; i < numParticles; i++) {
            let speed = randRange(0, (bonkSpeed ** 0.22) - 1);
            let theta = randRange(0, 2 * Math.PI);
            let speedX = speed * Math.cos(theta);
            let speedY = speed * Math.sin(theta);
            let wrp = 0.7 * (getBaseSize() * (this.getWaterflowRate() * 0.1 + 40 * 0.9) / 30) ** 0.2;
            let size = randRange(wrp * 0.5, wrp * 2);
            this.activeParticles.push([this.posX, this.posY, theta, speedX, speedY, size])
        }
    }

    getColorBase() {
        let outColor = getActiveClimate().getBaseSoilColor(this.colorVariant, this.sand, this.silt, this.clay);
        let darkeningColorMult = (this.waterContainment / this.waterContainmentMax);

        outColor.r *= (1 - 0.24 * darkeningColorMult);
        outColor.g *= (1 - 0.30 * darkeningColorMult);
        outColor.b *= (1 - 0.383 * darkeningColorMult);
        return outColor;
    }
    // soil nutrients

    takeNitrogen(requestedAmount, proto) {
        // let meanAmount = this.nitrogen * growthCycleFrac;
        // requestedAmount = Math.max(meanAmount / 2, requestedAmount);
        // requestedAmount = Math.min(meanAmount * 2, requestedAmount);
        // this.nitrogen -= requestedAmount;
        return requestedAmount * this.getNutrientRate(proto);
    }

    takePhosphorus(requestedAmount, proto) {
        // let meanAmount = this.phosphorus * growthCycleFrac;
        // requestedAmount = Math.max(meanAmount / 2, requestedAmount);
        // requestedAmount = Math.min(meanAmount * 2, requestedAmount);
        // this.phosphorus -= requestedAmount;
        return requestedAmount * this.getNutrientRate(proto);
    }

    waterEvaporationRoutine() {
        let adjacentWindSquare = getWindSquareAbove(this.posX, this.posY);
        let x = adjacentWindSquare[0];
        let y = adjacentWindSquare[1];
        if (x < 0 || y < 0 || this.waterContainment <= 0.01) {
            return;
        }
        let airWaterPressure = getWaterSaturation(x, y);
        let myVaporPressure = (this.waterContainment / this.waterContainmentMax) * saturationPressureOfWaterVapor(getTemperatureAtWindSquare(x, y));
        if (airWaterPressure > myVaporPressure) {
            return;
        }
        let pascals = (myVaporPressure - airWaterPressure);
        pascals /= (8 * temperatureHumidityFlowrateFactor());

        pascals *= Math.exp(-0.01 * (this.posY - (y * 4)));
        let amount = Math.min(this.waterContainment, (10 * pascals) / pascalsPerWaterSquare)
        this.waterContainment -= amount;
        addWaterSaturationPascals(x, y, pascals);
    }
}
