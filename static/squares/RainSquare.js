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
}

class AquiferSquare extends BaseSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.physicsEnabled = false;
        this.collision = false;
        this.proto = "AquiferSquare";
        this.colorBase = "#0E131F";
        this.waterContainmentMax = wds_sq_waterContainmentMax;
        this.waterContainmentTransferRate = wds_sq_waterTransferRate;
        this.opacity = 0.03;
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