import { removeOrganism } from "./_orgOperations.js";
import { Law } from "../Law.js";
import { randNumber } from "../common.js";
import { getCurTime } from "../globals.js";
import { getNextEntitySpawnId } from "../globals.js";

class BaseOrganism {
    constructor(square) {
        this.proto = "BaseOrganism";
        this.posX = square.posX;
        this.posY = square.posY;
        this.lifeSquares = new Array();
        this.type = "base";
        this.law = new Law();
        this.spawnedEntityId = 0;
        this.width = 0.95;
        this.xOffset = 0.5;
        this.alive = true;
        this.hovered = false;

        this.spawnTime = getCurTime();
        this.currentEnergy = 0;
        this.totalEnergy = 0;
        
        this.maxHealth = 100;
        this.perTickDamage = 1;
        this.currentHealth = this.maxHealth;
        this.nutrientDiffTolerance = 1.1565;
        this.nutrientDiffRegainHealth = 1.15;

        // life cycle properties
        this.maxLifeTime = 1000 * 20 * 1;
        this.reproductionEnergy = 1000;
        this.reproductionEnergyUnit = 100;
        this.maximumLifeSquaresOfType = {}
        this.lifeSquaresCountByType = {};
        this.spawnedEntityId = getNextEntitySpawnId();
        this.linkSquare(square);
        this.growInitialSquares();
    }

    storeAndRetrieveWater() {
        let minNutrient = Math.min(Math.min(this.airNutrients, this.dirtNutrients), this.waterNutrients);
        let maxNutrient = Math.max(Math.max(this.airNutrients, this.dirtNutrients), this.waterNutrients);
        let meanNutrient = (this.airNutrients + this.dirtNutrients + this.waterNutrients) / 3;

        if (this.waterNutrients == minNutrient) {
            this.lifeSquares.filter((lsq) => lsq.type == "green").forEach((lsq) => {
                if (this.waterNutrients >= meanNutrient) {
                    return;
                }
                this.waterNutrients += lsq.retrieveWater();
            })
        }

        if (this.waterNutrients == maxNutrient) {
            this.lifeSquares.filter((lsq) => lsq.type == "green").forEach((lsq) => {
                if (this.waterNutrients <= meanNutrient) {
                    return;
                }
                this.waterNutrients -= lsq.storeWater(this.waterNutrients);
            })
        }
    }


    processHealth() { 
        if (this.getLifeCyclePercentage() < 0.1) {
            return;
        }
        let meanNutrient = this.airNutrients + this.dirtNutrients + this.waterNutrients;
        let airNutrientNormalized = this.airNutrients / meanNutrient;
        let dirtNutrientNormalized = this.dirtNutrients / meanNutrient;
        let waterNutrientNormalized = this.waterNutrients / meanNutrient;

        let nutrientVariance = (1 - airNutrientNormalized) ** 2 + (1 - dirtNutrientNormalized) ** 2 + (1 - waterNutrientNormalized) ** 2;
        let nutrientStdDev = nutrientVariance ** 0.5; 

        if (nutrientStdDev > this.nutrientDiffTolerance) {
            this.currentHealth -= this.perTickDamage;
        }
        if (nutrientStdDev < this.nutrientDiffRegainHealth) {
            this.currentHealth += this.perTickDamage;
        }
        if (this.currentHealth < 0) {
            this.destroy();
        }
    }

    linkSquare(square) {
        this.linkedSquare = square;
        square.linkedOrganism = this;
    }
    unlinkSquare() {
        this.linkedSquare = null;
    }

    addAssociatedLifeSquare(lifeSquare) {
        this.lifeSquares.push(lifeSquare);
        if (!(lifeSquare.type in this.lifeSquaresCountByType)) {
            this.lifeSquaresCountByType[lifeSquare.type] = 0;
        }
        this.lifeSquaresCountByType[lifeSquare.type] += 1;
    }
    removeAssociatedLifeSquare(lifeSquare) {
        this.lifeSquaresCountByType[lifeSquare.type] -= 1;
        this.lifeSquares = Array.from(this.lifeSquares.filter((lsq) => lsq != lifeSquare));
        lifeSquare.destroy();
    }

    preRender() {}

    spawnSeed() {
        var seedSquare = this.getSeedSquare();
        if (seedSquare != null) {
            seedSquare.speedX = Math.floor(randNumber(-3, 3));
            seedSquare.speedY = Math.floor(randNumber(-3, -1));
            return true;
        } else {
            return false;
        }
    }

    getSeedSquare() {
        return null; // should be a SeedSquare with a contained PopGrassSeedOrganism or similar
    }

    getCountOfAssociatedSquaresOfProto(proto) {
        return Array.from(this.lifeSquares.filter((org) => org.proto == proto)).length;
    }
    getCountOfAssociatedSquaresOfType(type) {
        return Array.from(this.lifeSquares.filter((org) => org.type == type)).length;
    }

    growInitialSquares() { return new Array(); }

    render() {
        this.preRender();
        this.lifeSquares.forEach((sp) => sp.render())
    }

    destroy() {
        this.lifeSquares.forEach((lifeSquare) => lifeSquare.destroy());
        this.alive = false;
        removeOrganism(this);
    }

    process() {
        this.preTick();
        this.tick();
        this.postTick();
        this.processHealth();
        this.storeAndRetrieveWater();
    }

    preTick() {
        this.lifeSquares.forEach((sp) => sp.preTick())
    }

    tick() {
        this.lifeSquares.forEach((sp) => sp.tick())
    }

    getLifeCyclePercentage() {
        return (getCurTime() - this.spawnTime) / this.maxLifeTime;
    }

    getCurrentEnergyPercentage() {
        return this.currentEnergy / this.reproductionEnergy;
    }

    getEnergyConversionEfficiency() {
        return ((this.currentHealth + this.maxHealth) / 2) / this.maxHealth;
    }

    postTick() {
        this.lifeSquares.forEach((lifeSquare) => {
            this.dirtNutrients += lifeSquare.dirtNutrients;
            this.waterNutrients += lifeSquare.waterNutrients;
            this.airNutrients += lifeSquare.airNutrients;
        });

        var energyGained = this.law.photosynthesis(this.airNutrients - this.totalEnergy, this.waterNutrients - this.totalEnergy, this.dirtNutrients - this.totalEnergy);
        energyGained *= this.getEnergyConversionEfficiency();

        this.currentEnergy += energyGained;
        this.totalEnergy += energyGained;

        var lifeCyclePercentage = this.getLifeCyclePercentage();
        if (lifeCyclePercentage > 1) {
            this.destroy();
        }

        var currentEnergyPercentage = this.getCurrentEnergyPercentage();
        var totalEnergyLifeCycleRate = this.totalEnergy / lifeCyclePercentage;

        if (lifeCyclePercentage > 0.75 && currentEnergyPercentage > 1) {
            this.spawnSeed();
            this.currentEnergy -= this.reproductionEnergyUnit;
            return;
        }

        var projectedEnergyAtEOL = this.currentEnergy + totalEnergyLifeCycleRate * (1 - lifeCyclePercentage);
        if (projectedEnergyAtEOL < this.reproductionEnergy * (2 + 10 * Math.max(0, (0.75 - lifeCyclePercentage)))) {
            this.growAndDecay();
            return;
        } else {
            return;
        }
    }

    growAndDecay() {}
}

export {BaseOrganism}