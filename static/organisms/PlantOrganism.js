import {BaseOrganism} from "./BaseOrganism.js"
import { SeedSquare } from "../squares/SeedSquare.js";
import { PlantSeedOrganism } from "./PlantSeedOrganism.js";

import { removeSquareAndChildren } from "../globalOperations.js";
import { getCollidableSquareAtLocation } from "../squares/_sqOperations.js";
import { PlantSquare } from "../squares/PlantSquare.js";
import { PlantLifeSquare } from "../lifeSquares/PlantLifefSquare.js";
import { RootLifeSquare } from "../lifeSquares/RootLifeSquare.js";
import { removeOrganismSquare } from "../squares/_sqOperations.js";
import { getSquares } from "../squares/_sqOperations.js";
import { getDirectNeighbors } from "../squares/_sqOperations.js";
import { addSquare } from "../squares/_sqOperations.js";
import { getCountOfOrganismsSquaresOfProtoAtPosition, getCountOfOrganismsSquaresOfTypeAtPosition } from "../lifeSquares/_lsOperations.js";
import { addOrganismSquare } from "../lifeSquares/_lsOperations.js";
import { addNewOrganism, addOrganism } from "./_orgOperations.js";
import { getOrganismSquaresAtSquare } from "../lifeSquares/_lsOperations.js";
import { getOrganismSquaresAtSquareWithEntityId } from "../lifeSquares/_lsOperations.js";

import {
    plant_initialWidth,
    plant_deltaWidth,
    po_airSuckFrac,
    po_waterSuckFrac,
    po_rootSuckFrac,
    } from "../config/config.js"
import { getCurTime } from "../globals.js";
class PlantOrganism extends BaseOrganism {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "PlantOrganism";
        this.type = "plant";

        this.rootNutrients = 1;
        this.airNutrients = 1;
        this.waterNutrients = 1;

        this.throttleInterval = 1000;

        this.plantLastGrown = getCurTime();
        this.waterLastGrown = getCurTime;
        this.rootLastGrown = getCurTime();

        this.maximumLifeSquaresOfType = {
            "plant": 3,
            "root": 10
        }



