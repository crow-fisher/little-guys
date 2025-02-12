import { getStandardDeviation } from "./common.js";
import { getCurrentLightColorTemperature, getDaylightStrength, getMoonlightColor } from "./time.js";

var curFrameValues = [1];
var prevFrameDivMult = 1;

export function resetFrameDivMult() {
    var stdev = getStandardDeviation(curFrameValues);
    var mean = curFrameValues.reduce(                
        (accumulator, currentValue) => accumulator + currentValue,
        0,
    ) / curFrameValues.length;
    prevFrameDivMult = 0.99 + 0.01 * (mean + 0.7 * stdev);
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
    if (lightingMap.length == 0) {
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
