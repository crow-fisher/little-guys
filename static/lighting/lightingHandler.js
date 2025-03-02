import { iterateOnOrganisms } from "../organisms/_orgOperations.js";
import { createMoonLightGroup, createSunLightGroup, lightingClearLifeSquarePositionMap, lightingRegisterLifeSquare } from "./lighting.js";

export const lighting_retrace_interval = 1000;

export class LightingHandler {
    constructor() {
        this.nextLightingUpdate = 0;
        this.lightSources = [];
        this.lightSources.push(createSunLightGroup());
        // this.lightSources.push(createMoonLightGroup());
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
                console.log("Invoked raycasting for idx: ", i);
            }
        }
        this.nextLightingUpdate = Date.now() + lighting_retrace_interval;
        lightingClearLifeSquarePositionMap();
    }
}