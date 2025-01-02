import { rgbToHex, rgbToRgba } from "./common.js";
import { getSquares } from "./squares/_sqOperations.js";
import { MAIN_CONTEXT, CANVAS_SQUARES_X, CANVAS_SQUARES_Y, BASE_SIZE } from "./index.js";

var wpm;
var windPressureMapByPressure;

var windFlowStrength = 0.5;


function gp(x, y) {
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
            if (getSquares(i, j).some((sq) => sq.collision)) {
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
                wpm[i][j] = Math.max(0, wpm[i][j]);
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
                        var plPressure = wpm[pl[0]][pl[1]];
                        var splPressure = wpm[x][y];
                        var windPressureDiff = getWindPressureDiff(plPressure, splPressure);
                        wpm[pl[0]][pl[1]] -= windPressureDiff;
                        wpm[x][y] += windPressureDiff;
                });
        });

        pressureLocations
        .forEach((pl) => {
            getWindIndirectNeighbors(pl[0], pl[1])
                .forEach((spl) => {
                    var x = (spl[0] + CANVAS_SQUARES_X) % CANVAS_SQUARES_X;
                    var y = (spl[1] + CANVAS_SQUARES_Y) % CANVAS_SQUARES_Y;
                    var plPressure = wpm[pl[0]][pl[1]];
                    var splPressure = wpm[x][y];
                    var windPressureDiff = getWindPressureDiff(plPressure, splPressure) / 2 ** 0.5;
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
            MAIN_CONTEXT.fillStyle = rgbToRgba(p, p, p, 0.5);
            MAIN_CONTEXT.fillRect(
                i * BASE_SIZE,
                j * BASE_SIZE,
                BASE_SIZE,
                BASE_SIZE
            );
        }
    }
}


function getWindSpeedAtLocation(x, y) {
    var netPresX = 0;
    var netPresY = 0; 
    
    netPresX -= (gp(x, y) - gp(x - 1, y));
    netPresX += (gp(x, y) - gp(x + 1, y));

    netPresY -= (gp(x, y) - gp(x, y - 1));
    netPresY += (gp(x, y) - gp(x, y + 1));

    return [Math.floor(netPresX), Math.floor(netPresY)];
}

function getWindDirectNeighbors(x, y) {
    return [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1]
    ]
}

function addWindPressure(x, y) {
    x = Math.floor(x);
    y = Math.floor(y);
    wpm[Math.floor(x)][Math.floor(y)] += 300;

    getWindDirectNeighbors(x, y).forEach(
        (loc) => wpm[(loc[0] + CANVAS_SQUARES_X) % CANVAS_SQUARES_X][(loc[1] + CANVAS_SQUARES_Y) % CANVAS_SQUARES_Y] += 300);
        
}

function removeWindPressure(x, y) {
    x = Math.floor(x);
    y = Math.floor(y);
    wpm[Math.floor(x)][Math.floor(y)] -= 300;

    getWindDirectNeighbors(x, y).forEach(
        (loc) => wpm[(loc[0] + CANVAS_SQUARES_X) % CANVAS_SQUARES_X][(loc[1] + CANVAS_SQUARES_Y) % CANVAS_SQUARES_Y] -= 300);
        
}

function getWindIndirectNeighbors(x, y) {
    return [
        [x - 1, y - 1],
        [x + 1, y + 1],
        [x + 1, y - 1],
        [x - 1, y + 1]
    ]
}


export { renderWindPressureMap, initializeWindPressureMap, tickWindPressureMap, addWindPressure, removeWindPressure }