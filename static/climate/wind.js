import { hexToRgb, rgbToRgba } from "../common.js";
import { getSquares } from "../squares/_sqOperations.js";
import {  MAIN_CONTEXT } from "../index.js";
import { addWaterSaturationPascals, calculateColor, getTemperatureAtWindSquare, getWaterSaturation, initTemperatureHumidity, updateWindSquareTemperature } from "./temperatureHumidity.js";
import { getBaseSize, getCanvasSquaresX, getCanvasSquaresY, zoomCanvasFillRect } from "../canvas.js";

var windPressureMap;
var windPressureMapByPressure;
var windFlowStrength = 0.5;

export function getWindPressureMap() {
    return windPressureMap;
}
export function setWindPressureMap(inMap) {
    windPressureMap = inMap;
}

var air_molar_mass = 28.96;
var water_vapor_molar_mass = 18;
var stp_pascals_per_meter = 1100;
var base_wind_pressure = 101325; // 1 atm in pascals

var windSpeedSmoothingMap = new Map();

var clickAddPressure = base_wind_pressure * 0.01;
var WIND_SQUARES_X = () => Math.ceil(getCanvasSquaresX() / 4);
var WIND_SQUARES_Y = () => Math.ceil(getCanvasSquaresY() / 4);

var curWindSquaresX = -1;
var curWindSquaresY = -1;

var prevailingWindMap = new Map();
var prevailingWindStartPressureMap = new Map();
var prevailingWind_maxAtm = 1.2;
var prevailingWind_minAtm = 0.8;
var prevailingWind_minColorRGB = hexToRgb("#3d05dd")
var prevailingWind_maxColorRGB = hexToRgb("#fcb0f3")

export function getWindSquaresX() {
    return curWindSquaresX;
}
export function getWindSquaresY() {
    return curWindSquaresY;
}

function getAirSquareDensity(x, y) {
    return ((windPressureMap[x][y] / base_wind_pressure) * (air_molar_mass / getTempMolarMult(x, y)) + (getWaterSaturation(x, y) / base_wind_pressure) * (water_vapor_molar_mass / getTempMolarMult(x, y))) / air_molar_mass;
}

function getAirSquareDensityTempAndHumidity(x, y) {
    return getTempMolarMult(x, y); // ((air_molar_mass / getTempMolarMult(x, y)) + (getWaterSaturation(x, y) / base_wind_pressure) * (water_vapor_molar_mass / getTempMolarMult(x, y))) / air_molar_mass;
}

function getPressure(x, y) {
    if (isNaN(x) || isNaN(y)) {
        return 0;
    }
    if (!isPointInBounds(x, y)) {
        return -1;
    }
    return windPressureMap[x][y];
}

export function isPointInWindBounds(x, y) {
    return x >= 0 && x < curWindSquaresX && y >= 0 && y < curWindSquaresY;
}

export function getAdjacentWindSquareToRealSquare(squareX, squareY) {
    var x = Math.floor(squareX / 4);
    var y = Math.floor(squareY / 4);
    var ret = getWindDirectNeighbors(x, y)
        .filter((loc) => getPressure(x, y) > 0)
        .find((loc) => isPointInBounds(loc[0], loc[1]));
    if (ret != null) {
        return ret;
    } else {
        return [-1, -1];
    }
};

function getWindSquareAbove(squareX, squareY) {
    var x = Math.floor(squareX / 4);
    var y = Math.floor(squareY / 4);

    if (!isPointInBounds(x, y)) {
        return [-1, -1];
    }
    while (getPressure(x, y) < 0 && isPointInBounds(x, y - 1)) {
        y -= 1;
    }

    if (getPressure(x, y) < 0) {
        return [-1, -1];
    }
    return [x, y];
}

function getWindPressureDiff(w1, w2) {
    if (w1 < 0 || w2 < 0) {
        return 0;
    }
    if (!isFinite(w1) || !isFinite(w2)) {
        console.log("FUCK!!!!");
        return 0;
    }
    var diff = w1 - w2;
    diff *= windFlowStrength;
    return diff;
}

function setPressurebyMult(x, y, mult) {
    if (getPressure(x, y) < 0) {
        return;
    }
    windPressureMap[x][y] *= mult;
}

