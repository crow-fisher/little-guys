// pure functions only

import { reduceNextLightUpdateTime } from "./globalOperations.js";
import { getCurrentLightColorTemperature, getDaylightStrength, getMoonlightColor } from "./time.js";

function getObjectArrFromMap(baseMap, posX, posY) {
    if (!(posX in baseMap)) {
        baseMap[posX] = new Map();
    }
    if (!(posY in baseMap[posX])) {
        baseMap[posX][posY] = new Array();
    }
    return baseMap[posX][posY];
}

function removeItemAll(arr, value) {
    var i = 0;
    while (i < arr.length) {
        if (arr[i] === value) {
            arr.splice(i, 1);
        } else {
            ++i;
        }
    }
    return arr;
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

function rgbToRgba(r, g, b, a) {
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}

function randNumber(min, max) {
    max += 1;
    return Math.floor(Math.random() * (max - min) + min);
}

function randRange(min, max) {
    return Math.random() * (max - min) + min;
}

export function organismProgressCalculus(amount, period) {
    return (amount / (period ** 2)) * 2;
}

function loadImage(url) {
    let i = new Image();
    i.src = url;
    return i;
}

function getStandardDeviation(array) {
    const n = array.length
    const mean = array.reduce((a, b) => a + b) / n
    return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)
}

function processColorStdev(val_max, val, val_stdev, color) {
    return processColorStdevMulticolor(val_max, val, val_stdev, color, { r: 255, g: 255, b: 255 });
}

function processColorLerp(val, val_min, val_max, color) {
    return processColorLerpBicolor(val, val_min, val_max, color, { r: 255, g: 255, b: 255 });
}

function processColorLerpBicolor(val, val_min, val_max, color1, color2) {
    var p = (val - val_min) / (val_max - val_min);
    return {
        r: Math.floor(color1.r * (1 - p) + color2.r * (p)),
        g: Math.floor(color1.g * (1 - p) + color2.g * (p)),
        b: Math.floor(color1.b * (1 - p) + color2.b * (p))
    }
}

function processColorStdevMulticolor(val_max, val, val_stdev, color1, color2) {
    var z = (val_max - val) / val_stdev;
    var p = getZPercent(z);
    return {
        r: Math.floor(color1.r * (1 - p) + color2.r * (p)),
        g: Math.floor(color1.g * (1 - p) + color2.g * (p)),
        b: Math.floor(color1.b * (1 - p) + color2.b * (p))
    }
}


function getZPercent(z) {
    // z == number of standard deviations from the mean

    // if z is greater than 6.5 standard deviations from the mean the
    // number of significant digits will be outside of a reasonable range

    if (z < -6.5) {
        return 0.0;
    }

    if (z > 6.5) {
        return 1.0;
    }

    var factK = 1;
    var sum = 0;
    var term = 1;
    var k = 0;
    var loopStop = Math.exp(-23);

    while (Math.abs(term) > loopStop) {
        term = .3989422804 * Math.pow(-1, k) * Math.pow(z, k) / (2 * k + 1) / Math.pow(2, k) * Math.pow(z, k + 1) / factK;
        sum += term;
        k++;
        factK *= k;
    }

    sum += 0.5;

    return sum;
}

function getDist(x1, x2, y1, y2) {
    return ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5;
}

function dec2bin(dec) {
    return (dec >>> 0).toString(2);
  }

function processLighting(lightingMap) {
    if (lightingMap.length == 0) {
        var brightness = getDaylightStrength();
        var daylightColor = getCurrentLightColorTemperature();
        var moonlightColor = getMoonlightColor();
        return {
            r: (moonlightColor.r * 0.25) + (daylightColor.r * brightness),
            g: (moonlightColor.g * 0.25) + (daylightColor.g * brightness),
            b: (moonlightColor.b * 0.25) + (daylightColor.b * brightness)
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
            r: Math.min(255, outColor.r + strength * color.r),
            g: Math.min(255, outColor.g + strength * color.g),
            b: Math.min(255, outColor.b + strength * color.b)
        }
    });

    outColor.r = Math.max(outColor.r, minBrightness);
    outColor.g = Math.max(outColor.g, minBrightness);
    outColor.b = Math.max(outColor.b, minBrightness);
    return outColor;
}

export { getObjectArrFromMap, removeItemAll, hexToRgb, rgbToHex, rgbToRgba, 
    randNumber, randRange, loadImage, getStandardDeviation, getZPercent,
     processColorStdev, processColorStdevMulticolor, processColorLerp, 
     processColorLerpBicolor, getDist, dec2bin, processLighting}
