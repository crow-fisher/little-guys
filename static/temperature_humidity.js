import { hexToRgb, randNumber, rgbToRgba } from "./common.js";
import { addSquare, getSquares } from "./squares/_sqOperations.js";
import { MAIN_CONTEXT, CANVAS_SQUARES_X, CANVAS_SQUARES_Y, BASE_SIZE, zoomCanvasFillRect } from "./index.js";
import { addSquareByName } from "./index.js";
import { base_wind_pressure, getAirSquareDensity, getPressure, initializeWindPressureMap, updateWindPressureByMult, getAirSquareDensityTempAndHumidity, setPressurebyMult } from "./wind.js";
import { getCurTime, getPrevTime } from "./time.js";

var temperatureMap;
var waterSaturationMap;

export function setTemperatureMap(inMap) {
    temperatureMap = inMap;
}
export function setWaterSaturationMap(inMap) {
    waterSaturationMap = inMap;
}
export function getTemperatureMap() {
    return temperatureMap;
}
export function getWaterSaturationMap() {
    return waterSaturationMap;
}

var curSquaresX = 0;
var curSquaresY = 0;

var start_temperature = 273 + 20;

var air_thermalConductivity = 0.024; // watts per meter kelvin
var air_specificHeat = 1.005; // joules per gram degrees c 
var air_atomicWeight = 28.96;
var waterVapor_specificHeat = 1.9;  // ...
var startHumidity = 0.5;

var c_tempLowRGB = hexToRgb("#1dbde6");
var c_tempHighRGB = hexToRgb("#f1515e");

var c_waterSaturationLowRGB = hexToRgb("#9bafd9");
var c_waterSaturationHighRGB = hexToRgb("#103783");

var c_cloudMinRGB = hexToRgb("#f1f0f6");
var c_cloudMidRGB = hexToRgb("#dbdce1")
var c_cloudMaxRGB = hexToRgb("#818398");

var cloudMaxHumidity = 4;
var cloudRainThresh = 2;
var cloudRainMax = 8;
var cloudMaxOpacity = 0.65;


/*
1 meter water 
55345 moles of water in 1 meter cubed
44.64 mols per liter at 1 atm
55345 / 64 = 875 moles per meter cubed gas
times 4 cubed, because one air square is 4*4*4 normal squares
*/
var pascalsPerWaterSquare = (1.986 * 10 ** 6);
// https://www.engineeringtoolbox.com/water-vapor-saturation-pressure-air-d_689.html


function saturationPressureOfWaterVapor(t) {
    return Math.E ** (77.345 + 0.0057 * t - 7235 / t) / (t ** 8.2);
}

function getTemperatureAtWindSquare(x, y) {
    if (temperatureMap == null) {
        init();
    }
    return temperatureMap[x][y];
}


function getTemperatureAtSquare(x, y) {
    x /= 4;
    y /= 4;

    x = Math.floor(x);
    y = Math.floor(y);

    if (!isPointInBounds(x, y)) {
        return 273;
    }

    return temperatureMap[x][y];
}

function applySquareTemperatureDelta(x, y, val) {
    x /= 4;
    y /= 4;

    x = Math.floor(x);
    y = Math.floor(y);

    if (!isPointInBounds(x, y)) {
        return 0;
    }
    updateSquareTemperature(x, y, temperatureMap[x][y] + val)
}

function init() {
    temperatureMap = new Map();
    waterSaturationMap = new Map();
    curSquaresX = Math.ceil(CANVAS_SQUARES_X / 4)
    curSquaresY = Math.ceil(CANVAS_SQUARES_Y / 4)

    var start_watersaturation = saturationPressureOfWaterVapor(start_temperature) * startHumidity;

    for (let i = 0; i < curSquaresX; i++) {
        for (let j = 0; j < curSquaresY; j++) {
            if (!(i in temperatureMap)) {
                temperatureMap[i] = new Map();
                waterSaturationMap[i] = new Map();
            }
            temperatureMap[i][j] = start_temperature;
            waterSaturationMap[i][j] = start_watersaturation;
        }
    }
}

function updateSquareTemperature(x, y, newVal) {
    if (getPressure(x, y) < 0) {
        return;
    }
    if (temperatureMap == null) {
        init();
    }
    if (isNaN(newVal) || !isFinite(newVal)) {
        console.warn("Trying to set invalid temperature ", newVal);
        newVal = 273;
    }
    newVal = Math.max(newVal, 10);
    newVal = Math.min(newVal, start_temperature * 2);
    var start = temperatureMap[x][y];
    temperatureMap[x][y] = newVal;
    var end = temperatureMap[x][y];
    setPressurebyMult(x, y, (end / start));
}

