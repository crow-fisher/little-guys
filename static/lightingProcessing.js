import { getStandardDeviation } from "./common.js";
import { getCurrentLightColorTemperature, getDaylightStrength } from "./time.js";

var curFrameValues = [1];
var prevFrameDivMult = 1;
var targetNumEntries = 100;
var curProbability = 1;

export function resetFrameDivMult() {
    var stdev = getStandardDeviation(curFrameValues);
    var mean = curFrameValues.reduce(                
        (accumulator, currentValue) => accumulator + currentValue,
        0,
    ) / curFrameValues.length;
    prevFrameDivMult = 0.3 + 0.7 * (mean + 2 * stdev);

    if (curFrameValues.length > targetNumEntries) {
        curProbability *= 0.99;
    } else {
        curProbability *= 1.01;
    }
    curFrameValues = [1];
}

export function processLighting(lightingMap) {
    if (lightingMap.length == 0) {
        var brightness = getDaylightStrength();
        var daylightColor = getCurrentLightColorTemperature();
        return {
            r: (daylightColor.r * brightness),
            g: (daylightColor.g * brightness),
            b: (daylightColor.b * brightness)
        }
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
