import { hexToRgb, randNumber, rgbToRgba } from "../../common.js";
import { getSquares } from "../../squares/_sqOperations.js";
import { getBaseSize, zoomCanvasFillRect } from "../../canvas.js";
import { MAIN_CONTEXT } from "../../index.js";
import { getPressure, updateWindPressureByMult, setPressurebyMult, getWindSquaresY, getWindSquaresX, isPointInWindBounds, getBaseAirPressureAtYPosition, getAirSquareDensity, getWindPressureSquareDensity, base_wind_pressure, manipulateWindPressureMaintainHumidityWindSquare, initWindPressure, isWindSquareBlocked, windFlowrateFactor, getWindSquareAbove, getWindThrottleValWindMap } from "./wind.js";
import { logRainFall } from "../weather/weatherManager.js";
import { getDefaultLighting } from "../../lighting/lightingProcessing.js";
import { addSquareByName } from "../../manipulation.js";
import { loadGD, UI_CLIMATE_RAINFALL_DENSITY } from "../../ui/UIData.js";
import { isLeftMouseClicked, isRightMouseClicked } from "../../mouse.js";
import { RGB_COLOR_BLACK, RGB_COLOR_BLUE, RGB_COLOR_GREEN, RGB_COLOR_RED } from "../../colors.js";
import { getTimeScale, millis_per_day } from "../time.js";
import { getWindThrottleVal, registerWindThrottlerOutput } from "./throttler.js";
// decent reference https://web.gps.caltech.edu/~xun/course/GEOL1350/Lecture5.pdf

export function temperatureHumidityFlowrateFactor() {
    return 24;
}

var temperatureMap;
var waterSaturationMap;

let c_tempLowRGB = hexToRgb("#1dbde6");
let c_tempHighRGB = hexToRgb("#f1515e");

let c_waterSaturationLowRGB = hexToRgb("#9bafd9");
let c_waterSaturationHighRGB = hexToRgb("#103783");

let c_cloudMinRGB = hexToRgb("#f1f0f6");
let c_cloudMidRGB = hexToRgb("#dbdce1")
let c_cloudMaxRGB = hexToRgb("#818398");

let cloudRainThresh = 1.01;
export let cloudRainMax = 1.1;
let cloudMaxOpacity = 0.65;

let pascalsPerWaterSquare = (1.986 * 10 ** 6);

var restingGradientStrength = 1;
var restingTemperatureGradient = [
    [0, 273 + 10],
    [1, 273 + 30]
];

var restingHumidityGradient = [
    [0, 0.95],
    [1, 0.75]
];
let restingAirPressure = 1;

var reverseRestingHumidityGradient = Array.from(restingHumidityGradient).reverse();
var reverseRestingTemperatureGradient = Array.from(restingTemperatureGradient).reverse();

export function setTemperatureMap(inMap) {
    temperatureMap = inMap;
}
export function setWaterSaturationMap(inMap) {
    waterSaturationMap = inMap;
}
export function setRestingGradientStrength(inValue) {
    restingGradientStrength = inValue;
}
export function getTemperatureMap() {
    return temperatureMap;
}
export function getWaterSaturationMap() {
    return waterSaturationMap;
}
export function getRestingAirPressure() {
    return restingAirPressure;
}
export function setRestingAirPressure(inVal) {
    restingAirPressure = inVal;
}

export function setRestingTemperatureGradient(inGrad) {
    if (inGrad != restingTemperatureGradient) {
        restingTemperatureGradient = inGrad;
        reverseRestingTemperatureGradient = Array.from(restingTemperatureGradient).reverse();
    }
}

export function setRestingHumidityGradient(inGrad) {
    if (inGrad != restingHumidityGradient) {
        restingHumidityGradient = inGrad;
        reverseRestingHumidityGradient = Array.from(restingHumidityGradient).reverse();
    }
}

function getRestingHumidityAtSq(x, y) {
    y /= getWindSquaresY();
    let lower = reverseRestingHumidityGradient.find((arr) => arr[0] <= y);
    let upper = restingHumidityGradient.find((arr) => arr[0] > y);
    let pos = (y - lower[0]) / (upper[0] - lower[0]);
    return lower[1] * (1 - pos) + upper[1] * pos;
}

export function getRestingTemperatureAtSq(x, y) {
    y /= getWindSquaresY();
    let lower = reverseRestingTemperatureGradient.find((arr) => arr[0] <= y);
    let upper = restingTemperatureGradient.find((arr) => arr[0] > y);
    let pos = (y - lower[0]) / (upper[0] - lower[0]);
    return lower[1] * (1 - pos) + upper[1] * pos;
}