function temperatureDiffFunction(x, y, x2, y2, high, low) {
    if (getPressure(x, y) < 0) {
        return 0;
    }
    if (getPressure(x2, y2) < 0) {
        return 0;
    }

    /* 
    'high' and 'low' are temperature values of adjacent 4x4 cubes of air 
    
    air_specificHeat = 

    getPressure returns pascals for 64 meter cubed

    44.64 moles per 1 atm 
    
    get our fraction of our air pressure against 1 atm
    */

    var watts_transferRate = (high - low) * air_thermalConductivity;
    // total watts transferred by air component
    var joules_transferredEnergy = watts_transferRate * ((getCurTime() - getPrevTime()) / 1000);
    var air_molesMult = getAirSquareDensityTempAndHumidity(x, y);

    var air_molesTotal = air_molesMult * 44.64;
    var air_grams = air_molesTotal * air_atomicWeight;

    var air_joules_per_degree = air_grams / air_specificHeat;
    var air_degrees = joules_transferredEnergy / air_joules_per_degree;

    air_degrees *= 100;

    return air_degrees;
}

function humidityDiffFunction(x, y, x2, y2, high, low) {
    var humidity1 = getHumidity(x, y); // 0.2
    var humidity2 = getHumidity(x2, y2); // 0.8

    var humidityDiff = humidity1 - humidity2; // 0.2 - 0.8 = -0.6;

    var square1PascalsForHumidityDiff = saturationPressureOfWaterVapor(temperatureMap[x][y]) * Math.abs(humidityDiff / 2);
    var square2PascalsForHumidityDiff = saturationPressureOfWaterVapor(temperatureMap[x2][y2]) * Math.abs(humidityDiff / 2);

    var minPascalsForHumidityDiff = Math.min(square1PascalsForHumidityDiff, square2PascalsForHumidityDiff)

    minPascalsForHumidityDiff *= 0.001;

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
    var xKeys = Array.from(Object.keys(map));
    for (let i = 0; i < xKeys.length; i++) {
        var yKeys = Array.from(Object.keys(map[xKeys[i]]));
        for (let j = 0; j < yKeys.length; j++) {
            var x = parseInt(xKeys[i]);
            var y = parseInt(yKeys[j]);
            if (getPressure(x, y) < 0) {
                continue;
            }
            [getMapDirectNeighbors].forEach((f) =>
                f(x, y)
                    .filter((loc) => isPointInBounds(loc[0], loc[1]))
                    .filter((loc) => getPressure(loc[0], loc[1]) > 0)
                    .forEach((loc) => {
                        var x2 = loc[0];
                        var y2 = loc[1];
                        var diff = diff_function(x, y, x2, y2, map[x][y], map[x2][y2]);

                        if (y == y2) {
                            update_function(x, y, map[x][y] - diff);
                            update_function(x2, y2, map[x2][y2] + diff);
                            return;
                        }

                        var side = 1;
                        if (y2 < y) {
                            side *= -1;
                        }
                        if (diff < 0) {
                            side *= -1;
                        }

                        var vertMult = 5;

                        if (side == 1) {
                            diff /= vertMult;
                        } else {
                            diff *= vertMult;
                        }

                        update_function(x, y, map[x][y] - diff);
                        update_function(x2, y2, map[x2][y2] + diff);

                        // if positive, heat rising
                        // if negative, cold falling

                        // do the transform here to make sure that's what you're doing
                    }));
        }
    }
}

function canSquareRain(x, y, minPascals) {
    return (waterSaturationMap[x][y] > minPascals) ? 1 : 0;
}

