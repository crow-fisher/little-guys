import {BaseOrganism} from "./BaseOrganism.js"
import { getSquares } from "../squares/_sqOperations.js";
import { getDirectNeighbors } from "../squares/_sqOperations.js";
import { addOrganismSquare } from "../lifeSquares/_lsOperations.js";
import { getCurTime } from "../globals.js";
import { MossGreenLifeSquare } from "../lifeSquares/MossGreenLifeSquare.js";
import { airNutrientsPerEmptyNeighbor } from "../config/config.js";
import { getStandardDeviation } from "../common.js";

class MossOrganism extends BaseOrganism {
    constructor(square) {
        super(square);
        this.proto = "MossOrganism";
        this.type = "plant";

        this.maxLifeTime = 1000 * 80 * 1;

        this.growThrottleInterval = 50;
        this.plantLastGrown = getCurTime();

        this.currentEnergy = 10;

        this.reproductionEnergy *= 100;
        this.reproductionEnergyUnit *= 100;

        this.currentHealth *= 1000;

        this.airCoef = 0.25;
        this.dirtCoef = 1.6;
        this.waterCoef = 0.20;

        this.maximumLifeSquaresOfType = {
            "green": 1000
        }
        this.highestGreen = null;

    }

    postTick() {
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
            this.currentEnergy = 0;
            this.totalEnergy = 0;
            this.airNutrients = 0;
            this.waterNutrients = 0;
            this.dirtNutrients = 0;
            this.spawnTime = getCurTime();
            return;
        }
        this.growAndDecay();
    }
    growInitialSquares() {
        var firstMossSquare = addOrganismSquare(new MossGreenLifeSquare(this.linkedSquare, this));
        firstMossSquare.linkSquare(this.linkedSquare);
        this.linkedSquare.linkOrganismSquare(firstMossSquare);
        this.addAssociatedLifeSquare(firstMossSquare);
    }
    growForOptimizingNutrient(squareGetter) {
        if (getCurTime() - this.plantLastGrown < this.lifeSquaresCountByType["green"]) {
            return 0;
        }
        
        var maxSqSum = 0;
        var maxSq = null;
        this.lifeSquares.forEach((lsq) => {
            getDirectNeighbors(lsq.posX, lsq.posY)
            .filter((sq) => sq.linkedOrganismSquares.length == 0)
            .forEach((sq) => {
                // 'sq' is a candidate growth location
                // assess the value of 'sq'
                var sqSum = getDirectNeighbors(sq.posX, sq.posY)
                    .map(squareGetter)
                    .reduce(
                    (accumulator, currentValue) => accumulator + currentValue,
                    0,
                );

                if (sqSum > maxSqSum) {
                    maxSq = sq;
                    maxSqSum = sqSum;
                }
            });
        });

        if (maxSq == null) {
            return 0;
        }

        return this.growNewGreenAtSquare(maxSq);
    }

    growNewGreenAtSquare(square) {
        if (this.recentSquareRemovals.some((pos) => pos[0] == square.posX && pos[1] == square.posY)) {
            return 0;
        }

        var newMossSquare = addOrganismSquare(new MossGreenLifeSquare(square, this));
        newMossSquare.linkSquare(square);
        square.linkOrganismSquare(newMossSquare);
        this.addAssociatedLifeSquare(newMossSquare);
        this.plantLastGrown = getCurTime();
        return newMossSquare.getCost();
    }

    getAirNutrientsAtSquare(posX, posY) {
        var sqArr = Array.from(getSquares(posX, posY).filter((sq) => sq.solid));
        if (sqArr.length == 0) {
            return 0;
        }
        var targetSquare = sqArr[0];
        return airNutrientsPerEmptyNeighbor.value * (0.25 ** targetSquare.currentPressureDirect)
    }

    getWaterNutrientsAtSquare(posX, posY) {
        var sqArr = Array.from(getSquares(posX, posY).filter((sq) => sq.solid));
        if (sqArr.length == 0) {
            return 0;
        }
        var targetSquare = sqArr[0];
        return targetSquare.waterContainment;
    }

    
    getDirtNutrientsAtSquare(posX, posY) {
        var sqArr = Array.from(getSquares(posX, posY).filter((sq) => sq.solid));
        if (sqArr.length == 0) {
            return 0;
        }
        var targetSquare = sqArr[0];
        return targetSquare.nutrientValue.value;
    }

    growAndDecay() {
        // make a decision on how to grow based on which of our needs we need the most
        if (this.currentEnergy < 0) {
            return;
        }
        let meanNutrient = this.getMeanNutrient();

        if (this.airNutrients <= meanNutrient) {
            this.currentEnergy -= this.growForOptimizingNutrient((sq) => this.getAirNutrientsAtSquare(sq.posX, sq.posY));
        }

        if (this.dirtNutrients <= meanNutrient) {
            this.currentEnergy -= this.growForOptimizingNutrient((sq) => this.getDirtNutrientsAtSquare(sq.posX, sq.posY));
        }

        if (this.waterNutrients <= meanNutrient) {
            this.currentEnergy -= this.growForOptimizingNutrient((sq) => this.getWaterNutrientsAtSquare(sq.posX, sq.posY));
        }

        let squareScores = Array.from(this.lifeSquares.map((lsq) => lsq.getScore())).sort();
        if (squareScores.length > 20) {
            let squareScoresSum = squareScores.reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0,
            );
            let squareScoresMean = squareScoresSum / squareScores.length;
            let squareScoresStdev = getStandardDeviation(squareScores);
            let squareScoreThreshold = squareScoresMean - (1 + Math.random()) * squareScoresStdev;
            this.lifeSquares
                .filter((lsq) => lsq.posX != this.posX && lsq.posY != this.posY)
                .filter((lsq) => lsq.getScore() < squareScoreThreshold).forEach((lsq) => this.removeAssociatedLifeSquare(lsq));
        }
    }
}

export { MossOrganism }