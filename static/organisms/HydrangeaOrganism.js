import { BaseOrganism } from "./BaseOrganism.js"
import { SeedSquare } from "../squares/SeedSquare.js";
import { PopGrassSeedOrganism } from "./PopGrassSeedOrganism.js";

import { removeSquare } from "../globalOperations.js";
import { getCollidableSquareAtLocation, getNeighbors, getSquares } from "../squares/_sqOperations.js";
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
import { HydrangeaSeedOrganism } from "./HydrangeaSeedOrganism.js";
import { HydrangeaRootLifeSquare } from "../lifeSquares/HydrangeaRootLifeSquare.js";
import { HydrangeaFlowerLifeSquare } from "../lifeSquares/HydrangeaFlowerLifeSquare.js";
import { HydrangeaGreenLifeSquare } from "../lifeSquares/HydrangeaGreenLifeSquare.js";
import { getDist, hexToRgb, randNumber, rgbToHex } from "../common.js";
class HydrangeaOrganism extends BaseOrganism {
    constructor(square) {
        super(square);
        this.proto = "HydrangeaOrganism";
        this.type = "plant";

        this.throttleInterval = 1000;

        this.airCoef = 1;
        this.dirtCoef = .8;
        this.waterCoef = 0.20;

        this.spawnSeedSpeed = 2;

        this.reproductionEnergy *= 1.5;
        this.reproductionEnergyUnit *= 1.5;

        this.maximumLifeSquaresOfType = {
            "green": 1000,
            "root": 20
        }

        this.ovalParts = [randNumber(3, 8), randNumber(2, 5)].sort();
        this.ovalMaj = this.ovalParts[1];
        this.ovalMaj += this.ovalMaj % 2;
        this.ovalMin = this.ovalParts[0];
        this.ovalMin += this.ovalMin % 2;

        this.c = Math.random() * (Math.PI / 2) * (Math.random() > 0.5 ? 1 : -1);

        this.flowerColorAir = "#f4f3f5";
        this.flowerColorWater = "#efeff0";
        this.flowerColorDirt = "#f2a3eb";

        this.minAgeToGrowFlower = 10 * 1000;
    }

    getNextFlowerColor() {
        var squaresByType = this.getGrownSquaresByMotivation();

        var min = Math.min(Math.min(squaresByType["air"], squaresByType["dirt"]), squaresByType["water"]);
        var max = Math.max(Math.max(squaresByType["air"], squaresByType["dirt"]), squaresByType["water"]);

        var airColorMult = (1/3);
        var waterColorMult = (1/3);
        var dirtColorMult = (1/3);

        if (min != max) {
            airColorMult = (squaresByType["air"] * (1 + 0.1 * Math.random())) / max;
            waterColorMult = (squaresByType["water"] * (1 + 0.1 * Math.random())) / max;
            dirtColorMult = (squaresByType["dirt"] * (1 + 0.1 * Math.random())) / max;
        }

        var mean = (airColorMult + waterColorMult + dirtColorMult) / 3;
        airColorMult /= mean;
        waterColorMult /= mean;
        dirtColorMult /= mean;

        var airColorRgb = hexToRgb(this.flowerColorAir);
        var dirtColorRgb = hexToRgb(this.flowerColorDirt);
        var waterColorRgb = hexToRgb(this.flowerColorWater);

        var out = {
            r: Math.floor(airColorRgb.r * airColorMult + dirtColorRgb.r * dirtColorMult + waterColorRgb.r * waterColorMult),
            g: Math.floor(airColorRgb.g * airColorMult + dirtColorRgb.g * dirtColorMult + waterColorRgb.g * waterColorMult),
            b: Math.floor(airColorRgb.b * airColorMult + dirtColorRgb.b * dirtColorMult + waterColorRgb.b * waterColorMult),
        }
        return rgbToHex(out.r, out.g, out.b);
    }


    isPointInGrowBounds(x, y) {
        return (Math.sin(x * this.c)) + (x ** 2 / this.ovalMaj ** 2) + (y ** 2 / this.ovalMin ** 2) < 0.8;
    }

