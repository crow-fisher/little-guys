import {BaseOrganism} from "./BaseOrganism.js"
import { SeedSquare } from "../squares/SeedSquare.js";
import { PlantSeedOrganism } from "./PlantSeedOrganism.js";

import { removeSquare } from "../globalOperations.js";
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

import { getCurTime } from "../globals.js";
class PlantOrganism extends BaseOrganism {
    constructor(square) {
        super(square);
        this.proto = "PlantOrganism";
        this.type = "plant";

        this.dirtNutrients = 1;
        this.airNutrients = 1;
        this.waterNutrients = 1;

        this.throttleInterval = 1000;

        this.plantLastGrown = getCurTime();
        this.waterLastGrown = getCurTime();
        this.rootLastGrown = getCurTime();

        this.maximumLifeSquaresOfType = {
            "green": 3,
            "root": 10
        }

        this.highestGreen = null;
        this.growInitialSquares();
    }

    getSeedSquare() {
        var topGreen = this.getHighestGreen();
        var seedSquare = new SeedSquare(topGreen.posX, topGreen.posY - 1);
        if (addSquare(seedSquare)) {
            var newOrg = new PlantSeedOrganism(seedSquare);
            newOrg.linkSquare(seedSquare);
            if (addNewOrganism(newOrg)) {
                return seedSquare;
            } else {
                removeSquare(seedSquare);
                console.log("Failed to add organism to seed square");
                return null;
            }
        } else {
            console.warn("Failed to generate seed square...")
            return null;
        }
    }

    growInitialSquares() {
        // a plant needs to grow a PlantSquare above ground 
        // and grow a RootOrganism into existing Dirt
        getCollidableSquareAtLocation(this.posX, this.posY - 1)
            .filter((sq) => sq.proto == "WaterSquare")
            .forEach((sq) => {
                var topEmpty = true;
                getCollidableSquareAtLocation(sq.posX, sq.posY - 1).forEach((sq) => {
                    topEmpty = false;
                })
                if (topEmpty) {
                    removeSquare(sq); // fuck them kids!!!!
                }
        });
        var newPlantSquare = addSquare(new PlantSquare(this.posX, this.posY - 1));
        if (newPlantSquare) {
            var orgSq = addOrganismSquare(new PlantLifeSquare(newPlantSquare));
            if (orgSq) {
                orgSq.linkSquare(newPlantSquare);
                orgSq.linkOrganism(this);
                this.addAssociatedLifeSquare(orgSq);
            }
        } else {
            this.destroy();
        }
        var rootSq = addOrganismSquare(new RootLifeSquare(this.linkedSquare));
        rootSq.linkOrganism(this);
        rootSq.linkSquare(this.linkedSquare);
        this.addAssociatedLifeSquare(rootSq);
    }

    getLowestGreen() {
        return Array.from(this.lifeSquares
            .filter((sq) => sq.type == "green")).sort((a, b) => b.posY - a.posY)[0];
    }

    getHighestGreen() {
        return Array.from(this.lifeSquares
            .filter((sq) => sq.type == "green")).sort((a, b) => a.posY - b.posY)[0];
    }
    
    grow() {
        // make a decision on how to grow based on which of our needs we need the most
        
        let minNutrient = Math.min(Math.min(this.airNutrients, this.dirtNutrients), this.waterNutrients);
        if (this.currentEnergy < 0) {
            console.log("Want to grow...but the effort is too much")
            return;
        }

        if (this.airNutrients == minNutrient) {
            this.currentEnergy -= this.growNewPlant();
            return;
        }

        if (this.dirtNutrients == minNutrient) {
            this.currentEnergy -= this.growDirtRoot();
            return;
        }

        if (this.waterNutrients == minNutrient) {
            this.currentEnergy -= this.growWaterRoot();
            return;
        }
    }

    canGrowPlant() {
        return this.lifeSquaresCountByType["green"] <= this.maximumLifeSquaresOfType["green"];
    }
    canGrowRoot() {
        return this.lifeSquaresCountByType["root"] <= this.maximumLifeSquaresOfType["root"]
    }

    growNewPlant() {
        if (!this.canGrowPlant()) {
            return 0;
        }
        if (getCurTime() > this.plantLastGrown + this.throttleInterval) {
            this.plantLastGrown = getCurTime();
            var highestPlantSquare = Array.from(this.lifeSquares.filter((sq) => sq.type == "green").sort((a, b) => a.posY - b.posY))[0];
            if (highestPlantSquare == null) {
                // then we take highest root square;
                highestPlantSquare = Array.from(this.lifeSquares.filter((sq) => sq.type == "root").sort((a, b) => a.posY - b.posY))[0];
            }
            var newPlantSquare = new PlantSquare(highestPlantSquare.posX, highestPlantSquare.posY - 1);
            if (addSquare(newPlantSquare)) {
                var orgSq = addOrganismSquare(new PlantLifeSquare(newPlantSquare));
                if (orgSq) {
                    this.addAssociatedLifeSquare(orgSq);
                    orgSq.linkOrganism(this);
                    orgSq.linkSquare(newPlantSquare);
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
        if (!this.canGrowRoot()) {
            return 0;
        }
        if (getCurTime() > this.waterLastGrown + this.throttleInterval) {
            this.waterLastGrown = getCurTime();
            var wettestSquare = null;
            for (let i = 0; i < this.lifeSquares.length; i++) {
                var sq = this.lifeSquares[i];
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
                var rootSquare = addOrganismSquare(new RootLifeSquare(wettestSquare));
                if (rootSquare) {
                    this.addAssociatedLifeSquare(rootSquare);
                    rootSquare.linkOrganism(this);
                    rootSquare.linkSquare(wettestSquare);
                    return 1;
                }
            }
        }
        return 0;
    }

    growDirtRoot() {
        if (!this.canGrowRoot()) {
            return 0;
        }
        if (getCurTime() > this.rootLastGrown + this.throttleInterval) {
            this.rootLastGrown = getCurTime();
            var dirtiestSquare = null;
            var dirtiestSquareDirtResourceAvailable = 0;

            this.lifeSquares.filter((iterSquare) => iterSquare.type == "root")
                .forEach((iterSquare) => {
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
                var rootLifeSquare = addOrganismSquare(new RootLifeSquare(dirtiestSquare));
                this.addAssociatedLifeSquare(rootLifeSquare);
                rootLifeSquare.linkOrganism(this);
                rootLifeSquare.linkSquare(dirtiestSquare);
                return 1;
            }
        }
        return 0;
    }

    preRender() {
        this.highestGreen = this.getHighestGreen();
        this.lifeSquares
        .filter((sq) => sq.type == "green")
        .forEach((lsq) => {
            lsq.xOffset = this.xOffset;
        });
    }
}

export { PlantOrganism }