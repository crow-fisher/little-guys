import { RGB_COLOR_BLACK } from "./colors.js";
import { randNumber } from "./common.js";
import { ALL_SQUARES, LIGHT_SOURCES } from "./globals.js";
import { CANVAS_SQUARES_X, CANVAS_SQUARES_Y } from "./index.js";
import { getSqIterationOrder, getSquares } from "./squares/_sqOperations.js";
import { getCloudColorAtPos, getCloudColorAtSqPos } from "./temperatureHumidity.js";
import { getCurDay, getCurrentLightColorTemperature, getDaylightStrength, getMoonlightColor } from "./time.js";
import { getWindSquaresX, getWindSquaresY } from "./wind.js";

let lifeSquarePositions = new Map();

export let MAX_BRIGHTNESS = 8;

var sunBrightness = 0.27;

export function setSunBrightness(newVal) {
    sunBrightness = newVal;
}

export function getSunBrightness() {
    return sunBrightness;
}

export function lightingClearLifeSquarePositionMap() {
    lifeSquarePositions = new Map();
}

export function lightingRegisterLifeSquare(lifeSquare) {
    if (lifeSquare.type != "green") {
        return;
    }
    let posX = Math.floor(lifeSquare.getPosX());
    let posY = Math.floor(lifeSquare.getPosY());

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
    let sunLightGroup = new MovingLinearLightGroup(
        CANVAS_SQUARES_X / 2,
        -1, 
        CANVAS_SQUARES_X * 0.5,
        15,
        getCurrentLightColorTemperature, 
        () => sunBrightness * getDaylightStrength(),
        () => Math.max(0, (2 * (getCurDay() % 1) - 0.5))
    );
    return sunLightGroup;
}


export function createMoonLightGroup() {
    let moonLightGroup = new MovingLinearLightGroup(
        CANVAS_SQUARES_X / 2,
        -1, 
        1,
        1,
        getMoonlightColor, 
        () => 0.35,
        () => 0.5
    );
    return moonLightGroup;
}

export class MovingLinearLightGroup {
    constructor(centerX, centerY, sizeX, numNodes, colorFunc, brightnessFunc, relPosXFunc) {
        this.lightSources = [];
        this.centerX = centerX; 
        this.centerY = centerY;
        this.sizeX = sizeX;
        this.numNodes = numNodes;
        this.colorFunc = colorFunc;
        this.brightnessFunc = brightnessFunc;
        this.relPosXFunc = relPosXFunc;
        this.init();
    }

    getMinMaxTheta(posX, posY) {
        let minThetaPoint, maxThetaPoint;
        if (posX < 0) {
            minThetaPoint = [0, CANVAS_SQUARES_Y];
            maxThetaPoint = [CANVAS_SQUARES_X, 0];
        } else if (posX <= CANVAS_SQUARES_X) {
            minThetaPoint = [0, 0];
            maxThetaPoint = [CANVAS_SQUARES_X, 0];
        } else {
            minThetaPoint = [0, 0]
            maxThetaPoint = [CANVAS_SQUARES_X, CANVAS_SQUARES_Y];
        }

        let relMinThetaPoint = [minThetaPoint[0] - posX, minThetaPoint[1] - posY]
        let relMaxThetaPoint = [maxThetaPoint[0] - posX, maxThetaPoint[1] - posY]

        let minTheta = Math.atan(relMinThetaPoint[0] / relMinThetaPoint[1]);
        let maxTheta = Math.atan(relMaxThetaPoint[0] / relMaxThetaPoint[1]);

        return [minTheta, maxTheta];
    }

    getBrigthnessFunc(i) {
        let iFrac = i / this.numNodes;
        return () => this.brightnessFunc() * (1 - Math.abs(iFrac - this.relPosXFunc()));
    }

    init() {
        this.lightSources = [];
        let step = (this.sizeX / this.numNodes);
        let startX = this.centerX - (this.sizeX / 2);
        for (let i = 0; i < this.numNodes; i += 1) {
            let posX = startX + i * step;
            let minMaxTheta = this.getMinMaxTheta(posX, this.centerY);
            let newLightSource = new LightSource(
                startX + i * step,
                this.centerY,
                this.getBrigthnessFunc(i),
                this.colorFunc,
                10 ** 8,
                minMaxTheta[0],
                minMaxTheta[1],
                100
            );
            this.lightSources.push(newLightSource);
        }
        
    }