function doRain() {
    for (let x = 0; x < curSquaresX; x++) {
        for (let y = 0; y < curSquaresY; y++) {
            var adjacentHumidity = getHumidity(x, y) + getMapDirectNeighbors(x, y)
                .filter((loc) => loc[0] >= 0 && loc[0] < curSquaresX && loc[1] >= 0 && loc[1] < curSquaresY)
                .map((loc) => getHumidity(loc[0], loc[1]))
                .reduce(
                    (accumulator, currentValue) => accumulator + currentValue,
                    0,
                );

            if (adjacentHumidity < (5 * cloudRainThresh))
                continue;

            var rainDropHealth = 0.05;
            var rainDropPascals = pascalsPerWaterSquare * rainDropHealth;
            var usedWaterPascalsPerSquare = rainDropPascals / 5;

            var adjacentWaterPascals = waterSaturationMap[x][y] + getMapDirectNeighbors(x, y)
                .filter((loc) => loc[0] >= 0 && loc[0] < curSquaresX && loc[1] >= 0 && loc[1] < curSquaresY)
                .map((loc) => waterSaturationMap[loc[0]][loc[1]])
                .reduce(
                    (accumulator, currentValue) => accumulator + currentValue,
                    0,
                );

            if (adjacentWaterPascals < rainDropPascals)
                continue;

            var adjacentSquaresWithEnoughWater = canSquareRain(x, y, rainDropPascals) + getMapDirectNeighbors(x, y)
                .filter((loc) => loc[0] >= 0 && loc[0] < curSquaresX && loc[1] >= 0 && loc[1] < curSquaresY)
                .map((loc) => canSquareRain(loc[0], loc[1], rainDropPascals))
                .reduce(
                    (accumulator, currentValue) => accumulator + currentValue,
                    0,
                );

            if (adjacentSquaresWithEnoughWater < 5)
                continue;

            if (Math.random() > 0.90) {
                var sq = addSquareByName(x * 4 + randNumber(0, 3), y * 4 + randNumber(0, 3), "water");
                if (sq) {
                    sq.blockHealth = rainDropHealth;
                    sq.temperature = temperatureMap[x][y];
                    waterSaturationMap[x][y] -= usedWaterPascalsPerSquare;
                    getMapDirectNeighbors(x, y)
                        .filter((loc) => loc[0] >= 0 && loc[0] < curSquaresX && loc[1] >= 0 && loc[1] < curSquaresY)
                        .forEach((loc) => waterSaturationMap[loc[0]][loc[1]] -= usedWaterPascalsPerSquare);
                }
            }
        }
    }
}

function renderClouds() {
    for (let i = 0; i < curSquaresX; i++) {
        for (let j = 0; j < curSquaresY; j++) {
            if (getPressure(i, j) < 0) {
                continue;
            }
            var squareHumidity = getHumidity(i, j);
            if (squareHumidity < 10) {
                continue;
            }
            if (squareHumidity < (cloudMaxHumidity * cloudRainThresh)) {
                MAIN_CONTEXT.fillStyle = calculateColorOpacity(squareHumidity, 0, cloudMaxHumidity * cloudRainThresh, c_cloudMinRGB, c_cloudMidRGB);
            } else {
                MAIN_CONTEXT.fillStyle = calculateColor(squareHumidity, cloudMaxHumidity * cloudRainThresh, cloudMaxHumidity * cloudRainMax * 4, c_cloudMidRGB, c_cloudMaxRGB);
            }
            zoomCanvasFillRect(
                4 * i * BASE_SIZE,
                4 * j * BASE_SIZE,
                4 * BASE_SIZE,
                4 * BASE_SIZE
            );
        }
    }

}

function tickMaps() {
    if (temperatureMap == null || waterSaturationMap == null) {
        init();
    }
    tickMap(temperatureMap, temperatureDiffFunction, updateSquareTemperature);
    tickMap(waterSaturationMap, humidityDiffFunction, (x, y, v) => {
        if (v < 0) {
            console.warn("V is less than zero in tickMap!");
        }
        waterSaturationMap[x][y] = v;
    });
    doRain();
}

function getHumidity(x, y) {
    return waterSaturationMap[x][y] / saturationPressureOfWaterVapor(temperatureMap[x][y]);
}

function getWaterSaturation(x, y) {
    if (waterSaturationMap == null) {
        init();
    }
    var ret = waterSaturationMap[x][y];
    if (ret < 0) {
        console.warn("Tried to return water saturation below zero: ", ret, x, y);
        resetTemperatureAndHumidityAtSquare(x, y);
    }
    return waterSaturationMap[x][y];
}

function calculateColorTemperature(val) {
    return calculateColor(val, 273, 273 + 100, c_tempLowRGB, c_tempHighRGB);
}


function calculateColor(val, valMin, valMax, colorMin, colorMax) {
    val = Math.min(val, valMax);
    var normalized = (val - valMin) / (valMax - valMin);
    return rgbToRgba(
        Math.floor(colorMax.r * normalized + colorMin.r * (1 - normalized)),
        Math.floor(colorMax.g * normalized + colorMin.g * (1 - normalized)),
        Math.floor(colorMax.b * normalized + colorMin.b * (1 - normalized)),
        cloudMaxOpacity
    );
}

