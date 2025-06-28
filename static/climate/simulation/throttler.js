import { getBaseSize, zoomCanvasFillRectTheta } from "../../canvas.js";
import { rgbToRgba } from "../../common.js";
import { MAIN_CONTEXT } from "../../index.js";
import { getFrameXMaxWsq, getFrameXMinWsq, getFrameYMaxWsq, getFrameYMinWsq, getWindSquaresX, getWindSquaresY, getWindThrottleValWindMap, getWindThrottleValWindMapVal } from "./wind.js";

let windThrottleMap = new Map();
let maxDiff = 0.001;
let rollPeriod = 2;

export function initWindThrottleMap() {
    windThrottleMap.clear;
    for (let i = 0; i < getWindSquaresX(); i++) {
        windThrottleMap.set(i, new Map());
        for (let j = 0; j < getWindSquaresY(); j++) {
            windThrottleMap.get(i).set(j, 0.1);
        }
    }
};

export function registerWindThrottlerOutput(x, y, start, end) {
    let diff = Math.abs((end - start) / end);
    diff = Math.min(diff, maxDiff);
    let p = diff / maxDiff;
    let cur = windThrottleMap.get(x).get(y);
    cur = Math.max(0.05, (cur * (rollPeriod - 1) + p) / rollPeriod);
    windThrottleMap.get(x).set(y, cur);
}

export function getWindThrottleVal(x, y) {
    let p = windThrottleMap.get(x).get(y);
    if (Math.random() < p) {
        return (1 / p);
    } else {
        return -1;
    }
}

export function renderThrottleMap() {
    for (let i = getFrameXMinWsq(); i < getFrameXMaxWsq(); i++) {
        for (let j = getFrameYMinWsq(); j < getFrameYMaxWsq(); j++) {
            let pressure_255 = getWindThrottleValWindMapVal(i, j) * 200;
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
        }
    }
}