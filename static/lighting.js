import { RGB_COLOR_BLACK } from "./colors.js";
import { randNumber } from "./common.js";
import { ALL_SQUARES, LIGHT_SOURCES } from "./globals.js";
import { CANVAS_SQUARES_X, CANVAS_SQUARES_Y } from "./index.js";
import { getSqIterationOrder, getSquares } from "./squares/_sqOperations.js";

var lifeSquarePositions = new Map();

export var default_light_throttle_interval = 30000;

export var MAX_BRIGHTNESS = 8;

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

export function lightingPrepareTerrainSquares() {
    getSqIterationOrder().forEach((sq) => {
        sq.lighting = [];
        for (let i = 0; i < LIGHT_SOURCES; i++) {
            sq.lighting.push(null);
        }
    });
}

export class LightGroup {
    constructor(posX, posY, sizeX, sizeY, scaleMult, brightnessFunc, colorFunc, radius, numRays) {
        this.lightSources = [];
        var newBrightnessFunc = () => brightnessFunc() / ((sizeX * sizeY) ** 0.35);
        for (let i = 0; i < sizeX; i++) {
            for (let j = 0; j < sizeY; j++) {
                this.lightSources.push(new LightSource(posX + (scaleMult * i), posY + (scaleMult * j), newBrightnessFunc, colorFunc, radius, numRays));
            }
        }
    }

    doRayCasting(i) {
        this.lightSources.forEach((ls) => ls.doRayCasting(i));
    }

    setLastFullSquareUpdate(val) {
        this.lightSources.forEach((ls) => ls.lastFullSquareUpdate = val);
    }
}

export class LightSource {
    constructor(posX, posY, brightnessFunc, colorFunc, radius, numRays) {
        this.posX = posX;
        this.posY = posY;
        this.brightnessFunc = brightnessFunc;
        this.colorFunc = colorFunc;
        this.radius = radius;
        this.numRays = numRays;
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
        this.preprocessLifeSquares();
        var targetLists = [this.frameLifeSquares];

        this.preprocessTerrainSquares();
        targetLists.push(this.frameTerrainSquares);

        var thetaStep = ((2 * Math.PI) / this.numRays);
        for (let theta = -Math.PI; theta < Math.PI; theta += thetaStep) {
            var thetaSquares = [];
            targetLists.forEach((list) => {
                var posXKeys = Object.keys(list);
                posXKeys.forEach((relPosX) => {
                    var posYKeys = Object.keys(list[relPosX]);
                    posYKeys.forEach((relPosY) => {
                        var sqTheta = Math.atan(relPosY / relPosX);
                        if (relPosX == 0 && relPosY == 0 && theta == -Math.PI) {
                            thetaSquares.push([relPosX, relPosY]);
                        }
                        else if (isNaN(sqTheta)) {
                            return;
                        } else if (sqTheta > theta && sqTheta < (theta + thetaStep)) {
                            thetaSquares.push([relPosX, relPosY]);
                        }
                    })
                });
            });
            thetaSquares = [...new Set(thetaSquares)];
            thetaSquares.sort((a, b) => (a[0] ** 2 + a[1] ** 2) ** 0.5 - (b[0] ** 2 + b[1] ** 2) ** 0.5);
            var curBrightness = 0;
            thetaSquares.forEach((loc) => {
                targetLists.forEach((list) => {
                    if (!(loc[0] in list)) {
                        return;
                    }
                    if (!(loc[1] in list[loc[0]])) {
                        return;
                    }
                    list[loc[0]][loc[1]].forEach((obj) => {
                        if (curBrightness < -MAX_BRIGHTNESS) {
                            return;
                        }
                        let curBrightnessCopy = curBrightness;
                        let pointLightSourceFunc = () => (Math.max(0, MAX_BRIGHTNESS * this.brightnessFunc() + curBrightnessCopy)) / MAX_BRIGHTNESS;
                        if (obj.lighting[idx] == null)  {
                            obj.lighting[idx] = [[pointLightSourceFunc], this.frameColor];
                        } else {
                            obj.lighting[idx][0].push(pointLightSourceFunc);
                        }
                        curBrightness -= obj.getLightFilterRate() * this.numRays;
                    });
                })
            });
        }
    }
}