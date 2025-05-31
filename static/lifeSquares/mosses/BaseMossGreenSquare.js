import { getDaylightStrengthFrameDiff } from "../../climate/time.js";
import { RGB_COLOR_GREEN, RGB_COLOR_RED } from "../../colors.js";
import { hexToRgb, rgbToRgba } from "../../common.js";
import { MAIN_CONTEXT } from "../../index.js";
import { applyLightingFromSource } from "../../lighting/lightingProcessing.js";
import { BaseLifeSquare } from "../BaseLifeSquare.js";



export class BaseMossGreenSquare extends BaseLifeSquare {
    constructor(square, organism) {
        super(square, organism);
        square.linkOrganismSquare(this);
        applyLightingFromSource(square, this);

        this.dormantColorBase = hexToRgb("#594d3c");
    }

    generalNutritionTick(value, target, min, max) {
        if (value < min || value > max)
            return 0;
        else if (value > target)
            return 1 - ((value - target) / (max - target));
        else if (value < target)
            return (value - min) / (target - min);
        else
            return 0;
    }

    lightLevelTick() {
        return 1;
    }

    moistureLevelTick() {
        let target = this.linkedOrganism.waterPressureSoilTarget();
        let min = this.linkedOrganism.waterPressureWiltThresh() + target;
        let max = this.linkedOrganism.waterPressureOverwaterThresh() + target;

        this.tickMoistureLevel = this.generalNutritionTick(this.linkedSquare.getSoilWaterPressure(), target, min, max);

        return this.tickMoistureLevel;
    }

    mossSqTick() {
        return this.lightLevelTick() * this.moistureLevelTick();
    };

    renderMoisture(frameOpacity) {
        let c1 = RGB_COLOR_GREEN;
        let c2 = RGB_COLOR_RED;

        let out = {
            r: c1.r * this.tickMoistureLevel + c2.r * (1 - this.tickMoistureLevel),
            g: c1.g * this.tickMoistureLevel + c2.g * (1 - this.tickMoistureLevel),
            b: c1.b * this.tickMoistureLevel + c2.b * (1 - this.tickMoistureLevel),
        }
        MAIN_CONTEXT.fillStyle = rgbToRgba(out.r, out.g, out.b, frameOpacity);
        this.renderToCanvas();
        return;
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

            let outColorMP = {
                r: (outColorBase.r * this.tickMoistureLevel + this.dormantColorBase.r * (1 - this.tickMoistureLevel)),
                g: (outColorBase.g * this.tickMoistureLevel + this.dormantColorBase.g * (1 - this.tickMoistureLevel)),
                b: (outColorBase.b * this.tickMoistureLevel + this.dormantColorBase.b * (1 - this.tickMoistureLevel))
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