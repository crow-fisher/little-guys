import { getFrameDt } from "../climate/time.js";
import { iterateOnOrganisms } from "../organisms/_orgOperations.js";
import { loadUI, UI_LIGHTING_FASTUPDATERATE, UI_LIGHTING_SLOWUPDATERATE, UI_TOPBAR_FASTLIGHTING, UI_TOPBAR_TOGGLELIGHTING } from "../ui/UIData.js";
import { createMoonLightGroup, createSunLightGroup, lightingClearLifeSquarePositionMap, lightingRegisterLifeSquare } from "./lighting.js";


export function getCurLightingInterval() {
    return (loadUI(UI_TOPBAR_FASTLIGHTING) ? loadUI(UI_LIGHTING_FASTUPDATERATE) : loadUI(UI_LIGHTING_SLOWUPDATERATE)) * getFrameDt();
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
        if (!loadUI(UI_TOPBAR_TOGGLELIGHTING)) {
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