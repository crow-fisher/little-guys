import {BaseOrganism} from "./BaseOrganism.js"
import { SeedSquare } from "../squares/SeedSquare.js";
import { PopGrassSeedOrganism } from "./PopGrassSeedOrganism.js";

import { removeSquare } from "../globalOperations.js";
import { getCollidableSquareAtLocation } from "../squares/_sqOperations.js";
import { PlantSquare } from "../squares/PlantSquare.js";
import { PopGrassGreenLifeSquare } from "../lifeSquares/PopGrassGreenLifeSquare.js";
import { PopGrassRootLifeSquare } from "../lifeSquares/PopGrassRootLifeSquare.js";
import { removeOrganismSquare } from "../squares/_sqOperations.js";
import { getSquares } from "../squares/_sqOperations.js";
import { getDirectNeighbors } from "../squares/_sqOperations.js";
import { addSquare } from "../squares/_sqOperations.js";
import { getCountOfOrganismsSquaresOfProtoAtPosition, getCountOfOrganismsSquaresOfTypeAtPosition } from "../lifeSquares/_lsOperations.js";
import { addOrganismSquare } from "../lifeSquares/_lsOperations.js";
import { addNewOrganism, addOrganism } from "./_orgOperations.js";
import { getOrganismSquaresAtSquare } from "../lifeSquares/_lsOperations.js";
import { getOrganismSquaresAtSquareWithEntityId } from "../lifeSquares/_lsOperations.js";

import { getCurTime } from "../time.js";
import { CactusGreenLifeSquare } from "../lifeSquares/CactusGreenLifeSquare.js";
import { CactusRootLifeSquare } from "../lifeSquares/CactusRootLifeSquare.js";
import { CactusSeedOrganism } from "./CactusSeedOrganism.js";
class CactusOrganism extends BaseOrganism {
    constructor(square) {
        super(square);
        this.proto = "CactusOrganism";
        this.type = "plant";

        this.throttleInterval = 1000;

        this.plantLastGrown = getCurTime();
        this.waterLastGrown = getCurTime();
        this.rootLastGrown = getCurTime();

        this.airCoef = 3.5;
        this.dirtCoef = 2.5;
        this.waterCoef = 8.5;

        this.maximumLifeSquaresOfType = {
            "green": 100,
            "root": 200
        }

        this.applyWind = true;
    }

    postTick() {
        super.postTick();
    }


    getSeedSquare() {
        var topGreen = this.getHighestGreen();
        var seedSquare = new SeedSquare(topGreen.posX, topGreen.posY - 1);
        if (addSquare(seedSquare)) {
            var newOrg = new CactusSeedOrganism(seedSquare);
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
            var orgSq = addOrganismSquare(new CactusGreenLifeSquare(newPlantSquare, this));
            if (orgSq) {
                orgSq.linkSquare(newPlantSquare);
                this.addAssociatedLifeSquare(orgSq);
            }
        } else {
            this.destroy();
        }
        if (!this.linkedSquare.validPlantHome) {
            this.destroy();
            return;
        }
        var rootSq = addOrganismSquare(new CactusRootLifeSquare(this.linkedSquare, this));
        rootSq.linkSquare(this.linkedSquare);
        rootSq.addChild(orgSq);
        this.linkedSquare.linkOrganismSquare(rootSq);
        this.addAssociatedLifeSquare(rootSq);
    }


    getExteriorRoots() {
        return this.lifeSquares
        .filter((lsq) => lsq.type == "root")
        .filter((lsq) => lsq.childLifeSquares.length == 0);
    }

    growNewPlant() {
        if (!this.canGrowPlant()) {
            return 0;
        }
        if (getCurTime() > this.plantLastGrown + this.throttleInterval) {
            this.plantLastGrown = getCurTime();

            // grow in a sphere around the base of the organism

            var candidateGrowthLocations = new Array();

            this.lifeSquares.forEach((lsq) => {
                for (let i = -1; i < 2; i++) {
                    for (let j = -1; j < 2; j++) {
                        if (i == 0 && j == 0) {
                            continue;
                        }
                        if (Math.abs(i) == Math.abs(j)) {
                            continue;
                        }
                        var nextX = lsq.posX + i;
                        var nextY = lsq.posY + j;
                        if (getSquares(nextX, nextY).length == 0) {
                            var dist = ((this.posX - nextX) ** 8 + (this.posY - nextY) ** 2) ** 0.5;
                            var numNeighborsAtNewSquare = this.lifeSquares
                                .filter((sq) => sq in getDirectNeighbors(nextX, nextY))
                                .map((sq) => 1)
                                .reduce(
                                (accumulator, currentValue) => accumulator + currentValue,
                                0,
                            );

                            candidateGrowthLocations.push([lsq.posX + i, lsq.posY + j, numNeighborsAtNewSquare, dist, lsq]);
                        }
                    }
                }
            });

            if (candidateGrowthLocations.length == 0) {
                return;
            }
            candidateGrowthLocations.sort((a, b) => (a[2] - b[2]) * 100 + (a[3] - b[3]));
            var chosenCandidate = candidateGrowthLocations[Math.floor(Math.random() * candidateGrowthLocations.length / 4)]
            var newPlantSquare = new PlantSquare(chosenCandidate[0], chosenCandidate[1]);
            if (addSquare(newPlantSquare)) {
                var newPopGrassGreenLifeSquare = addOrganismSquare(new CactusGreenLifeSquare(newPlantSquare, this));
                if (newPopGrassGreenLifeSquare) {
                    this.addAssociatedLifeSquare(newPopGrassGreenLifeSquare);
                    newPopGrassGreenLifeSquare.linkSquare(newPlantSquare);
                    chosenCandidate[4].addChild(newPopGrassGreenLifeSquare);
                    return newPopGrassGreenLifeSquare.getCost();
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
                    }});
                }
            if (wettestSquare != null) {
                var cactusRootLifeSquare = addOrganismSquare(new CactusRootLifeSquare(wettestSquare, this));
                if (cactusRootLifeSquare) {
                    this.addAssociatedLifeSquare(cactusRootLifeSquare);
                    cactusRootLifeSquare.linkSquare(wettestSquare);
                    wettestSquareParent.addChild(cactusRootLifeSquare)
                    wettestSquare.linkOrganismSquare(cactusRootLifeSquare);
                    return cactusRootLifeSquare.getCost();
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
                var newRootSquare = addOrganismSquare(new CactusRootLifeSquare(dirtiestSquare, this));
                this.addAssociatedLifeSquare(newRootSquare);
                newRootSquare.linkSquare(dirtiestSquare);
                dirtiestSquareParent.addChild(newRootSquare);
                dirtiestSquare.linkOrganismSquare(newRootSquare);
                return newRootSquare.getCost();
            }
        }
        return 0;
    }

    preRender() {
        super.preRender();
        this.lifeSquares
        .filter((sq) => sq.type == "green")
        .forEach((lsq) => {
            lsq.xOffset = this.xOffset;
        });
    }
}

export { CactusOrganism }