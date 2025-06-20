import { iterateOnSquares } from "../squares/_sqOperations.js";
import { getCloudColorAtPos } from "../climate/simulation/temperatureHumidity.js";
import { getCurrentLightColorTemperature, getDaylightStrength, getFrameDt, getMoonlightColor } from "../climate/time.js";
import { loadGD, UI_GAME_MAX_CANVAS_SQUARES_X, UI_GAME_MAX_CANVAS_SQUARES_Y, UI_LIGHTING_DECAY, UI_LIGHTING_MOON, UI_LIGHTING_QUALITY, UI_LIGHTING_SUN, UI_LIGHTING_UPDATERATE, UI_SIMULATION_CLOUDS } from "../ui/UIData.js";
import { getWindSquaresX, getWindSquaresY } from "../climate/simulation/wind.js";
import { getCurLightingInterval } from "./lightingHandler.js";
import { isLeftMouseClicked, isRightMouseClicked } from "../mouse.js";
import { addTimeout } from "../main.js";
import { iterateOnOrganisms } from "../organisms/_orgOperations.js";
import { isSaveOrLoadInProgress } from "../saveAndLoad.js";
import { isSquareOnCanvas } from "../canvas.js";
import { getFrameSimulationSquares } from "../globalOperations.js";

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
    let numNodes = Math.ceil(loadGD(UI_LIGHTING_QUALITY) / 2);
    let moonLightGroup = new StationaryWideLightGroup(
        loadGD(UI_GAME_MAX_CANVAS_SQUARES_X) / 2,
        -loadGD(UI_GAME_MAX_CANVAS_SQUARES_Y),
        50,
        Math.ceil(loadGD(UI_LIGHTING_QUALITY) / 2),
        getMoonlightColor,
        () => Math.exp(loadGD(UI_LIGHTING_MOON)) / numNodes
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
                Math.ceil((100 / 7) * loadGD(UI_LIGHTING_QUALITY))
            );
            this.lightSources.push(newLightSource);
        }

    }

    doRayCasting(idx) {
        if (this.idxCompletionMap.get(idx) === false) {
            return false;
        }
        this.idxCompletionMap.set(idx, false)
        let completionMap = new Map();
        for (let i = 0; i < this.lightSources.length; i++) {
            completionMap.set(i, false);
            // this.lightSources[i].calculateFrameCloudCover();
            this.lightSources[i].doRayCasting(idx, i, () => {
                completionMap.set(i, true);
                if (completionMap.values().every((val) => val)) {
                    this.idxCompletionMap.set(idx, true);
                }
            });
        };
        return true;
    }
    preRender() {
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
        this.thetaSquares = new Array(numRays);
        
        this.thetaStep = (this.maxTheta - this.minTheta) / this.numRays;
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
            this.windSquareBrightnessMults[rayTheta] = (0.4 + 0.6 * (brightnessDrop ** 8));
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
        if (!loadGD(UI_SIMULATION_CLOUDS)) {
            return 1;
        }
        return 1;
    
        // pretty fucking bad code here, fix
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

    prepareSquareCoordinatePlane() {
        let allSquares = new Array();
        getFrameSimulationSquares().forEach((sq) => {
            if (!sq.visible) {
                return;
            }
            let relPosX = sq.posX - this.posX;
            let relPosY = sq.posY - this.posY;
            let sqTheta = Math.atan(relPosX / relPosY);
            allSquares.push([relPosX, relPosY, sqTheta, sq]);
        });

        iterateOnOrganisms((org) => {
            org.lifeSquares.filter((lsq) => lsq.type == "green").forEach((lsq) => {
                let relPosX = lsq.getPosX() - this.posX;
                let relPosY = lsq.getPosY() - this.posY;
                let lsqTheta = Math.atan(relPosX / relPosY);
                allSquares.push([relPosX, relPosY, lsqTheta, lsq]);
            }
            )
        });

        // sort these into theta buckets, and distribute them to our rays
        allSquares.sort((a, b) => a[2] - b[2]);
        
        let curBucket = -1;
        let curMinTheta = this.minTheta - this.thetaStep;
        let curMaxTheta = curMinTheta + this.thetaStep;
        
        for (let arr of allSquares) {
            while (arr[2] > curMaxTheta) {
                curMinTheta = curMaxTheta;
                curMaxTheta = curMinTheta + this.thetaStep;
                curBucket += 1;
                this.thetaSquares[curBucket] = new Array();
            }
            this.thetaSquares[curBucket].push(arr);
        };

        // lastly, nonzero optimization
        this.cachedLightingConstant = Math.exp(8 - loadGD(UI_LIGHTING_DECAY)) * (loadGD(UI_LIGHTING_QUALITY)) / 9;
    }

    async rayCastingForRayIdx(idx, jobIdx, i) {
        let thetaSquares = this.thetaSquares[i];
        if (thetaSquares == null) {
            return;
        }
        thetaSquares.sort((a, b) => (a[0] ** 2 + a[1] ** 2) ** 0.5 - (b[0] ** 2 + b[1] ** 2) ** 0.5);
        let curBrightness = 1;
        thetaSquares.forEach((arr) => {
            let obj = arr[3];
            let curBrightnessCopy = curBrightness;
            let pointLightSourceFunc = () => this.getWindSquareBrightnessFunc(this.minTheta + this.thetaStep * i) * curBrightnessCopy * this.brightnessFunc();
            curBrightness *= (1 - (obj.surface ? (obj.surfaceLightingFactor ?? 1) : 1) * (obj.blockHealth ?? 1) * (obj.getLightFilterRate() * this.cachedLightingConstant));
            if (obj.lighting[idx] == null) {
                obj.lighting[idx] = [[pointLightSourceFunc], this.colorFunc];
            } else {
                obj.lighting[idx][1] = this.colorFunc;
                obj.lighting[idx][0][jobIdx] = pointLightSourceFunc;
            }
        });
    }
    doRayCasting(idx, jobIdx, onComplete) {
        if (this.numTasksCompleted[idx] == null) {
            this.numTasksCompleted[idx] = new Map();
        }
        this.numTasksCompleted[idx][jobIdx] = 0;
        let timeInterval = (getCurLightingInterval() / this.numTasks);
        this.prepareSquareCoordinatePlane();
        for (let i = 0; i < this.numTasks; i++) {
            let scheduledTime = i * timeInterval + (getFrameDt() * (jobIdx % loadGD(UI_LIGHTING_UPDATERATE)));
            addTimeout(setTimeout(() => {
                for (let i = 0; i < this.numRays; i++) {
                    this.rayCastingForRayIdx(idx, jobIdx, i);
                }
                this.numTasksCompleted[idx][jobIdx] += 1;
                if (this.numTasksCompleted[idx][jobIdx] == this.numTasks) {
                    onComplete();
                }
            }, scheduledTime));
        }
    }
}