    getSeedSquare() {
        var ret = null;
        this.lifeSquares
            .filter((lsq) => lsq.type == "flower")
            .filter((lsq) => getSquares(lsq.posX, lsq.posY - 1).length == 0)
            .some((lsq) => {
                var seedSquare = new SeedSquare(lsq.posX, lsq.posY - 1);
                if (addSquare(seedSquare)) {
                    var newOrg = new HydrangeaSeedOrganism(seedSquare);
                    newOrg.linkSquare(seedSquare);
                    if (addNewOrganism(newOrg)) {
                        ret = seedSquare;
                        return true;
                    } else {
                        removeSquare(seedSquare);
                        console.log("Failed to add organism to seed square");
                        return false;
                    }
                }
            });

        return ret;
    }

    growInitialSquares() {
        // hydrangas cannot grow underwater in any capacity like pop grass
        if (getCollidableSquareAtLocation(this.posX, this.posY - 1)
            .some((sq) => sq.proto == "WaterSquare")) {
            this.destroy();
            return;
        };
        var orgSq;
        var newPlantSquare = addSquare(new PlantSquare(this.posX, this.posY - 1));
        if (newPlantSquare) {
            var orgSq = addOrganismSquare(new HydrangeaGreenLifeSquare(newPlantSquare, this));
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
        var rootSq = addOrganismSquare(new HydrangeaRootLifeSquare(this.linkedSquare, this));
        rootSq.linkSquare(this.linkedSquare);
        rootSq.addChild(orgSq);
        this.linkedSquare.linkOrganismSquare(rootSq);
        this.addAssociatedLifeSquare(rootSq);


    }

    getValidGreenLocations() {
        var out = [];
        for (let i = -this.ovalMaj; i <= this.ovalMaj; i++) {
            for (let j = -this.ovalMin; j <= this.ovalMin; j++) {
                if (this.isPointInGrowBounds(i, j)) {
                    out.push([this.posX + i, this.posY + j - this.ovalMin + 2]);
                }
            }
        }
        return out;
    }

    shouldGrowFlower() {
        return this.currentEnergy > (this.reproductionEnergy * 0.5 +
            (0.05 *
                this.lifeSquares.map((lsq) => lsq.type == "flower")
                    .reduce(
                        (accumulator, currentValue) => accumulator + currentValue,
                        0,
                    )));
    }

    growFlower() {
        if (!this.shouldGrowFlower()) {
            return 0;
        }
        var candidateParents = Array.from(this.lifeSquares.filter((lsq) => lsq.type == "green").filter((lsq) => lsq.spawnTime < getCurTime() - this.minAgeToGrowFlower));
        var chosenCandidateParent = null;
        while (candidateParents.length > 0) {
            chosenCandidateParent = candidateParents[randNumber(0, candidateParents.length - 1)];
            if (
                getSquares(chosenCandidateParent.posX, chosenCandidateParent.posY - 1).some((sq) => sq.organic || sq.collision) || 
                    (
                        getNeighbors(chosenCandidateParent.posX, chosenCandidateParent.posY - 1)
                            .filter((sq) => sq.linkedOrganismSquares.some((lsq) => lsq.type == "flower"))
                            .map((sq) => 1)
                            .reduce(
                                (accumulator, currentValue) => accumulator + currentValue,
                                0,
                            ) > 0
                    )) {
                candidateParents = Array.from(candidateParents.filter((cand) => cand != chosenCandidateParent));
                continue;
            }
            else {
                break;
            }
        }
        if (chosenCandidateParent == null) {
            return 0;
        }

        var newPlantSquare = new PlantSquare(chosenCandidateParent.posX, chosenCandidateParent.posY - 1);
        if (addSquare(newPlantSquare)) {
            var newHydrangeaFlowerLifeSquare = addOrganismSquare(new HydrangeaFlowerLifeSquare(newPlantSquare, this));
            if (newHydrangeaFlowerLifeSquare) {
                newPlantSquare.linkOrganism(this);
                newPlantSquare.linkOrganismSquare(newHydrangeaFlowerLifeSquare);
                this.addAssociatedLifeSquare(newHydrangeaFlowerLifeSquare);
                newHydrangeaFlowerLifeSquare.linkSquare(newPlantSquare);
                newHydrangeaFlowerLifeSquare.color = this.getNextFlowerColor();
                chosenCandidateParent.addChild(newHydrangeaFlowerLifeSquare);
                return newHydrangeaFlowerLifeSquare.getCost();
            } else {
                newPlantSquare.destroy();
                return 0;
            }
        } else {
            return 0;
        }


    }

    growNewPlant() {
        if (!this.canGrowPlant()) {
            return 0;
        }
        var chosenLoc = null;
        var chosenLocDistance = 0;
        var chosenNeighbor = null

        this.getValidGreenLocations()
            .filter((loc) => !this.lifeSquares.some((lsq) => lsq.posX == loc[0] && lsq.posY == loc[1]))
            .filter((loc) => !getSquares(loc[0], loc[1]).some((sq) => sq.organic || sq.collision))
            .forEach((loc) => {
                var adjacentLifeSquares = Array.from(this.lifeSquares
                    .filter((lsq) => lsq.dist(loc[0], loc[1]) < 2)
                );
                if (adjacentLifeSquares.length == 0) {
                    return;
                }
                var locDist = getDist(this.posX, loc[0], this.posY, loc[1]);

                if (chosenLoc == null || locDist < chosenLocDistance) {
                    chosenLoc = loc;
                    chosenLocDistance = locDist;
                    chosenNeighbor = adjacentLifeSquares[randNumber(0, adjacentLifeSquares.length - 1)];
                }
            });

        if (chosenLoc == null) {
            return 0;
        }
        var newPlantSquare = new PlantSquare(chosenLoc[0], chosenLoc[1]);
        if (addSquare(newPlantSquare)) {
            var newHydrangeaGreenLifeSquare = addOrganismSquare(new HydrangeaGreenLifeSquare(newPlantSquare, this));
            if (newHydrangeaGreenLifeSquare) {
                newPlantSquare.linkOrganism(this);
                newPlantSquare.linkOrganismSquare(newHydrangeaGreenLifeSquare);
                newHydrangeaGreenLifeSquare.motivation = "air";
                this.addAssociatedLifeSquare(newHydrangeaGreenLifeSquare);
                newHydrangeaGreenLifeSquare.linkSquare(newPlantSquare);
                chosenNeighbor.addChild(newHydrangeaGreenLifeSquare);
                return newHydrangeaGreenLifeSquare.getCost();
            }
        };
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
                var newHydrangeaWaterlifeSquare = addOrganismSquare(new HydrangeaRootLifeSquare(wettestSquare, this));
                if (newHydrangeaWaterlifeSquare) {
                    newHydrangeaWaterlifeSquare.motivation = "water";
                    this.addAssociatedLifeSquare(newHydrangeaWaterlifeSquare);
                    newHydrangeaWaterlifeSquare.linkSquare(wettestSquare);
                    wettestSquareParent.addChild(newHydrangeaWaterlifeSquare)
                    wettestSquare.linkOrganismSquare(newHydrangeaWaterlifeSquare);
                    return newHydrangeaWaterlifeSquare.getCost();
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
                var newHydrangeaRootLifeSquare = addOrganismSquare(new HydrangeaRootLifeSquare(dirtiestSquare, this));
                newHydrangeaRootLifeSquare.motivation = "dirt";
                this.addAssociatedLifeSquare(newHydrangeaRootLifeSquare);
                newHydrangeaRootLifeSquare.linkSquare(dirtiestSquare);
                dirtiestSquareParent.addChild(newHydrangeaRootLifeSquare);
                dirtiestSquare.linkOrganismSquare(newHydrangeaRootLifeSquare);
                return newHydrangeaRootLifeSquare.getCost();
            }
        }
        return 0;
    }

    preRender() {
        super.preRender();
    }
}

export { HydrangeaOrganism }