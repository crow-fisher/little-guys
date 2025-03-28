import { getFrameDt } from "../climate/time.js";
import { iterateOnOrganisms } from "../organisms/_orgOperations.js";
import { loadGD, UI_LIGHTING_UPDATERATE, UI_LIGHTING_ENABLED } from "../ui/UIData.js";
import { createMoonLightGroup, createSunLightGroup, lightingClearLifeSquarePositionMap, lightingRegisterLifeSquare } from "./lighting.js";


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
        iterateOnOrganisms((org) => org.lifeSquares.forEach((lsq) => lightingRegisterLifeSquare(lsq)));
        for (let i = 0; i < this.lightSources.length; i++) {
            this.lightSources[i].doRayCasting(i);
        }
        this.nextLightingUpdate = Date.now() + 100;
        lightingClearLifeSquarePositionMap();
    }
    destroy() {
        this.lightSources.forEach((ls) => ls.destroy());
    }
}