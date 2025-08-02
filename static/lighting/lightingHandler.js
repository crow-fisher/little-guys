import { getFrameDt } from "../climate/time.js";
import { addTask } from "../scheduler.js";
import { loadGD, UI_LIGHTING_UPDATERATE, UI_LIGHTING_ENABLED, UI_GAME_MAX_CANVAS_SQUARES_X, UI_GAME_MAX_CANVAS_SQUARES_Y } from "../ui/UIData.js";
import { createMoonLightGroup, createPermanantLightGroup, createSunLightGroup } from "./lighting.js";


export function getCurLightingInterval() {
    return (loadGD(UI_LIGHTING_UPDATERATE) - 1) * getFrameDt();
}

export function setNextLightingInterval(inVal) {
    curLightingInterval = inVal;
}


export class LightingHandler {
    constructor() {
        this.nextLightingUpdate = 0;
        this.lightSources = new Array();
        this.initLightSources();
    }

    initLightSources() {
        this.lightSources.push(createSunLightGroup());
        this.lightSources.push(createMoonLightGroup());
        this.lightSources.push(createPermanantLightGroup());
        this.lightingSizeX = loadGD(UI_GAME_MAX_CANVAS_SQUARES_X);
        this.lightingSizeY = loadGD(UI_GAME_MAX_CANVAS_SQUARES_Y);
    }
    lightingTick() {
        if (!loadGD(UI_LIGHTING_ENABLED)) {
            return;
        }
        if (loadGD(UI_GAME_MAX_CANVAS_SQUARES_X) != this.lightingSizeX || loadGD(UI_GAME_MAX_CANVAS_SQUARES_Y) != this.lightingSizeY) {
            this.initLightSources();
        }
        
        if (Date.now() < this.nextLightingUpdate) {
            return;
        }
        for (let i = 0; i < this.lightSources.length; i++) {
            this.lightSources[i].doRayCasting(i);
        }
        this.nextLightingUpdate = Date.now() + getCurLightingInterval();
    }
    destroy() {
        this.lightSources.forEach((ls) => ls.destroy());
    }
}