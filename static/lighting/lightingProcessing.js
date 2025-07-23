import { getCanvasSquaresX, getCanvasSquaresY } from "../canvas.js";
import { getCurrentLightColorTemperature, getDaylightStrength, getMoonlightColor } from "../climate/time.js";
import { getStandardDeviation } from "../common.js";
import { getSquares } from "../squares/_sqOperations.js";
import { loadGD, saveGD, UI_CAMERA_EXPOSURE, UI_LIGHTING_DISABLED_BRIGHTNESS, UI_LIGHTING_GLOBAL, UI_LIGHTING_MOON, UI_LIGHTING_SUN } from "../ui/UIData.js";

export function getDefaultLighting() {
    let brightness = getDaylightStrength();
    let daylightColor = getCurrentLightColorTemperature();
    let moonlightColor = getMoonlightColor();
    let mult = Math.exp(loadGD(UI_LIGHTING_DISABLED_BRIGHTNESS));
    return {
        r: mult * (moonlightColor.r * .7 * Math.exp(loadGD(UI_LIGHTING_MOON)) + 0.5 * Math.exp(loadGD(UI_LIGHTING_SUN)) * (daylightColor.r * brightness)),
        g: mult * (moonlightColor.g * .7 * Math.exp(loadGD(UI_LIGHTING_MOON)) + 0.5 * Math.exp(loadGD(UI_LIGHTING_SUN)) * (daylightColor.g * brightness)),
        b: mult * (moonlightColor.b * .7 * Math.exp(loadGD(UI_LIGHTING_MOON)) + 0.5 * Math.exp(loadGD(UI_LIGHTING_SUN)) * (daylightColor.b * brightness))
    }
}

export function getCloudRenderingLighting() {
    let brightness = getDaylightStrength();
    let daylightColor = getCurrentLightColorTemperature();
    let moonlightColor = getMoonlightColor();
    return {
        r: (moonlightColor.r * .7 * Math.exp(loadGD(UI_LIGHTING_MOON)) + 0.5 * Math.exp(loadGD(UI_LIGHTING_SUN)) * (daylightColor.r * brightness)),
        g: (moonlightColor.g * .7 * Math.exp(loadGD(UI_LIGHTING_MOON)) + 0.5 * Math.exp(loadGD(UI_LIGHTING_SUN)) * (daylightColor.g * brightness)),
        b: (moonlightColor.b * .7 * Math.exp(loadGD(UI_LIGHTING_MOON)) + 0.5 * Math.exp(loadGD(UI_LIGHTING_SUN)) * (daylightColor.b * brightness))
    }
}

export function processLighting(lightingMap) {
    let outColor = { r: 0, g: 0, b: 0 }
    lightingMap.filter((light) => light != null && light.length == 2).forEach((light) => {
        let strength = light[0].filter((f) => f != null).map((f) => f()).reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
        ) * loadGD(UI_CAMERA_EXPOSURE);

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
    dest.frameCacheLighting = structuredClone(source.frameCacheLighting);
}

export function lightingExposureAdjustment() {
    let collectedSquares = new Array();
    for (let i = 0; i < getCanvasSquaresX(); i += Math.floor(getCanvasSquaresX() ** 0.5)) {
        for (let j = 0; j < getCanvasSquaresY(); j += Math.floor(getCanvasSquaresY() ** 0.5)) {
            collectedSquares.push(...getSquares(i, j).filter((sq) => sq.solid));
        }
    };

    if (collectedSquares.length == 0) {
        return;
    }
    let strengths = collectedSquares
        .map((sq) => sq.lighting
            .filter((light) => light != null && light.length == 2)
            .map((light) => {
                let ba = light[0];
                let c = light[1]();
                let b = ba
                    .filter((f) => f != null)
                    .map((f) => f())
                    .reduce((a, b) => a + b, 0);
                return b * (c.r / 255) + b * (c.b / 255);
            }
            )).map((arr) => arr.reduce((a, b) => a + b, 0));

    let mean = strengths.reduce((a, b) => a + b, 0) / collectedSquares.length;
    let max = strengths.reduce((a, b) => Math.max(a, b), .01);
    let stdev = getStandardDeviation(strengths);

    let v = max - stdev;
    if (isNaN(v) || v == 0) {
        return;
    }

    let cur = loadGD(UI_CAMERA_EXPOSURE) / (2 - loadGD(UI_LIGHTING_GLOBAL));
    let next = null;

    let target = 2.5;
    let db = Math.abs((v * cur - target) / target) * .1;

    if (v * cur > target) {
        next = cur * (1 - db);
    } else if (v * cur < target) {
        next = cur * (1 + db);
    } else {
        next = cur;
    }

    next = Math.max(0.5, next);
    next = Math.min(14, next);

    saveGD(UI_CAMERA_EXPOSURE, next);
}