function checkIfCollisionAtWindSquare(x, y) {
    var every = true;
    var someSquareFound = false;
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            var ar = getSquares(x * 4 + i, y * 4 + j);
            if (ar.length > 0) {
                someSquareFound = true;
                every = every && ar.some((sq) => (!sq.surface) && sq.collision);
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

function initWindPressure() {
    windPressureMap = new Map();
    windPressureMapByPressure = new Map();
    prevailingWindMap = new Map();
    prevailingWindStartPressureMap = new Map();
    windSpeedSmoothingMap = new Map();

    curWindSquaresX = WIND_SQUARES_X();
    curWindSquaresY = WIND_SQUARES_Y();

    var start_pressure = base_wind_pressure;
    windPressureMapByPressure[start_pressure] = new Array();
    for (let i = 0; i < curWindSquaresX; i++) {
        for (let j = 0; j < curWindSquaresY; j++) {
            if (!(i in windPressureMap)) {
                windPressureMap[i] = new Map();
                prevailingWindMap[i] = new Map();
                windSpeedSmoothingMap[i] = new Map();
                prevailingWindStartPressureMap[i] = new Map();
            }
            prevailingWindMap[i][j] = -1;
            windSpeedSmoothingMap[i][j] = new Array();
            if (checkIfCollisionAtWindSquare(i, j)) {
                windPressureMap[i][j] = -1;
            } else {
                windPressureMap[i][j] = start_pressure + (stp_pascals_per_meter * 4 * j);
                windPressureMapByPressure[start_pressure].push([i, j]);
            }
        }
    }
}

function getTempMolarMult(x, y) {
    return 1 + ((getTemperatureAtWindSquare(x, y) - 273) / 273);
}

function tickWindPressureMap() {
    windPressureMapByPressure = new Map();
    if (WIND_SQUARES_X() != curWindSquaresX || WIND_SQUARES_Y() != curWindSquaresY) {
        initWindPressure();
        initTemperatureHumidity();
    }

    for (let i = 0; i < curWindSquaresX; i++) {
        for (let j = 0; j < curWindSquaresY; j++) {
            var prevailingWind = prevailingWindMap[i][j];
            if (prevailingWind != -1) {
                var prevailingWindPressure = prevailingWindStartPressureMap[i][j] * (prevailingWind_minAtm * (1 - prevailingWind) + prevailingWind_maxAtm * prevailingWind)
                var start = windPressureMap[i][j];
                windPressureMap[i][j] = prevailingWindPressure;
                var mult = windPressureMap[i][j] / start;
                addWaterSaturationPascals(i, j, mult * getWaterSaturation(i, j));
            }
            if (checkIfCollisionAtWindSquare(i, j)) {
                windPressureMap[i][j] = -1;
            } else {
                if (windPressureMap[i][j] == -1) {
                    if (!getWindDirectNeighbors(i, j).some((sq) => {
                        if (getPressure(sq[0], sq[1]) != -1) {
                            windPressureMap[i][j] = getPressure(sq[0], sq[1]);
                            return true;
                        }
                        return false;
                    })) {
                        windPressureMap[i][j] = base_wind_pressure;
                    }
                }
            }
            var pressure = Math.floor(windPressureMap[i][j]);
            if (!(pressure in windPressureMapByPressure)) {
                windPressureMapByPressure[pressure] = new Array();
            }
            windPressureMapByPressure[pressure].push([i, j]);
        }
    }

    var windPressureMapKeys = Array.from(Object.keys(windPressureMapByPressure)).sort((a, b) => b - a);

    windPressureMapKeys
        .filter((pressure) => pressure > 0)
        .forEach((pressure) => {
            var pressureLocations = windPressureMapByPressure[pressure];
            pressureLocations
                .forEach((pl) => {
                    var x = pl[0];
                    var y = pl[1];
                    getWindDirectNeighbors(x, y)
                        .filter((spl) => isPointInBounds(spl[0], spl[1]))
                        .filter((spl) => getPressure(spl[0], spl[1]) > 0)
                        .forEach((spl) => {
                            var x2 = spl[0];
                            var y2 = spl[1];
                            
                            var plPressure = windPressureMap[x][y]
                            var splPressure = windPressureMap[x2][y2];
                        
                            var plTemp = getTemperatureAtWindSquare(x, y);
                            var splTemp = getTemperatureAtWindSquare(x2, y2);

                            var windPressureDiff = getExpectedPressureDifferential(x, y, x2, y2);

                            if (windPressureDiff == 0) {
                                return;
                            }

                            var plEnergyLost = windPressureDiff * plTemp;
                            var startSplEnergy = splPressure * splTemp;
                            var endSplEnergy = startSplEnergy + plEnergyLost;
                            var endSplTemp = endSplEnergy / (splPressure + windPressureDiff);
                            // only spl has a change in temperature 
                            // since we are flowing from pl to spl

                            // if (Math.abs(plTemp - splTemp) > 1) 
                            //     console.log(x2, y2, splTemp, endSplTemp);
                            updateWindSquareTemperature(x2, y2, endSplTemp);

                            var plWaterPressure = getWaterSaturation(x, y);
                            var splWaterPressure = getWaterSaturation(x2, y2);

                            var plWaterPascalsLost = (windPressureDiff / plPressure) * plWaterPressure;
                            var splWaterPascalsLost = (windPressureDiff / splPressure) * splWaterPressure;
                            
                            var waterPascalsLost;
                            if (plWaterPascalsLost >= 0)
                                waterPascalsLost = Math.min(plWaterPascalsLost, splWaterPascalsLost);
                            else
                                waterPascalsLost = Math.max(plWaterPascalsLost, splWaterPascalsLost);

                            addWaterSaturationPascals(x, y, -waterPascalsLost);
                            addWaterSaturationPascals(x2, y2, waterPascalsLost);

                            //TODO: Also do this for water pressure!!!
                            windPressureMap[x][y] -= windPressureDiff;
                            windPressureMap[x2][y2] += windPressureDiff;
                        });
                });
        });
};

function getExpectedPressureDifferential(x, y, x2, y2) {
    if (!isPointInBounds(x, y) || !isPointInBounds(x2, y2)) {
        return 0;
    }

    var plPressure = windPressureMap[x][y];
    var splPressure = windPressureMap[x2][y2];

    if (splPressure < 0 || plPressure < 0) {
        return 0;
    }

    // now, process plPressure and splPressure

    var plDensity = getAirSquareDensityTempAndHumidity(x, y);
    var splDensity = getAirSquareDensityTempAndHumidity(x2, y2);

    var plPressureProcessed = plPressure * plDensity;
    var splPressureProcessed = splPressure * splDensity;

    var y2_relY = y2 - y;
    var expectedPressureDiff = 0;

    if (y2_relY != 0) {
        if (y2_relY < 0) {
            expectedPressureDiff = stp_pascals_per_meter * 4 * splDensity;
        } else {
            expectedPressureDiff = -1 * stp_pascals_per_meter * 4 * plDensity;
        }
    }

    return getWindPressureDiff(plPressureProcessed - expectedPressureDiff / 2, splPressureProcessed + expectedPressureDiff / 2) / 2;
}


function renderWindPressureMap() {
    for (let i = 0; i < curWindSquaresX; i++) {
        for (let j = 0; j < curWindSquaresY; j++) {
            var presure_min = base_wind_pressure - stp_pascals_per_meter / 2 * getCanvasSquaresY();
            var pressure_max = base_wind_pressure + stp_pascals_per_meter / 2 * getCanvasSquaresY();
            var p = getPressure(i, j);
            var s = _getWindSpeedAtLocation(i, j);

            var pressure_255 = ((p - presure_min) / (pressure_max - presure_min)) * 255;

            MAIN_CONTEXT.fillStyle = rgbToRgba(255 - pressure_255, 255 - pressure_255, 255 - pressure_255, .3);
            zoomCanvasFillRect(
                4 * i * getBaseSize(),
                4 * j * getBaseSize(),
                4 * getBaseSize(),
                4 * getBaseSize()
            );

            if (prevailingWindMap[i][j] != -1) {
                MAIN_CONTEXT.fillStyle = calculateColor(prevailingWindMap[i][j], 0, 1, prevailingWind_minColorRGB, prevailingWind_maxColorRGB);
                zoomCanvasFillRect(
                    4 * i * getBaseSize(),
                    4 * j * getBaseSize(),
                    4 * getBaseSize(),
                    4 * getBaseSize()
                );

            }

            if ((i * j) % 32 != 0) {
                continue;
            }

            var startX = 4 * i * getBaseSize();
            var startY = 4 * j * getBaseSize();

            MAIN_CONTEXT.beginPath();
            MAIN_CONTEXT.lineWidth = 1;
            MAIN_CONTEXT.moveTo(startX, startY);
            MAIN_CONTEXT.lineTo(startX + s[0] * 3, startY + s[1] * 3);
            MAIN_CONTEXT.stroke();
            MAIN_CONTEXT.closePath();


        }
    }
}


function getWindDirectNeighbors(x, y) {
    return [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1]
    ]
}


// public methods 

function getWindSpeedAtLocation(x, y) {
    x = Math.floor(x / 4);
    y = Math.floor(y / 4);
    return _getWindSpeedAtLocation(x, y);
}

function _getWindSpeedAtLocation(x, y) {
    if (getPressure(x, y) < 0) {
        return [0, 0];
    }
    if (isNaN(x) || isNaN(y)) {
        return [0, 0];
    }
    var netPresX = 0;
    var netPresY = 0;

    netPresX = getExpectedPressureDifferential(x, y, x + 1, y) - getExpectedPressureDifferential(x, y, x - 1, y)
    netPresY = getExpectedPressureDifferential(x, y, x, y + 1) - getExpectedPressureDifferential(x, y, x, y - 1)


    netPresX = (netPresX > 0 ? 1 : -1) * windSpeedFromPressure(Math.abs(netPresX), windPressureMap[x][y]);
    netPresY = (netPresY > 0 ? 1 : -1) * windSpeedFromPressure(Math.abs(netPresY), windPressureMap[x][y]);

    netPresX /= 10;
    netPresY /= 10;

    var previousSpeeds = windSpeedSmoothingMap[x][y];
    if (previousSpeeds.length == 0) {
        previousSpeeds.push([netPresX, netPresY]);
        return [netPresX, netPresY]
    }

    var previousSumX = 0;
    var previousSumY = 0;

    previousSpeeds.forEach((sp) => {
        previousSumX += sp[0];
        previousSumY += sp[1];
    });

    var previousAvgX = previousSumX / previousSpeeds.length;
    var previousAvgY = previousSumY / previousSpeeds.length;

    //  √(2 * 100 Pa / 1.225 kg/m³)

    previousSpeeds.push([netPresX, netPresY]);

    if (previousSpeeds.length > 5) {
        previousSpeeds.shift(1);
    }

    var coef = 0.8;

    if (isNaN(previousAvgX * coef + netPresX * (1 - coef))) {
        console.warn("FUCK 408");
    }
    return [previousAvgX * coef + netPresX * (1 - coef), previousAvgY * coef + netPresY * (1 - coef)];
}

function windSpeedFromPressure(pascals, sourcePressure) {
    return (2 * pascals / (1.225 * sourcePressure / base_wind_pressure)) ** 0.5;

}

function addWindPressure(posX, posY) {
    var x = Math.floor(posX / 4);
    var y = Math.floor(posY / 4);
    if (!isPointInBounds(x, y)) {
        return;
    }
    windPressureMap[x][y] += clickAddPressure;
}

function removeWindPressure(x, y) {
    x = Math.floor(x / 4);
    y = Math.floor(y / 4);

    if (!isPointInBounds(x, y)) {
        return;
    }

    windPressureMap[x][y] = Math.max(1, windPressureMap[x][y] - clickAddPressure);
    getWindDirectNeighbors(x, y).forEach(
        (loc) => {
            var x2 = loc[0];
            var y2 = loc[1];
            windPressureMap[x2][y2] = Math.max(1, windPressureMap[x2][y2] - clickAddPressure);
        });
}

function updateWindPressureByMult(x, y, m) {
    windPressureMap[x][y] *= m;
}

function isPointInBounds(x, y) {
    return x >= 0 && x < curWindSquaresX && y >= 0 && y < curWindSquaresY;
}

function clearPrevailingWind(posX, posY) {
    var x = Math.floor(posX / 4);
    var y = Math.floor(posY / 4);
    if (!isPointInBounds(x, y)) {
        return;
    }
    prevailingWindMap[x][y] = -1;
}

function addPrevailingWind(posX, posY, d) {
    var x = Math.floor(posX / 4);
    var y = Math.floor(posY / 4);
    if (!isPointInBounds(x, y)) {
        return;
    }
    var start = prevailingWindMap[x][y];
    if (start == -1) {
        start = 0.5;
        prevailingWindStartPressureMap[x][y] = windPressureMap[x][y];
    }
    var delta = d / 10;
    var end = start + delta; 
    end = Math.min(end, 1);
    end = Math.max(end, 0);
    if (end == 0.5) {
        prevailingWindMap[x][y] = -1;
    } else {
        prevailingWindMap[x][y] = end;
    }
}

initWindPressure();

export { clearPrevailingWind, addPrevailingWind, getWindSquareAbove, setPressurebyMult, getPressure, getAirSquareDensity, getWindSpeedAtLocation, renderWindPressureMap, initWindPressure, tickWindPressureMap, addWindPressure, removeWindPressure, updateWindPressureByMult, getAirSquareDensityTempAndHumidity, base_wind_pressure }