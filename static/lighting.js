import { RGB_COLOR_BLACK } from "./colors.js";
import { randNumber } from "./common.js";
import { ALL_SQUARES, LIGHT_SOURCES } from "./globals.js";
import { CANVAS_SQUARES_X, CANVAS_SQUARES_Y } from "./index.js";
import { getSqIterationOrder, getSquares } from "./squares/_sqOperations.js";
import { getCurDay, getCurrentLightColorTemperature, getDaylightStrength, getMoonlightColor } from "./time.js";

var lifeSquarePositions = new Map();


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

export function createSunLightGroup() {
    var sizeX = 8;
    var sunLightGroup = new LightGroup(
        0,
        -1, 
        sizeX, 
        1,
        CANVAS_SQUARES_X / (sizeX - 1), 
        () => 0.8 * (0.1 + 0.9 * getDaylightStrength()), 
        getCurrentLightColorTemperature, 
        10 ** 8,
        24,
        "sun");

    return sunLightGroup;
}

export function createMoonLightGroup() {
    var sizeX = 8;
    var moonlightGroup = new LightGroup(
        0,
        -1, 
        sizeX, 
        1,
        CANVAS_SQUARES_X / (sizeX - 1), 
        () => 0.2 * ((1) - (0.1 + 0.9 * getDaylightStrength())), 
        getMoonlightColor, 
        10 ** 8,
        24,
        "moon");

    return moonlightGroup;
}

export class LightGroup {
    constructor(posX, posY, sizeX, sizeY, scaleMult, brightnessFunc, colorFunc, radius, numRays, mode) {
        this.lightSources = [];
        let brigthnessFrac = (sizeX * sizeY) ** 0.5;
        let totalSize = posX + ((sizeX - 1) * scaleMult);

        var minTheta = 2 * Math.PI;
        var maxTheta = 0;

        for (let i = 0; i < sizeX; i++) {
            for (let j = 0; j < sizeY; j++) {
                let sourcePosX = posX + (scaleMult * i);
                let sourcePosY = posY + (scaleMult * j);
                [[0, 0], [0, CANVAS_SQUARES_Y], [CANVAS_SQUARES_X, 0], [CANVAS_SQUARES_X, CANVAS_SQUARES_Y]].forEach((loc) => {
                    let testX = Math.abs(loc[0] - sourcePosX);
                    let testY = loc[1] - sourcePosY;
                    let theta = Math.atan(testY / testX);
                    minTheta = Math.min(minTheta, theta);
                    maxTheta = Math.max(maxTheta, theta);
                })
                
                let sourceBrightnessFunc = null;
                
                
                if (mode == "sun") {
                    sourceBrightnessFunc = () => {
                        let xFrac = (sourcePosX - posX) / totalSize;
                        let dayFrac = ((getCurDay() % 1) - 0.25) * 2;
                        if (dayFrac < 0 || dayFrac > 1) {
                            return 0;
                        }
                        var diff = Math.abs(xFrac - dayFrac);
                        return ( 1 / brigthnessFrac) * brightnessFunc() * (1 - diff);
                    }
                } else {
                    sourceBrightnessFunc = () => ( 1 / brigthnessFrac) * brightnessFunc();
                }

                this.lightSources.push(new LightSource(
                    sourcePosX, sourcePosY,
                    sourceBrightnessFunc, colorFunc, radius, 
                    minTheta, maxTheta, numRays));
            }
        }

        this.lightSources.forEach((ls) => {ls.minTheta = minTheta; ls.maxTheta = maxTheta});
    }

    doRayCasting(i) {
        this.lightSources.forEach((ls) => ls.doRayCasting(i));
    }
}

export class LightSource {
    constructor(posX, posY, brightnessFunc, colorFunc, radius, minTheta, maxTheta, numRays) {
        this.posX = posX;
        this.posY = posY;
        this.brightnessFunc = brightnessFunc;
        this.colorFunc = colorFunc;
        this.radius = radius;
        this.minTheta = minTheta;
        this.maxTheta = maxTheta;
        this.numRays = numRays;
        this.frameLifeSquares = null;
        this.frameTerrainSquares = null;
    }

    preprocessLifeSquares() {
        this.frameLifeSquares = new Map();
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
        this.preprocessTerrainSquares();
        var targetLists = [this.frameTerrainSquares, this.frameLifeSquares];
        let thetaStep = (this.maxTheta - this.minTheta) / this.numRays;

        for (let theta = this.minTheta; theta < this.maxTheta; theta += thetaStep) {
            var thetaSquares = [];
            targetLists.forEach((list) => {
                var posXKeys = Object.keys(list);
                posXKeys.forEach((relPosX) => {
                    var posYKeys = Object.keys(list[relPosX]);
                    posYKeys.forEach((relPosY) => {
                        var sqTheta = Math.atan(relPosY / Math.abs(relPosX));
                        if (relPosX == 0 && relPosY == 0 && theta == this.minTheta) {
                            thetaSquares.push([relPosX, relPosY]);
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
                        let curBrightnessCopy = curBrightness;
                        let pointLightSourceFunc = () => (Math.max(0, MAX_BRIGHTNESS * this.brightnessFunc() + curBrightnessCopy)) / MAX_BRIGHTNESS;
                        if (obj.lighting[idx] == null)  {
                            obj.lighting[idx] = [[pointLightSourceFunc], this.colorFunc];
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