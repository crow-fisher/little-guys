import { getCurrentLightColorTemperature, getDaylightStrength, getMoonlightColor } from "../climate/time.js";
import { isSaveOrLoadInProgress } from "../saveAndLoad.js";
import { loadGD, UI_LIGHTING_ENABLED, UI_LIGHTING_MOON, UI_LIGHTING_SUN } from "../ui/UIData.js";

export function getDefaultLighting() {
    let brightness = getDaylightStrength();
    let daylightColor = getCurrentLightColorTemperature();
    let moonlightColor = getMoonlightColor();

    return {
        r: moonlightColor.r * 2.3 * Math.exp(loadGD(UI_LIGHTING_MOON)) + 0.5 * Math.exp(loadGD(UI_LIGHTING_SUN)) * (daylightColor.r * brightness),
        g: moonlightColor.g * 2.3 * Math.exp(loadGD(UI_LIGHTING_MOON)) + 0.5 * Math.exp(loadGD(UI_LIGHTING_SUN)) * (daylightColor.g * brightness),
        b: moonlightColor.b * 2.3 * Math.exp(loadGD(UI_LIGHTING_MOON)) + 0.5 * Math.exp(loadGD(UI_LIGHTING_SUN)) * (daylightColor.b * brightness)
    }
}

export function processLighting(lightingMap) {
    if (!loadGD(UI_LIGHTING_ENABLED) || lightingMap.length == 0) {
        return getDefaultLighting();
    }
    let outColor = {r: 0, g: 0, b: 0}

    lightingMap.filter((light) => light != null && light.length == 2).forEach((light) => {
        if (light[0].length > 3)
            light[0] = light[0].slice(0, 2);

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
