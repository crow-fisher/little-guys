import { iterateOnSquares } from "../squares/_sqOperations.js";
import { getCloudColorAtPos } from "../climate/temperatureHumidity.js";
import { getCurrentLightColorTemperature, getDaylightStrength, getMoonlightColor } from "../climate/time.js";
import { loadGD, UI_GAME_MAX_CANVAS_SQUARES_X, UI_GAME_MAX_CANVAS_SQUARES_Y, UI_LIGHTING_DECAY, UI_LIGHTING_MOON, UI_LIGHTING_QUALITY, UI_LIGHTING_SUN, UI_SIMULATION_CLOUDS } from "../ui/UIData.js";
import { getWindSquaresX, getWindSquaresY } from "../climate/wind.js";
import { getCurLightingInterval } from "./lightingHandler.js";
import { isLeftMouseClicked, isRightMouseClicked } from "../mouse.js";
import { addTimeout } from "../main.js";
import { iterateOnOrganisms } from "../organisms/_orgOperations.js";
import { isSaveOrLoadInProgress } from "../saveAndLoad.js";

export let MAX_BRIGHTNESS = 8;
export function createSunLightGroup() {
    let numNodes = loadGD(UI_LIGHTING_QUALITY);
    let sunLightGroup = new StationaryWideLightGroup(
        loadGD(UI_GAME_MAX_CANVAS_SQUARES_X) / 2,
        -loadGD(UI_GAME_MAX_CANVAS_SQUARES_Y),
        1000,
        numNodes,
        getCurrentLightColorTemperature,
        () => Math.exp(loadGD(UI_LIGHTING_SUN)) * getDaylightStrength() / numNodes
    );
    return sunLightGroup;
}

export function createMoonLightGroup() {
    let moonLightGroup = new StationaryWideLightGroup(
        loadGD(UI_GAME_MAX_CANVAS_SQUARES_X) / 2,
        -loadGD(UI_GAME_MAX_CANVAS_SQUARES_Y),
        50,
        3,
        getMoonlightColor,
        () => Math.exp(loadGD(UI_LIGHTING_MOON))
    );
    return moonLightGroup;
}

class LightGroup {
    constructor() {
        this.lightSources = [];
    }
    destroy() {
        this.lightSources.forEach((ls) => ls.destroy());
    }
}

export class StationaryWideLightGroup extends LightGroup {
    constructor(centerX, centerY, sizeX, numNodes, colorFunc, brightnessFunc) {
        super();
        this.centerX = centerX;
        this.centerY = centerY;
        this.sizeX = sizeX;
        this.numNodes = numNodes;
        this.colorFunc = colorFunc;
        this.brightnessFunc = brightnessFunc;
        this.init();
        this.idxCompletionMap = new Map();
    }

    getMinMaxTheta(posX, posY) {
        let minThetaPoint, maxThetaPoint;
        if (posX < 0) {
            minThetaPoint = [0, loadGD(UI_GAME_MAX_CANVAS_SQUARES_Y)];
            maxThetaPoint = [loadGD(UI_GAME_MAX_CANVAS_SQUARES_X), 0];
        } else if (posX <= loadGD(UI_GAME_MAX_CANVAS_SQUARES_X)) {
            minThetaPoint = [0, 0];
            maxThetaPoint = [loadGD(UI_GAME_MAX_CANVAS_SQUARES_X), 0];
        } else {
            minThetaPoint = [0, 0]
            maxThetaPoint = [loadGD(UI_GAME_MAX_CANVAS_SQUARES_X), loadGD(UI_GAME_MAX_CANVAS_SQUARES_Y)];
        }

        let relMinThetaPoint = [minThetaPoint[0] - posX, minThetaPoint[1] - posY]
        let relMaxThetaPoint = [maxThetaPoint[0] - posX, maxThetaPoint[1] - posY]

        let minTheta = Math.atan(relMinThetaPoint[0] / relMinThetaPoint[1]);
        let maxTheta = Math.atan(relMaxThetaPoint[0] / relMaxThetaPoint[1]);

        return [minTheta, maxTheta];
    }

    init() {
        this.lightSources = [];
        let step = (this.sizeX / this.numNodes);
        let startX = this.centerX - (this.sizeX / 2);
        for (let i = 0; i < this.numNodes; i += 1) {
            let posX = startX + i * step + step * 0.5;
            let minMaxTheta = this.getMinMaxTheta(posX, this.centerY);
            let newLightSource = new LightSource(
                posX,
                this.centerY,
                this.brightnessFunc,
                this.colorFunc,
                10 ** 8,
                minMaxTheta[0],
                minMaxTheta[1],
                (100 / 7) * loadGD(UI_LIGHTING_QUALITY)
            );
            this.lightSources.push(newLightSource);
        }

    }

    doRayCasting(idx) {
        if (this.idxCompletionMap[idx] === false) {
            return false;
        }
        this.idxCompletionMap[idx] = false;
        let completionMap = new Map();
        for (let i = 0; i < this.lightSources.length; i++) {
            completionMap[i] = false;
            this.lightSources[i].doRayCasting(idx, i, () => {
                completionMap[i] = true;
                if (completionMap.values().every((val) => val)) {
                    this.idxCompletionMap[idx] = true;
                }
            });
        };
        return true;
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
        this.windSquareLocations = new Map();
        this.windSquareBrightnessMults = new Map();
        this.numTasks = 10;
        this.numTasksCompleted = {};
    }

    destroy() {
        this.windSquareLocations = null;
        this.windSquareBrightnessMults = null;
    }

