import { RGB_COLOR_BLACK } from "./colors.js";
import { ALL_SQUARES, LIGHT_SOURCES } from "./globals.js";
import { getSqIterationOrder } from "./squares/_sqOperations.js";

var lifeSquarePositions = new Map();

var MAX_BRIGHTNESS = 16;

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
    constructor(posX, posY, brightness, colorFunc, radius) {
        this.posX = posX;
        this.posY = posY;
        this.brightness = brightness;
        this.colorFunc = colorFunc;
        this.radius = radius;

        this.frameLifeSquares = null;
        this.frameTerrainSquares = null;
        this.frameColor = RGB_COLOR_BLACK;
        this.allLifeSquares = new Array();
        this.visitedLifeSquares = new Set();
    }

    preprocessLifeSquares() {
        this.frameLifeSquares = new Map();
        this.allLifeSquares = new Array();
        this.visitedLifeSquares = new Set();
        this.frameColor = this.colorFunc();
        var posXKeys = Object.keys(lifeSquarePositions);
        posXKeys.forEach((lsqPosX) => {
            var relPosX = Math.floor(this.posX - lsqPosX);
            var posYKeys = Object.keys(lifeSquarePositions[lsqPosX]);
            posYKeys.forEach((lsqPosY) => {
                var relPosY = Math.floor(this.posY - lsqPosY);
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
            .filter((sq) => ((this.posX - sq.posX) ** 2 + (this.posY - sq.posY) ** 2) ** 0.5 < this.radius)
            .forEach((sq) => {
                if (!(sq.posX in this.frameTerrainSquares)) {
                    this.frameTerrainSquares[sq.posX] = new Map();
                }
                if (!(sq.posY in this.frameTerrainSquares[sq.posX])) {
                    this.frameTerrainSquares[sq.posX][sq.posY] = new Array();
                }
                this.frameTerrainSquares[sq.posX][sq.posY].push(sq);
            });
    }

    doRayCasting(idx) {
        this.preprocessLifeSquares();
        this.preprocessTerrainSquares();
        var numRays = 64;
        var thetaStep = (2 * Math.PI / numRays);
        for (let theta = -Math.PI; theta < Math.PI; theta += thetaStep) {
            var thetaSquares = [];
            var posXKeys = Object.keys(this.frameLifeSquares);
            posXKeys.forEach((relPosX) => {
                var posYKeys = Object.keys(this.frameLifeSquares[relPosX]);
                posYKeys.forEach((relPosY) => {
                    var sqTheta = Math.atan(relPosY / relPosX);
                    if (Math.abs(sqTheta - theta) < thetaStep) {
                        thetaSquares.push([relPosX, relPosY]);
                    }
                })
            });

            thetaSquares.sort((a, b) => (a[0] ** 2 + a[1] ** 2) ** 0.5 - (b[0] ** 2 + b[1] ** 2) ** 0.5);
            var curBrightness = this.brightness;
            thetaSquares.forEach((loc) => {
                this.frameLifeSquares[loc[0]][loc[1]].forEach((lsq) => {
                    this.visitedLifeSquares.add(lsq);
                    lsq.lighting[idx] = [];
                    lsq.lighting[idx][0] = curBrightness / MAX_BRIGHTNESS;
                    lsq.lighting[idx][1] = this.colorFunc;
                });

                var relPosX = loc[0];
                var relPosY = loc[1];
                var sqTheta = Math.atan(relPosY / relPosX);
                var diff = 0.9 + 0.1 * (1 - (Math.abs((theta - sqTheta)) / thetaStep * 2));
                curBrightness -= 0.1 * diff;
            });
        }
    }
}