import { randRange, rgbToHex, rgbToRgba } from "./common.js";
import { getSquares } from "./squares/_sqOperations.js";
import { MAIN_CONTEXT, CANVAS_SQUARES_X, CANVAS_SQUARES_Y, BASE_SIZE } from "./index.js";
import { getCurTime, getNextGroupId } from "./globals.js";
import { COLOR_BLUE, COLOR_BROWN, COLOR_GREEN, COLOR_RED } from "./colors.js";

var wpm;
var windPressureMapByPressure;
var windFlowStrength = 0.5;

var base_wind_pressure = 10;

var windFuncCurTheta = 0;
var windFuncCurThetaDt = 0.01;
var windFunctionApplicationMap = new Map();
var windFunctionApplicationArray = new Array();
var windFunctionApplicationLastAddTime = -(10 ** 8);
var windFunctionApplicaitonDt = 1000;

var windSpeedSmoothingMap = new Map();

var windColors = [COLOR_BLUE, COLOR_GREEN, COLOR_RED, COLOR_BROWN];

var clickAddPressure = 20;

var WIND_SQUARES_X = () => CANVAS_SQUARES_X / 4;
var WIND_SQUARES_Y = () => CANVAS_SQUARES_Y / 4;

function gp(x, y) {
    if (isNaN(x) || isNaN(y)) {
        return 0;
    }
    x = (Math.floor(x) + WIND_SQUARES_X()) % WIND_SQUARES_X();
    y = (Math.floor(y) + WIND_SQUARES_Y()) % WIND_SQUARES_Y();
    return wpm[x][y];
}

function getWindPressureDiff(w1, w2) {
    if (w1 < 0 || w2 < 0) {
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
    wpm = new Map();
    windPressureMapByPressure = new Map();
    windFunctionApplicationMap = new Map();
    windFunctionApplicationArray = new Array();
    windFunctionApplicationLastAddTime = -(10 ** 8);
    windSpeedSmoothingMap = new Map();
    var start_pressure = base_wind_pressure;
    windPressureMapByPressure[start_pressure] = new Array();
    for (let i = 0; i < WIND_SQUARES_X(); i++) {
        for (let j = 0; j < WIND_SQUARES_Y(); j++) {
            if (!(i in wpm)) {
                wpm[i] = new Map();
                windFunctionApplicationMap[i] = new Map(); 
                windSpeedSmoothingMap[i] = new Map();
            }
            windFunctionApplicationMap[i][j] = -1;
            windSpeedSmoothingMap[i][j] = new Array();
            if (checkIfCollisionAtWindSquare(i, j)) {
                wpm[i][j] = -1;
            } else {
                wpm[i][j] = start_pressure;
                windPressureMapByPressure[start_pressure].push([i, j]);
            }
        }
    }
}

function tickWindPressureMap() {
    windFuncCurTheta += windFuncCurThetaDt;
    windPressureMapByPressure = new Map();
    for (let i = 0; i < WIND_SQUARES_X(); i++) {
        for (let j = 0; j < WIND_SQUARES_Y(); j++) {
            if (isNaN(wpm[i][j])) {
                initializeWindPressureMap();
                return;
            }
            if (checkIfCollisionAtWindSquare(i, j)) {
                wpm[i][j] = -1;
            } else {
                if (wpm[i][j] == -1) {
                    if (!getWindDirectNeighbors(i, j).some((sq) => {
                        if (gp(sq[0], sq[1]) != -1) {
                            wpm[i][j] = gp(sq[0], sq[1]);
                            return true;
                        }
                        return false;
                    })) {
                        wpm[i][j] = base_wind_pressure;
                    }
                }
            }

            if (windFunctionApplicationMap[i][j] != -1) {
                wpm[i][j] = Math.max(0, wpm[i][j] + windFunctionApplicationArray[windFunctionApplicationMap[i][j] - 1](windFuncCurTheta));
            }

            var pressure = Math.floor(wpm[i][j]);
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
                getWindDirectNeighbors(pl[0], pl[1])
                    .forEach((spl) => {
                        var x = (spl[0] + WIND_SQUARES_X()) % WIND_SQUARES_X();
                        var y = (spl[1] + WIND_SQUARES_Y()) % WIND_SQUARES_Y();
                        if (pl[0] == 0 || pl[0] == CANVAS_SQUARES_X || pl[1] == 0 || pl[1] == CANVAS_SQUARES_Y) {
                            wpm[x][y] = base_wind_pressure;
                        }
                        var plPressure = wpm[pl[0]][pl[1]];
                        var splPressure = wpm[x][y];

                        var windPressureDiff = getWindPressureDiff(plPressure, splPressure);
                        wpm[pl[0]][pl[1]] -= windPressureDiff;
                        wpm[x][y] += windPressureDiff;
                });

                getWindIndirectNeighbors(pl[0], pl[1])
                    .forEach((spl) => {
                        var x = (spl[0] + WIND_SQUARES_X()) % WIND_SQUARES_X();
                        var y = (spl[1] + WIND_SQUARES_Y()) % WIND_SQUARES_Y();
                        if (pl[0] == 0 || pl[0] == CANVAS_SQUARES_X || pl[1] == 0 || pl[1] == CANVAS_SQUARES_Y) {
                            wpm[x][y] = base_wind_pressure;
                        }
                        var plPressure = wpm[pl[0]][pl[1]];
                        var splPressure = wpm[x][y];

                        var windPressureDiff = getWindPressureDiff(plPressure, splPressure);
                        windPressureDiff *= Math.SQRT1_2;

                        wpm[pl[0]][pl[1]] -= windPressureDiff;
                        wpm[x][y] += windPressureDiff;
            });
        });
    });
}

