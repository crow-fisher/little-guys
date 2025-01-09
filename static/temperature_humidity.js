import { hexToRgb, randNumber, rgbToRgba } from "./common.js";
import { addSquare } from "./squares/_sqOperations.js";
import { MAIN_CONTEXT, CANVAS_SQUARES_X, CANVAS_SQUARES_Y, BASE_SIZE } from "./index.js";
import { addSquareByName } from "./index.js";
import { base_wind_pressure, getAirSquareDensity, getPressure, initializeWindPressureMap, updateWindPressureByMult } from "./wind.js";
import { getCurTime, getPrevTime, getTimeSpeedMult } from "./time.js";

var temperatureMap;
var waterSaturationMap;

var curSquaresX = 0;
var curSquaresY = 0;

var clickAddTemperature = 1;
var start_temperature = 273;

var air_thermalConductivity = 0.024; // watts per meter kelvin
var air_specificHeat = 1.005; // joules per gram degrees c 
var air_atomicWeight = 28.96;
var waterVapor_specificHeat = 1.9;  // ...

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
implies pressure of 875 / 44.64 = 19.6 atm or 1.986 * 10 ** 6 pascals
*/
var pascalsPerWaterSquare = 1.986 * 10 ** 6;
// https://www.engineeringtoolbox.com/water-vapor-saturation-pressure-air-d_689.html


function saturationPressureOfWaterVapor(t) {
    return Math.E ** (77.345 + 0.0057 * t - 7235 / t) / (t ** 8.2);
}

function getTemperatureAtWindSquare(x, y) {
    if (temperatureMap ==  null) {
        init();
    }
    return temperatureMap[x][y];
}


function getTemperatureAtSquare(x, y) {
    x /= 4;
    y /= 4;

    x = Math.floor(x);
    y = Math.floor(y);

    if (x < 0 || x >= curSquaresX || y < 0 || y >= curSquaresY) {
        return 273 + 30;
    }

    return temperatureMap[x][y];
}

function applyTemperatureDelta(x, y, val) {
    x /= 4;
    y /= 4;

    x = Math.floor(x);
    y = Math.floor(y);

    if (x < 0 || x >= curSquaresX || y < 0 || y >= curSquaresY) {
        return;
    }
    temperatureMap[x][y] += val;
}

function init() {
    temperatureMap = new Map();
    waterSaturationMap = new Map();
    curSquaresX = Math.ceil(CANVAS_SQUARES_X / 4)
    curSquaresY = Math.ceil(CANVAS_SQUARES_Y / 4)

    var start_watersaturation = saturationPressureOfWaterVapor(start_temperature) * cloudMaxHumidity * cloudRainThresh;

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
    if (temperatureMap == null) {
        init();
    }
    if (isNaN(newVal) || !isFinite(newVal) || newVal < 0) {
        console.warn("Trying to set invalid temperature ", newVal);
        newVal = 10;
    }
    temperatureMap[x][y] = newVal;
}

function temperatureDiffFunction(x, y, high, low) {
    if (getPressure(x, y) < 0) {
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
    var air_molesMult = getAirSquareDensity(x, y);

    if (air_molesMult > 2 || air_molesMult < 0.125) {
        console.warn("Something fucky");
        return 0;
    }

    var air_molesTotal = air_molesMult * 44.64;
    var air_grams = air_molesTotal * air_atomicWeight;
    
    var air_joules_per_degree = air_grams / air_specificHeat;
    var air_degrees = joules_transferredEnergy / air_joules_per_degree;

    return air_degrees * getTimeSpeedMult();

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
            [getMapDirectNeighbors, getMapIndirectNeighbors].forEach((f) => 
                f(x, y)
                    .filter((loc) => isPointInBounds(loc[0], loc[1]))
                    .forEach((loc) => {
                    var x2 = loc[0];
                    var y2 = loc[1];
                    if (x2 < 0 || x2 >= curSquaresX || y2 < 0 || y2 >= curSquaresY) {
                        return;
                    }
                    if (map[x2][y2] >= map[x][y]) {
                        return;
                    }
                    var diff = diff_function(x, y, map[x][y], map[x2][y2]);
                    update_function(x, y, map[x][y] - diff);
                    update_function(x2, y2, map[x2][y2] + diff);
                }));
        }
    }
}

