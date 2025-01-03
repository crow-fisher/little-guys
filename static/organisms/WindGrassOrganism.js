import {BaseOrganism} from "./BaseOrganism.js"
import { SeedSquare } from "../squares/SeedSquare.js";
import { WindGrassSeedOrganism } from "./WindGrassSeedOrganism.js";

import { removeSquare } from "../globalOperations.js";
import { getCollidableSquareAtLocation } from "../squares/_sqOperations.js";
import { PlantSquare } from "../squares/PlantSquare.js";
import { WindGrassGreenLifeSquare } from "../lifeSquares/WindGrassGreenLifeSquare.js";
import { WindGrassRootLifeSquare } from "../lifeSquares/WindGrassRootLifeSquare.js";
import { getDirectNeighbors } from "../squares/_sqOperations.js";
import { addSquare } from "../squares/_sqOperations.js";
import { getCountOfOrganismsSquaresOfTypeAtPosition } from "../lifeSquares/_lsOperations.js";
import { addOrganismSquare } from "../lifeSquares/_lsOperations.js";
import { addNewOrganism, addOrganism } from "./_orgOperations.js";
import { getOrganismSquaresAtSquare } from "../lifeSquares/_lsOperations.js";
import { getOrganismSquaresAtSquareWithEntityId } from "../lifeSquares/_lsOperations.js";

import { getCurTime } from "../globals.js";
import { randNumber } from "../common.js";

import { getWindSpeedAtLocation } from "../wind.js";

class WindGrassOrganism extends BaseOrganism {
    constructor(square) {
        super(square);
        this.proto = "WindGrassOrganism";
        this.type = "plant";

        this.throttleInterval = 300;
        this.currentEnergy = 20;

        this.airCoef = 1;
        this.dirtCoef = 1;
        this.waterCoef = 0.30;

        this.maximumLifeSquaresOfType = {
            "green": randNumber(3, 6),
            "root": 80
        }

        this.highestGreen = null;
        this.startDeflectionAngle = 0; 
        this.lastDeflectionStateXs = new Array(8);
        this.lastDeflectionStateYs = new Array(8);
        this.deflectionIdx = 0;

        this.deflectionStateX = 0;
        this.deflectionStateY = 0;

        this.deflectionStateFunctions = [];
    }

    updateDeflectionState() {
        var highestGreen = this.getHighestGreen();
        var windVec = getWindSpeedAtLocation(highestGreen.posX + highestGreen.deflectionXOffset, highestGreen.posY + highestGreen.deflectionYOffset);

        // start 
        var startX = this.getStartDeflectionStateX();
        var startY = this.getStartDeflectionStateY();
        // apply wind force 
        this.deflectionStateX = startX + (windVec[0] / this.lastDeflectionStateXs.length);
        this.deflectionStateY = startY + (windVec[1] / this.lastDeflectionStateYs.length);

        // this.deflectionStateX += windVec[0];
        // this.deflectionStateY += windVec[1];

        this.deflectionStateY = Math.max(-.9, this.deflectionStateY);

        // apply plant spring force
        
        this.deflectionStateX *= 0.8;
        this.deflectionStateY *= 0.8;

        this.lastDeflectionStateXs[this.deflectionIdx % this.lastDeflectionStateXs.length] = this.deflectionStateX;
        this.lastDeflectionStateYs[this.deflectionIdx % this.lastDeflectionStateYs.length] = this.deflectionStateY;

        this.deflectionIdx += 1;

    }

