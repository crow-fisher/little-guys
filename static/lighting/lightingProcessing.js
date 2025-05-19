import { getCurrentLightColorTemperature, getDaylightStrength, getMoonlightColor } from "../climate/time.js";
import { isSaveOrLoadInProgress } from "../saveAndLoad.js";
import { loadGD, UI_CAMERA_EXPOSURE, UI_LIGHTING_ENABLED, UI_LIGHTING_MOON, UI_LIGHTING_SUN } from "../ui/UIData.js";

export function getDefaultLighting() {
    let brightness = getDaylightStrength();
    let daylightColor = getCurrentLightColorTemperature();
    let moonlightColor = getMoonlightColor();

    return {
        r: moonlightColor.r * .7 * Math.exp(loadGD(UI_LIGHTING_MOON)) + 0.5 * Math.exp(loadGD(UI_LIGHTING_SUN)) * (daylightColor.r * brightness),
        g: moonlightColor.g * .7 * Math.exp(loadGD(UI_LIGHTING_MOON)) + 0.5 * Math.exp(loadGD(UI_LIGHTING_SUN)) * (daylightColor.g * brightness),
        b: moonlightColor.b * .7 * Math.exp(loadGD(UI_LIGHTING_MOON)) + 0.5 * Math.exp(loadGD(UI_LIGHTING_SUN)) * (daylightColor.b * brightness)
    }
}

export function processLighting(lightingMap) {
    let outColor = {r: 0, g: 0, b: 0}
    lightingMap.filter((light) => light != null && light.length == 2).forEach((light) => {
        let strength = light[0].filter((f) => f != null).map((f) => f()).reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
        ) * Math.exp(loadGD(UI_CAMERA_EXPOSURE));
        let color = light[1]();
        outColor = {
            r: outColor.r + strength * color.r,
            g: outColor.g + strength * color.g,
            b: outColor.b + strength * color.b
        }
    });
    return outColor;
}

export function applyLightingFromSource(source, dest) {
    if (source == null || source.lighting == null || source.lighting.length == 0) {
        return;
    }
    dest.lighting = new Array();
    source.lighting.forEach((light) => {
        dest.lighting.push([Array.from(light[0].map((x) => x)), light[1]])
    });
}
