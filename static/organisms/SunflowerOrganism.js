import {BaseOrganism} from "./BaseOrganism.js"
import { SeedSquare } from "../squares/SeedSquare.js";
import { SunflowerSeedOrganism } from "./SunflowerSeedOrganism.js";

import { removeSquare } from "../globalOperations.js";
import { getCollidableSquareAtLocation } from "../squares/_sqOperations.js";
import { PlantSquare } from "../squares/PlantSquare.js";
import { SunflowerGreenLifeSquare } from "../lifeSquares/SunflowerGreenLifeSquare.js";
import { SunflowerRootLifeSquare } from "../lifeSquares/SunflowerRootLifeSquare.js";
import { getDirectNeighbors } from "../squares/_sqOperations.js";
import { addSquare } from "../squares/_sqOperations.js";
import { getCountOfOrganismsSquaresOfTypeAtPosition } from "../lifeSquares/_lsOperations.js";
import { addOrganismSquare } from "../lifeSquares/_lsOperations.js";
import { addNewOrganism, addOrganism } from "./_orgOperations.js";
import { getOrganismSquaresAtSquare } from "../lifeSquares/_lsOperations.js";
import { getOrganismSquaresAtSquareWithEntityId } from "../lifeSquares/_lsOperations.js";

import { getCurTime } from "../time.js";
import { randNumber } from "../common.js";


class SunflowerOrganism extends BaseOrganism {
    constructor(square) {
        super(square);
        this.proto = "SunflowerOrganism";
        this.type = "plant";

        this.throttleInterval = Math.random() * 1000;

        this.airCoef = 0.25;
        this.dirtCoef = 1;
        this.waterCoef = 0.30;

        this.currentEnergy = 10;

        this.reproductionEnergy *= 0.9;
        this.reproductionEnergyUnit *= 0.9;

        this.maximumLifeSquaresOfType = {
            "green": 80,
            "root": 80
        }

        this.nextSide = Math.random() > 0.5 ? 1 : -1;

        this.flowerRadius = 3;
        this.bloomed = false;
        this.applyWind = true;

        this.minNumGreensForFlower = randNumber(50, 80);
    }

    getSeedSquare() {
        if (!this.bloomed) {
            return;
        }
        var topFlowerPetal = this.getHighestFlowerPetal();
        var seedSquare = new SeedSquare(topFlowerPetal.posX, topFlowerPetal.posY - 1);
        if (addSquare(seedSquare)) {
            var newOrg = new SunflowerSeedOrganism(seedSquare);
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
            var orgSq = addOrganismSquare(new SunflowerGreenLifeSquare(newPlantSquare, this));
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
        var rootSq = addOrganismSquare(new SunflowerRootLifeSquare(this.linkedSquare, this));
        rootSq.linkSquare(this.linkedSquare);
        rootSq.addChild(orgSq);
        this.linkedSquare.linkOrganismSquare(rootSq);
        this.addAssociatedLifeSquare(rootSq);
    }

    getLowestGreen() {
        return Array.from(this.lifeSquares
            .filter((sq) => sq.type == "green")).sort((a, b) => b.posY - a.posY)[0];
    }

    getHighestGreen() {
        return Array.from(this.lifeSquares
            .filter((sq) => sq.type == "green" && sq.subtype != "leaf").sort((a, b) => a.posY - b.posY))[0];
    }

    getHighestFlowerPetal() {
        return Array.from(this.lifeSquares
            .filter((sq) => sq.type == "flower" && sq.subtype == "flowerPetal").sort((a, b) => a.posY - b.posY))[0];
    }


    getExteriorRoots() {
        return this.lifeSquares
        .filter((lsq) => lsq.type == "root")
        .filter((lsq) => lsq.childLifeSquares.length == 0);
    }

    growUp() {
        if (this.bloomed) {
            return 0;
        }
        var highestPlantSquare = this.getHighestGreen();
        var newPlantSquare = new PlantSquare(highestPlantSquare.posX, highestPlantSquare.posY - 1);
        if (addSquare(newPlantSquare)) {
            var newSunflowerGreenLifeSquare = addOrganismSquare(new SunflowerGreenLifeSquare(newPlantSquare, this));
            if (newSunflowerGreenLifeSquare) {
                this.addAssociatedLifeSquare(newSunflowerGreenLifeSquare);
                newSunflowerGreenLifeSquare.linkSquare(newPlantSquare);
                if (highestPlantSquare.subtype == "stem") {
                    newSunflowerGreenLifeSquare.subtype = "joint";
                }
                highestPlantSquare.addChild(newSunflowerGreenLifeSquare);
                return newSunflowerGreenLifeSquare.getCost();
            }
        };
        return 0;
    }

    getFlowerStart() {
        var ar =  Array.from(this.lifeSquares.filter((sq) => sq.type == "flower" && sq.subtype == "flowerStart"));
        if (ar.length == 0) {
            return null;
        }
        return ar[0];
    }

    flowerLifeCycle() {

    }

    aboveMinNumGreensForFlower() {
        return this.lifeSquares.filter((lsq) => lsq.type == "green").map((lsq) => 1).reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
        ) > this.minNumGreensForFlower;
    }

