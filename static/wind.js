import { randRange, rgbToHex, rgbToRgba } from "./common.js";
import { getSquares } from "./squares/_sqOperations.js";
import { MAIN_CONTEXT, CANVAS_SQUARES_X, CANVAS_SQUARES_Y, BASE_SIZE } from "./index.js";
import { getCurTime } from "./time.js";
import { COLOR_BLUE, COLOR_BROWN, COLOR_GREEN, COLOR_RED } from "./colors.js";
import { addTemperature, getTemperatureAtSquare, getTemperatureAtWindSquare, getWaterSaturation, updateSquareTemperature } from "./temperature_humidity.js";

var windPressureMap;
var windPressureMapByPressure;
var windFlowStrength = 0.5;


var air_molar_mass = 28.96;
var water_vapor_molar_mass = 18;
var stp_pascals_per_meter = 1100;
var moles_per_1_atm_of_1_mcubed = 44.64;

var base_wind_pressure = 101325; // 1 atm in pascals

var windFuncCurTheta = 0;
var windFuncCurThetaDt = 0.01;
var windFunctionApplicationMap = new Map();
var windFunctionApplicationArray = new Array();
var windFunctionApplicationLastAddTime = -(10 ** 8);
var windFunctionApplicaitonDt = 1000;

var windSpeedSmoothingMap = new Map();

var f_windDensityMap = new Map();
var f_upperPressureMap = new Map();

var windColors = [COLOR_BLUE, COLOR_GREEN, COLOR_RED, COLOR_BROWN];

var clickAddPressure = base_wind_pressure * 0.01;

var WIND_SQUARES_X = () => CANVAS_SQUARES_X / 4;
var WIND_SQUARES_Y = () => CANVAS_SQUARES_Y / 4;

function getAirSquareDensity(x, y) {
    return ((windPressureMap[x][y] / base_wind_pressure) * (air_molar_mass / getTempMolarMult(x, y)) + (getWaterSaturation(x, y) / base_wind_pressure) * (water_vapor_molar_mass / getTempMolarMult(x, y))) / air_molar_mass;
}

function getAirSquareDensityTempAndHumidity(x, y) {
    return ((air_molar_mass / getTempMolarMult(x, y)) + (getWaterSaturation(x, y) / base_wind_pressure) * (water_vapor_molar_mass / getTempMolarMult(x, y))) / air_molar_mass;
}

function getPressureProcessed(x, y) {
    if (windPressureMap == null) {
        initializeWindPressureMap();
    }
    if (!isPointInBounds(x, y)) {
        return -1;
    }
    var pressure = windPressureMap[x][y];
    var density = getAirSquareDensityTempAndHumidity(x, y);
    return pressure * density;
}