    doRayCasting(idx) {
        this.lightSources.forEach((ls) => ls.doRayCasting(idx));
    }

    preRender() {
        this.lightSources.forEach((ls) => ls.calculateFrameCloudCover());
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
        this.windSquareLocations = new Map();
        this.windSquareBrigthnessMults = new Map();
    }

    calculateFrameCloudCover() {
        this.windSquareBrigthnessMults = new Map();
        let rayKeys = Object.keys(this.windSquareLocations);
        if (rayKeys.length < (this.numRays - 1)) {
            this.initWindSquareLocations();
        }
        rayKeys.forEach((rayTheta) => {
            let outLightColor = {r: 255, g: 255, b: 255};
            this.windSquareLocations[rayTheta].forEach((loc) => {
                let windSquareCloudColor = getCloudColorAtPos(loc[0], loc[1]);
                let opacity = windSquareCloudColor.a * 0.1;
                outLightColor.r *= (windSquareCloudColor.r / 255) * opacity + (1 - opacity)
                outLightColor.g *= (windSquareCloudColor.g / 255) * opacity + (1 - opacity)
                outLightColor.b *= (windSquareCloudColor.b / 255) * opacity + (1 - opacity)
            });
            var brightnessDrop = (outLightColor.r + outLightColor.g + outLightColor.b) / (255 * 3);
            this.windSquareBrigthnessMults[rayTheta] = brightnessDrop ** 8;
        });
    }

    initWindSquareLocations() {
        this.windSquareLocations = new Map();
        let thetaStep = (this.maxTheta - this.minTheta) / this.numRays;
        for (let i = 0; i < getWindSquaresX(); i++) {
            for (let j = 0; j < getWindSquaresY(); j++) {
                let loc = [i, j];

                for (let ii = 0; ii < 4; ii++) {
                    for (let jj = 0; jj < 4; jj++) {
                        let relPosX = (i * 4) + ii - this.posX;
                        let relPosY = (j * 4) + jj - this.posY;
                        let sqTheta = Math.atan(relPosX / relPosY);

                        for (let theta = this.minTheta; theta < this.maxTheta; theta += thetaStep) {
                            if (!(theta in this.windSquareLocations)) {
                                this.windSquareLocations[theta] = new Array();
                            }
                            if (this.windSquareLocations[theta].includes(loc)) {
                                continue;
                            } else if (sqTheta > theta && sqTheta < (theta + thetaStep)) {
                                this.windSquareLocations[theta].push(loc);
                            }
                        }
                    }
                }
                
            }
        }
    }

    getWindSquareBrightnessFunc(theta) {
        return () => {
            let ret = this.windSquareBrigthnessMults[theta];
            if (ret == null) {
                this.calculateFrameCloudCover();
                return this.getWindSquareBrightnessFunc(theta);
            }
            return ret;
        }
    }
    preprocessLifeSquares() {
        this.frameLifeSquares = new Map();
        let posXKeys = Object.keys(lifeSquarePositions);
        posXKeys.forEach((lsqPosX) => {
            let relPosX = Math.floor(lsqPosX - this.posX);
            let posYKeys = Object.keys(lifeSquarePositions[lsqPosX]);
            posYKeys.forEach((lsqPosY) => {
                let relPosY = Math.floor(lsqPosY - this.posY);
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
                let relPosX = sq.posX - this.posX;
                let relPosY = sq.posY - this.posY;
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
        let targetLists = [this.frameTerrainSquares, this.frameLifeSquares];
        let thetaStep = (this.maxTheta - this.minTheta) / this.numRays;

        for (let theta = this.minTheta; theta < this.maxTheta; theta += thetaStep) {
            let thetaSquares = [];
            targetLists.forEach((list) => {
                let posXKeys = Object.keys(list);
                posXKeys.forEach((relPosX) => {
                    let posYKeys = Object.keys(list[relPosX]);
                    posYKeys.forEach((relPosY) => {
                        let sqTheta = Math.atan(relPosX / relPosY);
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

            let curBrightness = 0;
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
                        let pointLightSourceFunc = () => this.getWindSquareBrightnessFunc(theta)() * (Math.max(0, MAX_BRIGHTNESS * this.brightnessFunc() + curBrightnessCopy)) / MAX_BRIGHTNESS;
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