function doRain() {
    var xKeys = Array.from(Object.keys(waterSaturationMap));
    for (let i = 0; i < xKeys.length; i++) {
        var yKeys = Array.from(Object.keys(waterSaturationMap[xKeys[i]]));
        for (let j = 0; j < yKeys.length; j++) {
            var x = parseInt(xKeys[i]);
            var y = parseInt(yKeys[j]);
            var adjacentHumidity = getHumidity(x, y) + getMapDirectNeighbors(x, y)
                .filter((loc) => loc[0] >= 0 && loc[0] < curSquaresX && loc[1] >= 0 && loc[1] < curSquaresY)
                .map((loc) => getHumidity(loc[0], loc[1]))
                .reduce(
                    (accumulator, currentValue) => accumulator + currentValue,
                    0,
                );

            var adjacentWaterPascals = waterSaturationMap[x][y] + getMapDirectNeighbors(x, y)
                .filter((loc) => loc[0] >= 0 && loc[0] < curSquaresX && loc[1] >= 0 && loc[1] < curSquaresY)
                .map((loc) => waterSaturationMap[loc[0]][loc[1]])
                .filter((val) => val > (pascalsPerWaterSquare / 5))
                .reduce(
                    (accumulator, currentValue) => accumulator + currentValue,
                    0,
                ) * 0.8;

            if (adjacentHumidity > (cloudMaxHumidity * 5 * cloudRainThresh) && adjacentWaterPascals > pascalsPerWaterSquare) {
                var probability = adjacentHumidity / (cloudMaxHumidity * 5 * cloudRainMax);
                var usedWaterPascalsPerSquare = pascalsPerWaterSquare / 5;

                if (Math.random() < probability && Math.random() > 0.99) {
                    var sq = addSquareByName(x * 4 + randNumber(0, 3), y * 4 + randNumber(0, 3), "water");
                    if (sq) {
                        sq.blockHealth = 0.05;
                        waterSaturationMap[x][y] -= usedWaterPascalsPerSquare;
                        getMapDirectNeighbors(x, y)
                        .filter((loc) => loc[0] >= 0 && loc[0] < curSquaresX && loc[1] >= 0 && loc[1] < curSquaresY)
                        .map((loc) =>  waterSaturationMap[loc[0]][loc[1]] -= usedWaterPascalsPerSquare);
                    }
                }
            }
        }
    }
}

function renderClouds() {
    for (let i = 0; i < curSquaresX; i++) {
        for (let j = 0; j < curSquaresY; j++) {
            var squareHumidity = getHumidity(i, j);
            if (squareHumidity < 1) {
                continue;
            }
            if (squareHumidity < (cloudMaxHumidity * cloudRainThresh) ) {
                MAIN_CONTEXT.fillStyle = calculateColorOpacity(squareHumidity, 0, cloudMaxHumidity * cloudRainThresh, c_cloudMinRGB, c_cloudMidRGB);
            } else {
                MAIN_CONTEXT.fillStyle = calculateColor(squareHumidity, cloudMaxHumidity * cloudRainThresh, cloudMaxHumidity * cloudRainMax, c_cloudMidRGB, c_cloudMaxRGB);
            }
            MAIN_CONTEXT.fillRect(
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
    tickMap(waterSaturationMap, (x, y, a, b) => (a - b) / 2, (x, y, v) => waterSaturationMap[x][y] = v);
    doRain();
}

function getHumidity(x, y) {
    return waterSaturationMap[x][y] / saturationPressureOfWaterVapor(temperatureMap[x][y]);
}

function getWaterSaturation(x, y) {
    if (waterSaturationMap == null) {
        init();
    }
    return waterSaturationMap[x][y];
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

function renderTemperature() {
    for (let i = 0; i < curSquaresX; i++) {
        for (let j = 0; j < curSquaresY; j++) {
            MAIN_CONTEXT.fillStyle = calculateColor(temperatureMap[i][j], 273, 273 + 30, c_tempLowRGB, c_tempHighRGB);
            MAIN_CONTEXT.fillRect(
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
            MAIN_CONTEXT.fillStyle = calculateColor(getHumidity(i, j), cloudMaxHumidity * 0, cloudMaxHumidity * 4, c_waterSaturationLowRGB, c_waterSaturationHighRGB);
            MAIN_CONTEXT.fillRect(
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

function getMapIndirectNeighbors(x, y) {
    return [
        [x - 1, y - 1],
        [x + 1, y - 1],
        [x + 1, y - 1],
        [x + 1, y + 1]
    ]
}

function isPointInBounds(x, y) {
    return x >= 0 && x < curSquaresX && y >= 0 && y < curSquaresY; 
}


function addTemperature(x, y, delta) {
    x  = Math.floor(x / 4);
    y  = Math.floor(y / 4);

    if (!isPointInBounds(x, y)) {
        return;
    }

    var startTemp = temperatureMap[x][y];
    updateSquareTemperature(x, y, temperatureMap[x][y] + delta);
    var endTemp = temperatureMap[x][y];
    if (startTemp != endTemp) {
        var mult = (endTemp - startTemp) / 273; 
        updateWindPressureByMult(x, y, (1 + mult));
    }
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

 
export { getWaterSaturation, getTemperatureAtWindSquare, updateSquareTemperature, applyTemperatureDelta, renderTemperature, renderWaterSaturation, tickMaps, addTemperature, addWaterSaturation, renderClouds, getTemperatureAtSquare }