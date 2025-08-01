import { getBaseSize, getFrameXMax, getFrameXMin, getFrameYMax, getFrameYMin } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { SunCalc } from "../../climate/suncalc/suncalc.js";
import { getCurDay, getCurrentLightColorTemperature, getDaylightStrength, millis_per_day } from "../../climate/time.js";
import { addTask } from "../../scheduler.js";
import { loadGD, UI_CANVAS_VIEWPORT_CENTER_X, UI_CANVAS_VIEWPORT_CENTER_Y, UI_LIGHTING_SHADOW_SOFTNESS } from "../../ui/UIData.js";
import { LightGroup } from "./lightGroup.js";
import { MovingLightSource } from "./MovingLightSource.js";

export class SunMovingLightGroup extends LightGroup {
    constructor() {
        super();
        this.dist = 10000;
        this.numNodes = 5;
        this.init();
        this.idxCompletionMap = new Map();
    }

    init() {
        this.lightSources = [];
        for (let i = 0; i < this.numNodes; i += 1) {
            let newLightSource = new MovingLightSource(
                this.getPositionFunc(i),
                getDaylightStrength,
                getCurrentLightColorTemperature,
                21000
            );
            this.lightSources.push(newLightSource);
        }
    }

    getPositionFunc(idx) {
        return () => {
            let curMillis = getCurDay() * millis_per_day;
            let curDate = new Date(curMillis);

            let times = SunCalc.getTimes(curDate, getActiveClimate().lat, getActiveClimate().lng);

            let sunrise = times["sunrise"].getTime() / millis_per_day;
            let noon = times["solarNoon"].getTime() / millis_per_day;
            let sunset = times["night"].getTime() / millis_per_day;

            let sunPos = 0;
            if (getCurDay() < noon)
                sunPos = 0.5 * (getCurDay() - sunrise) / (noon - sunrise);
            else
                sunPos = 0.5 + 0.5 * (getCurDay() - noon) / (sunset - noon);

            sunPos = (sunPos) * Math.PI;

            let perIdxOffset = (this.dist * loadGD(UI_LIGHTING_SHADOW_SOFTNESS) * idx);
            let maxIdxOffset = (this.dist * loadGD(UI_LIGHTING_SHADOW_SOFTNESS) * this.numNodes);
            let idxOffset = perIdxOffset - (maxIdxOffset / 2);

            let lightSourceCenterPosX = loadGD(UI_CANVAS_VIEWPORT_CENTER_X) / getBaseSize() + idxOffset;;
            let lightSourceCenterPosY = -this.dist;

            let lightSourceRotationPosX = lightSourceCenterPosX;
            let lightSourceRotationPosY = (getFrameYMax() + getFrameYMin()) / 2;

            let idxPosXProcessed = lightSourceCenterPosX - lightSourceRotationPosX;
            let idxPosYProcessed = lightSourceCenterPosY - lightSourceRotationPosY;

            let dayTheta = (2 * Math.PI) - (sunPos - (Math.PI / 2));

            let rotatedX = idxPosXProcessed * Math.cos(dayTheta) - idxPosYProcessed * Math.sin(dayTheta);
            let rotatedY = idxPosYProcessed * Math.cos(dayTheta) + idxPosXProcessed * Math.sin(dayTheta);

            let endX = rotatedX + lightSourceRotationPosX;
            let endY = rotatedY + lightSourceRotationPosY;

            endY = Math.min(endY, lightSourceRotationPosY);

            return [endX, endY]
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
            this.lightSources[i].calculateFrameCloudCover();
            let _i = i;
            addTask("SunMovingLightGroup_doRayCasting_" + idx + "_" + i, () => {
                this.lightSources[i].doRayCasting(idx, i, () => {
                    completionMap.set(_i, true);
                    if (completionMap.values().every((val) => val)) {
                        this.idxCompletionMap.set(idx, true);
                    }
                });
            }, i);
        };
        return true;
    }
}