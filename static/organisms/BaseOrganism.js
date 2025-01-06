import { removeOrganism } from "./_orgOperations.js";
import { Law } from "../Law.js";
import { getStandardDeviation, randNumber } from "../common.js";
import { getCurTime } from "../globals.js";
import { getNextEntitySpawnId } from "../globals.js";
import { getWindSpeedAtLocation } from "../wind.js";

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

        this.airCoef = 1;
        this.dirtCoef = 1;
        this.waterCoef = 1;

        this.spawnSeedSpeed = 3;

        this.spawnTime = getCurTime();
        this.currentEnergy = 0;
        this.totalEnergy = 0;
        
        this.maxHealth = 100;
        this.perTickDamage = 1;
        this.currentHealth = this.maxHealth;
        this.nutrientDiffTolerance = 1.1565;
        this.nutrientDiffRegainHealth = 1.15;

        this.dirtNutrients = 1;
        this.airNutrients = 1;
        this.waterNutrients = 1;

        this.plantLastGrown = getCurTime();
        this.waterLastGrown = getCurTime();
        this.rootLastGrown = getCurTime();

        this.recentSquareRemovals = new Array();

        this.maxDistFromOrigin = 0;

        // life cycle properties
        this.maxLifeTime = 1000 * 60 * 2;
        this.reproductionEnergy = 100;
        this.reproductionEnergyUnit = 50;
        this.maximumLifeSquaresOfType = {}
        this.lifeSquaresCountByType = {};
        this.spawnedEntityId = getNextEntitySpawnId();
        this.linkSquare(square);
        this.growInitialSquares();

        this.applyWind = false;
        this.springCoef = 5;
        this.startDeflectionAngle = 0; 
        this.lastDeflectionStateThetas = new Array(100);
        this.deflectionIdx = 0;
        this.deflectionStateTheta = 0;
        this.deflectionStateFunctions = [];

        for (let i = 0; i < this.lastDeflectionStateThetas.length; i++) {
            this.lastDeflectionStateThetas[i] = 0;
        }

    }

    updateDeflectionState() {
        if (!this.applyWind) {
            return;
        }
        var highestGreen = this.getHighestGreen();
        var windVec = getWindSpeedAtLocation(highestGreen.posX + highestGreen.deflectionXOffset, highestGreen.posY + highestGreen.deflectionYOffset);
        var startTheta = this.getStartDeflectionStateTheta();
        var startSpringForce = Math.sin(startTheta) * this.springCoef;
        startSpringForce *= 0.70;
        var windX = windVec[0];
        var coef = 0.5;
        var endSpringForce = startSpringForce * (1 - coef) + windX * coef;
        
        endSpringForce = Math.min(this.springCoef, endSpringForce);
        endSpringForce = Math.max(-this.springCoef, endSpringForce);

        this.deflectionStateTheta = Math.asin(endSpringForce / this.springCoef);

        this.lastDeflectionStateThetas[this.deflectionIdx % this.lastDeflectionStateThetas.length] = this.deflectionStateTheta;
        this.deflectionIdx += 1;
    }

    getStartDeflectionStateTheta() {
        return this.lastDeflectionStateThetas.reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
        ) / this.lastDeflectionStateThetas.length;
    }


    applyDeflectionStateToSquares() {
        if (!this.applyWind) {
            return;
        }
        var greenSquares = Array.from(this.lifeSquares.filter((lsq) => lsq.type != "root"));

        var startTheta = this.getStartDeflectionStateTheta();
        var endTheta = this.getStartDeflectionStateTheta() * 0.75 + this.deflectionStateTheta * 0.25;
        
        var currentTheta = startTheta;
        var thetaDelta = endTheta - startTheta;

        startTheta = endTheta - thetaDelta;

        var hg = this.getHighestGreen();

        if (hg == null) {
            return;
        }

        var hgX = this.posX - hg.posX;
        var hgY = this.posY - hg.posY;
        
        var hgDist = (hgX ** 2 + hgY ** 2) ** 0.5;

        for (let i = 0; i < greenSquares.length; i++) {
            var cs = greenSquares[i];

            // relative to origin
            
            var csX = this.posX - cs.posX;
            var csY = this.posY - cs.posY;

            var csDist = (csX ** 2 + csY ** 2) ** 0.5; 

            var currentTheta = startTheta + (csDist / hgDist) * thetaDelta;

            // https://academo.org/demos/rotation-about-point/
            var endX = csX * Math.cos(currentTheta) - csY * Math.sin(currentTheta);
            var endY = csY * Math.cos(currentTheta) + csX * Math.sin(currentTheta);

            cs.deflectionXOffset = endX - csX;
            cs.deflectionYOffset = endY - csY;
        }
    }

    setHealthAndEnergyColorInSubsquares() {
        var currentHealthNumSquares = Math.min(1, this.getCurrentHealth()) * this.lifeSquares.length;
        var currentEnergyNumSquares = Math.min(1, this.getCurrentEnergyFrac()) * this.lifeSquares.length;
        var currentLifetimeNumSquares = Math.min(1, this.getLifeCyclePercentage()) * this.lifeSquares.length;

        var currentAirNumSquares = this.airNutrients / this.getMeanNutrient() * this.lifeSquares.length;
        var currentWaterNumSquares = this.waterNutrients / this.getMeanNutrient() * this.lifeSquares.length;
        var currentDirtNumSquares = this.dirtNutrients / this.getMeanNutrient() * this.lifeSquares.length;

        this.setIndicatorOnSquares(currentHealthNumSquares, (sq, amount) => sq.healthIndicated = amount);
        this.setIndicatorOnSquares(currentEnergyNumSquares, (sq, amount) => sq.energyIndicated = amount);
        this.setIndicatorOnSquares(currentLifetimeNumSquares, (sq, amount) => sq.lifetimeIndicated = amount);
        
        this.setIndicatorOnSquares(currentAirNumSquares, (sq, amount) => sq.airIndicated += (sq.airIndicated > 0 ? -amount : amount));
        this.setIndicatorOnSquares(currentWaterNumSquares, (sq, amount) => sq.waterIndicated += (sq.waterIndicated > 0 ? -amount : amount));
        this.setIndicatorOnSquares(currentDirtNumSquares, (sq, amount) => sq.dirtIndicated += (sq.dirtIndicated > 0 ? -amount : amount));
    }

    setIndicatorOnSquares(amountToAdd, setter) {
        var cidx = 0;
        var amountAdded = 0;
        while (cidx < amountToAdd && amountAdded < amountToAdd) {
            var curAmountToAdd = Math.min(1, amountToAdd - amountAdded);
            setter(this.lifeSquares[cidx % this.lifeSquares.length], curAmountToAdd)
            amountAdded += curAmountToAdd;
            cidx += 1;
        }
    }

    getMaxNutrient() {
        return Math.max(Math.max(this.airNutrients, this.dirtNutrients), this.waterNutrients);
    }

    getMinNutrient() {
        return Math.min(Math.min(this.airNutrients, this.dirtNutrients), this.waterNutrients);
    }

    getMeanNutrient() {
        return (this.airNutrients + this.dirtNutrients + this.waterNutrients) / 3;
    }

    canGrowPlant() {
        return this.lifeSquaresCountByType["green"] <= this.maximumLifeSquaresOfType["green"];
    }
    canGrowRoot() {
        return this.lifeSquaresCountByType["root"] <= this.maximumLifeSquaresOfType["root"]
    }
    
    getLowestGreen() {
        return Array.from(this.lifeSquares
            .filter((sq) => sq.type == "green")).sort((a, b) => b.posY - a.posY)[0];
    }

    getHighestGreen() {
        return Array.from(this.lifeSquares
            .filter((sq) => sq.type == "green")).sort((a, b) => a.posY - b.posY)[0];
    }

    storeAndRetrieveWater() {
        let meanNutrient = this.getMeanNutrient(); 
        if (this.waterNutrients < meanNutrient) {
            this.lifeSquares.filter((lsq) => lsq.type == "green").forEach((lsq) => {
                if (this.waterNutrients >= meanNutrient) {
                    return;
                }
                this.waterNutrients += lsq.retrieveWater();
            })
        }

        if (this.waterNutrients > meanNutrient) {
            var amountToStore = (this.waterNutrients - meanNutrient);
            var amountStored = 0;
            this.lifeSquares.filter((lsq) => lsq.type == "green").forEach((lsq) => {
                if (amountStored >= amountToStore) {
                    return;
                }
                amountStored += lsq.storeWater(amountToStore - amountStored);
            })
            this.waterNutrients -= amountStored;
        }
    }

    getAmountOfDirtNutrientsToCollect() {
        let meanNutrient = (this.airNutrients + this.dirtNutrients + this.waterNutrients) / 3;
        return meanNutrient - this.dirtNutrients;
    }

    
    growFlower() { return 0; }


    processHealth() { 
        if (this.getLifeCyclePercentage() < 0.05) {
            return;
        }
        let minNutrient = this.getMinNutrient();
        let meanNutrient = this.getMeanNutrient();
        let maxNutrient = this.getMaxNutrient();

        if (minNutrient < (meanNutrient / 2) || maxNutrient > (meanNutrient * 1.5)) {
            this.currentHealth -= this.perTickDamage;
            this.growAndDecay();
        }

        if (this.currentHealth < 0) {
            this.destroy();
        }
    }
    getMaxDirtNutrient() {
        if (this.maxDirtNutrient != 0) {
            return this.maxDirtNutrient;
        }
        this.maxDirtNutrient = Array.from(this.lifeSquares.map((ls) => ls.dirtNutrients)).sort((a, b) => b - a)[0]
        return this.maxDirtNutrient;
    }

    getMaxAirNutrient() {
        if (this.maxAirNutrient != 0) {
            return this.maxAirNutrient;
        }
        this.maxAirNutrient = Array.from(this.lifeSquares.map((ls) => ls.airNutrients)).sort((a, b) => b - a)[0]
        return this.maxAirNutrient;
    }
    getMaxWaterNutrient() {
        if (this.maxWaterNutrient != 0) {
            return this.maxWaterNutrient;
        }
        this.maxWaterNutrient = Array.from(this.lifeSquares.map((ls) => ls.waterNutrients)).sort((a, b) => b - a)[0]
        return this.maxWaterNutrient;
    }

    getStdevDirtNutrient() {
        if (this.stdevDirtNutrient != 0) {
            return this.stdevDirtNutrient;
        }
        this.stdevDirtNutrient = getStandardDeviation(Array.from(this.lifeSquares.map((ls) => ls.dirtNutrients)));
        return this.stdevDirtNutrient;
    }

    getStdevAirNutrient() {
        if (this.stdevAirNutrient != 0) {
            return this.stdevAirNutrient;
        }
        this.stdevAirNutrient = getStandardDeviation(Array.from(this.lifeSquares.map((ls) => ls.airNutrients)));
        return this.stdevAirNutrient;
    }
    getStdevWaterNutrient() {
        if (this.stdevWaterNutrient != 0) {
            return this.stdevWaterNutrient;
        }
        this.stdevWaterNutrient = getStandardDeviation(Array.from(this.lifeSquares.map((ls) => ls.waterNutrients)));
        return this.stdevWaterNutrient;
    }

    getCurrentHealth() {
        return this.currentHealth / this.maxHealth;
    }

    linkSquare(square) {
        this.linkedSquare = square;
        square.linkOrganism(this);
    }
    unlinkSquare() {
        this.linkedSquare = null;
    }
    dist(posX, posY) {
        return Math.sqrt((this.posX - posX) ** 2 + (this.posY - posY) ** 2);
    }
    addAssociatedLifeSquare(lifeSquare) {
        this.lifeSquares.push(lifeSquare);
        if (!(lifeSquare.type in this.lifeSquaresCountByType)) {
            this.lifeSquaresCountByType[lifeSquare.type] = 0;
        }
        this.lifeSquaresCountByType[lifeSquare.type] += 1;
        lifeSquare.distFromOrigin = this.dist(lifeSquare.posX, lifeSquare.posY);
        this.maxDistFromOrigin = Math.max(this.maxDistFromOrigin, lifeSquare.distFromOrigin);
    }
    removeAssociatedLifeSquare(lifeSquare) {
        this.lifeSquaresCountByType[lifeSquare.type] -= 1;
        this.lifeSquares = Array.from(this.lifeSquares.filter((lsq) => lsq != lifeSquare));
        lifeSquare.destroy();
        this.recentSquareRemovals.push([lifeSquare.posX, lifeSquare.posY]);
    }

    preRender() {
        this.setHealthAndEnergyColorInSubsquares();
    }

    spawnSeed() {
        var seedSquare = this.getSeedSquare();
        if (seedSquare != null) {
            while (seedSquare.speedX == 0) {
                seedSquare.speedX = Math.floor(randNumber(-this.spawnSeedSpeed, this.spawnSeedSpeed));
            }
            seedSquare.speedY = Math.floor(randNumber(-this.spawnSeedSpeed, -1));
            return true;
        } else {
            return false;
        }
    }

    getSeedSquare() {
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
        this.linkedSquare.unlinkOrganism();
        removeOrganism(this);
    }

    process() {
        this.preTick();
        this.tick();
        this.postTick();
        this.processHealth();
        this.storeAndRetrieveWater();
        this.currentEnergy -= this.growFlower();
    }

    getMaxAllNutrients() {
        return this.getMaxAirNutrient() + this.getMaxWaterNutrient() + this.getMaxAirNutrient();
    }

    getStdevAllNutrients() {
        return Math.sqrt((this.getMaxAirNutrient() ** 2) / 3 + (this.getMaxDirtNutrient() ** 2) / 3 + (this.getMaxWaterNutrient() ** 2) / 3)
    }

    preTick() {
        this.maxAirNutrient = 0;
        this.maxDirtNutrient = 0;
        this.maxWaterNutrient = 0;
        this.stdevAirNutrient = 0;
        this.stdevDirtNutrient = 0;
        this.stdevWaterNutrient = 0;
        this.lifeSquares.forEach((sp) => sp.preTick())
        if (this.recentSquareRemovals.length > 10) {
            this.recentSquareRemovals = new Array();
        }
    }

    tick() {
        this.lifeSquares.forEach((sp) => sp.tick());
        this.updateDeflectionState();
        this.applyDeflectionStateToSquares();
    }

    getLifeCyclePercentage() {
        return (getCurTime() - this.spawnTime) / this.maxLifeTime;
    }

    getCurrentEnergyFrac() {
        return this.currentEnergy / this.reproductionEnergy;
    }

    getHealthEnergyConversionEfficiency() {
        return (
            ((this.currentHealth + this.maxHealth) / 2) / this.maxHealth
        );
    }

    getGrownSquaresByMotivation() {
        var out = {
            "dirt": 0,
            "water": 0,
            "air": 0
        };
        this.lifeSquares.forEach((sq) => {
            if (sq.motivation in out) {
                out[sq.motivation] += 1;
            } else {
                out[sq.motivation] = 1;
            }
        });
        return out;
    }
        
    growAndDecay() {
        // make a decision on how to grow based on which of our needs we need the most
        if (this.currentEnergy < 0) {
            return;
        }
        let minNutrient = this.getMinNutrient();
        let meanNutrient = this.getMeanNutrient();

        if (this.airNutrients == minNutrient) {
            this.currentEnergy -= (this.currentEnergy / 10) * this.growNewPlant();
            return;
        }

        if (this.dirtNutrients == minNutrient && this.waterNutrients < meanNutrient * 1.1) {
            this.currentEnergy -= (this.currentEnergy / 10) * this.growDirtRoot();
        }

        if (this.waterNutrients == minNutrient && this.dirtNutrients < meanNutrient * 1.1) {
            this.currentEnergy -= (this.currentEnergy / 10) * this.growWaterRoot();
        }
    }

    postTick() {
        if (this.lifeSquares.length == 0) {
            this.destroy();
        }
        this.lifeSquares.forEach((lifeSquare) => {
            this.dirtNutrients += lifeSquare.dirtNutrients * this.dirtCoef;
            this.waterNutrients += lifeSquare.waterNutrients * this.waterCoef;
            this.airNutrients += lifeSquare.airNutrients * this.airCoef;
        });

        var energyGained = this.law.photosynthesis(this.airNutrients - this.totalEnergy, this.waterNutrients - this.totalEnergy, this.dirtNutrients - this.totalEnergy);
        energyGained *= this.getHealthEnergyConversionEfficiency();

        this.currentEnergy += energyGained;
        this.totalEnergy += energyGained;

        var lifeCyclePercentage = this.getLifeCyclePercentage();
        if (lifeCyclePercentage > 1) {
            this.destroy();
        }

        if (this.getCurrentEnergyFrac() > 1) {
            if (this.spawnSeed()) {
                this.currentEnergy -= this.reproductionEnergyUnit;
            }
            return;
        }

        if (lifeCyclePercentage < 0.6) {
            this.growAndDecay();
            return;
        }

        var totalEnergyLifeCycleRate = this.totalEnergy / lifeCyclePercentage;



        var projectedEnergyAtEOL = this.currentEnergy + totalEnergyLifeCycleRate * (1 - lifeCyclePercentage);
        if (projectedEnergyAtEOL < this.reproductionEnergy * (2 + 10 * Math.max(0, (0.75 - lifeCyclePercentage)))) {
            this.growAndDecay();
            return;
        } else {
            return;
        }
    }

}

export {BaseOrganism}