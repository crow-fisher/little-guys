import { BaseOrganism } from "./BaseOrganism.js"
import { SeedSquare } from "../squares/SeedSquare.js";
import { PopGrassSeedOrganism } from "./PopGrassSeedOrganism.js";

import { removeSquare } from "../globalOperations.js";
import { getCollidableSquareAtLocation, getSquares } from "../squares/_sqOperations.js";
import { PlantSquare } from "../squares/PlantSquare.js";
import { PopGrassGreenLifeSquare } from "../lifeSquares/PopGrassGreenLifeSquare.js";
import { PopGrassRootLifeSquare } from "../lifeSquares/PopGrassRootLifeSquare.js";
import { getDirectNeighbors } from "../squares/_sqOperations.js";
import { addSquare } from "../squares/_sqOperations.js";
import { getCountOfOrganismsSquaresOfTypeAtPosition } from "../lifeSquares/_lsOperations.js";
import { addOrganismSquare } from "../lifeSquares/_lsOperations.js";
import { addNewOrganism, addOrganism } from "./_orgOperations.js";
import { getOrganismSquaresAtSquare } from "../lifeSquares/_lsOperations.js";
import { getOrganismSquaresAtSquareWithEntityId } from "../lifeSquares/_lsOperations.js";

import { getCurTime } from "../globals.js";
import { LilyPadSeedOrganism } from "./LilyPadSeedOrganism.js";
import { LilyPadWaterGreenLifeSquare } from "../lifeSquares/LilyPadWaterGreenLifeSquare.js";
import { LilyPadRootLifeSquare } from "../lifeSquares/LilyPadRootLifeSquare.js";
import { LilyPadFlowerLifeSquare } from "../lifeSquares/LilyPadFlowerLifeSquare.js";
class LilyPadOrganism extends BaseOrganism {
    constructor(square) {
        super(square);
        this.proto = "LilyPadOrganism";
        this.type = "plant";

        this.throttleInterval = 1000;

        this.reproductionEnergy = 800;
        this.reproductionEnergyUnit = 300;

        this.maxLifeTime = 1000 * 50;

        this.plantLastGrown = getCurTime();
        this.waterLastGrown = getCurTime();
        this.rootLastGrown = getCurTime();

        this.maximumLifeSquaresOfType = {
            "green": 20,
            "root": 20
        }

        this.highestGreen = null;
    }

