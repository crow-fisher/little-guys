import { removeSquareAndChildren } from "../globalOperations.js";
import { removeOrganismSquare } from "../squares/_sqOperations.js";
import { removeOrganism } from "./_orgOperations.js";
import { Law } from "../Law.js";
import { randNumber } from "../common.js";
import { getCurTime } from "../globals.js";

class BaseOrganism {
    constructor(posX, posY) {
        this.proto = "BaseOrganism";
        this.posX = Math.floor(posX);
        this.posY = Math.floor(posY);
        this.associatedSquares = new Array();
        this.type = "base";
        this.law = new Law();
        this.spawnedEntityId = 0;
        this.width = 0.95;
        this.xOffset = 0.5;

        this.spawnTime = getCurTime();
        this.currentEnergy = 0;
        this.totalEnergy = 0;

        // life cycle properties
        this.maxLifeTime = 1000 * 40 * 1;
        this.reproductionEnergy = 1000;
        this.reproductionEnergyUnit = 300;
        this.maximumLifeSquaresOfType = {}
        this.associatedSquaresCountByType = {};
    }

    addAssociatedSquare(lifeSquare) {
        lifeSquare.spawnedEntityId = this.spawnedEntityId;
        this.associatedSquares.push(lifeSquare);
        if (!(lifeSquare.type in this.associatedSquaresCountByType)) {
            this.associatedSquaresCountByType[lifeSquare.type] = 0;
        }
        this.associatedSquaresCountByType[lifeSquare.type] += 1;
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
        return null; // should be a SeedSquare with a contained PlantSeedOrganism or similar
    }

    getCountOfAssociatedSquaresOfProto(proto) {
        return Array.from(this.associatedSquares.filter((org) => org.proto == proto)).length;
    }
    getCountOfAssociatedSquaresOfType(type) {
        return Array.from(this.associatedSquares.filter((org) => org.type == type)).length;
    }

    growInitialSquares() { return new Array(); }

    render() {
        this.preRender();
        this.associatedSquares.forEach((sp) => sp.render())
    }

    destroy() {
        this.associatedSquares.forEach((asq) => {
            if (asq.linkedSquare != null) {
                removeSquareAndChildren(asq.linkedSquare);
            }
            removeOrganismSquare(asq)
        });
        removeOrganism(this);
    }

    process() {
        this.preTick();
        this.tick();
        this.postTick();
    }

    preTick() {
        this.associatedSquares.forEach((sp) => sp.preTick())
    }

    tick() {
        this.associatedSquares.forEach((sp) => sp.tick())
    }

    postTick() {
        this.associatedSquares.forEach((lifeSquare) => {
            this.dirtNutrients += lifeSquare.dirtNutrients;
            this.waterNutrients += lifeSquare.waterNutrients;
            this.airNutrients += lifeSquare.airNutrients;
        });

        var energyGained = this.law.photosynthesis(this.airNutrients - this.totalEnergy, this.waterNutrients - this.totalEnergy, this.dirtNutrients - this.totalEnergy);

        this.currentEnergy += energyGained;
        this.totalEnergy += energyGained;

        var lifeCyclePercentage = (getCurTime() - this.spawnTime) / this.maxLifeTime;
        if (lifeCyclePercentage > 1) {
            this.destroy();
        }

        var currentEnergyPercentage = this.currentEnergy / this.reproductionEnergy;
        var totalEnergyLifeCycleRate = this.totalEnergy / this.maxLifeTime;

        if (currentEnergyPercentage > 1) {
            this.spawnSeed();
            this.currentEnergy -= this.reproductionEnergyUnit;
            return;
        }

        var projectedEnergyAtEOL = this.currentEnergy + (totalEnergyLifeCycleRate * (1 - lifeCyclePercentage) * this.maxLifeTime);
        if (projectedEnergyAtEOL < this.reproductionEnergy * 2) {
            this.grow();
            return;
        } else {
            return;
        }
    }

    grow() {}
}

export {BaseOrganism}