function getRestingAirPressureAtSq(y) {
    return getBaseAirPressureAtYPosition(y) + ((restingAirPressure - 1) * base_wind_pressure);
}

export function restingValues() {
    let temperatureStrength = 18 * restingGradientStrength;
    let humidityStrength = 2 * restingGradientStrength; 
    for (let i = 0; i < getWindSquaresX(); i++) {
        for (let j = 0; j < getWindSquaresY(); j++) {
            let curPressure = getPressure(i, j); 
             
            let pressureRestingMult = 0.05;

            let restingPressureTarget = getRestingAirPressureAtSq(j) * pressureRestingMult + curPressure * (1 - pressureRestingMult);
            manipulateWindPressureMaintainHumidityWindSquare(i, j, restingPressureTarget);

            let startTemp = temperatureMap[i][j];
            let restingTemp = getRestingTemperatureAtSq(i, j);
            let diffTemp = restingTemp - startTemp; 
            let curTempPascals = saturationPressureOfWaterVapor((restingTemp * 0.8 + temperatureMap[i][j] * 0.2));

            let curHumidity = getHumidity(i, j);
            let restingHumidity = getRestingHumidityAtSq(i, j);
            let diffHumidity = (restingHumidity - curHumidity);

            temperatureMap[i][j] += diffTemp / temperatureStrength;
            waterSaturationMap[i][j] += diffHumidity * curTempPascals / humidityStrength;
            waterSaturationMap[i][j] *= temperatureMap[i][j] / startTemp;
        }
    }
}

function saturationPressureOfWaterVapor(t) {
    // https://www.engineeringtoolbox.com/water-vapor-saturation-pressure-air-d_689.html
    return Math.E ** (77.345 + 0.0057 * t - 7235 / t) / (t ** 8.2);
}

export function getTemperatureAtWindSquare(x, y) {
    return temperatureMap[x][y];
}

export function initTemperatureHumidity() {
    temperatureMap = new Map();
    waterSaturationMap = new Map();

    for (let i = 0; i < getWindSquaresX(); i++) {
        for (let j = 0; j < getWindSquaresY(); j++) {
            if (!(i in temperatureMap)) {
                temperatureMap[i] = new Map();
                waterSaturationMap[i] = new Map();
            }
            temperatureMap[i][j] = getRestingTemperatureAtSq(i, j);
            waterSaturationMap[i][j] = saturationPressureOfWaterVapor(temperatureMap[i][j]) * getRestingHumidityAtSq(i, j);
        }
    }
}

function updateWindSquareTemperature(x, y, newVal) {
    if (getPressure(x, y) < 0) {
        return;
    }
    if (isNaN(newVal) || !isFinite(newVal)) {
        console.warn("Trying to set invalid temperature ", newVal);
        newVal = 273;
    }
    let start = temperatureMap[x][y];
    temperatureMap[x][y] = newVal;
    let end = temperatureMap[x][y];
    setPressurebyMult(x, y, (end / start));
}
 


function temperatureDiffFunction(x, y, x2, y2, high, low) {
    if (isWindSquareBlocked(x, y) || isWindSquareBlocked(x2, y2)) {
        return 0;
    }
    let diff = (high - low) / 2;
    diff /= temperatureHumidityFlowrateFactor();
    return diff;
}

function humidityDiffFunction(x, y, x2, y2, high, low) {
    if (isWindSquareBlocked(x, y) || isWindSquareBlocked(x2, y2)) {
        return 0;
    }
    let humidity1 = getHumidity(x, y); // 0.2
    let humidity2 = getHumidity(x2, y2); // 0.8

    let humidityDiff = humidity1 - humidity2; // 0.2 - 0.8 = -0.6;
    
    let square1PascalsForHumidityDiff = getWindPressureSquareDensity(x, y) * saturationPressureOfWaterVapor(temperatureMap[x][y]) * Math.abs(humidityDiff / 2);
    let square2PascalsForHumidityDiff = getWindPressureSquareDensity(x2, y2) * saturationPressureOfWaterVapor(temperatureMap[x2][y2]) * Math.abs(humidityDiff / 2);

    let minPascalsForHumidityDiff = Math.min(square1PascalsForHumidityDiff, square2PascalsForHumidityDiff)

    minPascalsForHumidityDiff /= temperatureHumidityFlowrateFactor();

    if (humidityDiff > 0) {
        return minPascalsForHumidityDiff;
    } else {
        return (-1) * (minPascalsForHumidityDiff);
    }
}