    growFlower() {
        if (this.bloomed || !this.aboveMinNumGreensForFlower()) {
            return 0;
        }
        var flowerStart = this.getFlowerStart();
        if (flowerStart == null && this.getCurrentEnergyFrac() > 1) {
            var highestPlantSquare = this.getHighestGreen();
            if (highestPlantSquare.subtype == "joint") {
                this.currentEnergy -= this.growUp();
                return this.growFlower();
                // return 0;
            }
            var newPlantSquare = new PlantSquare(highestPlantSquare.posX, highestPlantSquare.posY - 1);
            if (addSquare(newPlantSquare)) {
                var newSunflowerGreenLifeSquare = addOrganismSquare(new SunflowerGreenLifeSquare(newPlantSquare, this));
                if (newSunflowerGreenLifeSquare) {
                    this.addAssociatedLifeSquare(newSunflowerGreenLifeSquare);
                    newSunflowerGreenLifeSquare.linkSquare(newPlantSquare);
                    newSunflowerGreenLifeSquare.type = "flower";
                    newSunflowerGreenLifeSquare.subtype = "flowerStart";
                    highestPlantSquare.addChild(newSunflowerGreenLifeSquare);
                    return newSunflowerGreenLifeSquare.getCost();
                }
            };
        }

        if (flowerStart == null && this.getCurrentEnergyFrac() < 1) {
            // not enough juice, try again later
            return 0;
        }

        var flowerGrowthPlan = flowerStart.getFlowerCenterGrowthPlan().filter((loc) => !this.lifeSquares.some((lsq) => lsq.posX == loc[0] && lsq.posY == loc[1]));
        var flowerGrowthPlanMaxY = Math.max(...flowerGrowthPlan.map((loc) => loc[1]));

        if (flowerGrowthPlan
            .filter((loc) => loc[1] == flowerGrowthPlanMaxY)
            .some((loc) => {
                var posX = loc[0];
                var posY = loc[1];
                var candidateParents = Array.from(this.lifeSquares.filter((lsq) => lsq.dist(posX, posY) <= 1));
                if (candidateParents.length == 0) {
                    return false;
                }
                // if (Math.random() < 0.7) {
                //     return false;
                // }
                var chosenCandidate = candidateParents[randNumber(0, candidateParents.length - 1)];

                var newPlantSquare = new PlantSquare(posX, posY);
                if (addSquare(newPlantSquare)) {
                    var newSunflowerGreenLifeSquare = addOrganismSquare(new SunflowerGreenLifeSquare(newPlantSquare, this));
                    if (newSunflowerGreenLifeSquare) {
                        this.addAssociatedLifeSquare(newSunflowerGreenLifeSquare);
                        newSunflowerGreenLifeSquare.linkSquare(newPlantSquare);
                        newSunflowerGreenLifeSquare.type = "flower";
                        newSunflowerGreenLifeSquare.subtype = "flowerCenter";
                        chosenCandidate.addChild(newSunflowerGreenLifeSquare);
                        return true;
                    }
                }
                return false;
            })) {
                return 0;
            }

            if (this.bloomed) {
                return 0;
            }
            var flowerBloomGrowthPlan = flowerStart.getFlowerBloomGrowthPlan();

            flowerBloomGrowthPlan.forEach((loc) => {
                var posX = loc[0];
                var posY = loc[1];
                var dist = loc[2];

                var currentSqAtLocArr = Array.from(this.lifeSquares.filter((lsq) => lsq.posX == posX && lsq.posY == posY));
                var newPlantSquare = new PlantSquare(posX, posY);
                if (currentSqAtLocArr.length == 0) {
                    if (addSquare(newPlantSquare)) {
                        var newSunflowerGreenLifeSquare = addOrganismSquare(new SunflowerGreenLifeSquare(newPlantSquare, this));
                        if (newSunflowerGreenLifeSquare) {
                            this.addAssociatedLifeSquare(newSunflowerGreenLifeSquare);
                            newSunflowerGreenLifeSquare.linkSquare(newPlantSquare);
                            newSunflowerGreenLifeSquare.type = "flower";
                            if (dist <= this.flowerRadius - 2) {
                                newSunflowerGreenLifeSquare.subtype = "flowerCenter";
                            } else {
                                newSunflowerGreenLifeSquare.subtype = "flowerPetal";

                            }
                            flowerStart.addChild(newSunflowerGreenLifeSquare);
                            return;
                        }
                    }
                }

                var currentSqAtLoc = currentSqAtLocArr[0];
                currentSqAtLoc.type = "flower";
                if (dist <= this.flowerRadius - 1) {
                    currentSqAtLoc.subtype = "flowerCenter";
                } else {
                    currentSqAtLoc.subtype = "flowerPetal";
                }
                
                // otherwise change that type to be a flower
            });

            this.bloomed = true;
        
            return this.currentEnergy / 10;

            // we've gotten all the way through our flower growth plan

            // now the flower has to bloom


    }