        this.highestGreen = null;
        this.growInitialSquares();
    }

    getSeedSquare() {
        var topGreen = this.getHighestGreen();
        var seedSquare = new SeedSquare(topGreen.posX, topGreen.posY - 1);
        if (addSquare(seedSquare)) {
            var newOrg = new PlantSeedOrganism(seedSquare.posX, seedSquare.posY);
            newOrg.linkedSquare = seedSquare;
            if (addNewOrganism(newOrg)) {
                return seedSquare;
            } else {
                removeSquareAndChildren(seedSquare);
                console.log("Failed to add organism to seed square");
                return null;
            }
        } else {
            console.warn("Failed to generate seed square...")
            return null;
        }
    }

    growInitialSquares() {
        var ret = new Array();
        // a plant needs to grow a PlantSquare above ground 
        // and grow a RootOrganism into existing Dirt
        var topSquare = getCollidableSquareAtLocation(this.posX, this.posY - 1);
        if (topSquare != null && topSquare.proto == "WaterSquare") {
            var topTop = getCollidableSquareAtLocation(this.posX, this.posY - 2);
            if (topTop == null) {
                removeSquareAndChildren(topSquare); // fuck them kids!!!!
            } else {
                return;
            }
        }
        var newPlantSquare = addSquare(new PlantSquare(this.posX, this.posY - 1));
        if (newPlantSquare) {
            var orgSq = addOrganismSquare(new PlantLifeSquare(this.posX, this.posY - 1));
            if (orgSq) {
                orgSq.linkedSquare = newPlantSquare;
                orgSq.width = this.width;
                this.width *= 0.95;
                ret.push(orgSq);
            }
        };

        // root time
        getSquares(this.posX, this.posY)
            .filter((sq) => sq.rootable)
            .forEach((sq) => {
                var rootSq = addOrganismSquare(new RootLifeSquare(this.posX, this.posY));
                if (rootSq) {
                    ret.push(rootSq);
                }
            });

        if (ret.length == 2) {
            ret.forEach((sq) => this.addAssociatedSquare(sq));
            return ret;
        } else {
            if (newPlantSquare != null) {
                removeSquareAndChildren(newPlantSquare);
            }
            ret.forEach(removeOrganismSquare);
        }
    }

    postTick() {
        var airSuckFrac = po_airSuckFrac.value;
        var waterSuckFrac = po_waterSuckFrac.value;
        var rootSuckFrac = po_rootSuckFrac.value;

        var airNutrientsGained = 0;
        var waterNutrientsGained = 0;
        var rootNutrientsGained = 0;

        this.associatedSquares.forEach((lifeSquare) => {
            rootNutrientsGained = lifeSquare.rootNutrients * rootSuckFrac;
            waterNutrientsGained = lifeSquare.waterNutrients * waterSuckFrac;

            this.rootNutrients += rootNutrientsGained;
            lifeSquare.rootNutrients -= rootNutrientsGained;

            this.waterNutrients += waterNutrientsGained;
            lifeSquare.waterNutrients -= waterNutrientsGained;

            airNutrientsGained = lifeSquare.airNutrients * airSuckFrac;

            this.airNutrients += airNutrientsGained;
            lifeSquare.airNutrients -= airNutrientsGained;
        });

        var energyGained = this.law.photosynthesis(this.airNutrients, this.waterNutrients, this.rootNutrients);

        this.currentEnergy += energyGained;
        this.totalEnergy += energyGained;

        this.airNutrients -= energyGained;
        this.waterNutrients -= energyGained;
        this.rootNutrients -= energyGained;

        // our goal is to get enough energy to hit the 'reproductionEnergy', then spurt

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

    getLowestGreen() {
        return Array.from(this.associatedSquares
            .filter((sq) => sq.type == "green")).sort((a, b) => b.posY - a.posY)[0];
    }

    getHighestGreen() {
        return Array.from(this.associatedSquares
            .filter((sq) => sq.type == "green")).sort((a, b) => a.posY - b.posY)[0];
    }

    getExteriorRoots() {
        var lowestGreen = Array.from(this.associatedSquares
            .filter((sq) => sq.type == "green")).sort((a, b) => b.posY - a.posY)[0];

        var visitedSquares = new Set();
        var exteriorRoots = new Set();
        var squaresToExplore = new Array();
        squaresToExplore.push(lowestGreen); // LifeSquare 
        visitedSquares.add(getSquares(lowestGreen.posX, lowestGreen.posY)); // TerrainSquares
        var curIdx = 0;
        do {
            var activeSquare = squaresToExplore[curIdx];
            var myNeighbors = getDirectNeighbors(activeSquare.posX, activeSquare.posY);
            for (let i = 0; i < myNeighbors.length; i++) {
                var neighbor = myNeighbors[i];
                var isExteriorRoot = true;
                if (neighbor == null) {
                    continue;
                }
                if (getCountOfOrganismsSquaresOfTypeAtPosition(neighbor.posX, neighbor.posY, "root") > 0 && (Array.from(visitedSquares).indexOf(neighbor) == -1)) {
                    squaresToExplore.push(neighbor)
                    visitedSquares.add(neighbor);
                    isExteriorRoot = false;

                }
                if (isExteriorRoot) {
                    exteriorRoots.add(activeSquare);
                }
            }
            curIdx += 1;
        } while (curIdx < squaresToExplore.length);

        return Array.from(exteriorRoots);
    }

    grow() {
        // make a decision on how to grow based on which of our needs we need the most
        let minNutrient = Math.min(Math.min(this.airNutrients, this.rootNutrients), this.waterNutrients);
        if (this.currentEnergy < 0) {
            console.log("Want to grow...but the effort is too much")
            return;
        }

        if (this.airNutrients == minNutrient) {
            this.currentEnergy -= this.growNewPlant();
            return;
        }

        if (this.rootNutrients == minNutrient) {
            this.currentEnergy -= this.growDirtRoot();
            return;
        }

        if (this.waterNutrients == minNutrient) {
            this.currentEnergy -= this.growWaterRoot();
            return;
        }
    }

    growNewPlant() {
        if (this.associatedSquaresCountByType["green"] > this.maximumLifeSquaresOfType["green"]) {
            return 0;
        }
        if (getCurTime() > this.plantLastGrown + this.throttleInterval) {
            this.plantLastGrown = getCurTime();
            var highestPlantSquare = Array.from(this.associatedSquares.filter((sq) => sq.type == "green").sort((a, b) => a.posY - b.posY))[0];
            if (highestPlantSquare == null) {
                // then we take highest root square;
                highestPlantSquare = Array.from(this.associatedSquares.filter((sq) => sq.type == "root").sort((a, b) => a.posY - b.posY))[0];
            }
            var newPlantSquare = new PlantSquare(highestPlantSquare.posX, highestPlantSquare.posY - 1);
            if (addSquare(newPlantSquare)) {
                var orgSq = addOrganismSquare(new PlantLifeSquare(highestPlantSquare.posX, highestPlantSquare.posY - 1));
                if (orgSq) {
                    orgSq.linkedSquare = newPlantSquare;
                    orgSq.setSpawnedEntityId(this.spawnedEntityId);
                    orgSq.width = this.width;
                    this.width *= (1 - (Math.random() / 10));
                    this.addAssociatedSquare(orgSq);
                    return 1;
                }
            };
        }
        return 0;
    }

    getNumRootNeighborsAtSquare(square) {
        return getNeighbors(square.posX, square.posY)
            .filter((sq) => sq != null)
            .filter((sq) => sq.rootable)
            .map((sq) => getCountOfOrganismsSquaresOfTypeAtPosition(sq.posX, sq.posY, "root"))
            .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    }

    growWaterRoot() {
        if (this.associatedSquaresCountByType["root"] > this.maximumLifeSquaresOfType["root"]) {
            return 0;
        }
        if (getCurTime() > this.waterLastGrown + this.throttleInterval) {
            this.waterLastGrown = getCurTime();
            var wettestSquare = null;
            for (let i = 0; i < this.associatedSquares.length; i++) {
                var sq = this.associatedSquares[i];
                if (sq.type != "root") {
                    continue;
                }
                getDirectNeighbors(sq.posX, sq.posY)
                    .filter((_sq) => _sq != null)
                    .filter((_sq) => _sq.rootable)
                    .filter((_sq) => getOrganismSquaresAtSquareWithEntityId(_sq, this.spawnedEntityId).length == 0)
                    .forEach((compSquare) => {
                        if ((wettestSquare == null || (wettestSquare.waterContainment < compSquare.waterContainment))) {
                            wettestSquare = compSquare;
                    }});
                }
            if (wettestSquare != null) {
                var rootSquare = addOrganismSquare(new RootLifeSquare(wettestSquare.posX, wettestSquare.posY));
                if (rootSquare) {
                    this.addAssociatedSquare(rootSquare);
                    return 1;
                }
            }
        }
        return 0;
    }

    growDirtRoot() {
        if (this.associatedSquaresCountByType["root"] > this.maximumLifeSquaresOfType["root"]) {
            return 0;
        }
        if (getCurTime() > this.rootLastGrown + this.throttleInterval) {
            this.rootLastGrown = getCurTime();
            var dirtiestSquare = null;
            var dirtiestSquareDirtResourceAvailable = 0;

            this.associatedSquares.filter((iterSquare) => iterSquare.type == "root").forEach((iterSquare) => {
                getDirectNeighbors(iterSquare.posX, iterSquare.posY)
                    .filter((compSquare) => compSquare != null)
                    .filter((compSquare) => compSquare.rootable)
                    .filter((compSquare) => getOrganismSquaresAtSquare(compSquare.posX, compSquare.posY).length == 0)
                    .forEach((compSquare) => {
                        var compSquareResourceAvailable = getDirectNeighbors(compSquare.posX, compSquare.posY)
                            .filter((sq) => sq != null && sq.solid && sq.nutrientValue.value > 0)
                            .map((sq) => {
                                var sqNeighbors = getDirectNeighbors(sq.posX, sq.posY);
                                var sqNeighborsRooted = Array.from(sqNeighbors.filter((ssq) => ssq != null).filter((ssq) => getCountOfOrganismsSquaresOfTypeAtPosition(ssq.posX, ssq.posY, "root")));
                                return sq.nutrientValue.value / (sqNeighborsRooted.length + 1);
                            })
                            .reduce(
                                (accumulator, currentValue) => accumulator + currentValue,
                                0,
                            );

                        if (compSquareResourceAvailable > dirtiestSquareDirtResourceAvailable ||
                            (compSquareResourceAvailable == dirtiestSquareDirtResourceAvailable && compSquare.posY < dirtiestSquare.posY)
                        ) {
                            dirtiestSquare = compSquare;
                            dirtiestSquareDirtResourceAvailable = compSquareResourceAvailable;
                        }
                    });
            });
            if (dirtiestSquare != null) {
                var rootSquare = addOrganismSquare(new RootLifeSquare(dirtiestSquare.posX, dirtiestSquare.posY));
                if (rootSquare) {
                    this.addAssociatedSquare(rootSquare);
                    return 1;
                }
            }
        }
        return 0;
    }

    preRender() {
        this.highestGreen = this.getHighestGreen();
        this.associatedSquares
        .filter((sq) => sq.type == "green")
        .forEach((lsq) => {
            lsq.width = parseFloat(plant_initialWidth.value) + (parseFloat(plant_deltaWidth.value)) * (lsq.posY - this.highestGreen.posY);
            lsq.xOffset = this.xOffset;
        });
    }
}

export { PlantOrganism }