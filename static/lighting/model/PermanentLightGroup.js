import { getBaseSize, getFrameXMax, getFrameXMin, getFrameYMax, getFrameYMin } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { SunCalc } from "../../climate/suncalc/suncalc.js";
import { getCurDay, getCurrentLightColorTemperature, getDaylightStrength, getMoonlightBrightness, getMoonlightColor, millis_per_day } from "../../climate/time.js";
import { RGB_COLOR_RED } from "../../colors.js";
import { hsv2rgb } from "../../common.js";
import { addTask } from "../../scheduler.js";
import { loadGD, UI_CANVAS_VIEWPORT_CENTER_X, UI_CANVAS_VIEWPORT_CENTER_Y, UI_LIGHTING_FLATLIGHTING_BRIGHTNESS, UI_LIGHTING_FLATLIGHTING_HUE, UI_LIGHTING_FLATLIGHTING_SATURATION, UI_LIGHTING_SHADOW_SOFTNESS, UI_LIGHTING_UPDATERATE } from "../../ui/UIData.js";
import { LightGroup } from "./LightGroup.js";
import { MovingLightSource } from "./MovingLightSource.js";

export class PermanentLightGroup extends LightGroup {
    constructor() {
        super();
        this.dist = 10000;
        this.numNodes = 2;
        this.init();
        this.idxCompletionMap = new Map();
    }

    init() {
        this.colorFuncRefresh();
        this.lightSources = [];
        for (let i = 0; i < this.numNodes; i += 1) {
            let newLightSource = new MovingLightSource(
                this.getPositionFunc(i),
                () => Math.exp(loadGD(UI_LIGHTING_FLATLIGHTING_BRIGHTNESS)),
                () => this.colorFunc(),
                40000
            );
            this.lightSources.push(newLightSource);
        }
    }

    colorFuncRefresh() {
        let hsv = [loadGD(UI_LIGHTING_FLATLIGHTING_HUE), loadGD(UI_LIGHTING_FLATLIGHTING_SATURATION), 255];
        let rgbArr = hsv2rgb(...hsv);
        this.cachedColor = { r: rgbArr[0], g: rgbArr[1], b: rgbArr[2] }
    }

    colorFunc() {
        return this.cachedColor;
    }


    getPositionFunc(idx) {
        let offset = 1000 * idx - (50 * (this.numNodes - 1) / 2);
        return () => [offset + (loadGD(UI_CANVAS_VIEWPORT_CENTER_X) / getBaseSize()), -2000];
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
            addTask("MoonMovingLightGruop_doRayCasting_" + idx + "_" + i, () => {
                this.lightSources[i].doRayCasting(idx, i, () => {
                    completionMap.set(_i, true);
                    if (completionMap.values().every((val) => val)) {
                        this.idxCompletionMap.set(idx, true);
                    }
                });
            }, idx + i * loadGD(UI_LIGHTING_UPDATERATE));
        };
        return true;
    }
}