    growAndDecay() {
        super.growAndDecay();
        if (!this.aboveMinNumGreensForFlower()) {
            this.growNewPlant();
        }
    }

    growFromJoint(lifeSquare) {
        var jointGrowthPlan = lifeSquare.getJointGrowthPlan().filter((loc) => !this.lifeSquares.some((lsq) => lsq.posX == loc[0] && lsq.posY == loc[1]));
        var jointGrowthPlanMinY = Math.min(...jointGrowthPlan.map((loc) => loc[1]));
        if (jointGrowthPlan
            .filter((loc) => loc[1] == jointGrowthPlanMinY)
            .some((loc) => {
            var posX = loc[0];
            var posY = loc[1];

            var candidateParents = Array.from(this.lifeSquares.filter((lsq) => lsq.dist(posX, posY) <= 1));

            if (candidateParents.length == 0) {
                return false;
            }

            if (Math.random() < 0.7) {
                return false;
            }

            var chosenParent = candidateParents[randNumber(0, candidateParents.length - 1)];

            var newPlantSquare = new PlantSquare(posX, posY);
            if (addSquare(newPlantSquare)) {
                var newSunflowerGreenLifeSquare = addOrganismSquare(new SunflowerGreenLifeSquare(newPlantSquare, this));
                if (newSunflowerGreenLifeSquare) {
                    this.addAssociatedLifeSquare(newSunflowerGreenLifeSquare);
                    newSunflowerGreenLifeSquare.linkSquare(newPlantSquare);
                    newSunflowerGreenLifeSquare.subtype = "leaf";
                    chosenParent.addChild(newSunflowerGreenLifeSquare);
                    return true;
                }
            }
            return false;
        })) {
            return true;
        }
        return false;
    }

    growNewPlant() {
        if (!this.canGrowPlant()) {
            return 0;
        }
        if (getCurTime() > this.plantLastGrown + this.throttleInterval) {
            this.plantLastGrown = getCurTime();
            if (this.lifeSquares.filter((lsq) => lsq.type == "green" && lsq.subtype == "joint").some((lsq) => this.growFromJoint(lsq))) {
                return this.lifeSquares[this.lifeSquares.length - 1].getCost(); // yeah, yeah, tell it to the judge 
            } else {
                return this.growUp();
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
                    }});
                }
            if (wettestSquare != null) {
                var newSunflowerRootLifeSquare = addOrganismSquare(new SunflowerRootLifeSquare(wettestSquare, this));
                if (newSunflowerRootLifeSquare) {
                    this.addAssociatedLifeSquare(newSunflowerRootLifeSquare);
                    newSunflowerRootLifeSquare.linkSquare(wettestSquare);
                    wettestSquare.linkOrganismSquare(newSunflowerRootLifeSquare);
                    wettestSquareParent.addChild(newSunflowerRootLifeSquare)
                    return newSunflowerRootLifeSquare.getCost();
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
                                (compSquareResourceAvailable == dirtiestSquareDirtResourceAvailable)
                            ) {
                                dirtiestSquare = compSquare;
                                dirtiestSquareParent = iterSquare;
                                dirtiestSquareDirtResourceAvailable = compSquareResourceAvailable;
                            }
                        });
            });
            if (dirtiestSquare != null) {
                var sunflowerRootLifeSquare = addOrganismSquare(new SunflowerRootLifeSquare(dirtiestSquare, this));
                this.addAssociatedLifeSquare(sunflowerRootLifeSquare);
                sunflowerRootLifeSquare.linkSquare(dirtiestSquare);
                dirtiestSquareParent.addChild(sunflowerRootLifeSquare);
                dirtiestSquare.linkOrganismSquare(sunflowerRootLifeSquare);
                return sunflowerRootLifeSquare.getCost();
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

export { SunflowerOrganism }