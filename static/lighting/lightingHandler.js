import { getCurDay } from "../climate/time.js";
import { iterateOnOrganisms } from "../organisms/_orgOperations.js";
import { createMoonLightGroup, createSunLightGroup, lightingClearLifeSquarePositionMap, lightingPrepareTerrainSquares, lightingRegisterLifeSquare } from "./lighting.js";

export class LightingHandler {
    constructor() {
        this.nextLightingUpdate = 0;
        this.lastLightingUpdateDay = 0;

        this.lighting_throttle_interval_ms = 10 ** 8;
        this.lighting_throttle_interval_days = 3;

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
        if (Date.now() < this.nextLightingUpdate && (
            (getCurDay() - this.lighting_throttle_interval_days) < this.lastLightingUpdateDay && (getCurDay() > 0.25)
        )) {
            return;
        }
        lightingPrepareTerrainSquares();
        iterateOnOrganisms((org) => org.lifeSquares.forEach((lsq) => lightingRegisterLifeSquare(lsq)));
        for (let i = 0; i < this.lightSources.length; i++) {
            this.lightSources[i].doRayCasting(i);
        }
        this.nextLightingUpdate = Date.now() + this.lighting_throttle_interval_ms;
        this.lastLightingUpdateDay = getCurDay(); 
        lightingClearLifeSquarePositionMap();

    }
}