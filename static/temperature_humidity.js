import { hexToRgb, randNumber, randRange, rgbToHex, rgbToRgba } from "./common.js";
import { addSquare, getDirectNeighbors, getSquares } from "./squares/_sqOperations.js";
import { MAIN_CONTEXT, CANVAS_SQUARES_X, CANVAS_SQUARES_Y, BASE_SIZE } from "./index.js";
import { getCurTime } from "./time.js";
import { COLOR_BLUE, COLOR_BROWN, COLOR_GREEN, COLOR_RED } from "./colors.js";
import { WaterSquare } from "./squares/WaterSquare.js";

var temperatureMap;
var waterSaturationMap;

var temperatureFlowStrength = 0.5;

var curSquaresX = 0;
var curSquaresY = 0;

var clickAddTemperature = 1;
var start_temperature = 273 + 20;

var c_tempLowRGB = hexToRgb("#1dbde6");
var c_tempHighRGB = hexToRgb("#f1515e");

var c_waterSaturationLowRGB = hexToRgb("#9bafd9");
var c_waterSaturationHighRGB = hexToRgb("#103783");

// https://www.engineeringtoolbox.com/water-vapor-saturation-pressure-air-d_689.html


function saturationPressureOfWaterVapor(t) {
    return Math.E ** (77.345 + 0.057 * t - 7235 / t) / (t ** 8.2);
}

function getHumidityAtSquare(x, y) {
    return waterSaturationMap[x][y] / saturationPressureOfWaterVapor(temperatureMap[x][y]);

}

function setSquareWaterContainmentToHumidityMult(x, y, m) {
    waterSaturationMap[x][y] = saturationPressureOfWaterVapor(temperatureMap[x][y]) * m;
}

function checkIfCollisionAtSquare(x, y) {
    var every = true;
    var someSquareFound = false;
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            var ar = getSquares(x * 4 + i, y * 4 + j);
            if (ar.length > 0) {
                someSquareFound = true;
                every = every && ar.some((sq) => (!sq.surface) && sq.collision && sq.solid);
            } else {
                every = false;
            }
        }
    }
    if (someSquareFound) {
        return every;
    }
    return false;
}


function init() {
    temperatureMap = new Map();
    waterSaturationMap = new Map();
    curSquaresX = Math.ceil(CANVAS_SQUARES_X / 4)
    curSquaresY = Math.ceil(CANVAS_SQUARES_Y / 4)

    var start_watersaturation = saturationPressureOfWaterVapor(start_temperature) * 0.75;

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

function tickMap(
    map,
    diff_function
) {
    var xKeys = Array.from(Object.keys(map));
    for (let i = 0; i < xKeys.length; i++) {
        var yKeys = Array.from(Object.keys(map[xKeys[i]]));
        for (let j = 0; j < yKeys.length; j++) {
            var x = parseInt(xKeys[i]);
            var y = parseInt(yKeys[j]);
            var sqVal = map[x][y];
            [getMapDirectNeighbors, getMapIndirectNeighbors].forEach((f) => 
                f(x, y).forEach((loc) => {
                    var x2 = loc[0];
                    var y2 = loc[1];
                    if (x2 < 0 || x2 >= curSquaresX || y2 < 0 || y2 >= curSquaresY) {
                        return;
                    }
                    var compVal = map[x2][y2];

                    if (compVal >= sqVal) {
                        return;
                    }
                    var diff = diff_function(sqVal, compVal);
                    map[x][y] -= diff;
                    map[x2][y2] += diff;
                    sqVal = map[x][y];
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
            var adjacentWaterSaturation = getHumidityAtSquare(x, y) + getMapDirectNeighbors(x, y)
                .filter((loc) => loc[0] >= 0 && loc[0] < curSquaresX && loc[1] >= 0 && loc[1] < curSquaresY)
                .map((loc) => getHumidityAtSquare(loc[0], loc[1]))
                .reduce(
                    (accumulator, currentValue) => accumulator + currentValue,
                    0,
                );

            if (adjacentWaterSaturation > 32) {
                var sq = addSquare(new WaterSquare(x * 4 + randNumber(0, 3), y * 4 + randNumber(0, 3)));
                if (sq) {
                    sq.blockHealth = 0.05;
                    setSquareWaterContainmentToHumidityMult(x, y, 0.75);
                    getMapDirectNeighbors(x, y)
                    .filter((loc) => loc[0] >= 0 && loc[0] < curSquaresX && loc[1] >= 0 && loc[1] < curSquaresY)
                    .map((loc) => setSquareWaterContainmentToHumidityMult(loc[0], loc[1], 0.75))
                }
            }
        }
    }
}

function renderClouds() {

}

function tickMaps() {
    if (temperatureMap == null || waterSaturationMap == null) {
        init();
    }
    tickMap(temperatureMap, (a, b) => (a - b) / 2);
    tickMap(waterSaturationMap, (a, b) => (a - b) / 2);
    doRain();
}

function getHumidity(i, j) {
    var current = waterSaturationMap[i][j];
    var max = saturationPressureOfWaterVapor(temperatureMap[i][j]);
    return current / max;
}

function calculateColor(val, valMin, valMax, colorMin, colorMax) {
    var normalized = (val - valMin) / valMax;
    return rgbToRgba(
        colorMax.r * normalized + colorMin.r * (1 - normalized),
        colorMax.g * normalized + colorMin.g * (1 - normalized),
        colorMax.b * normalized + colorMin.b * (1 - normalized),
        0.65
    );
}

function renderTemperature() {
    for (let i = 0; i < curSquaresX; i++) {
        for (let j = 0; j < curSquaresY; j++) {
            MAIN_CONTEXT.fillStyle = calculateColor(temperatureMap[i][j], 273, 273 + 50, c_tempLowRGB, c_tempHighRGB);
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
            MAIN_CONTEXT.fillStyle = calculateColor(getHumidity(i, j) , 0, 1, c_waterSaturationLowRGB, c_waterSaturationHighRGB);
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

function addTemperature(x, y, dt) {
    x /= 4;
    y /= 4;
    _addTemperature(x, y, dt);
    getMapDirectNeighbors(x, y).forEach((loc) => _addTemperature(loc[0], loc[1], dt));
}

function _addTemperature(x, y, delta) {
    x = (Math.floor(x) + curSquaresX) % curSquaresX;
    y = (Math.floor(y) + curSquaresY) % curSquaresY;
    temperatureMap[x][y] += delta;
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
 
export { renderTemperature, renderWaterSaturation, tickMaps, addTemperature, addWaterSaturation }