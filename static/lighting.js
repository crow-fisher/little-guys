import { RGB_COLOR_BLACK } from "./colors.js";
import { ALL_SQUARES, LIGHT_SOURCES } from "./globals.js";
import { getSqIterationOrder } from "./squares/_sqOperations.js";

var lifeSquarePositions = new Map();

export var MAX_BRIGHTNESS = 8;

export function forceAllLightCalculations() {
    LIGHT_SOURCES.forEach((ls) => ls.lastFullSquareUpdate = 0);
}

export function lightingClearLifeSquarePositionMap() {
    lifeSquarePositions = new Map();
}

export function lightingRegisterLifeSquare(lifeSquare) {
    if (lifeSquare.type != "green") {
        return;
    }
    var posX = Math.floor(lifeSquare.getPosX());
    var posY = Math.floor(lifeSquare.getPosY());

    if (!(posX in lifeSquarePositions)) {
        lifeSquarePositions[posX] = new Map();
    }
    if (!(posY in lifeSquarePositions[posX])) {
        lifeSquarePositions[posX][posY] = new Array();
    }
    lifeSquarePositions[posX][posY].push(lifeSquare);
    lifeSquare.lighting = [];
    while (lifeSquare.lighting.length < LIGHT_SOURCES.length) {
        lifeSquare.lighting.push(null);
    }
}

export class LightSource {
    constructor(posX, posY, brightnessFunc, colorFunc, radius) {
        this.posX = posX;
        this.posY = posY;
        this.brightnessFunc = brightnessFunc;
        this.colorFunc = colorFunc;
        this.radius = radius;
        this.frameLifeSquares = null;
        this.frameTerrainSquares = null;
        this.frameColor = RGB_COLOR_BLACK;
        this.allLifeSquares = new Array();
        this.visitedLifeSquares = new Set();
        this.lastFullSquareUpdate = 0;
    }

    preprocessLifeSquares() {
        this.frameLifeSquares = new Map();
        this.allLifeSquares = new Array();
        this.visitedLifeSquares = new Set();
        this.frameColor = this.colorFunc();
        var posXKeys = Object.keys(lifeSquarePositions);
        posXKeys.forEach((lsqPosX) => {
            var relPosX = Math.floor(lsqPosX - this.posX);
            var posYKeys = Object.keys(lifeSquarePositions[lsqPosX]);
            posYKeys.forEach((lsqPosY) => {
                var relPosY = Math.floor(lsqPosY - this.posY);
                if ((relPosX ** 2 + relPosY ** 2) ** 0.5 > this.radius) {
                    return;
                }
                if (!(relPosX in this.frameLifeSquares)) {
                    this.frameLifeSquares[relPosX] = new Map();
                }
                if (!(relPosY in this.frameLifeSquares[relPosX])) {
                    this.frameLifeSquares[relPosX][relPosY] = new Array();
                }
                this.frameLifeSquares[relPosX][relPosY].push(...lifeSquarePositions[lsqPosX][lsqPosY]);
                this.allLifeSquares.push(...lifeSquarePositions[lsqPosX][lsqPosY]);
            })
        })
    }

    preprocessTerrainSquares() {
        this.frameTerrainSquares = new Map();
        getSqIterationOrder().forEach((sq) => sq.lighting = []);
        getSqIterationOrder()
            .filter((sq) => sq.visible)
            .filter((sq) => ((this.posX - sq.posX) ** 2 + (this.posY - sq.posY) ** 2) ** 0.5 < this.radius)
            .forEach((sq) => {
                var relPosX = sq.posX - this.posX;
                var relPosY = sq.posY - this.posY;
                if (!(relPosX in this.frameTerrainSquares)) {
                    this.frameTerrainSquares[relPosX] = new Map();
                }
                if (!(relPosY in this.frameTerrainSquares[relPosX])) {
                    this.frameTerrainSquares[relPosX][relPosY] = new Array();
                }
                this.frameTerrainSquares[relPosX][relPosY].push(sq);
            });
    }

    doRayCasting(idx) {
        var shouldDoFullSquareUpdate = (Date.now() - this.lastFullSquareUpdate) > 1000;
        
        this.preprocessLifeSquares();
        var numRays = 64;
        var thetaStep = (2 * Math.PI / numRays);
        var targetLists = [this.frameLifeSquares];

        if (shouldDoFullSquareUpdate) {
            this.lastFullSquareUpdate = Date.now();
            this.preprocessTerrainSquares();
            targetLists.push(this.frameTerrainSquares);
        }

        for (let theta = -Math.PI + (thetaStep / 2); theta < Math.PI - (thetaStep / 2); theta += thetaStep) {
            var thetaSquares = [];
            targetLists.forEach((list) => {
                var posXKeys = Object.keys(list);
                posXKeys.forEach((relPosX) => {
                    var posYKeys = Object.keys(list[relPosX]);
                    posYKeys.forEach((relPosY) => {
                        var sqTheta = Math.atan(relPosY / relPosX);
                        if (Math.abs(sqTheta - theta) < thetaStep) {
                            thetaSquares.push([relPosX, relPosY]);
                        }
                    })
                });
            });
            thetaSquares = [...new Set(thetaSquares)];
            thetaSquares.sort((a, b) => (a[0] ** 2 + a[1] ** 2) ** 0.5 - (b[0] ** 2 + b[1] ** 2) ** 0.5);
            var curBrightness = MAX_BRIGHTNESS * this.brightnessFunc();

            thetaSquares.forEach((loc) => {
                targetLists.forEach((list) => {
                    if (!(loc[0] in list)) {
                        return;
                    }
                    if (!(loc[1] in list[loc[0]])) {
                        return;
                    }
                    list[loc[0]][loc[1]].forEach((obj) => {
                        obj.lighting[idx] = [];
                        obj.lighting[idx][0] = Math.max(0, curBrightness / MAX_BRIGHTNESS);
                        obj.lighting[idx][1] = this.frameColor;
                        if (obj.type != null && obj.type == "green") { // organism square
                            curBrightness -= 0.007;
                        } else if (obj.surface == false) {
                            curBrightness -= .03;
                        }
                        // do not go down in brightness for "surface" squares
                    });

                })
            });
        }
    }
}