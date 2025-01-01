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
        this.lastDeflectionStates = new Array(100);
        this.lastDeflectionAngles = new Array(100);
        this.deflectionIdx = 0;

        this.deflectionState = 0;
        this.deflectionStateTheta = 0;
        this.deflectionStateMax = Math.random() * 500;

        this.deflectionStateFunctions = [];
    }

    updateDeflectionStateFunctions() {
        if (this.deflectionStateFunctions.length > 4) {
            return;
        }
        var r1 = Math.random(), r2 = Math.random(), r3 = Math.random(); 
        this.deflectionStateFunctions.push(() => (r1 * 5 + r2 * 10 * Math.sin((1 + r3) * this.deflectionStateTheta)));
    }

    updateDeflectionState() {
        if (this.deflectionIdx % 75 == 0) {
            this.deflectionStateFunctions.shift();
        }
        this.updateDeflectionStateFunctions();
        this.deflectionStateTheta += 0.1;

        this.deflectionState = this.deflectionStateFunctions.map((f) => f()).reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
        );
    }

    getStartDeflectionState() {
        return this.lastDeflectionStates.reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
        ) / this.lastDeflectionStates.length;
    }

    getStartDeflectionAngle() {
        if (this.deflectionIdx < this.lastDeflectionAngles.length) {
            return Math.PI / 2;
        }

        return this.lastDeflectionAngles.reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
        ) / this.lastDeflectionAngles.length;
    }



    applyDeflectionStateToSquares() {
        var greenSquares = Array.from(this.lifeSquares.filter((lsq) => lsq.type == "green"));
        var deflectionPerSquare = (this.deflectionState - this.getStartDeflectionState()) / greenSquares.length;

        var currentTheta = (this.getStartDeflectionAngle())
        var currentXOffset = 0;
        var currentYOffset = 0;

        for (let i = 0; i < greenSquares.length; i++) {
            var sqAppliedDeflection = deflectionPerSquare; // * (i / greenSquares.length);
            currentTheta += sqAppliedDeflection / greenSquares[i].deflectionStrength; // hooke's law motherfuckerrrrrsssss
            
            this.lastDeflectionAngles[this.deflectionIdx % this.lastDeflectionAngles.length] = currentTheta;
            this.lastDeflectionStates[this.deflectionIdx % this.lastDeflectionStates.length] = this.deflectionState;

            currentXOffset += Math.cos(currentTheta);
            currentYOffset += Math.sin(currentTheta);

            this.deflectionIdx += 1;

            greenSquares[i].deflectionXOffset = currentXOffset - 2 * ((greenSquares[i].linkedOrganism.posX - greenSquares[i].posX) / 2);
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