    getSeedSquare() {
        var ret = null;
        this.lifeSquares.filter((lsq) => lsq.type == "flower")
            .forEach((lsq) => {
                var seedSquare = new SeedSquare(lsq.posX, lsq.posY - 1);
                if (addSquare(seedSquare)) {
                    var newOrg = new LilyPadSeedOrganism(seedSquare);
                    newOrg.linkSquare(seedSquare);
                    if (addNewOrganism(newOrg)) {
                        ret = seedSquare;
                    } else {
                        removeSquare(seedSquare);
                        console.log("Failed to add organism to seed square");
                    }
                }
            });

        return ret;
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
        var orgSq;
        getSquares(this.posX, this.posY - 1)
            .filter((sq) => sq.proto == "WaterSquare")
            .forEach((waterSquare) => {
                var newPlantSquare = addSquare(new PlantSquare(this.posX, this.posY - 1));
                if (newPlantSquare) {
                    orgSq = addOrganismSquare(new LilyPadWaterGreenLifeSquare(newPlantSquare, this));
                    if (orgSq) {
                        orgSq.linkSquare(newPlantSquare);
                        this.addAssociatedLifeSquare(orgSq);
                    }
                } else {
                    this.destroy();
                }
            });

        if (!this.linkedSquare.validPlantHome) {
            this.destroy();
            return;
        }
        var rootSq = addOrganismSquare(new LilyPadRootLifeSquare(this.linkedSquare, this));
        rootSq.linkSquare(this.linkedSquare);
        rootSq.addChild(orgSq);
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

    getExteriorRoots() {
        return this.lifeSquares
            .filter((lsq) => lsq.type == "root")
            .filter((lsq) => lsq.childLifeSquares.length == 0);
    }

    canGrowPlant() {
        return this.lifeSquaresCountByType["green"] <= this.maximumLifeSquaresOfType["green"];
    }
    canGrowRoot() {
        return this.lifeSquaresCountByType["root"] <= this.maximumLifeSquaresOfType["root"]
    }

    shouldGrowFlower() {
        return this.currentEnergy > (this.reproductionEnergy * 0.5) && !(this.lifeSquares.some((sq) => sq.type == "flower"));
    }

    growFlower() {
        if (this.shouldGrowFlower()) {
            var highestPlantSquare = Array.from(this.lifeSquares.filter((sq) => sq.type == "green").sort((a, b) => a.posY - b.posY))[0];
            if (
                !(getSquares(highestPlantSquare.posX, highestPlantSquare.posY - 1).some((sq) => sq.proto == "WaterSquare")) &&
                !(getSquares(highestPlantSquare.posX, highestPlantSquare.posY - 1).some((sq) => sq.collision || sq.organic))
                ) {
                var newPlantSquare = new PlantSquare(highestPlantSquare.posX, highestPlantSquare.posY - 1);
                if (addSquare(newPlantSquare)) {
                    var newLilyPadFlowerLifeSquare = addOrganismSquare(new LilyPadFlowerLifeSquare(newPlantSquare, this));
                    if (newLilyPadFlowerLifeSquare) {
                        this.addAssociatedLifeSquare(newLilyPadFlowerLifeSquare);
                        newLilyPadFlowerLifeSquare.linkSquare(newPlantSquare);
                        highestPlantSquare.addChild(newLilyPadFlowerLifeSquare);
                        return newLilyPadFlowerLifeSquare.getCost();
                    }
                }
            } else {
                var newPlantSquare = new PlantSquare(highestPlantSquare.posX, highestPlantSquare.posY - 1);
                var newLilyPadWaterGreenLifeSquare = addOrganismSquare(new LilyPadWaterGreenLifeSquare(newPlantSquare, this));
                if (newLilyPadWaterGreenLifeSquare) {
                    this.addAssociatedLifeSquare(newLilyPadWaterGreenLifeSquare);
                    newLilyPadWaterGreenLifeSquare.linkSquare(newPlantSquare);
                    highestPlantSquare.addChild(newLilyPadWaterGreenLifeSquare)
                    return newLilyPadWaterGreenLifeSquare.getCost();
                }
            }
        }
        return 0;
    }

    growNewPlant() {
        if (!this.canGrowPlant()) {
            return 0;
        }
        if (getCurTime() > this.plantLastGrown + this.throttleInterval) {
            this.plantLastGrown = getCurTime();
            var highestPlantSquare = Array.from(this.lifeSquares.filter((sq) => sq.type == "green").sort((a, b) => a.posY - b.posY))[0];
            if (getSquares(highestPlantSquare.posX, highestPlantSquare.posY - 1).some((sq) => sq.proto == "WaterSquare")) {
                var wettestSquare = null;
                var wettestSquareParent = null;
                var wettestSquareAirNutrientsAvailable = 0;
                for (let i = 0; i < this.lifeSquares.length; i++) {
                    var sq = this.lifeSquares[i];
                    if (sq.type != "green") {
                        continue;
                    }
                    getDirectNeighbors(sq.posX, sq.posY)
                        .filter((_sq) => _sq.proto == "WaterSquare")
                        .filter((_sq) => getOrganismSquaresAtSquareWithEntityId(_sq, this.spawnedEntityId).length == 0)
                        .forEach((compSquare) => {
                            var compSquareNutrientsAvailable = getDirectNeighbors(compSquare.posX, compSquare.posY)
                                .filter((sq) => getOrganismSquaresAtSquare(sq.posX, sq.posY).length == 0)
                                .map((sq) => 1 * (0.9 ** compSquare.currentPressureIndirect))
                                .reduce(
                                    (accumulator, currentValue) => accumulator + currentValue,
                                    0,
                                );

                            if ((wettestSquare == null || (wettestSquareAirNutrientsAvailable < compSquareNutrientsAvailable))) {
                                wettestSquare = compSquare;
                                wettestSquareParent = sq;
                                wettestSquareAirNutrientsAvailable = compSquareNutrientsAvailable;
                            }
                        });
                }

                if (wettestSquare != null) {
                    var newPlantSquare = new PlantSquare(wettestSquare.posX, wettestSquare.posY);
                    var newLilyPadWaterGreenLifeSquare = addOrganismSquare(new LilyPadWaterGreenLifeSquare(newPlantSquare, this));
                    if (newLilyPadWaterGreenLifeSquare) {
                        this.addAssociatedLifeSquare(newLilyPadWaterGreenLifeSquare);
                        newLilyPadWaterGreenLifeSquare.linkSquare(newPlantSquare);
                        wettestSquareParent.addChild(newLilyPadWaterGreenLifeSquare)
                        return newLilyPadWaterGreenLifeSquare.getCost();
                    }
                }
            } else {
                var newPlantSquare = new PlantSquare(highestPlantSquare.posX, highestPlantSquare.posY - 1);
                if (addSquare(newPlantSquare)) {
                    var newLilyPadWaterGreenLifeSquare = addOrganismSquare(new LilyPadWaterGreenLifeSquare(newPlantSquare, this));
                    if (newLilyPadWaterGreenLifeSquare) {
                        this.addAssociatedLifeSquare(newLilyPadWaterGreenLifeSquare);
                        newLilyPadWaterGreenLifeSquare.linkSquare(newPlantSquare);
                        highestPlantSquare.addChild(newLilyPadWaterGreenLifeSquare);
                        return newLilyPadWaterGreenLifeSquare.getCost();
                    }
                };
            }
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
            var wettestSquareParent = null;
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
                            wettestSquareParent = sq;
                        }
                    });
            }
            if (wettestSquare != null) {
                var newPopGrassRootLifeSquare = addOrganismSquare(new PopGrassRootLifeSquare(wettestSquare, this));
                if (newPopGrassRootLifeSquare) {
                    this.addAssociatedLifeSquare(newPopGrassRootLifeSquare);
                    newPopGrassRootLifeSquare.linkSquare(wettestSquare);
                    wettestSquareParent.addChild(newPopGrassRootLifeSquare)
                    return newPopGrassRootLifeSquare.getCost();
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
            var dirtiestSquareParent = null;
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
                                dirtiestSquareParent = iterSquare;
                                dirtiestSquareDirtResourceAvailable = compSquareResourceAvailable;
                            }
                        });
                });
            if (dirtiestSquare != null) {
                var popGrassRootLifeSquare = addOrganismSquare(new PopGrassRootLifeSquare(dirtiestSquare, this));
                this.addAssociatedLifeSquare(popGrassRootLifeSquare);
                popGrassRootLifeSquare.linkSquare(dirtiestSquare);
                dirtiestSquareParent.addChild(popGrassRootLifeSquare);
                return popGrassRootLifeSquare.getCost();
            }
        }
        return 0;
    }

    preRender() {
        super.preRender();
        this.highestGreen = this.getHighestGreen();
        this.lifeSquares
            .filter((sq) => sq.type == "green")
            .forEach((lsq) => {
                lsq.xOffset = this.xOffset;
            });
    }
}

export { LilyPadOrganism }