function getPressure(x, y) {
    if (isNaN(x) || isNaN(y)) {
        return 0;
    }
    x = (Math.floor(x) + WIND_SQUARES_X()) % WIND_SQUARES_X();
    y = (Math.floor(y) + WIND_SQUARES_Y()) % WIND_SQUARES_Y();
    return windPressureMap[x][y];
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

function checkIfCollisionAtWindSquare(x, y) {
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

function initializeWindPressureMap() {
    windPressureMap = new Map();
    windPressureMapByPressure = new Map();
    windFunctionApplicationMap = new Map();
    windFunctionApplicationArray = new Array();
    windFunctionApplicationLastAddTime = -(10 ** 8);
    windSpeedSmoothingMap = new Map();
    var start_pressure = base_wind_pressure;
    windPressureMapByPressure[start_pressure] = new Array();
    for (let i = 0; i < WIND_SQUARES_X(); i++) {
        for (let j = 0; j < WIND_SQUARES_Y(); j++) {
            if (!(i in windPressureMap)) {
                windPressureMap[i] = new Map();
                windFunctionApplicationMap[i] = new Map();
                windSpeedSmoothingMap[i] = new Map();
            }
            windFunctionApplicationMap[i][j] = -1;
            windSpeedSmoothingMap[i][j] = new Array();
            if (checkIfCollisionAtWindSquare(i, j)) {
                windPressureMap[i][j] = -1;
            } else {
                windPressureMap[i][j] = start_pressure;
                windPressureMapByPressure[start_pressure].push([i, j]);
            }
        }
    }
}

function getTempMolarMult(x, y) {
    return 1 + ((getTemperatureAtSquare(x, y) - 273) / 273);
}

function tickWindPressureMap() {
    windPressureMapByPressure = new Map();
    for (let i = 0; i < WIND_SQUARES_X() - 1; i++) {
        for (let j = 0; j < WIND_SQUARES_Y() - 1; j++) {
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
        .forEach((pressure) => {
            var pressureLocations = windPressureMapByPressure[pressure];
            pressureLocations
                .forEach((pl) => {
                    var x = pl[0];
                    var y = pl[1];
                    getWindDirectNeighbors(x, y)
                        .filter((spl) => isPointInBounds(spl[0], spl[1]))
                        .forEach((spl) => {
                            var x2 = spl[0];
                            var y2 = spl[1];

                            var plPressure = windPressureMap[x][y];
                            var splPressure = windPressureMap[x2][y2];

                            if (splPressure < 0 || plPressure < 0) {
                                return;
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

                            /* 
                            if y2_relY is negative, then spl is on top of pl. 
                            therefore, pl's air air pressure should be ("stp pascals per meter" * "splDensity" * 4) pascals higher than spl's. so subtract that from it when we do our diffy wiffy
                            */

                            var plTemp = getTemperatureAtWindSquare(x, y);
                            var splTemp = getTemperatureAtWindSquare(x2, y2);

                            var windPressureDiff = getWindPressureDiff(plPressureProcessed - expectedPressureDiff / 2, splPressureProcessed + expectedPressureDiff / 2) / 2; // + expectedPressureDiff, splPressureProcessed - expectedPressureDiff);
                            
                            if (windPressureDiff == 0) {
                                return;
                            }

                            if ((plPressure - windPressureDiff) < 0 || (splPressure + windPressureDiff < 0)) {
                                console.warn("FUCK!!!");
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
                            updateSquareTemperature(x2, y2, endSplTemp);
                            windPressureMap[x][y] -= windPressureDiff;
                            windPressureMap[x2][y2] += windPressureDiff;
                        });
                });
        });
};


function renderWindPressureMap() {
    for (let i = 0; i < WIND_SQUARES_X(); i++) {
        for (let j = 0; j < WIND_SQUARES_Y(); j++) {

            var presure_min = base_wind_pressure - stp_pascals_per_meter / 2 * CANVAS_SQUARES_Y;
            var pressure_max = base_wind_pressure + stp_pascals_per_meter / 2 * CANVAS_SQUARES_Y;

            var p = getPressure(i, j);
            var s = _getWindSpeedAtLocation(i, j);

            var pressure_255 = ((p - presure_min) / (pressure_max - presure_min)) * 255;

            MAIN_CONTEXT.fillStyle = rgbToRgba(255 - pressure_255, 255 - pressure_255, 255 - pressure_255, .3);
            MAIN_CONTEXT.fillRect(
                4 * i * BASE_SIZE,
                4 * j * BASE_SIZE,
                4 * BASE_SIZE,
                4 * BASE_SIZE
            );

            if (windFunctionApplicationMap[i][j] != -1) {
                MAIN_CONTEXT.fillStyle = windColors[windFunctionApplicationMap[i][j] % windColors.length];
                MAIN_CONTEXT.fillRect(
                    4 * i * BASE_SIZE,
                    4 * j * BASE_SIZE,
                    4 * BASE_SIZE,
                    4 * BASE_SIZE
                );

            }

            if ((i * j) % 32 != 0) {
                continue;
            }

            var startX = 4 * i * BASE_SIZE;
            var startY = 4 * j * BASE_SIZE;

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


function getCurrentWindPressureFunc() {
    if (getCurTime() - windFunctionApplicationLastAddTime > windFunctionApplicaitonDt) {
        // make a new new one
        windFunctionApplicationArray.push(getParameterizedWindFunc(randRange(8, 13), randRange(10, 30)));
    }
    windFunctionApplicationLastAddTime = getCurTime();
    return windFunctionApplicationArray.length;
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
    var netPresX = 0;
    var netPresY = 0;

    var pressureLeft = getPressureProcessed(x - 1, y) - getPressureProcessed(x, y);
    var pressureRight = getPressureProcessed(x + 1, y) - getPressureProcessed(x, y);

    var pressureTop = 
        getPressureProcessed(x, y - 1) - 
        (getPressureProcessed(x, y) - getAirSquareDensity(x, y - 1) * 4 * stp_pascals_per_meter);
    var pressureBottom = 
        (getPressureProcessed(x, y + 1) - getAirSquareDensity(x, y) * 4 * stp_pascals_per_meter) - 
        getPressureProcessed(x, y);

    if ((getPressureProcessed(x, y - 1) > 0) &&  (getPressureProcessed(x, y + 1) > 0)) {
        netPresX = (pressureLeft - pressureRight);
    }
    if ((getPressureProcessed(x, y - 1) > 0) && (getPressureProcessed(x, y + 1) > 0)) {
        netPresY = (pressureTop - pressureBottom);
    }

    netPresX = (netPresX > 0 ? 1 : -1) * windSpeedFromPressure(Math.abs(netPresX), windPressureMap[x][y]);
    netPresY = (netPresY > 0 ? 1 : -1) * windSpeedFromPressure(Math.abs(netPresY), windPressureMap[x][y]);

    netPresX /= 100;
    netPresY /= 100;


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
    return [previousAvgX * coef + netPresX * (1 - coef), previousAvgY * coef + netPresY * (1 - coef)];
}

function windSpeedFromPressure(pascals, sourcePressure) {
    //  √(2 * 100 Pa / 1.225 kg/m³)
    // sketchy gen ai shit 
    return (2 * pascals / (1.225 * sourcePressure / base_wind_pressure)) ** 0.5;

}

function addWindPressure(posX, posY) {
    var x = Math.floor(posX / 4);
    var y = Math.floor(posY / 4);
    if (x < 0 || x >= WIND_SQUARES_X() || y < 0 || y >= WIND_SQUARES_Y()) {
        return;
    }
    windPressureMap[x][y] += clickAddPressure;

    // getWindDirectNeighbors(x, y).forEach(
    //     (loc) => windPressureMap[(loc[0] + WIND_SQUARES_X()) % WIND_SQUARES_X()][(loc[1] + WIND_SQUARES_Y()) % WIND_SQUARES_Y()] += clickAddPressure);
}

function removeWindPressure(x, y) {
    x = Math.floor(x / 4);
    y = Math.floor(y / 4);

    if (!isPointInBounds(x, y)) {
        return;
    }

    windPressureMap[Math.floor(x)][Math.floor(y)] = Math.max(0, windPressureMap[Math.floor(x)][Math.floor(y)] + clickAddPressure);
    getWindDirectNeighbors(x, y).forEach(
        (loc) => windPressureMap[(loc[0] + CANVAS_SQUARES_X) % CANVAS_SQUARES_X][(loc[1] + CANVAS_SQUARES_Y) % CANVAS_SQUARES_Y] = Math.max(0, windPressureMap[(loc[0] + CANVAS_SQUARES_X) % CANVAS_SQUARES_X][(loc[1] + CANVAS_SQUARES_Y) % CANVAS_SQUARES_Y] - clickAddPressure));
}

function removeFunctionAddWindPressure(x, y) {
    x = Math.floor(x / 4);
    y = Math.floor(y / 4);
    windFunctionApplicationMap[x][y] = -1;
}

function updateWindPressureByMult(x, y, m) {
    windPressureMap[x][y] *= m;
}

function isPointInBounds(x, y) {
    return x >= 0 && x < WIND_SQUARES_X() && y >= 0 && y < WIND_SQUARES_Y(); 
}

initializeWindPressureMap();

export { getPressure, getAirSquareDensity, removeFunctionAddWindPressure, getWindSpeedAtLocation, renderWindPressureMap, initializeWindPressureMap, tickWindPressureMap, addWindPressure, removeWindPressure, updateWindPressureByMult, getAirSquareDensityTempAndHumidity, base_wind_pressure }