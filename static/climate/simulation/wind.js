import { hexToRgb, rgbToRgba } from "../../common.js";
import { getSquares } from "../../squares/_sqOperations.js";
import {  MAIN_CONTEXT } from "../../index.js";
import { addWaterSaturation, addWaterSaturationPascals, calculateColor, getHumidity, getTemperatureAtWindSquare, getWaterSaturation, initTemperatureHumidity, setWaterSaturation, setWaterSaturationMap, updateWindSquareTemperature } from "./temperatureHumidity.js";
import { getBaseSize, getCanvasHeight, getCanvasSquaresX, getCanvasSquaresY, getCanvasWidth, getFrameXMax, getFrameXMin, getFrameYMax, getFrameYMin, zoomCanvasFillRect, zoomCanvasFillRectTheta } from "../../canvas.js";
import { loadGD, UI_CANVAS_SQUARES_ZOOM, UI_CANVAS_VIEWPORT_CENTER_X, UI_CANVAS_VIEWPORT_CENTER_Y, UI_GAME_MAX_CANVAS_SQUARES_X, UI_GAME_MAX_CANVAS_SQUARES_Y } from "../../ui/UIData.js";
import { getWindThrottleVal, registerWindThrottlerOutput } from "./throttler.js";
import { COLOR_VERY_FUCKING_RED } from "../../colors.js";

let windPressureMap;
let windPressureMapByPressure;
let windPressureBlockOcclusionMap;

export function windFlowrateFactor() {
    return 1;
}

export function getWindPressureMap() {
    return windPressureMap;
}
export function setWindPressureMap(inMap) {
    windPressureMap = inMap;
}

let air_molar_mass = 28.96;
let water_vapor_molar_mass = 18;
let stp_pascals_per_meter = 1100;
let base_wind_pressure = 101325; // 1 atm in pascals

let windSpeedSmoothingMap = new Map();

let WIND_SQUARES_X = () => Math.ceil(loadGD(UI_GAME_MAX_CANVAS_SQUARES_X) / 4);
let WIND_SQUARES_Y = () => Math.ceil(loadGD(UI_GAME_MAX_CANVAS_SQUARES_Y) / 4);

let curWindSquaresX = -1;
let curWindSquaresY = -1;

export function getWindSquaresX() {
    return WIND_SQUARES_X();
}
export function getWindSquaresY() {
    return WIND_SQUARES_Y();
}

function getAirSquareDensity(x, y) {
    return ((windPressureMap[x][y] / base_wind_pressure) * (air_molar_mass / getTempMolarMult(x, y)) + (getWaterSaturation(x, y) / base_wind_pressure) * (water_vapor_molar_mass / getTempMolarMult(x, y))) / air_molar_mass;
}

function getAirSquareDensityTempAndHumidity(x, y) {
    return getTempMolarMult(x, y); // ((air_molar_mass / getTempMolarMult(x, y)) + (getWaterSaturation(x, y) / base_wind_pressure) * (water_vapor_molar_mass / getTempMolarMult(x, y))) / air_molar_mass;
}

function getPressure(wx, wy) {
    if (isNaN(wx) || isNaN(wy)) {
        return 0;
    }
    if (!isPointInBounds(wx, wy)) {
        return -1;
    }
    return windPressureMap[wx][wy];
}

export function isPointInWindBounds(x, y) {
    return x >= getFrameXMinWsq() && x < getFrameXMaxWsq() && y >= getFrameYMinWsq() && y < getFrameYMaxWsq();
}

export function getAdjacentWindSquareToRealSquare(squareX, squareY) {
    let x = Math.floor(squareX / 4);
    let y = Math.floor(squareY / 4);
    let ret = getWindDirectNeighbors(x, y)
        .filter((loc) => getPressure(x, y) > 0)
        .find((loc) => isPointInBounds(loc[0], loc[1]));
    if (ret != null) {
        return ret;
    } else {
        return [-1, -1];
    }
};