function tickMap(
    map,
    diff_function,
    update_function
) {
    let xKeys = Array.from(Object.keys(map));
    for (let i = 0; i < xKeys.length; i++) {
        let yKeys = Array.from(Object.keys(map[xKeys[i]]));
        for (let j = 0; j < yKeys.length; j++) {
            let x = parseInt(xKeys[i]);
            let y = parseInt(yKeys[j]);
            let throttleVal = getWindThrottleValWindMap(x, y);
            if (throttleVal < 0) {
                continue;
            }

            getMapDirectNeighbors(x, y)
                .filter((loc) => isPointInWindBounds(loc[0], loc[1]))
                .filter((loc) => getPressure(loc[0], loc[1]) > 0)
                .forEach((loc) => {
                    let x2 = loc[0];
                    let y2 = loc[1];
                    let diff = diff_function(x, y, x2, y2, map[x][y], map[x2][y2]);
                    if (diff == 0) {
                        return;
                    }
                    // registerWindThrottlerOutput(x, y, map[x][y], map[x][y] - diff)

                    if (y == y2) {
                        update_function(x, y, map[x][y] - diff);
                        update_function(x2, y2, map[x2][y2] + diff);
                        return;
                    }

                    let side = 1;
                    if (y2 < y) {
                        side *= -1;
                    }
                    if (diff < 0) {
                        side *= -1;
                    }

                    let vertMult = 5;

                    if (side == 1) {
                        diff /= vertMult;
                    } else {
                        diff *= vertMult;
                    }

                    update_function(x, y, map[x][y] - diff);
                    update_function(x2, y2, map[x2][y2] + diff);
                });
        }
    }
}

function getAdjacentProp(x, y, func) {
    return func(x, y) + getMapDirectNeighbors(x, y)
    .filter((loc) => loc[0] >= 0 && loc[0] < getWindSquaresX() && loc[1] >= 0 && loc[1] < getWindSquaresY())
    .map((loc) => func(loc[0], loc[1]))
    .reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0,
    );
}

function doRain() {
    if (getTimeScale() == 0) {
        return;
    }
    for (let x = 0; x < getWindSquaresX(); x++) {
        for (let y = 0; y < getWindSquaresY(); y++) {
            if (getAdjacentProp(x, y, (x, y) => (getHumidity(x, y) > cloudRainThresh ? 1 : 0)) < 5) {
                continue;
            };

            let adjacentHumidity = Math.min(cloudRainMax, getAdjacentProp(x, y, getHumidity) / 5);
            if (adjacentHumidity < (cloudRainThresh))
                continue;
            let rainDropProbability = ((adjacentHumidity - cloudRainThresh) / (cloudRainMax - cloudRainThresh));

            let density = Math.exp(loadGD(UI_CLIMATE_RAINFALL_DENSITY));

            rainDropProbability /= density;
            if (Math.random() > rainDropProbability) {
                continue;
            }

            let adjacentTemperature = getAdjacentProp(x, y, getTemperatureAtWindSquare) / 5;
            let expectedPascals = saturationPressureOfWaterVapor(adjacentTemperature) * cloudRainThresh;
            let adjacentPascals = getAdjacentProp(x, y, (x, y) => waterSaturationMap[x][y]) / 5;

            let dropPascals = (adjacentPascals - expectedPascals) * 0.005;

            let usedWaterPascalsPerSquare = dropPascals / 5;
            let dropHealth = dropPascals / pascalsPerWaterSquare;

            dropHealth = Math.min(1, dropHealth * density * 12000);

            let sq = addSquareByName(x * 4 + randNumber(0, 3), y * 4 + randNumber(0, 3), "water");
            if (sq) {
                sq.blockHealth = dropHealth;
                sq.temperature = temperatureMap[x][y];
                logRainFall(sq.blockHealth);
                waterSaturationMap[x][y] -= usedWaterPascalsPerSquare;
                getMapDirectNeighbors(x, y)
                    .filter((loc) => loc[0] >= 0 && loc[0] < getWindSquaresX() && loc[1] >= 0 && loc[1] < getWindSquaresY())
                    .forEach((loc) => waterSaturationMap[loc[0]][loc[1]] -= usedWaterPascalsPerSquare); 
                sq.speedY = 1;
            }
        }
    }
}

export function getCloudColorAtSqPos(x, y) {
    let wx = Math.floor(x / 4);
    let wy = Math.floor(y / 4);
    return getCloudColorAtPos(wx, wy);
}