function renderWindPressureMap() {
    for (let i = 0; i < WIND_SQUARES_X(); i++) {
        for (let j = 0; j < WIND_SQUARES_Y(); j++) {
            var p = gp(i, j);
            var s = _getWindSpeedAtLocation(i, j);

            MAIN_CONTEXT.fillStyle = rgbToRgba(p, p, p, .3);
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
            MAIN_CONTEXT.moveTo (startX, startY);
            MAIN_CONTEXT.lineTo (startX + s[0] * 3, startY + s[1] * 3);
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

function getWindIndirectNeighbors(x, y) {
    return [
        [x - 1, y - 1],
        [x + 1, y - 1],
        [x + 1, y - 1],
        [x + 1, y + 1]
    ]
}


function getParameterizedWindFunc(a, b) {
    return (x) => b * (Math.log1p(-1 + Math.sin(Math.cos(x / a))) + 1.9);
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
    if (gp(x, y) < 0) {
        return [0, 0];
    }
    var netPresX = 0;
    var netPresY = 0; 

    var pressureLeft = gp(x - 1, y) - gp(x, y);
    var pressureRight = gp(x + 1, y) - gp(x, y);
    var pressureTop = gp(x, y - 1) - gp(x, y);
    var pressureBottom = gp(x, y + 1) - gp(x, y);

    if (pressureLeft * pressureRight <= 0) {
        netPresX = (pressureLeft - pressureRight);
    }
    if (pressureTop * pressureBottom <= 0) {
        netPresY = (pressureTop - pressureBottom);
    }
    // if (gp(x - 1, y) >= 0)
    //     netPresX -= (gp(x, y) - gp(x - 1, y));
    // if (gp(x + 1, y) >= 0)
    //     netPresX += (gp(x, y) - gp(x + 1, y));
    // if (gp(x, y - 1) >= 0)
    //     netPresY -= (gp(x, y) - gp(x, y - 1));
    // if (gp(x, y + 1) >= 0)
    //     netPresY += (gp(x, y) - gp(x, y + 1));

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
    
    previousSpeeds.push([netPresX, netPresY]);

    if (previousSpeeds.length > 5) {
        previousSpeeds.shift(1);
    }

    var coef = 0.8;
    return [previousAvgX * coef + netPresX * (1 - coef), previousAvgY * coef + netPresY * (1 - coef)];
}

function addWindPressure(x, y) {
    x = Math.floor(x / 4);
    y = Math.floor(y / 4);

    x = (Math.floor(x) + WIND_SQUARES_X()) % WIND_SQUARES_X();
    y = (Math.floor(y) + WIND_SQUARES_Y()) % WIND_SQUARES_Y();
    wpm[Math.floor(x)][Math.floor(y)] += clickAddPressure;

    getWindDirectNeighbors(x, y).forEach(
        (loc) => wpm[(loc[0] + WIND_SQUARES_X()) % WIND_SQUARES_X()][(loc[1] + WIND_SQUARES_Y()) % WIND_SQUARES_Y()] += clickAddPressure);
}

function removeWindPressure(x, y) {
    x = Math.floor(x / 4);
    y = Math.floor(y / 4);

    x = (Math.floor(x) + CANVAS_SQUARES_X) % CANVAS_SQUARES_X;
    y = (Math.floor(y) + CANVAS_SQUARES_Y) % CANVAS_SQUARES_Y;
    wpm[Math.floor(x)][Math.floor(y)] = Math.max(0, wpm[Math.floor(x)][Math.floor(y)] + clickAddPressure);
    getWindDirectNeighbors(x, y).forEach(
        (loc) => wpm[(loc[0] + CANVAS_SQUARES_X) % CANVAS_SQUARES_X][(loc[1] + CANVAS_SQUARES_Y) % CANVAS_SQUARES_Y] = Math.max(0, wpm[(loc[0] + CANVAS_SQUARES_X) % CANVAS_SQUARES_X][(loc[1] + CANVAS_SQUARES_Y) % CANVAS_SQUARES_Y] - clickAddPressure));
}

function addFunctionAddWindPressure(x, y) {
    x = Math.floor(x / 4);
    y = Math.floor(y / 4);

    x = (Math.floor(x) + CANVAS_SQUARES_X) % CANVAS_SQUARES_X;
    y = (Math.floor(y) + CANVAS_SQUARES_Y) % CANVAS_SQUARES_Y;
    windFunctionApplicationMap[x][y] = getCurrentWindPressureFunc();
}
 
function removeFunctionAddWindPressure(x, y) {
    x = Math.floor(x / 4);
    y = Math.floor(y / 4);
    windFunctionApplicationMap[x][y] = -1;
}

export { removeFunctionAddWindPressure, addFunctionAddWindPressure, getWindSpeedAtLocation, renderWindPressureMap, initializeWindPressureMap, tickWindPressureMap, addWindPressure, removeWindPressure }