    calculateFrameCloudCover() {
        this.windSquareBrightnessMults = new Map();
        let rayKeys = Object.keys(this.windSquareLocations);
        if (rayKeys.length < (this.numRays - 1)) {
            this.initWindSquareLocations();
        }
        rayKeys.forEach((rayTheta) => {
            let outLightColor = { r: 255, g: 255, b: 255 };
            this.windSquareLocations[rayTheta].forEach((loc) => {
                let windSquareCloudColor = getCloudColorAtPos(loc[0], loc[1]);
                let opacity = windSquareCloudColor.a * 0.1;
                outLightColor.r *= (windSquareCloudColor.r / 255) * opacity + (1 - opacity)
                outLightColor.g *= (windSquareCloudColor.g / 255) * opacity + (1 - opacity)
                outLightColor.b *= (windSquareCloudColor.b / 255) * opacity + (1 - opacity)
            });
            let brightnessDrop = (outLightColor.r + outLightColor.g + outLightColor.b) / (255 * 3);
            this.windSquareBrightnessMults[rayTheta] = (brightnessDrop ** 8);
        });
    }

    initWindSquareLocations() {
        this.windSquareLocations = new Map();
        let thetaStep = (this.maxTheta - this.minTheta) / this.numRays;
        for (let i = 0; i < getWindSquaresX(); i++) {
            for (let j = 0; j < getWindSquaresY(); j++) {
                let loc = [i, j];
                let relPosX = (i * 4) + 2 - this.posX;
                let relPosY = (j * 4) + 2 - this.posY;
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

    getWindSquareBrightnessFunc(theta) {
        return () => {
            if (!loadGD(UI_SIMULATION_CLOUDS)) {
                return 1;
            }

            if (this.windSquareBrightnessMults == null) {
                return 1;
            }
            let ret = this.windSquareBrightnessMults[theta];
            if (ret == null) {
                this.calculateFrameCloudCover();
                return this.getWindSquareBrightnessFunc(theta);
            }
            let m = .5; 
            ret = (ret + m) / (m + 1);
            return ret;
        }
    }


    async rayCastingForTheta(idx, jobIdx, theta, thetaStep) {
        if (isSaveOrLoadInProgress()) {
            return;
        }
        let thetaSquares = new Array();
        iterateOnSquares((sq) => {
            if (!sq.visible) {
                return;
            }
            let relPosX = sq.posX - this.posX;
            let relPosY = sq.posY - this.posY;
            let sqTheta = Math.atan(relPosX / relPosY);
            if (relPosX == 0 && relPosY == 0 && theta == this.minTheta) {
                thetaSquares.push([relPosX, relPosY, sq]);
            } else if (sqTheta > theta && sqTheta < (theta + thetaStep)) {
                thetaSquares.push([relPosX, relPosY, sq]);
            }
        });

        iterateOnOrganisms((org) => {
            org.lifeSquares.forEach((lsq) => {
                let relPosX = lsq.getPosX() - this.posX;
                let relPosY = lsq.getPosY() - this.posY;
                let sqTheta = Math.atan(relPosX / relPosY);
                if (relPosX == 0 && relPosY == 0 && theta == this.minTheta) {
                    thetaSquares.push([relPosX, relPosY, lsq]);
                } else if (sqTheta > theta && sqTheta < (theta + thetaStep)) {
                    thetaSquares.push([relPosX, relPosY, lsq]);
                }
            })
        })
        thetaSquares.sort((a, b) => (a[0] ** 2 + a[1] ** 2) ** 0.5 - (b[0] ** 2 + b[1] ** 2) ** 0.5);
        let curBrightness = 1;
        thetaSquares.forEach((arr) => {
            let obj = arr[2];
            let curBrightnessCopy = curBrightness;
            let pointLightSourceFunc = () => this.getWindSquareBrightnessFunc(theta)() * curBrightnessCopy * this.brightnessFunc();
            curBrightness *= (1 - (obj.surface ? (obj.surfaceLightingFactor ?? 1) : 1) * (obj.blockHealth ?? 1) * (obj.getLightFilterRate() * Math.exp(8 - loadGD(UI_LIGHTING_DECAY)) * (loadGD(UI_LIGHTING_QUALITY)) / 9));
            if (obj.lighting[idx] == null) {
                obj.lighting[idx] = [[pointLightSourceFunc], this.colorFunc];
            } else {
                obj.lighting[idx][1] = this.colorFunc;
                obj.lighting[idx][0][jobIdx] = pointLightSourceFunc;
            }
        });
    };
    doRayCasting(idx, jobIdx, onComplete) {
        if (this.numTasksCompleted[idx] == null) {
            this.numTasksCompleted[idx] = new Map();
        }
        this.numTasksCompleted[idx][jobIdx] = 0;

        let thetaStep = (this.maxTheta - this.minTheta) / this.numRays;
        let a0 = [];

        for (let theta = this.minTheta; theta < this.maxTheta; theta += thetaStep) {
            a0.push(theta);
        }
        let tasksPerThread = a0.length / this.numTasks;

        let timeInterval = getCurLightingInterval();
        let scheduledTime = 0;
        for (let i = 0; i < this.numTasks; i++) {
            let startIdx = Math.floor(i * tasksPerThread);
            let endIdx = Math.ceil((i + 1) * (tasksPerThread));
            scheduledTime = i * (timeInterval / this.numTasks);
            let stCopy = scheduledTime;
            if (isLeftMouseClicked() || isRightMouseClicked()) {
                scheduledTime *= 3;
            }
            addTimeout(setTimeout(() => {
                for (let i = startIdx; i < Math.min(endIdx, a0.length); i++) {
                    this.rayCastingForTheta(idx, jobIdx, a0[i], thetaStep);
                }
                this.numTasksCompleted[idx][jobIdx] += 1;
                if (this.numTasksCompleted[idx][jobIdx] == this.numTasks) {
                    onComplete();
                }
            }, stCopy));
        }
    }
}