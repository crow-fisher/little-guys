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
import { HydrangeaGreenLifeSquare } from "../lifeSquares/HydrangeaGreenLifeSquare.js";
import { getDist, hexToRgb, randNumber, rgbToHex, dec2bin, rgbToRgba } from "../common.js";
class HydrangeaOrganism extends BaseOrganism {
    constructor(square) {
        super(square);
        this.proto = "HydrangeaOrganism";
        this.type = "plant";

        this.throttleInterval = 1000;

        this.airCoef = 0.8;
        this.dirtCoef = 1.2;
        this.waterCoef = 0.9;

        this.spawnSeedSpeed = 4;

        this.reproductionEnergy *= 1.5;
        this.reproductionEnergyUnit *= 0.75;

        this.maximumLifeSquaresOfType = {
            "green": 1000,
            "root": 20
        }

    }

    hydrangaInit() {
        this.width = randNumber(5, 7);
        this.height = randNumber(3, 4) * 2;
        this.slant = Math.random() - 0.5;
        this.numBlocks = Math.floor(1.5 * this.width * this.height * this.characteristicIntegral(1));
        this.numPossibleFlowerBlocks = Math.floor(this.numBlocks * 0.7);
        this.numNonFlowerBlocks = this.numBlocks - this.numPossibleFlowerBlocks;
        this.numFlowers = Math.floor(this.numBlocks * 0.2);
        this.bitmasks = [];
        this.curBitmaskPosition = 0;
        this.loadBitmasks();
        
        this.flowerStart = 0.5;
        this.flowerEnd = 0.9;

        this.flowerColorAir = "#f4f3f5";
        this.flowerColorWater = "#EC86D6";
        this.flowerColorDirt = "#BEA2F2";
        this.flowerStartOpacity = 0.8;

        this.lifeSquares.filter((lsq) => lsq.type == "green").forEach((lsq) => lsq.opacity = this.flowerStartOpacity);

    }

    blocksToEdge(posX, posY) {
        var flowerRelativePosX = posX - this.posX;
        var flowerRelativePosY = posY - this.posY;
        
        var max = Math.max(Math.abs(flowerRelativePosX), Math.abs(flowerRelativePosY));
        var posRelativePosXNormalized = flowerRelativePosX / max;
        var posRelativePosYNormalized = flowerRelativePosY / max;

        var xSide = (flowerRelativePosX > 0 ? 1 : -1);
        
        this.endWidth = this.width * posRelativePosXNormalized * xSide;
        this.endHeight = this.height * posRelativePosYNormalized * (flowerRelativePosY > 0 ? 1 : -1);

        var curX = flowerRelativePosX;
        var curY = flowerRelativePosY;

        while (Math.abs(curX) <= Math.abs(this.endWidth) && curY <= this.endHeight) {
            var nextX = curX + xSide;
            var nextY = curY + 1;
            if (nextX <= Math.abs(this.endWidth) && this.lifeSquares.some((lsq) => lsq.posX == this.posX + nextX && lsq.posY == this.posY + curY)) {
                curX = nextX;
                continue;
            } else {
                if (nextY <= this.endHeight && this.lifeSquares.some((lsq) => lsq.posX == this.posX + curX && lsq.posY == this.posY + nextY)) {
                    curY = nextY;
                    continue;
                } else {
                    break;
                }
            }
        } 
        return Math.abs(curX - flowerRelativePosX) + Math.abs(curY - flowerRelativePosY);
    }

    distToEdge(posX, posY) {
        var flowerRelativePosX = Math.abs(posX - this.posX);
        var flowerRelativePosY = Math.abs(posY - this.posY);
        
        var max = Math.max(flowerRelativePosX, flowerRelativePosY);
        var posRelativePosXNormalized = flowerRelativePosX / max;
        var posRelativePosYNormalized = flowerRelativePosY / max;

        return this.innerDist(this.width * posRelativePosXNormalized, (this.height / 2) * posRelativePosYNormalized) - this.innerDist(flowerRelativePosX, flowerRelativePosY)
    }

    innerDist(x, y) {
        return Math.sqrt(x ** 2 + y ** 2);
    }

