import { BaseSquare } from "./BaseSqaure.js";
import { RockSquare } from "./RockSquare.js";
import {
    wds_sq_waterContainmentMax,
    wds_sq_waterTransferRate,
    rain_dropChance,
    heavyrain_dropChance,
    rain_dropHealth
    } from "../config/config.js"
    
import { addSquare, getSquares } from "./_sqOperations.js";
import { WaterSquare } from "./WaterSquare.js";
import { randNumber } from "../common.js";

class RainSquare extends RockSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "RainSquare";
        this.collision = false;
        this.baseColor = "#F5F5F5";
        this.darkColor = "#E5E4E2";
        this.accentColor = "#91A3B0";
    }
    physics() {
        if (Math.random() > (1 - rain_dropChance.value)) {
            var newSq = addSquare(new WaterSquare(this.posX, this.posY + 1));
            if (newSq) {
                newSq.blockHealth = rain_dropHealth.value;
                newSq.temperature = this.temperature;
                newSq.speedX = randNumber(-1, 1);
            };
        }
    }
    render() {
        if (!this.visible) {
            return;
        }
        this.renderWithVariedColors();
    }
}
class HeavyRainSquare extends RockSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "HeavyRainSquare";
        this.collision = false;
    
        this.baseColor = "#C0C0C0";
        this.darkColor = "#91A3B0";
        this.accentColor = "#BEBFC5";

        this.maxRainDrops = 30;
        this.curRainDrops = this.maxRainDrops / 2;
        this.rainRechargeRate = 0.03;
        this.raining = true;

    }
    physics() {
        if (this.raining) {
            if (this.curRainDrops < 0) {
                this.raining = false;
                return;
            }
            if (Math.random() > (1 - heavyrain_dropChance.value)) {
                var newSq = addSquare(new WaterSquare(this.posX, this.posY + 1));
                if (newSq) {
                    newSq.blockHealth = rain_dropHealth.value;
                    newSq.speedX = randNumber(-2, 2);
                    newSq.temperature = this.temperature;

                    this.curRainDrops -= 1;
                };
            }
        } else {
            if (this.curRainDrops > this.maxRainDrops) {
                this.raining = true;
            } else {
                this.curRainDrops += this.rainRechargeRate;
            }
        }
    }
    render() {
        if (!this.visible) {
            return;
        }
        this.renderWithVariedColors();
    }
}

class AquiferSquare extends BaseSquare {
    constructor(posX, posY) { 
        super(posX, posY);
        this.baseColor = "#E5E4E2";
        this.darkColor = "#C0C0C0";
        this.accentColor = "#708090";
        this.physicsEnabled = false;
        this.collision = false;
        this.proto = "AquiferSquare";
        this.waterContainmentMax = wds_sq_waterContainmentMax;
        this.waterContainmentTransferRate = wds_sq_waterTransferRate;
        this.opacity = 0.03;
    }
    physics() {
        if (getSquares(this.posX, this.posY + 1).length == 0) {
            var sq = addSquare(new WaterSquare(this.posX, this.posY + 1));
            if (sq) {
                sq.speedX = randNumber(-2, 2);
                sq.temperature = this.temperature;
            }
        }
    }
    render() {
        if (!this.visible) {
            return;
        }
        this.renderWithVariedColors();
    }
}

export {RainSquare, HeavyRainSquare, AquiferSquare}