    getStartDeflectionStateX() {
        return this.lastDeflectionStateXs.reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
        ) / this.lastDeflectionStateXs.length;
    }

    getStartDeflectionStateY() {
        return this.lastDeflectionStateYs.reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
        ) / this.lastDeflectionStateYs.length;
    }


    applyDeflectionStateToSquares() {
        var greenSquares = Array.from(this.lifeSquares.filter((lsq) => lsq.type == "green"));

        var startDeflectionX = this.getStartDeflectionStateX();
        var startDeflectionY = this.getStartDeflectionStateY();

        var currentDeflectionX = this.deflectionStateX;
        var currentDeflectionY = this.deflectionStateY;

        var startLength = (startDeflectionX ** 2 + startDeflectionY ** 2 ) ** 0.5
        var currentLength = (currentDeflectionX ** 2 + currentDeflectionY ** 2 ) ** 0.5

        if (startLength * currentLength == 0) {
            startLength = 1;
            currentLength = 1;
        }
        
        if (startDeflectionX == 0) {
            startDeflectionX = 0.1;
        }
        if (currentDeflectionX == 0) {
            currentDeflectionX = 0.1;
        }

        startDeflectionY += (Math.max(1, startLength) **2 - startDeflectionX ** 2) ** 0.5;
        currentDeflectionY += (Math.max(1, currentLength) ** 2 - currentDeflectionX ** 2) ** 0.5;

        var startTheta = Math.atan(startDeflectionY / startDeflectionX);
        var endTheta = Math.atan(currentDeflectionY / currentDeflectionX);

        if (startDeflectionX < 0) {
            startTheta = Math.PI + startTheta;
        }

        if (currentDeflectionX < 0) {
            endTheta = Math.PI + endTheta;
        }

        var currentXOffset = 0;
        var currentYOffset = 0;

        console.log(startTheta, endTheta);

        startTheta = Math.max(0.4, startTheta);
        startTheta = Math.min(Math.PI - 0.4, startTheta);

        endTheta = Math.max(0.2, endTheta);
        endTheta = Math.min(Math.PI - 0.2, endTheta);

        // startTheta = 0;
        // endTheta = Math.PI / 2;

        // 0 is straight left, pi/2 is up, pi is right, pi * 3/2 is down
        var currentTheta = startTheta;
        var thetaDelta = endTheta - startTheta;

        for (let i = 0; i < greenSquares.length; i++) {
            currentTheta += thetaDelta / greenSquares.length;

            currentXOffset += Math.cos(currentTheta);
            currentYOffset += Math.sin(currentTheta);

            greenSquares[i].deflectionXOffset = -currentXOffset - 2 * ((greenSquares[i].linkedOrganism.posX - greenSquares[i].posX) / 2);
            greenSquares[i].deflectionYOffset = currentYOffset - 2 * ((greenSquares[i].linkedOrganism.posY - greenSquares[i].posY) / 2);
        }
    }

    getSeedSquare() {
        var topGreen = this.getHighestGreen();
        var seedSquare = new SeedSquare(topGreen.posX, topGreen.posY - 1);
        if (addSquare(seedSquare)) {
            var newOrg = new WindGrassSeedOrganism(seedSquare);
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
            var orgSq = addOrganismSquare(new WindGrassGreenLifeSquare(newPlantSquare, this));
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
        var rootSq = addOrganismSquare(new WindGrassRootLifeSquare(this.linkedSquare, this));
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
            .filter((sq) => sq.type == "green")).sort((a, b) => a.posY - b.posY)[0];
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
            var highestPlantSquare = Array.from(this.lifeSquares.filter((sq) => sq.type == "green").sort((a, b) => a.posY - b.posY))[0];
            if (highestPlantSquare == null) {
                // then we take highest root square;
                highestPlantSquare = Array.from(this.lifeSquares.filter((sq) => sq.type == "root").sort((a, b) => a.posY - b.posY))[0];
            }
            var newPlantSquare = new PlantSquare(highestPlantSquare.posX, highestPlantSquare.posY - 1);
            if (addSquare(newPlantSquare)) {
                var newWindGrassGreenLifeSquare = addOrganismSquare(new WindGrassGreenLifeSquare(newPlantSquare, this));
                if (newWindGrassGreenLifeSquare) {
                    this.addAssociatedLifeSquare(newWindGrassGreenLifeSquare);
                    newWindGrassGreenLifeSquare.linkSquare(newPlantSquare);
                    highestPlantSquare.addChild(newWindGrassGreenLifeSquare);
                    return newWindGrassGreenLifeSquare.getCost();
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
                var newWindGrassRootLifeSquare = addOrganismSquare(new WindGrassRootLifeSquare(wettestSquare, this));
                if (newWindGrassRootLifeSquare) {
                    this.addAssociatedLifeSquare(newWindGrassRootLifeSquare);
                    newWindGrassRootLifeSquare.linkSquare(wettestSquare);
                    wettestSquare.linkOrganismSquare(newWindGrassRootLifeSquare);
                    wettestSquareParent.addChild(newWindGrassRootLifeSquare)
                    return newWindGrassRootLifeSquare.getCost();
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
                var windGrassRootLifeSquare = addOrganismSquare(new WindGrassRootLifeSquare(dirtiestSquare, this));
                this.addAssociatedLifeSquare(windGrassRootLifeSquare);
                windGrassRootLifeSquare.linkSquare(dirtiestSquare);
                dirtiestSquareParent.addChild(windGrassRootLifeSquare);
                dirtiestSquare.linkOrganismSquare(windGrassRootLifeSquare);
                return windGrassRootLifeSquare.getCost();
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

    tick() {
        super.tick();
        this.updateDeflectionState();
        this.applyDeflectionStateToSquares();
    }

}

export { WindGrassOrganism }