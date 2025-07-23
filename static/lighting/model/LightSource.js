import { getFrameXMax, getFrameXMin, getFrameYMax, getFrameYMin } from "../../canvas.js";
import { getCloudColorAtPos } from "../../climate/simulation/temperatureHumidity.js";
import { getFrameXMaxWsq, getFrameXMinWsq, getFrameYMaxWsq, getFrameYMinWsq } from "../../climate/simulation/wind.js";
import { getFrameDt } from "../../climate/time.js";
import { getFrameSimulationSquares } from "../../globalOperations.js";
import { addTimeout } from "../../main.js";
import { isSaveOrLoadInProgress } from "../../saveAndLoad.js";
import { loadGD, UI_CANVAS_VIEWPORT_CENTER_X, UI_GAME_MAX_CANVAS_SQUARES_X, UI_GAME_MAX_CANVAS_SQUARES_Y, UI_LIGHTING_CLOUDCOVER_OPACITY, UI_LIGHTING_DECAY, UI_LIGHTING_QUALITY, UI_LIGHTING_UPDATERATE, UI_SIMULATION_CLOUDS } from "../../ui/UIData.js";
import { getCurLightingInterval } from "../lightingHandler.js";

export class LightSource {
    constructor(posX, posY, brightnessFunc, colorFunc, numRays) {
        this.posX = posX;
        this.posY = posY;
        this.brightnessFunc = brightnessFunc;
        this.colorFunc = colorFunc;
        this.numRays = numRays;
        this.thetaStep = Math.PI * 2 / numRays;

        this.thetaSquares = new Array(numRays);
        this.windSquareLocations = new Map();
        this.windSquareBrightnessMults = new Map();
        this.numTasks = 10;
        this.numTasksCompleted = {};
        this.calculateMinMaxTheta();

        this.minTheta = 0;
        this.maxTheta = Math.PI * 2;
    }

    calculateMinMaxTheta() {
        if (getFrameXMin() == 0 && getFrameXMax() == 0)
            return;
        let relXMin = this.posX - getFrameXMin();
        let relXMax = this.posX - getFrameXMax();

        let minThetaPoint, maxThetaPoint;

        if (relXMin < 0) { // then we're to the left of the canvas
            minThetaPoint = [getFrameXMin(), getFrameYMax()];
            maxThetaPoint = [getFrameXMax(), getFrameYMin()];
        } else if (relXMax < 0) { // then we're to the right of the canvas
            minThetaPoint = [getFrameXMin(), getFrameYMin()];
            maxThetaPoint = [getFrameXMax(), getFrameYMax()];
        } else { // otherwise we're in middle of the canvas 
            minThetaPoint = [getFrameXMin(), getFrameYMin()]
            maxThetaPoint = [getFrameXMax(), getFrameYMin()];
        }

        let relMinThetaPoint = [minThetaPoint[0] - this.posX, minThetaPoint[1] - this.posY]
        let relMaxThetaPoint = [maxThetaPoint[0] - this.posX, maxThetaPoint[1] - this.posY]
        this.minTheta = Math.atan(relMinThetaPoint[0] / relMinThetaPoint[1]);
        this.maxTheta = Math.atan(relMaxThetaPoint[0] / relMaxThetaPoint[1]);
    }
    

    destroy() {
        this.windSquareLocations = null;
        this.windSquareBrightnessMults = null;
    }

    calculateFrameCloudCover() {
        for (let rayIdx = 0; rayIdx <= this.numRays; rayIdx++) {
            this.windSquareBrightnessMults[rayIdx] = 1;
        }

        let opacityFactor = loadGD(UI_LIGHTING_CLOUDCOVER_OPACITY);

        for (let x = getFrameXMinWsq(); x < getFrameXMaxWsq(); x++) {
            for (let y = getFrameYMinWsq(); y < getFrameYMaxWsq(); y++) {
                let wsqTheta = Math.atan(((x * 4) - this.posX) / ((y * 4) - this.posY));
                let wsqThetaNormalized = wsqTheta - this.minTheta;
                let bucket = Math.floor(wsqThetaNormalized / this.thetaStep);
                let windSquareCloudColor = getCloudColorAtPos(x, y);
                let opacity = windSquareCloudColor.a * opacityFactor;
                let outLightColor = { r: 255, g: 255, b: 255 };
                outLightColor.r *= (windSquareCloudColor.r / 255) * opacity + (1 - opacity)
                outLightColor.g *= (windSquareCloudColor.g / 255) * opacity + (1 - opacity)
                outLightColor.b *= (windSquareCloudColor.b / 255) * opacity + (1 - opacity)
                let brightnessDrop = (outLightColor.r + outLightColor.g + outLightColor.b) / (255 * 3);
                brightnessDrop = brightnessDrop ** 8;
                this.windSquareBrightnessMults[bucket] *= brightnessDrop;
            }
        }
    }

