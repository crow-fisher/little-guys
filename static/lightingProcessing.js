import { getCurrentLightColorTemperature, getDaylightStrength } from "./time.js";

var curFrameDivMult = 1;
var prevFrameDivMult = 1;

export function resetFrameDivMult() {
    prevFrameDivMult = curFrameDivMult;
    curFrameDivMult = 1;
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
    var minBrightness = 55 * getDaylightStrength();
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
    var outColorMax = Math.max(Math.max(outColor.r, outColor.g), outColor.b);
    curFrameDivMult = Math.max(curFrameDivMult, outColorMax / 255);
    outColor.r /= prevFrameDivMult;
    outColor.g /= prevFrameDivMult;
    outColor.b /= prevFrameDivMult;
    outColor.r = Math.max(outColor.r, minBrightness);
    outColor.g = Math.max(outColor.g, minBrightness);
    outColor.b = Math.max(outColor.b, minBrightness);
    return outColor;
}
