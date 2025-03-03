import { iterateOnOrganisms } from "../organisms/_orgOperations.js";
import { createMoonLightGroup, createSunLightGroup, lightingClearLifeSquarePositionMap, lightingRegisterLifeSquare } from "./lighting.js";


export const SLOW_LIGHTING_INTERVAL = 3000;
export const FAST_LIGHTING_INTERVAL = 1000;

let restingLightingInterval = SLOW_LIGHTING_INTERVAL;
let curLightingInterval = restingLightingInterval;

export function getCurLightingInterval() {
    return curLightingInterval;
}

export function setNextLightingInterval(inVal) {
    curLightingInterval = inVal;
}

export function setRestingLightingInterval(inVal) {
    curLightingInterval = inVal;
}

export function getRestingLightingInterval() {
    return restingLightingInterval;
}

export class LightingHandler {
    constructor() {
        this.nextLightingUpdate = 0;
        this.lightSources = [];
        this.lightSources.push(createSunLightGroup());
        this.lightSources.push(createMoonLightGroup());
    }

    setNextLightingUpdateTime(newTime) {
        this.nextLightingUpdate = newTime;
    }

    getNextLightingUpdateTime() {
        return this.nextLightingUpdate;
    }

    lightingTick() {
        this.lightSources.forEach((ls) => ls.preRender());
        if (Date.now() < this.nextLightingUpdate) {
            return;
        }
        iterateOnOrganisms((org) => org.lifeSquares.forEach((lsq) => lightingRegisterLifeSquare(lsq)));
        for (let i = 0; i < this.lightSources.length; i++) {
            if (this.lightSources[i].doRayCasting(i)) {
                // console.log("Invoked raycasting for idx: ", i);
            }
        }
        this.nextLightingUpdate = Date.now() + 100;
        lightingClearLifeSquarePositionMap();
    }
}