function calculateColorOpacity(val, valMin, valMax, colorMin, colorMax) {
    var normalized = Math.max(Math.min(1, (val - valMin) / (valMax - valMin)), 0);
    return rgbToRgba(
        Math.floor(colorMax.r * normalized + colorMin.r * (1 - normalized)),
        Math.floor(colorMax.g * normalized + colorMin.g * (1 - normalized)),
        Math.floor(colorMax.b * normalized + colorMin.b * (1 - normalized)),
        normalized * cloudMaxOpacity
    );
}

function calculateColorProvideOpacity(val, valMin, valMax, colorMin, colorMax, opacity) {
    val = Math.min(val, valMax);
    var normalized = (val - valMin) / (valMax - valMin);
    return rgbToRgba(
        Math.floor(colorMax.r * normalized + colorMin.r * (1 - normalized)),
        Math.floor(colorMax.g * normalized + colorMin.g * (1 - normalized)),
        Math.floor(colorMax.b * normalized + colorMin.b * (1 - normalized)),
        opacity
    );
}

function renderTemperature() {
    for (let i = 0; i < curSquaresX; i++) {
        for (let j = 0; j < curSquaresY; j++) {
            MAIN_CONTEXT.fillStyle = calculateColorTemperature(temperatureMap[i][j]);
            zoomCanvasFillRect(
                4 * i * BASE_SIZE,
                4 * j * BASE_SIZE,
                4 * BASE_SIZE,
                4 * BASE_SIZE
            );
        }
    }
}

function renderWaterSaturation() {
    for (let i = 0; i < curSquaresX; i++) {
        for (let j = 0; j < curSquaresY; j++) {
            if (getPressure(i, j) <= 0) {
                continue;
            }
            MAIN_CONTEXT.fillStyle = calculateColor(getHumidity(i, j), 0, 2, c_waterSaturationLowRGB, c_waterSaturationHighRGB);
            zoomCanvasFillRect(
                4 * i * BASE_SIZE,
                4 * j * BASE_SIZE,
                4 * BASE_SIZE,
                4 * BASE_SIZE
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

function isPointInBounds(x, y) {
    return x >= 0 && x < curSquaresX && y >= 0 && y < curSquaresY;
}

function resetTemperatureAndHumidityAtSquare(x, y) {
    temperatureMap[x][y] = start_temperature;
    waterSaturationMap[x][y] = 0;
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

    if (!isPointInBounds(x, y)) {
        return;
    }

    var startTemp = temperatureMap[x][y];
    updateSquareTemperature(x, y, Math.max(temperatureMap[x][y] + delta, 0.1));
    var endTemp = temperatureMap[x][y];

    doFunctionOnRealSquares(x, y, (sq) => {
        if (sq.collision) {
            sq.temperature = Math.max(10, sq.temperature + delta);
        }
    });

    if (startTemp != endTemp) {
        var mult = (endTemp - startTemp) / 273;
        updateWindPressureByMult(x, y, (1 + mult));
    }
}

function addWaterSaturationPascalsSqCoords(x, y, pascals) {
    x = Math.floor(x / 4);
    y = Math.floor(y / 4);

    if (!isPointInBounds(x, y)) {
        return;
    }
    addWaterSaturationPascals(x, y, pascals);

    doFunctionOnRealSquares(x, y, (sq) => (sq.collision) ? sq.waterPressure += 0.01 : null);

}

function addWaterSaturationPascals(x, y, pascals) {
    var end = waterSaturationMap[x][y] + pascals;
    end = Math.max(0, end);
    waterSaturationMap[x][y] = end;
}

function addWaterSaturation(x, y) {
    _addWaterSaturation(x, y);
    getMapDirectNeighbors(x, y).forEach((loc) => _addWaterSaturation(loc[0], loc[1]));
}

function _addWaterSaturation(x, y) {
    x = (Math.floor(x) + curSquaresX) % curSquaresX;
    y = (Math.floor(y) + curSquaresY) % curSquaresY;
    waterSaturationMap[x][y] += 0.10 * saturationPressureOfWaterVapor(temperatureMap[x][y]);
}


export { calculateColorProvideOpacity, pascalsPerWaterSquare, cloudRainThresh, calculateColor, calculateColorTemperature, addWaterSaturationPascals, addWaterSaturationPascalsSqCoords, saturationPressureOfWaterVapor, resetTemperatureAndHumidityAtSquare, getWaterSaturation, getTemperatureAtWindSquare, updateSquareTemperature, applySquareTemperatureDelta, renderTemperature, renderWaterSaturation, tickMaps, addTemperature, addWaterSaturation, renderClouds, getTemperatureAtSquare }