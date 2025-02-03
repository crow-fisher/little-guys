import { removeOrganism } from "./_orgOperations.js";
import { getStandardDeviation, randNumber } from "../common.js";
import { getCurDay, getCurTime } from "../time.js";
import { getNextEntitySpawnId } from "../globals.js";
import { getWindSpeedAtLocation } from "../wind.js";
import { lightingRegisterLifeSquare } from "../lighting.js";

class BaseOrganism {
    constructor(square) {
        this.proto = "BaseOrganism";
        this.posX = square.posX;
        this.posY = square.posY;
        this.stage = STAGE_SPROUT;
        this.stages = [
            STAGE_SPROUT,
            STAGE_JUVENILE,
            STAGE_ADULT,
            STAGE_FLOWER,
            STAGE_FRUIT
        ];
        this.originGrowth = null;
        this.spinnable = false;

        this.lifeSquares = new Array();
        this.growthPlans = [];
        this.lastGrownMap = {};
        this.linkSquare(square);
        this.growInitialSquares();
        this.maxSquaresOfTypePerDay = 1000;
        this.stageTimeMap = { STAGE_SPROUT: 0 };

        this.greenType = null;
        this.rootType = null;

        this.curWilt = 0;
        this.waterPressure = -2;
        this.waterPressureTarget = -2;
        this.waterPressureWiltThresh = -3;
        this.waterPressureDieThresh = -5;
        this.waterPressureOverwaterThresh = -1;
        this.transpirationRate = 0.001;
        this.rootPower = 2;

        this.applyWind = false;
        this.springCoef = 4;
        this.startDeflectionAngle = 0; 
        this.lastDeflectionStateRollingAverage = 0;
        this.lastDeflectionStateThetaRollingAveragePeriod = 1000;
        this.deflectionIdx = 0;
        this.deflectionStateTheta = 0;
        this.deflectionStateFunctions = [];

        this.rootOpacity = 0.4;
    }

    updateDeflectionState() {
        if (!this.applyWind) {
            return;
        }
        var highestGreen = this.getHighestGreen();

        if (highestGreen == null) {
            this.destroy();
            return;
        }

        var windVec = getWindSpeedAtLocation(highestGreen.posX + highestGreen.deflectionXOffset, highestGreen.posY + highestGreen.deflectionYOffset);
        var startTheta = this.lastDeflectionStateRollingAverage;
        var startSpringForce = Math.sin(startTheta) * this.springCoef;
        startSpringForce *= 0.70;
        var windX = windVec[0];
        var coef = 0.5;
        var endSpringForce = startSpringForce * (1 - coef) + windX * coef;
        
        endSpringForce = Math.min(this.springCoef, endSpringForce);
        endSpringForce = Math.max(-this.springCoef, endSpringForce);

        
        var endDeflectionStateTheta = Math.asin(endSpringForce / this.springCoef);

        if (Math.abs(endDeflectionStateTheta - this.deflectionStateTheta) > Math.abs(this.deflectionStateTheta) * 0.1) {
            this.deflectionStateTheta = this.deflectionStateTheta * 0.9 + endDeflectionStateTheta * 0.1;
        } else {
            this.deflectionStateTheta = endDeflectionStateTheta;
        }
        
        this.lastDeflectionStateRollingAverage *= (1 - (1 / this.lastDeflectionStateThetaRollingAveragePeriod));
        this.lastDeflectionStateRollingAverage += (1 / this.lastDeflectionStateThetaRollingAveragePeriod) * this.deflectionStateTheta;
    }


    applyDeflectionStateToSquares() {
        if (!this.applyWind) {
            return;
        }
        var greenSquares = Array.from(this.lifeSquares.filter((lsq) => lsq.type != "root"));

        var startTheta = this.lastDeflectionStateRollingAverage;
        var endTheta = this.lastDeflectionStateRollingAverage * 0.75 + this.deflectionStateTheta * 0.25;
        
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

            if (isNaN(cs.deflectionXOffset)) {
                console.warn("FUCKKKKK");
            }
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

    canGrowPlant() {
        return this.lifeSquaresCountByType["green"] <= this.maximumLifeSquaresOfType["green"];
    }
    canGrowRoot() {
        return this.lifeSquaresCountByType["root"] <= this.maximumLifeSquaresOfType["root"]
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
        
        var pred = (lsq) => lsq.lighting != null && lsq.lighting.length > 0;
        if (this.lifeSquares.some(pred)) {
            lifeSquare.lighting = this.lifeSquares.reverse().find(pred).lighting;
        }
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

    growInitialSquares() { return new Array(); }

    render() {
        this.preRender();
        this.lifeSquares.forEach((sp) => sp.render())
    }

    destroy() {
        this.lifeSquares.forEach((lifeSquare) => lifeSquare.destroy());
        if (this.linkedSquare != null && this.linkedSquare != -1) {
            this.linkedSquare.unlinkOrganism();
        }
        removeOrganism(this);
    }

    process() {
        this.tick();
        this.postTick();
        this.processHealth();
        this.storeAndRetrieveWater();
        this.currentEnergy -= this.growFlower();
    }

    tick() {
        this.lifeSquares.forEach((sp) => sp.tick());
        this.updateDeflectionState();
        this.applyDeflectionStateToSquares();
        this.lifeSquares = this.lifeSquares.sort((a, b) => a.distToFront - b.distToFront);
    }
}

export {BaseOrganism}