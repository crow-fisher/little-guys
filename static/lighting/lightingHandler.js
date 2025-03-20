import { getFrameDt } from "../climate/time.js";
import { iterateOnOrganisms } from "../organisms/_orgOperations.js";
import { loadUI, UI_LIGHTING_UPDATERATE, UI_LIGHTING_SUNNODES, UI_LIGHTING_FASTLIGHTING, UI_LIGHTING_ENABLED } from "../ui/UIData.js";
import { createMoonLightGroup, createSunLightGroup, lightingClearLifeSquarePositionMap, lightingRegisterLifeSquare } from "./lighting.js";


export function getCurLightingInterval() {
    return loadUI(UI_LIGHTING_UPDATERATE) * getFrameDt();
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
        if (!loadUI(UI_LIGHTING_ENABLED)) {
            return;
        }
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