export function getCloudColorAtPos(x, y) {
    if (!isPointInWindBounds(x, y)) {
        return {r: 255, g: 255, b: 255, a: 0};
    }
    let squareHumidity = getHumidity(x, y);
    if (squareHumidity < 1) {
        return {r: 255, g: 255, b: 255, a: 0};
    }
    let outColor;
    let opacity;
    if (squareHumidity < (cloudRainThresh)) {
        outColor = calculateColorRGB(squareHumidity, 1, cloudRainThresh, c_cloudMinRGB, c_cloudMidRGB);
        opacity = (squareHumidity - 1) / (cloudRainThresh - 1);
    } else {
        outColor = calculateColorRGB(squareHumidity, cloudRainThresh, cloudRainMax, c_cloudMidRGB, c_cloudMaxRGB);
        opacity = 1;
    }
    outColor.a = opacity * 0.7;
    return outColor;
}

let frameCloudSum = {r: 0, g: 0, b: 0};;
let frameCloudSumCount = 1;

export function getFrameRelCloud() {
    return {
        r: frameCloudSum.r / frameCloudSumCount,
        g: frameCloudSum.g / frameCloudSumCount,
        b: frameCloudSum.b / frameCloudSumCount
    }
}

function renderClouds() {
    frameCloudSum = {r: 0, g: 0, b: 0};
    frameCloudSumCount = 1;
    let frameLighting = getDefaultLighting();

    for (let i = 0; i < getWindSquaresX(); i++) {
        for (let j = 0; j < getWindSquaresY(); j++) {
            let x = i;
            let y = j;

            if (isWindSquareBlocked(i, j)) {
                if (!isWindSquareBlocked(i, j + 1) && getHumidity(i, j + 1) > 1) {
                    let adj = getWindSquareAbove(i * 4, j * 4);
                    x = adj[0];
                    y = adj[1];
                }
            }

            let cloudColorRGBA = getCloudColorAtPos(x, y);

            frameCloudSum.r += cloudColorRGBA.r * cloudColorRGBA.a;
            frameCloudSum.g += cloudColorRGBA.g * cloudColorRGBA.a;
            frameCloudSum.b += cloudColorRGBA.b * cloudColorRGBA.a;
            frameCloudSumCount += 1;


            MAIN_CONTEXT.fillStyle = rgbToRgba(
                cloudColorRGBA.r * (frameLighting.r / 255), 
                cloudColorRGBA.g * (frameLighting.g / 255), 
                cloudColorRGBA.b * (frameLighting.b / 255), 
                cloudColorRGBA.a);
            zoomCanvasFillRect(
                4 * i * getBaseSize(),
                4 * j * getBaseSize(),
                4 * getBaseSize(),
                4 * getBaseSize()
            );
        }
    }

}

function tickMaps() {
    tickMap(temperatureMap, temperatureDiffFunction, updateWindSquareTemperature);
    tickMap(waterSaturationMap, humidityDiffFunction, (x, y, v) => {
        if (v < 0) {
            console.warn("V is less than zero in tickMap!");
        }
        waterSaturationMap[x][y] = v;
    });
    doRain();
}

export function getHumidity(x, y) {
    if (waterSaturationMap == null) {
        return 0;
    }
    return waterSaturationMap[x][y] / saturationPressureOfWaterVapor(temperatureMap[x][y]) / getWindPressureSquareDensity(x, y);
}

export function getWaterSaturation(x, y) {
    return waterSaturationMap[x][y];
}
export function setWaterSaturation(x, y, v) {
    waterSaturationMap[x][y] = v;
}

function calculateColorTemperature(val) {
    let colorMin, colorMax, min, max;
    val -= 273;
    if (val < 20) {
        min = 0;
        max = 20;
        colorMin = RGB_COLOR_BLACK;
        colorMax = RGB_COLOR_BLUE;
    }
    else if (val < 40) {
        min = 20;
        max = 40;
        colorMin = RGB_COLOR_BLACK;
        colorMax = RGB_COLOR_GREEN;
    } else {
        min = 40;
        max = 60;
        colorMin = RGB_COLOR_BLACK;
        colorMax = RGB_COLOR_RED;
    }
    return calculateColor(val, min, max, colorMin, colorMax);
}

export function calculateColorRGB(val, valMin, valMax, colorMin, colorMax) {
    val -= valMin;
    valMax -= valMin;
    valMin = 0;
    let normalized = (val - valMin) / (valMax - valMin);
    return {
        r: Math.round(colorMax.r * normalized + colorMin.r * (1 - normalized)),
        g: Math.round(colorMax.g * normalized + colorMin.g * (1 - normalized)),
        b: Math.round(colorMax.b * normalized + colorMin.b * (1 - normalized))
    }
}

