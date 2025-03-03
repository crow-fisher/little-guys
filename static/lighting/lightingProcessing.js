import { getStandardDeviation } from "../common.js";
import { getCurrentLightColorTemperature, getDaylightStrength, getMoonlightColor } from "../climate/time.js";
import { addUIFunctionMap, loadUI, UI_LIGHTING_DECAY, UI_LIGHTING_PLANT, UI_LIGHTING_ROCK, UI_LIGHTING_WATER, UI_TOPBAR_FASTLIGHTING, UI_TOPBAR_TOGGLELIGHTING } from "../ui/UIData.js";
import { setNextLightUpdateTime } from "../main.js";
import { FAST_LIGHTING_INTERVAL, setNextLightingInterval, setRestingLightingInterval, SLOW_LIGHTING_INTERVAL } from "./lightingHandler.js";

var curFrameValues = [1];
var prevFrameDivMult = 1;

export function resetFrameDivMult() {
    var stdev = getStandardDeviation(curFrameValues);
    var mean = curFrameValues.reduce(                
        (accumulator, currentValue) => accumulator + currentValue,
        0,
    ) / curFrameValues.length;
    prevFrameDivMult = 0.6 + 0.4 * (mean + 0.7 * stdev);
    curFrameValues = [1];
}

export function getDefaultLighting() {
    var brightness = getDaylightStrength();
    var daylightColor = getCurrentLightColorTemperature();
    var moonlightColor = getMoonlightColor();

    return {
        r: Math.min(255, moonlightColor.r * 0.3 + (daylightColor.r * brightness)),
        g: Math.min(255, moonlightColor.g * 0.3 + (daylightColor.g * brightness)),
        b: Math.min(255, moonlightColor.b * 0.3 + (daylightColor.b * brightness))
    }
}

export function processLighting(lightingMap) {
    if (!loadUI(UI_TOPBAR_TOGGLELIGHTING) || lightingMap.length == 0) {
        return getDefaultLighting();
    }
    var outColor = {r: 0, g: 0, b: 0}
    lightingMap.filter((light) => light != null && light.length == 2).forEach((light) => {
        var strength = light[0].map((f) => f()).reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
        );
        var color = light[1]();
        outColor = {
            r: outColor.r + strength * color.r,
            g: outColor.g + strength * color.g,
            b: outColor.b + strength * color.b
        }
    });
    curFrameValues.push(outColor.b / 255);
    outColor.r /= prevFrameDivMult;
    outColor.g /= prevFrameDivMult;
    outColor.b /= prevFrameDivMult;
    return outColor;
}

addUIFunctionMap(UI_LIGHTING_WATER, () => setNextLightUpdateTime(0))
addUIFunctionMap(UI_LIGHTING_ROCK, () => setNextLightUpdateTime(0))
addUIFunctionMap(UI_LIGHTING_PLANT, () => setNextLightUpdateTime(0))
addUIFunctionMap(UI_LIGHTING_DECAY, () => setNextLightUpdateTime(0))
addUIFunctionMap(UI_TOPBAR_FASTLIGHTING, () => {
    if (loadUI(UI_TOPBAR_FASTLIGHTING)) {
        setRestingLightingInterval(FAST_LIGHTING_INTERVAL);
    } else {
        setRestingLightingInterval(SLOW_LIGHTING_INTERVAL);
    }
})
