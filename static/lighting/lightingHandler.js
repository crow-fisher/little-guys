import { getFrameDt } from "../climate/time.js";
import { iterateOnSquares } from "../squares/_sqOperations.js";
import { loadGD, UI_LIGHTING_UPDATERATE, UI_LIGHTING_ENABLED } from "../ui/UIData.js";
import { createMoonLightGroup, createSunLightGroup } from "./lighting.js";


export function getCurLightingInterval() {
    return (loadGD(UI_LIGHTING_UPDATERATE) - 1) * getFrameDt();
}

export function setNextLightingInterval(inVal) {
    curLightingInterval = inVal;
}


export class LightingHandler {
    constructor() {
        this.nextLightingUpdate = 0;
        this.lightSources = [];
        this.lightSources.push(createSunLightGroup());
        this.lightSources.push(createMoonLightGroup());
    }
    lightingTick() {
        if (!loadGD(UI_LIGHTING_ENABLED)) {
            return;
        }
        this.lightSources.forEach((ls) => ls.preRender());
        if (Date.now() < this.nextLightingUpdate) {
            return;
        }
        for (let i = 0; i < this.lightSources.length; i++) {
            this.lightSources[i].doRayCasting(i);
        }
        this.nextLightingUpdate = Date.now() + 100;
        this.resetBadLightingSquares();
    }
    destroy() {
        this.lightSources.forEach((ls) => ls.destroy());
    }
    resetBadLightingSquares() {
        let expected = this.lightSources.map((ls) => ls.lightSources.length).reduce((a, b) => a + b);
        iterateOnSquares((sq) => {
            let sqll = sq.lighting.length;
            if (sqll < this.lightSources.length) {
                return;
            } else if (sqll > this.lightSources.length) {
                sq.lighting = [];
                return;
            }
            let arrOfLen = sq.lighting.map((arr) => arr[0].length)
            for (let i = 0; i < arrOfLen.length; i++) {
                if (arrOfLen[i] > this.lightSources[i].numNodes) {
                    sq.lighting = [];
                }
            }

        })
    }
}