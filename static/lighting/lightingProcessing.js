import { getStandardDeviation } from "../common.js";
import { getCurrentLightColorTemperature, getDaylightStrength, getMoonlightColor } from "../climate/time.js";
import { loadGD, UI_LIGHTING_ENABLED } from "../ui/UIData.js";

let curFrameValues = [1];
let prevFrameDivMult = 1;

export function resetFrameDivMult() {
    let stdev = getStandardDeviation(curFrameValues);
    let mean = curFrameValues.reduce(                
        (accumulator, currentValue) => accumulator + currentValue,
        0,
    ) / curFrameValues.length;
    prevFrameDivMult = 0.6 + 0.4 * (mean + 0.7 * stdev);
    curFrameValues = [1];
}

export function getDefaultLighting() {
    let brightness = getDaylightStrength();
    let daylightColor = getCurrentLightColorTemperature();
    let moonlightColor = getMoonlightColor();

    return {
        r: Math.min(255, moonlightColor.r * 0.3 + (daylightColor.r * brightness)),
        g: Math.min(255, moonlightColor.g * 0.3 + (daylightColor.g * brightness)),
        b: Math.min(255, moonlightColor.b * 0.3 + (daylightColor.b * brightness))
    }
}

export function processLighting(lightingMap) {
    if (!loadGD(UI_LIGHTING_ENABLED) || lightingMap.length == 0) {
        return getDefaultLighting();
    }
    let outColor = {r: 0, g: 0, b: 0}
    lightingMap.filter((light) => light != null && light.length == 2).forEach((light) => {
        let strength = light[0].map((f) => f()).reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
        );
        let color = light[1]();
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

export function applyLightingFromSource(source, dest) {
    if (source.lighting.length == 0) {
        return;
    }
    dest.lighting = [];
    source.lighting.forEach((light) => {
        dest.lighting.push([Array.from(light[0].map((x) => x)), light[1]])
    });
}
