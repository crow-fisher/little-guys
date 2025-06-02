import { getDaylightStrengthFrameDiff } from "../../climate/time.js";
import { RGB_COLOR_GREEN, RGB_COLOR_OTHER_BLUE, RGB_COLOR_RED } from "../../colors.js";
import { hexToRgb, rgbToRgba } from "../../common.js";
import { MAIN_CONTEXT } from "../../index.js";
import { applyLightingFromSource } from "../../lighting/lightingProcessing.js";
import { BaseLifeSquare } from "../BaseLifeSquare.js";



export class BaseMossGreenSquare extends BaseLifeSquare {
    constructor(square, organism) {
        super(square, organism);
        square.linkOrganismSquare(this);
        this.type = "moss";
        applyLightingFromSource(square, this);
        this.dormantColorBase = hexToRgb("#594d3c");
        this.overwaterColorBase = hexToRgb("#150e04");
        this.tickLightLevel = 0;
        this.tickMoistureLevel = 0;
    }

    generalNutritionTick(val, target, min, max) {
        if (val <= min)
            return -1;
        else if (val >= max)
            return 1;
        else if (val > target)
            return ((val - target) / (max - target));
        else if (val < target) {
            val -= min;
            target -= min;
            val /= target; // if val is min, ie worst, it will be 0. if max, ie best, it will be 1
            return (-1) + val;
        }
        else
            return 0;
    }

    lightLevelTick() {
        let target = this.linkedOrganism.llt_target();
        let min = target - this.linkedOrganism.llt_min();
        let max = target + this.linkedOrganism.llt_max();

        let _lsl = this.processLighting();
        let val = (_lsl.r + _lsl.b) / (255 * 2);
        this.tickLightLevel = this.generalNutritionTick(val, target, min, max);

        return this.tickLightLevel;
    }

    moistureLevelTick() {
        let target = this.linkedOrganism.waterPressureSoilTarget();
        let min = target + this.linkedOrganism.waterPressureWiltThresh();
        let max = target + this.linkedOrganism.waterPressureOverwaterThresh();

        let val = this.linkedSquare.getSoilWaterPressure();
        this.tickMoistureLevel = this.generalNutritionTick(val, target, min, max);
        return this.tickMoistureLevel;
    }

    mossSqTick() {
        this.lightLevelTick();
        return [(1 - Math.abs(this.moistureLevelTick())), (1 - Math.abs(this.lightLevelTick()))]
    };

    renderNutrient(frameOpacity, val) {
        let color1 = null;
        let color2 = null;
        let c1m, c2m;

        if (val < 0) {
            color1 = RGB_COLOR_RED;
            color2 = RGB_COLOR_GREEN;
            c1m = Math.abs(val);
            c2m = 1 + val;
        } else if (val >= 0) {
            color1 = RGB_COLOR_GREEN;
            color2 = RGB_COLOR_OTHER_BLUE;
            c1m = (1 - val);
            c2m = val;
        }
        let out = {
            r: color1.r * c1m + color2.r * c2m,
            g: color1.g * c1m + color2.g * c2m,
            b: color1.b * c1m + color2.b * c2m
        }

        MAIN_CONTEXT.fillStyle = rgbToRgba(out.r, out.g, out.b, frameOpacity);
        this.renderToCanvas();
        return;
    }

    renderMoisture(frameOpacity) {
        return this.renderNutrient(frameOpacity, this.tickMoistureLevel);
    }

    renderLighting() {
        return this.renderNutrient(1, this.tickLightLevel);
    }

    renderWithVariedColors(frameOpacity) {
        let minTime = 2000;
        // if (isSqColChanged(Math.floor(this.getPosX()))) {
        //     minTime /= 4;
        // }
        // if (isSqRowChanged(Math.floor(this.getPosY()))) {
        //     minTime /= 4;
        // }

        if (
            (frameOpacity != this.lastColorCacheOpacity) ||
            (Date.now() > this.lastColorCacheTime + minTime * Math.random()) ||
            Math.abs(getDaylightStrengthFrameDiff()) > 0.01) {
            this.lastColorCacheTime = Date.now();
            this.lastColorCacheOpacity = frameOpacity;
            let res = this.getStaticRand(1) * this.accentColorAmount + this.darkColorAmount + this.baseColorAmount;
            let baseColor = null;
            let altColor1 = null;
            let altColor2 = null;
            if (res < this.accentColorAmount) {
                baseColor = this.accentColor_rgb;
                altColor1 = this.darkColor_rgb;
                altColor2 = this.baseColor_rgb;
            } else if (res < this.accentColorAmount + this.darkColorAmount) {
                baseColor = this.accentColor_rgb;
                altColor1 = this.baseColor_rgb;
                altColor2 = this.darkColor_rgb;
            } else {
                altColor1 = this.accentColor_rgb;
                altColor2 = this.darkColor_rgb;
                baseColor = this.baseColor_rgb;
            }

            let rand = this.getStaticRand(2);
            // the '0.1' is the base darkness
            let outColorBase = {
                r: (baseColor.r * 0.5 + ((altColor1.r * rand + altColor2.r * (1 - rand)) * 0.5)),
                g: (baseColor.g * 0.5 + ((altColor1.g * rand + altColor2.g * (1 - rand)) * 0.5)),
                b: (baseColor.b * 0.5 + ((altColor1.b * rand + altColor2.b * (1 - rand)) * 0.5))
            };

            let outColorMP = null;

            if (this.tickMoistureLevel <= 0) {
                outColorMP = {
                    r: (outColorBase.r * (1 - Math.abs(this.tickMoistureLevel)) + this.dormantColorBase.r * Math.abs(this.tickMoistureLevel)),
                    g: (outColorBase.g * (1 - Math.abs(this.tickMoistureLevel)) + this.dormantColorBase.g * Math.abs(this.tickMoistureLevel)),
                    b: (outColorBase.b * (1 - Math.abs(this.tickMoistureLevel)) + this.dormantColorBase.b * Math.abs(this.tickMoistureLevel))
                }
            } else {
                outColorMP = {
                    r: (outColorBase.r * (1 - this.tickMoistureLevel) + this.overwaterColorBase.r * Math.abs(this.tickMoistureLevel)),
                    g: (outColorBase.g * (1 - this.tickMoistureLevel) + this.overwaterColorBase.g * Math.abs(this.tickMoistureLevel)),
                    b: (outColorBase.b * (1 - this.tickMoistureLevel) + this.overwaterColorBase.b * Math.abs(this.tickMoistureLevel))
                }
            }

            this.frameCacheLighting = null;
            let lightingColor = this.processLighting();
            let outColor = { r: lightingColor.r * outColorMP.r / 255, g: lightingColor.g * outColorMP.g / 255, b: lightingColor.b * outColorMP.b / 255 };
            this.cachedRgba = rgbToRgba(Math.floor(outColor.r), Math.floor(outColor.g), Math.floor(outColor.b), frameOpacity);
        }
        MAIN_CONTEXT.fillStyle = this.cachedRgba;
        this.renderToCanvas();
    }
}