    getWindSquareBrightnessFunc(rayIdx) {
        if (!loadGD(UI_SIMULATION_CLOUDS)) {
            return 1;
        }
        if (this.windSquareBrightnessMults == null) {
            return 1;
        }
        let ret = this.windSquareBrightnessMults[rayIdx];
        let m = .5;
        ret = (ret + m) / (m + 1);
        return ret;
    }

    prepareSquareCoordinatePlane() {
        
        let allSquares = new Array();
        this.thetaSquares = new Array(this.numRays);

        getFrameSimulationSquares().forEach((sq) => {
            if (!sq.visible) {
                return;
            }
            let relPosX = sq.posX - this.posX;
            let relPosY = sq.posY - this.posY;
            let sqTheta = Math.atan(relPosX / relPosY);
            allSquares.push([relPosX, relPosY, sqTheta, sq]);

            sq.linkedOrganisms.forEach((org) => {
                org.lifeSquares.filter((lsq) => lsq.type == "green").forEach((lsq) => {
                    let relPosX = lsq.getPosX() - this.posX;
                    let relPosY = lsq.getPosY() - this.posY;
                    let lsqTheta = Math.atan(relPosX / relPosY);
                    allSquares.push([relPosX, relPosY, lsqTheta, lsq]);
                }
                )
            });
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
            if (curBucket >= 0)
                this.thetaSquares[curBucket].push(arr);
        };
        // lastly, nonzero optimization
        this.cachedLightingConstant = Math.exp(8 - loadGD(UI_LIGHTING_DECAY)) * (loadGD(UI_LIGHTING_QUALITY)) / 9;
    }

    async rayCastingForRayIdx(idx, jobIdx, i) {
        if (isSaveOrLoadInProgress()) {
            return;
        }
        let thetaSquares = this.thetaSquares[i];
        if (thetaSquares == null || thetaSquares.length == 0) {
            return;
        }
        thetaSquares.sort((a, b) => (a[0] ** 2 + a[1] ** 2) ** 0.5 - (b[0] ** 2 + b[1] ** 2) ** 0.5);
        let curBrightness = 1;
        thetaSquares.forEach((arr) => {
            let obj = arr[3];
            let curBrightnessCopy = curBrightness;
            let pointLightSourceFunc = () => this.getWindSquareBrightnessFunc(i) * curBrightnessCopy * this.brightnessFunc();
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
        this.calculateMinMaxTheta();
        this.prepareSquareCoordinatePlane();

        let bottomIdx = this.minTheta / this.thetaStep;
        let topIdx = this.maxTheta / this.thetaStep;

        bottomIdx = (bottomIdx + this.numRays) % this.numRays;
        topIdx = (topIdx + this.numRays) % this.numRays;
        
        for (let _i = 0; _i < this.numTasks; _i++) {
            let i = _i;
            let scheduledTime = _i * timeInterval + (getFrameDt() * (jobIdx % loadGD(UI_LIGHTING_UPDATERATE)));
            addTimeout(setTimeout(() => {
                let bottom = i * (this.numRays / this.numTasks);
                let top = (i + 1) * (this.numRays / this.numTasks);

                for (let j = bottom; j < top; j++)
                    this.rayCastingForRayIdx(idx, jobIdx, j);

                this.numTasksCompleted[idx][jobIdx] += 1;
                if (this.numTasksCompleted[idx][jobIdx] == this.numTasks) {
                    onComplete();
                }
            }, scheduledTime));
        }
    }
}