function getWindSquareAbove(squareX, squareY) {
    let x = Math.floor(squareX / 4);
    let y = Math.floor(squareY / 4);

    if (!isPointInBounds(x, y)) {
        return [-1, -1];
    }
    while (isWindSquareBlocked(x, y) && isPointInBounds(x, y - 1)) {
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
    let diff = (w1 - w2) / 2;
    diff /= windFlowrateFactor();
    return diff;
}

function setPressurebyMult(x, y, mult) {
    if (getPressure(x, y) < 0) {
        return;
    }
    windPressureMap[x][y] *= mult;
}

function checkIfCollisionAtWindSquare(x, y) {
    return false;
    let every = true;
    let someSquareFound = false;
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            let ar = getSquares(x * 4 + i, y * 4 + j);
            if (ar.length > 0) {
                someSquareFound = true;
                every = every && ar.some((sq) => !sq.surface && sq.collision);
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

export function isWindSquareBlocked(x, y) {
    return windPressureBlockOcclusionMap[x][y];
}

export function getBaseAirPressureAtYPosition(posY) {
    return base_wind_pressure + (stp_pascals_per_meter * 4 * posY);
}

function initWindPressure() {
    windPressureMap = new Map();
    windPressureMapByPressure = new Map();
    windPressureBlockOcclusionMap = new Map();
    windSpeedSmoothingMap = new Map();

    curWindSquaresX = WIND_SQUARES_X();
    curWindSquaresY = WIND_SQUARES_Y();

    for (let i = 0; i <= curWindSquaresX; i++) {
        for (let j = 0; j <= curWindSquaresY; j++) {
            if (!(i in windPressureMap)) {
                windPressureMap[i] = new Map();
                windSpeedSmoothingMap[i] = new Map();
                windPressureBlockOcclusionMap[i] = new Map();
            }
            windSpeedSmoothingMap[i][j] = new Array();
            windPressureMap[i][j] = getBaseAirPressureAtYPosition(j);
            windPressureBlockOcclusionMap[i][j] = checkIfCollisionAtWindSquare(i, j);
        }
    }
}

function getTempMolarMult(x, y) {
    return 1 + ((getTemperatureAtWindSquare(x, y) - 273) / 273);
}

export function getWindThrottleValWindMap(x, y) {
    return Math.random() < getWindThrottleValWindMapVal(x, y) ? 1 : -1;
}

export function getWindThrottleValWindMapVal(x, y) {
    let max = 0;
    getWindDirectNeighbors(x, y)
        .filter((spl) => isPointInBounds(spl[0], spl[1]))
        .forEach((spl) => {
            let x2 = spl[0];
            let y2 = spl[1];
            let pressureDiff = getExpectedPressureDifferential(x, y, x2, y2);
            max = Math.max(max, pressureDiff);
        });
    let maxThersh = 100;
    let minThresh = .1;
    let maxRate = 1;
    let minRate = .01;
    if (max > maxThersh) {
        return maxRate;
    } else if (max < minThresh) {
        return minRate;
    } else {
        let invlerp = (max - minThresh) / (maxThersh - minThresh);
        let lerp = invlerp * (maxRate - minRate) + minRate;
        return lerp;
    }
}

let frameXMinWsq = 0;
export function getFrameXMinWsq() { return frameXMinWsq; }
let frameXMaxWsq = 0;
export function getFrameXMaxWsq() { return frameXMaxWsq; }
let frameYMinWsq = 0;
export function getFrameYMinWsq() { return frameYMinWsq; }
let frameYMaxWsq = 0;
export function getFrameYMaxWsq() { return frameYMaxWsq; }

function tickWindPressureMap() {
    if (WIND_SQUARES_X() == 0) {
        return;
    }

    windPressureMapByPressure = new Map();

    frameXMinWsq = Math.floor(getFrameXMin() / 4);
    frameXMaxWsq = Math.ceil(getFrameXMax() / 4);
    frameYMinWsq = Math.floor(getFrameYMin() / 4);
    frameYMaxWsq = Math.ceil(getFrameYMax() / 4);

    for (let i = frameXMinWsq; i < frameXMaxWsq; i++) {
        for (let j = frameYMinWsq; j < frameYMaxWsq; j++) {
            let coll = checkIfCollisionAtWindSquare(i, j);
            if (coll) {
                if (!(windPressureBlockOcclusionMap[i][j])) {
                    let h = getHumidity(i, j);
                    if (h > 1) {
                        setWaterSaturation(i, j, 0.8 / h)
                    }
                }
            }
            windPressureBlockOcclusionMap[i][j] = coll;
            let pressure = Math.floor(windPressureMap[i][j]);
            if (!(pressure in windPressureMapByPressure)) {
                windPressureMapByPressure[pressure] = new Array();
            }
            windPressureMapByPressure[pressure].push([i, j]);
        }
    }
    let windPressureMapKeys = Array.from(Object.keys(windPressureMapByPressure)).sort((a, b) => b - a);
    windPressureMapKeys
        .filter((pressure) => pressure > 0)
        .forEach((pressure) => {
            let pressureLocations = windPressureMapByPressure[pressure];
            pressureLocations
                .forEach((pl) => {
                    let x = pl[0];
                    let y = pl[1];
                    if (isWindSquareBlocked(x, y)) {
                        return;
                    }
                    let throttleVal = getWindThrottleValWindMap(x, y);
                    if (throttleVal < 0) {
                        return;
                    }
                    let start = windPressureMap[x][y]; 
                    getWindDirectNeighbors(x, y)
                        .filter((spl) => isPointInBounds(spl[0], spl[1]))
                        .forEach((spl) => {
                            let x2 = spl[0];
                            let y2 = spl[1];

                            if (isWindSquareBlocked(x2, y2)) {
                                return;
                            }
                        
                            let plPressure = windPressureMap[x][y]
                            let splPressure = windPressureMap[x2][y2];
                        
                            let plTemp = getTemperatureAtWindSquare(x, y);
                            let splTemp = getTemperatureAtWindSquare(x2, y2);

                            let windPressureDiff = getExpectedPressureDifferential(x, y, x2, y2);
                            if (windPressureDiff == 0) {
                                return;
                            }

                            let plEnergyLost = windPressureDiff * plTemp;
                            let startSplEnergy = splPressure * splTemp;
                            let endSplEnergy = startSplEnergy + plEnergyLost;
                            let endSplTemp = endSplEnergy / (splPressure + windPressureDiff);
                            // only spl has a change in temperature 
                            // since we are flowing from pl to spl

                            // if (Math.abs(plTemp - splTemp) > 1) 
                            //     console.log(x2, y2, splTemp, endSplTemp);
                            updateWindSquareTemperature(x2, y2, endSplTemp);

                            let plWaterPressure = getWaterSaturation(x, y);
                            let splWaterPressure = getWaterSaturation(x2, y2);

                            let plWaterPascalsLost = (windPressureDiff / plPressure) * plWaterPressure;
                            let splWaterPascalsLost = (windPressureDiff / splPressure) * splWaterPressure;
                            
                            let waterPascalsLost;
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
                    
                    let end = windPressureMap[x][y]; 
                    registerWindThrottlerOutput(x, y, start, end);

                });
        });
};

function getExpectedPressureDifferential(x, y, x2, y2) {
    if (!isPointInBounds(x, y) || !isPointInBounds(x2, y2) || isWindSquareBlocked(x, y) || isWindSquareBlocked(x2, y2)) {
        return 0;
    }
    let plPressure = windPressureMap[x][y];
    let splPressure = windPressureMap[x2][y2];
    // now, process plPressure and splPressure
    let plDensity = getAirSquareDensityTempAndHumidity(x, y);
    let splDensity = getAirSquareDensityTempAndHumidity(x2, y2);

    let plPressureProcessed = plPressure * plDensity;
    let splPressureProcessed = splPressure * splDensity;

    let y2_relY = y2 - y;
    let expectedPressureDiff = 0;

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
    for (let i = getFrameXMinWsq(); i < getFrameXMaxWsq(); i++) {
        for (let j = getFrameYMinWsq(); j < getFrameYMaxWsq(); j++) {
            let p = getPressure(i, j) / getBaseAirPressureAtYPosition(j);  
            let s = _getWindSpeedAtLocation(i, j);


            let sLen = (s[0] ** 2 + s[1] ** 2) ** 0.5;
            let maxSLen = 2;

            if (sLen > maxSLen) {
                s[0] *= maxSLen / sLen;
                s[1] *= maxSLen / sLen;
            }

            let pressure_255 = (p - 1) * 12200;

            MAIN_CONTEXT.fillStyle = rgbToRgba(255 - pressure_255, 255 - pressure_255, 255 - pressure_255, .3);
            zoomCanvasFillRectTheta(
                4 * i * getBaseSize(),
                4 * j * getBaseSize(),
                4 * getBaseSize(),
                4 * getBaseSize(),
                2,
                2,
                0
            );

            if ((i * j) % 32 != 0) {
                continue;
            }

            let startX = 4 * (i + getFrameXMinWsq()) * getBaseSize();
            let startY = 4 * (j + getFrameYMinWsq()) * getBaseSize();

            MAIN_CONTEXT.beginPath();
            MAIN_CONTEXT.lineWidth = 1;
            MAIN_CONTEXT.moveTo(startX, startY);
            MAIN_CONTEXT.lineTo(startX + s[0] * 30, startY + s[1] * 30);
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
    let netPresX = 0;
    let netPresY = 0;

    netPresX = getExpectedPressureDifferential(x, y, x + 1, y) - getExpectedPressureDifferential(x, y, x - 1, y)
    netPresY = getExpectedPressureDifferential(x, y, x, y + 1) - getExpectedPressureDifferential(x, y, x, y - 1)

    netPresX = (netPresX > 0 ? 1 : -1) * windSpeedFromPressure(Math.abs(netPresX), windPressureMap[x][y]);
    netPresY = (netPresY > 0 ? 1 : -1) * windSpeedFromPressure(Math.abs(netPresY), windPressureMap[x][y]);

    netPresX /= 10;
    netPresY /= 10;

    let previousSpeeds = windSpeedSmoothingMap[x][y];
    if (previousSpeeds.length == 0) {
        previousSpeeds.push([netPresX, netPresY]);
        return [netPresX, netPresY]
    }

    let previousSumX = 0;
    let previousSumY = 0;

    previousSpeeds.forEach((sp) => {
        previousSumX += sp[0];
        previousSumY += sp[1];
    });

    let previousAvgX = previousSumX / previousSpeeds.length;
    let previousAvgY = previousSumY / previousSpeeds.length;

    //  √(2 * 100 Pa / 1.225 kg/m³)

    previousSpeeds.push([netPresX, netPresY]);

    if (previousSpeeds.length > 5) {
        previousSpeeds.shift(1);
    }

    let coef = 0.8;

    if (isNaN(previousAvgX * coef + netPresX * (1 - coef))) {
        console.warn("FUCK 408");
    }

    return [previousAvgX * coef + netPresX * (1 - coef), previousAvgY * coef + netPresY * (1 - coef)];
}

function windSpeedFromPressure(pascals, sourcePressure) {
    return (2 * pascals / (1.225 * sourcePressure / base_wind_pressure)) ** 0.5;

}

export function getWindPressureSquareDensity(x, y) {
    let p = getPressure(x, y);
    if (p <= 0) {
        return 1;
    } else {
        return p / getBaseAirPressureAtYPosition(y);
    }
}

export function manipulateWindPressureMaintainHumidityWindSquare(x, y, target) {
    if (!isPointInBounds(x, y)) {
        return;
    }
    let start = windPressureMap[x][y];
    windPressureMap[x][y] = Math.max(getBaseAirPressureAtYPosition(y) * 0.5, target);
    windPressureMap[x][y] = Math.min(getBaseAirPressureAtYPosition(y) * 100, target);
    let end = windPressureMap[x][y];
    setWaterSaturation(x, y, getWaterSaturation(x, y) * (end / start));
}

export function manipulateWindPressureMaintainHumidityBlockSquare(posX, posY, amount) {
    let x = Math.floor(posX / 4);
    let y = Math.floor(posY / 4);
    let start = windPressureMap[x][y];
    if (start <= 0) {
        return;
    }
    let pascals = start * amount;
    manipulateWindPressureMaintainHumidityWindSquare(x, y, windPressureMap[x][y] + pascals);
}

export function addWindPressureDryAir(posX, posY, amount) {
    let x = Math.floor(posX / 4);
    let y = Math.floor(posY / 4);
    if (isWindSquareBlocked(x, y)) {
        return;
    }
    let pascals = getBaseAirPressureAtYPosition(y) * amount;
    let target = windPressureMap[x][y] + pascals;
    windPressureMap[x][y] = Math.max(getBaseAirPressureAtYPosition(y) * 1, target);
    windPressureMap[x][y] = Math.min(getBaseAirPressureAtYPosition(y) * 100, target);
}

export function addWindPerssureMaintainHumidity(posX, posY, amount) {
    manipulateWindPressureMaintainHumidityBlockSquare(posX, posY, amount);
}

export function addWindPressureCloud(posX, posY, amount, cloud) {
    addWindPressureDryAir(posX, posY, amount);
    let x = Math.floor(posX / 4);
    let y = Math.floor(posY / 4);
    if (isWindSquareBlocked(x, y)) {
        return;
    }
    let curHumidity = getHumidity(x, y);
    let targetHumidity = cloud;
    let curWaterPascals = getWaterSaturation(x, y);
    setWaterSaturation(x, y, (curWaterPascals * (targetHumidity / curHumidity)));
}

export function addWindPressureDryAirWindSquare(wx, wy, pascals) {
    let start = windPressureMap[wx][wy];
    if (start <= 0) {
        return;
    }
    let target = windPressureMap[wx][wy] + pascals;
    windPressureMap[wx][wy] = target;
    windPressureMap[wx][wy] = Math.max(getBaseAirPressureAtYPosition(wy) * 0.5, windPressureMap[wx][wy]);
    windPressureMap[wx][wy] = Math.min(getBaseAirPressureAtYPosition(wy) * 100, windPressureMap[wx][wy]);
}

function updateWindPressureByMult(x, y, m) {
    windPressureMap[x][y] *= m;
}

function isPointInBounds(x, y) {
    return x >= 0 && x < curWindSquaresX && y >= 0 && y < curWindSquaresY;
}

initWindPressure();

export { getWindSquareAbove, setPressurebyMult, getPressure, getAirSquareDensity, getWindSpeedAtLocation, renderWindPressureMap, initWindPressure, tickWindPressureMap, updateWindPressureByMult, getAirSquareDensityTempAndHumidity, base_wind_pressure }