    dist(posX, posY) {
        return Math.sqrt((this.posX - posX) ** 2 + (this.posY - posY) ** 2);
    }

    loadBitmasks() {
        for (let i = 0; i <= 6; i++) {
            this.bitmasks.push(this.getBitmask());
        }
    }

    getBitmask() {
        return this.getSubBitMask(this.numPossibleFlowerBlocks * 0.3, (this.numFlowers / 2)).concat(
               this.getSubBitMask(this.numPossibleFlowerBlocks * 0.5, (this.numFlowers / 2)).concat(
               this.getSubBitMask(this.numNonFlowerBlocks, this.numNonFlowerBlocks / 2))
        )
    }

    getSubBitMask(length, total) {
        var out = [0];
        for (let i = 0; i < length; i++) {
            out.push(Math.random() * (total / length) * (Math.random() > out[out.length - 1] ? 3 : 0.75));
        }
        return out.slice(1);
    }

    getBitmaskValue(idx) {
        return this.bitmasks.map((bitmask) => bitmask[idx % bitmask.length]).reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
        );
    }
    addAssociatedLifeSquare(lifeSquare) {
        super.addAssociatedLifeSquare(lifeSquare);
        if (this.bitmasks == null) {
            this.hydrangaInit();
        }
        if (lifeSquare.type == "green") {
            lifeSquare.shouldFlower = this.getBitmaskValue(this.curBitmaskPosition);
            lifeSquare.shouldFlowerFlag = this.curBitmaskPosition > (this.numBlocks - this.numPossibleFlowerBlocks);
            this.curBitmaskPosition += 1;
        }
    }

    isPointInGrowBounds(x, y) {
        y = Math.abs(y);
        x /= this.width;
        y /= this.height;
        if (x > 1) {
            return false;
        }
        return y < Math.abs(this.characteristicFunc(x));
    }

    // normalized to 1
    characteristicFunc(x) {
        return 1 - Math.abs(x)**3 + this.slant * x;
    }

    characteristicIntegral(x) {
        return x - (1/4) * x **4 + (1/2) * this.slant * x ** 2; ;
    }

    getNextFlowerColors() {
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
        return [rgbToHex(out.r, out.g, out.b), rgbToRgba(out.r, out.g, out.b, this.flowerStartOpacity), out];
    }

    getSeedSquare() {
        var ret = null;
        this.lifeSquares
            .filter((lsq) => lsq.flowering)
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

    growFlower() {
        this.lifeSquares.forEach((lsq) => lsq.flower());
        return 0;
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
            orgSq = addOrganismSquare(new HydrangeaGreenLifeSquare(newPlantSquare, this));
            if (orgSq) {
                orgSq.linkSquare(newPlantSquare);
                orgSq.opacity = this.flowerStartOpacity;
                this.addAssociatedLifeSquare(orgSq);
            } else {
                this.destroy();
            }
        } else {
            this.destroy();
        }
        if (orgSq == null || !this.linkedSquare.validPlantHome) {
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
        for (let i = -this.width; i <= this.width; i++) {
            for (let j = 0; j <= this.height; j++) {
                if (this.isPointInGrowBounds(i, j)) {
                    out.push([this.posX + i, this.posY - j]);
                }
            }
        }
        return out;
    }

    growAndDecay() {
        super.growAndDecay();
        if (Math.random() > 0.995) {
            this.currentEnergy -= (this.currentEnergy / 10) * this.growNewPlant();
        }
    }

    growNewPlant() {
        if (!this.canGrowPlant()) {
            return 0;
        }
        if (this.getLifeCyclePercentage() > (1 - (1 - this.flowerEnd) * 3)) {
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
                
                var flowerColors = this.getNextFlowerColors();
                newHydrangeaGreenLifeSquare.flowerColor = flowerColors[0];
                newHydrangeaGreenLifeSquare.flowerColorRgba = flowerColors[1];
                newHydrangeaGreenLifeSquare.flowerColorRgb = flowerColors[2];

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
        if (this.getLifeCyclePercentage() > (1 - (1 - this.flowerEnd) * 3)) {
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
        if (this.getLifeCyclePercentage() > (1 - (1 - this.flowerEnd) * 3)) {
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