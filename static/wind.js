import { rgbToHex, rgbToRgba } from "./common.js";
import { getSquares } from "./squares/_sqOperations.js";
import { MAIN_CONTEXT, CANVAS_SQUARES_X, CANVAS_SQUARES_Y, BASE_SIZE } from "./index.js";

var wpm;
var windPressureMapByPressure;

var windFlowStrength = 0.5;

function gp(x, y) {
    if (isNaN(x) || isNaN(y)) {
        return 0;
    }
    x = (Math.floor(x) + CANVAS_SQUARES_X) % CANVAS_SQUARES_X;
    y = (Math.floor(y) + CANVAS_SQUARES_Y) % CANVAS_SQUARES_Y;
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

function initializeWindPressureMap() {
    wpm = new Map();
    windPressureMapByPressure = new Map();

    var start_pressure = 100;
    windPressureMapByPressure[start_pressure] = new Array();
    for (let i = 0; i < CANVAS_SQUARES_X; i++) {
        for (let j = 0; j < CANVAS_SQUARES_Y; j++) {
            if (!(i in wpm)) {
                wpm[i] = new Map();
            }
            if (false && getSquares(i, j).some((sq) => (!sq.surface) && sq.collision)) {
                wpm[i][j] = -1;
            } else {
                wpm[i][j] = start_pressure;
                windPressureMapByPressure[start_pressure].push([i, j]);
            }
        }
    }
}

function tickWindPressureMap() {
    windPressureMapByPressure = new Map();
    for (let i = 0; i < CANVAS_SQUARES_X; i++) {
        for (let j = 0; j < CANVAS_SQUARES_Y; j++) {
            if (getSquares(i, j).some((sq) => sq.collision)) {
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
                        wpm[i][j] = 100;
                    }
                }
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
                        var x = (spl[0] + CANVAS_SQUARES_X) % CANVAS_SQUARES_X;
                        var y = (spl[1] + CANVAS_SQUARES_Y) % CANVAS_SQUARES_Y;
                        if (pl[0] == 0 || pl[0] == CANVAS_SQUARES_X || pl[1] == 0 || pl[1] == CANVAS_SQUARES_Y) {
                            wpm[x][y] = 100;
                        }
                        var plPressure = wpm[pl[0]][pl[1]];
                        var splPressure = wpm[x][y];

                        var windPressureDiff = getWindPressureDiff(plPressure, splPressure);
                        wpm[pl[0]][pl[1]] -= windPressureDiff;
                        wpm[x][y] += windPressureDiff;
                });
        });
    });
}

function renderWindPressureMap() {
    for (let i = 0; i < CANVAS_SQUARES_X; i++) {
        for (let j = 0; j < CANVAS_SQUARES_Y; j++) {
            var p = gp(i, j);
            var s = getWindSpeedAtLocation(i, j);

            MAIN_CONTEXT.fillStyle = rgbToRgba(p, p, p, .2);
            MAIN_CONTEXT.fillRect(
                i * BASE_SIZE,
                j * BASE_SIZE,
                BASE_SIZE,
                BASE_SIZE
            );

            if ((i * j) % 32 != 0) {
                continue;
            }

            var startX = i * BASE_SIZE;
            var startY = j * BASE_SIZE;

            MAIN_CONTEXT.beginPath();
            MAIN_CONTEXT.lineWidth = 0.1;
            MAIN_CONTEXT.moveTo (startX, startY);
            MAIN_CONTEXT.lineTo (startX + s[0], startY + s[1]);
            MAIN_CONTEXT.stroke();
            MAIN_CONTEXT.closePath();


        }
    }
}


function getWindSpeedAtLocation(x, y) {
    if (gp(x, y) < 0) {
        return [0, 0];
    }
    var netPresX = 0;
    var netPresY = 0; 
    if (gp(x - 1, y) >= 0)
        netPresX -= (gp(x, y) - gp(x - 1, y));
    if (gp(x + 1, y) >= 0)
        netPresX += (gp(x, y) - gp(x + 1, y));
    if (gp(x, y - 1) >= 0)
        netPresY -= (gp(x, y) - gp(x, y - 1));
    if (gp(x, y + 1) >= 0)
        netPresY += (gp(x, y) - gp(x, y + 1));

    return [netPresX, netPresY]
}

function getWindDirectNeighbors(x, y) {
    return [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1]
    ]
}

var delta = 50;

function addWindPressure(x, y) {
    x = (Math.floor(x) + CANVAS_SQUARES_X) % CANVAS_SQUARES_X;
    y = (Math.floor(y) + CANVAS_SQUARES_Y) % CANVAS_SQUARES_Y;
    wpm[Math.floor(x)][Math.floor(y)] += delta;

    getWindDirectNeighbors(x, y).forEach(
        (loc) => wpm[(loc[0] + CANVAS_SQUARES_X) % CANVAS_SQUARES_X][(loc[1] + CANVAS_SQUARES_Y) % CANVAS_SQUARES_Y] += delta);
        
}

function removeWindPressure(x, y) {
    x = (Math.floor(x) + CANVAS_SQUARES_X) % CANVAS_SQUARES_X;
    y = (Math.floor(y) + CANVAS_SQUARES_Y) % CANVAS_SQUARES_Y;
    wpm[Math.floor(x)][Math.floor(y)] = Math.max(0, wpm[Math.floor(x)][Math.floor(y)] + delta);
    getWindDirectNeighbors(x, y).forEach(
        (loc) => wpm[(loc[0] + CANVAS_SQUARES_X) % CANVAS_SQUARES_X][(loc[1] + CANVAS_SQUARES_Y) % CANVAS_SQUARES_Y] = Math.max(0, wpm[(loc[0] + CANVAS_SQUARES_X) % CANVAS_SQUARES_X][(loc[1] + CANVAS_SQUARES_Y) % CANVAS_SQUARES_Y] - delta));
}


export { getWindSpeedAtLocation, renderWindPressureMap, initializeWindPressureMap, tickWindPressureMap, addWindPressure, removeWindPressure }