function calculateColor(val, valMin, valMax, colorMin, colorMax) {
    val = Math.min(val, valMax);
    let normalized = (val - valMin) / (valMax - valMin);
    return rgbToRgba(
        Math.floor(colorMax.r * normalized + colorMin.r * (1 - normalized)),
        Math.floor(colorMax.g * normalized + colorMin.g * (1 - normalized)),
        Math.floor(colorMax.b * normalized + colorMin.b * (1 - normalized)),
        cloudMaxOpacity
    );
}

function calculateColorProvideOpacity(val, valMin, valMax, colorMin, colorMax, opacity) {
    val = Math.min(val, valMax);
    let normalized = (val - valMin) / (valMax - valMin);
    return rgbToRgba(
        Math.floor(colorMax.r * normalized + colorMin.r * (1 - normalized)),
        Math.floor(colorMax.g * normalized + colorMin.g * (1 - normalized)),
        Math.floor(colorMax.b * normalized + colorMin.b * (1 - normalized)),
        opacity
    );
}

function renderTemperature() {
    for (let i = 0; i < getWindSquaresX(); i++) {
        for (let j = 0; j < getWindSquaresY(); j++) {
            MAIN_CONTEXT.fillStyle = calculateColorTemperature(temperatureMap[i][j]);
            zoomCanvasFillRect(
                4 * i * getBaseSize(),
                4 * j * getBaseSize(),
                4 * getBaseSize(),
                4 * getBaseSize()
            );
        }
    }
}

function renderWaterSaturation() {
    for (let i = 0; i < getWindSquaresX(); i++) {
        for (let j = 0; j < getWindSquaresY(); j++) {
            if (getPressure(i, j) <= 0) {
                continue;
            }
            MAIN_CONTEXT.fillStyle = calculateColor(getHumidity(i, j), 1, 1.1, c_waterSaturationLowRGB, c_waterSaturationHighRGB);
            zoomCanvasFillRect(
                4 * i * getBaseSize(),
                4 * j * getBaseSize(),
                4 * getBaseSize(),
                4 * getBaseSize()
            );
        }
    }
}

function getMapDirectNeighbors(x, y) {
    return [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1]
    ]
}



function doFunctionOnRealSquares(x, y, func) {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            getSquares(x * 4 + i, y * 4 + j).forEach(func);
        }
    }
}

function addTemperature(x, y, delta) {
    x = Math.floor(x / 4);
    y = Math.floor(y / 4);

    if (!isPointInWindBounds(x, y)) {
        return;
    }
    doFunctionOnRealSquares(x, y, (sq) => {
        if (sq.collision) {
            sq.temperature = Math.min(273 + 100, Math.max(10, sq.temperature + delta * 10));
        }
    });
    return;

    // wind square portion, this needs to get fractured into two methods
    let startTemp = temperatureMap[x][y];
    updateWindSquareTemperature(x, y, Math.max(temperatureMap[x][y] + delta, 0.1));
    let endTemp = temperatureMap[x][y];
    if (startTemp != endTemp) {
        let mult = (endTemp - startTemp) / 273;
        updateWindPressureByMult(x, y, (1 + mult));
    }
}

function addWaterSaturationPascalsSqCoords(x, y, pascals) {
    x = Math.floor(x / 4);
    y = Math.floor(y / 4);

    if (!isPointInWindBounds(x, y)) {
        return;
    }
    addWaterSaturationPascals(x, y, pascals);
}

function addWaterSaturationPascals(x, y, pascals) {
    let end = waterSaturationMap[x][y] + pascals;
    end = Math.max(10, end);
    waterSaturationMap[x][y] = end;
}

function addWaterSaturation(x, y) {
    _addWaterSaturation(x, y);
    getMapDirectNeighbors(x, y).forEach((loc) => _addWaterSaturation(loc[0], loc[1]));
}

function _addWaterSaturation(x, y) {
    x = (Math.floor(x) + getWindSquaresX()) % getWindSquaresX();
    y = (Math.floor(y) + getWindSquaresY()) % getWindSquaresY();
    waterSaturationMap[x][y] += 0.10 * saturationPressureOfWaterVapor(temperatureMap[x][y]);
    waterSaturationMap[x][y] = Math.min(waterSaturationMap[x][y], 10);
}


export { calculateColorProvideOpacity, pascalsPerWaterSquare, cloudRainThresh, calculateColor, calculateColorTemperature, addWaterSaturationPascals, addWaterSaturationPascalsSqCoords, saturationPressureOfWaterVapor, updateWindSquareTemperature, renderTemperature, renderWaterSaturation, tickMaps, addTemperature, addWaterSaturation, renderClouds }