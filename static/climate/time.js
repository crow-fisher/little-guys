import { getBaseSize, getCanvasSquaresX, getCanvasSquaresY, getFrameXMax, getFrameXMin, getFrameYMax, getFrameYMin, isSquareOnCanvas, zoomCanvasFillCircle } from "../canvas.js";
import { hexToRgb, hsv2rgb, randNumber, randRange, rgb2hsv, rgbToHex, rgbToRgba } from "../common.js";
import { getTotalCanvasPixelHeight, getTotalCanvasPixelWidth, MAIN_CONTEXT, setBackgroundColor } from "../index.js";
import { calculateColorRGB, getFrameRelCloud } from "./simulation/temperatureHumidity.js";
import {
    loadGD,
    UI_SPEED_1,
    UI_SPEED_2,
    UI_SPEED_3,
    UI_SPEED_4,
    UI_SPEED_5,
    UI_SPEED_6,
    UI_SPEED_7,
    UI_SPEED_8,
    UI_SPEED_9,
    UI_SPEED_10,
    UI_SPEED_11,
    UI_SPEED_12,
    UI_SPEED_13,
    UI_SPEED_14,
    UI_SPEED_15,
    UI_SPEED_16,
    UI_SPEED_17,
    UI_SPEED_18,
    UI_SPEED_19,
    UI_SPEED,
    UI_SPEED_0, saveGD,
    UI_GAME_MAX_CANVAS_SQUARES_X,
    UI_GAME_MAX_CANVAS_SQUARES_Y,
    UI_LIGHTING_SUN,
    addUIFunctionMap
} from "../ui/UIData.js";
import { iterateOnOrganisms } from "../organisms/_orgOperations.js";
import { SunCalc } from "./suncalc/suncalc.js";
import { getActiveClimate } from "./climateManager.js";
import { StarHandler } from "./stars/starHandler.js";

let TIME_SCALE = 1;
let curUIKey = UI_SPEED_1;

export const millis_per_day = 60 * 60 * 24 * 1000;
var curDay = 0.4;
var prevDay = 0;
var prevTime = 0;

let prevRealTime = Date.now();
let dt = 0;
let dtRollingAverage = dt;

export function getFrameDt() {
    return dtRollingAverage;
}

var starMap;
var starColorTemperatureMap;
var starMapCenterX;
var starMapCenterY;
// https://coolors.co/gradient-maker/18254c-5a4d41-a49f67-7e9fb1-84b2e2?position=0,43,53,73,100&opacity=100,100,100,100,100&type=linear&rotation=90
let sky_nightRGB = hexToRgb("#121622");
let sky_duskRGB = hexToRgb("#5A4D41");
let sky_colorEveningMorningRGB = hexToRgb("#A49F67");
let sky_colorNearNoonRGB = hexToRgb("#7E9FB1");
let sky_colorNoonRGB = hexToRgb("#84B2E2");

let currentLightColorTemperature = sky_nightRGB;
let _cdaylightStrength, _prevDaylightStrength, _cmoonlightStrength;
export function setTimeScale(timeScale) {
    seekTimeTarget = 0;
    TIME_SCALE = timeScale;
}

export function getDaylightStrengthFrameDiff() {
    return _cdaylightStrength - _prevDaylightStrength;
}

export function getSeekTimeTarget() {
    return seekTimeTarget;
}

// for time skipping 
let startSeekTime = 0;
let seekTimeTarget = 0;

export function isTimeSeeking() {
    return !(seekTimeTarget == 0);
}

function endTimeSeek() {
    seekTimeTarget = 0;
}

export function doTimeSeek() {
    if (seekTimeTarget == 0) {
        return;
    }
    if (TIME_SCALE <= 1) {
        endTimeSeek();
        return;
    }
    if (getCurDay() > seekTimeTarget) {
        TIME_SCALE -= 1;
        if (TIME_SCALE == 1) {
            endTimeSeek();
        }
        return;
    }
    let dayRemaining = seekTimeTarget - getCurDay();
    let timeRemaining = millis_per_day * (dayRemaining / getCurTimeScale());

    if (timeRemaining < getFrameDt() * 2) {
        TIME_SCALE -= 1;
    } else if (timeRemaining < 500) {
        // do nothing
    } else {
        TIME_SCALE += 1;
    }
    TIME_SCALE = Math.min(TIME_SCALE, 19);
    TIME_SCALE = Math.max(TIME_SCALE, 1);

    switch (TIME_SCALE) {
        case 1:
            saveGD(UI_SPEED, UI_SPEED_1);
            break;
        case 2:
            saveGD(UI_SPEED, UI_SPEED_2);
            break;
        case 3:
            saveGD(UI_SPEED, UI_SPEED_3);
            break;
        case 4:
            saveGD(UI_SPEED, UI_SPEED_4);
            break;
        case 5:
            saveGD(UI_SPEED, UI_SPEED_5);
            break;
        case 6:
            saveGD(UI_SPEED, UI_SPEED_6);
            break;
        case 7:
            saveGD(UI_SPEED, UI_SPEED_7);
            break;
        case 8:
            saveGD(UI_SPEED, UI_SPEED_8);
            break;
        case 9:
            saveGD(UI_SPEED, UI_SPEED_9);
            break;
        case 10:
            saveGD(UI_SPEED, UI_SPEED_10);
            break;
        case 11:
            saveGD(UI_SPEED, UI_SPEED_11);
            break;
        case 12:
            saveGD(UI_SPEED, UI_SPEED_12);
            break;
        case 13:
            saveGD(UI_SPEED, UI_SPEED_13);
            break;
        case 14:
            saveGD(UI_SPEED, UI_SPEED_14);
            break;
        case 15:
            saveGD(UI_SPEED, UI_SPEED_15);
            break;
        case 16:
            saveGD(UI_SPEED, UI_SPEED_16);
            break;
        case 17:
            saveGD(UI_SPEED, UI_SPEED_17);
            break;
        case 18:
            saveGD(UI_SPEED, UI_SPEED_18);
            break;
        case 19:
            saveGD(UI_SPEED, UI_SPEED_19);
            break;
    }
}

// targetTime between 0 and 1

export function explicitSeek(targetDate) {
    seekTimeTarget = targetDate;
    startSeekTime = getCurDay();
    TIME_SCALE = Math.max(TIME_SCALE, 2);
}

export function seek(targetTime) {
    let targetTimeCurDay = Math.floor(getCurDay()) + targetTime;
    TIME_SCALE = 2;
    if (targetTimeCurDay < getCurDay()) {
        seekTimeTarget = targetTimeCurDay + 1;
    } else {
        seekTimeTarget = targetTimeCurDay;
    }
    startSeekTime = getCurDay();
}

export function doTimeSkipToDate(dateName) {
    seekTimeTarget = 0;
    let date = new Date();
    switch (dateName) {
        case "spring":
            date.setMonth(2, 20);
            console.log("bop");
            console.log(date);
            break;
        case "summer":
            date.setMonth(5, 20);
            break;
        case "fall":
            date.setMonth(8, 21);
            break;
        default:
        case "winter":
            date.setMonth(11, 21);
            break;
    }
    setCurDay(Math.floor(date.getTime() / millis_per_day) + (curDay % 1));
    saveGD(UI_SPEED, UI_SPEED_1);

}

export function setCurDay(newCurDay) {
    curDay = newCurDay;
    seekTimeTarget = 0;
}

export function doTimeSkipToNow() {
    setCurDay(Date.now() / millis_per_day);
    saveGD(UI_SPEED, UI_SPEED_1);
    return;
}

function getPrevTime() {
    return prevTime;
}
let starHandler;
function initializeStarMap() {
    starHandler = new StarHandler();
}

export function gsmfc() {
    return starHandler?.frameCache;
}

function _initializeStarMap() {
    starMap = new Map();
    starColorTemperatureMap = new Map();
    let sx = loadGD(UI_GAME_MAX_CANVAS_SQUARES_X);
    let sy = loadGD(UI_GAME_MAX_CANVAS_SQUARES_Y);

    starMapCenterX = randNumber(sx / 4, sx * 0.75);
    starMapCenterY = randNumber(sy / 4, sy * 0.75);

    let numStars = 10000 * (1 + Math.random()) * ((sx / 100) ** 0.1);

    for (let i = 0; i < numStars; i++) {
        let starX = randNumber(-sx * 4, sx * 4);
        let starY = randNumber(-sy * 4, sy * 4);

        let starBrightness = (Math.random() ** 0.7) * 0.3;

        if (!(starMap.has(starX))) {
            starMap.set(starX, new Map());
            starColorTemperatureMap.set(starX, new Map());
        }

        starMap.get(starX).set(starY, starBrightness);
        starColorTemperatureMap.get(starX).set(starY, randRange(0.63, 1));
    }
}

function renderStarMap(brightnessMult) {
    starHandler.render();
    return;
    if (starMap == null) {
        initializeStarMap();
    }

    let frameCloudColor = getFrameRelCloud();
    let frameCloudMult = Math.min(1, ((frameCloudColor.r + frameCloudColor.g + frameCloudColor.b) / (3 * 255) * 20));

    if (getDaylightStrength() > 0.35) {
        return;
    }

    let xKeys = Array.from(starMap.keys());
    for (let i = 0; i < xKeys.length; i++) {
        let yKeys = Array.from(starMap.get(xKeys[i]).keys());
        for (let j = 0; j < yKeys.length; j++) {
            let starX = xKeys[i];
            let starY = yKeys[j];
            let starbrightness = starMap.get(starX).get(starY) * Math.max(brightnessMult, 0);

            let starXRelOrigin = starX - starMapCenterX;
            let starYRelOrigin = starY - starMapCenterY;

            let dayTheta = (getCurDay() % 1) * 2 * Math.PI;

            let rotatedX = starXRelOrigin * Math.cos(dayTheta) - starYRelOrigin * Math.sin(dayTheta);
            let rotatedY = starYRelOrigin * Math.cos(dayTheta) + starXRelOrigin * Math.sin(dayTheta);

            let endX = rotatedX + starMapCenterX;
            let endY = rotatedY + starMapCenterX;

            if (!isSquareOnCanvas(endX, endY))
                continue;

            let r = 0.4;
            let b = (starbrightness) * r + (1) * (1 - r);
            MAIN_CONTEXT.fillStyle = calculateTempColorRgbaNoCache(starColorTemperatureMap.get(starX).get(starY), (b * (1 - frameCloudMult)));
            zoomCanvasFillCircle(
                endX * getBaseSize(),
                endY * getBaseSize(),
                starbrightness * getBaseSize() * (getCanvasSquaresY() / 100)
            );
        }
    }
}


export function getDt() {
    // return Math.min(.00001, curDay - prevDay);
    return Math.min(.000008, curDay - prevDay);
}

export function getCurDay() {
    return curDay;
}

function getPrevDay() {
    return prevDay;
}

export function getCurTimeScaleVal(v) {
    return (2.8 ** (v - 1));
}

export function getCurTimeScale() {
    return getCurTimeScaleVal(TIME_SCALE);
}

export function getTimeScale() {
    return TIME_SCALE;
}

export function timeScaleFactor() {
    return (105 - (Math.min(100, getCurTimeScale())));;
}

function updateTime() {
    if (curUIKey != loadGD(UI_SPEED)) {
        switch (loadGD(UI_SPEED)) {
            case UI_SPEED_0:
                TIME_SCALE = 0;
                break;
            case UI_SPEED_1:
                TIME_SCALE = 1;
                break;
            case UI_SPEED_2:
                TIME_SCALE = 2;
                break;
            case UI_SPEED_3:
                TIME_SCALE = 3;
                break;
            case UI_SPEED_4:
                TIME_SCALE = 4;
                break;
            case UI_SPEED_5:
                TIME_SCALE = 5;
                break;
            case UI_SPEED_6:
                TIME_SCALE = 6;
                break;
            case UI_SPEED_7:
                TIME_SCALE = 7;
                break;
            case UI_SPEED_8:
                TIME_SCALE = 8;
                break;
            case UI_SPEED_9:
                TIME_SCALE = 9;
                break;
            case UI_SPEED_10:
                TIME_SCALE = 10;
                break;
            case UI_SPEED_11:
                TIME_SCALE = 11;
                break;
            case UI_SPEED_12:
                TIME_SCALE = 12;
                break;
            case UI_SPEED_13:
                TIME_SCALE = 13;
                break;
            case UI_SPEED_14:
                TIME_SCALE = 14;
                break;
            case UI_SPEED_15:
                TIME_SCALE = 15;
                break;
            case UI_SPEED_16:
                TIME_SCALE = 16;
                break;
            case UI_SPEED_17:
                TIME_SCALE = 17;
                break;
            case UI_SPEED_18:
                TIME_SCALE = 18;
                break;
            case UI_SPEED_19:
                TIME_SCALE = 19;
                break;
        }
        curUIKey = loadGD(UI_SPEED);
    }

    if (TIME_SCALE == 0) {
        return;
    }
    dt = Date.now() - prevRealTime;
    prevRealTime = Date.now();
    prevDay = curDay;

    if (dtRollingAverage == 0) {
        dtRollingAverage = dt;
    }

    dtRollingAverage = dtRollingAverage * 0.9 + dt * 0.1;

    if (dt < 1000) {
        curDay += dt / (millis_per_day / getCurTimeScale());
        _prevDaylightStrength = _cdaylightStrength;
        _cdaylightStrength = null;
        _cmoonlightStrength = null;
    }
}

export function getSkyBackgroundColorForDay(curDay) {
    // pull out of the shit below and do that there
    let curMillis = curDay * millis_per_day;
    let curDate = new Date(curMillis);
    let nextDate = new Date(curMillis + millis_per_day);
    let prevDate = new Date(curMillis - millis_per_day);

    let prevTimes = SunCalc.getTimes(prevDate, getActiveClimate().lat, getActiveClimate().lng);
    let curTimes = SunCalc.getTimes(curDate, getActiveClimate().lat, getActiveClimate().lng);
    let nextTimes = SunCalc.getTimes(nextDate, getActiveClimate().lat, getActiveClimate().lng);

    let timeColors = {
        dawn: sky_duskRGB,
        sunrise: sky_colorEveningMorningRGB,
        goldenHourEnd: sky_colorNearNoonRGB,
        solarNoon: sky_colorNoonRGB,
        goldenHour: sky_colorNearNoonRGB,
        sunsetStart: sky_colorEveningMorningRGB,
        dusk: sky_duskRGB,
        night: sky_nightRGB
    }
    let timesArr = new Array();

    [prevTimes, curTimes, nextTimes].forEach((times) => Object.keys(timeColors).forEach((key) => {
        timesArr.push([times[key], timeColors[key], key]);
    }));

    timesArr.sort((a, b) => a[0].getTime() - b[0].getTime());

    // let minColor, maxColor, min, max, starBrightness;
    let idx = timesArr.findIndex((arr) => curDate < arr[0]);
    let minArr = timesArr[idx - 1];
    let maxArr = timesArr[idx];
    let min = minArr[0];
    let max = maxArr[0];
    let minColor = minArr[1];
    let maxColor = maxArr[1];
    let processedColor = calculateColorRGB(curDate.getTime(), min.getTime(), max.getTime(), minColor, maxColor);

    let frameCloudColor = getFrameRelCloud();
    let frameCloudMult = Math.min(1, (frameCloudColor.r + frameCloudColor.g + frameCloudColor.b) / (3 * 255) * 5);

    let processedColorHsv = rgb2hsv(processedColor.r, processedColor.g, processedColor.b);
    processedColorHsv[1] *= (1 - frameCloudMult);

    let processedColorRGBArr = hsv2rgb(processedColorHsv[0], processedColorHsv[1], processedColorHsv[2]);

    processedColor.r = processedColorRGBArr[0] - (frameCloudColor.r)
    processedColor.g = processedColorRGBArr[1] - (frameCloudColor.g)
    processedColor.b = processedColorRGBArr[2] - (frameCloudColor.b)

    return rgbToRgba(Math.floor(processedColor.r), Math.floor(processedColor.g), Math.floor(processedColor.b), 1);
}

function renderSkyBackground() {
    let curDay = getCurDay();
    let processedColorRgba = getSkyBackgroundColorForDay(curDay);
    MAIN_CONTEXT.fillStyle = processedColorRgba;
    setBackgroundColor(processedColorRgba);

    MAIN_CONTEXT.fillRect(
        0,
        0,
        getTotalCanvasPixelWidth(),
        getTotalCanvasPixelHeight()
    );

    renderStarMap(Math.min(1, Math.exp(-7 * getDaylightStrength())));
}

export function getMoonlightStrength() {
    if (_cmoonlightStrength != null) {
        return _cmoonlightStrength;
    }
    let curDay = getCurDay();
    let curDate = new Date(curDay * millis_per_day);
    let moonData = SunCalc.getMoonIllumination(curDate);
    return moonData.fraction;
}


function getDaylightStrength() {
    if (_cdaylightStrength != null) {
        return _cdaylightStrength;
    }
    let curDay = getCurDay();
    let curDate = new Date(curDay * millis_per_day);
    let sunData = SunCalc.getPosition(curDate, getActiveClimate().lat, getActiveClimate().lng);
    // console.log(sunData.altitude, Math.sin(sunData.altitude));

    if (sunData.altitude < 0) {
        return 0;
    }
    _cdaylightStrength = Math.sin(sunData.altitude);
    return _cdaylightStrength;
}

function renderTime() {
    MAIN_CONTEXT.fillStyle = calculateTempColorRgbaCache(getDaylightStrength(), 0.35);
    MAIN_CONTEXT.fillRect(
        0,
        0,
        getTotalCanvasPixelWidth(),
        getTotalCanvasPixelHeight()
    );

    renderSkyBackground();
}

export function getCurrentLightColorTemperature() {
    return currentLightColorTemperature;
}

let moonlightColor = calculateTempColor(6599);
moonlightColor.r *= 0.9;
moonlightColor.g *= 0.9;


export function getMoonlightColor() {
    return moonlightColor;
}

export function getMoonlightColorRgb() {
    let rgb = getMoonlightColor();
    return rgbToHex(rgb.r, rgb.b, rgb.b);
}

export function getMoonlightBrightness() {
    return 1;
    let curDay = getCurDay();
    let curMillis = curDay * millis_per_day;
    let curDate = new Date(curMillis);
    let moonTimes = SunCalc.getMoonTimes(curDate, getActiveClimate().lat, getActiveClimate().lng);
    let moonFraction = SunCalc.getMoonIllumination(curDate).fraction;

    if (moonTimes.alwaysUp) {
        return moonFraction;
    }
    if (moonTimes.alwaysDown) {
        return 0;
    } else {
        if (moonTimes.rise < moonTimes.set) {
            if (curDate > moonTimes.rise && curDate < moonTimes.set) {
                return moonFraction;
            } else {
                return 0;
            }
        } else {
            if (curDate > moonTimes.set || curDate > moonTimes.rise) {
                return moonFraction;
            } else {
                return 0;
            }
        }
    }
}

// https://www.researchgate.net/publication/328726901_Real-time_adaptable_and_coherent_rendering_for_outdoor_augmented_reality/download

export function calculateTempColor(temperature) {
    temperature = Math.max(2500, Math.min(temperature, 6500));
    temperature /= 100;

    return {
        r: fbc(temp_red(temperature)),
        g: fbc(temp_green(temperature)),
        b: fbc(temp_blue(temperature))
    };
}

let tempColorRgbaMap = new Map();
let tempColorRgbMap = new Map();

function calculateTempColorRgbaCache(daylightStrength, opacity) {
    let temperature = Math.floor(daylightStrength * 6600);
    if (temperature in tempColorRgbaMap) {
        currentLightColorTemperature = tempColorRgbMap[temperature];
        return tempColorRgbaMap[temperature];
    } else {
        let dc = calculateTempColor(temperature);
        let resColor = {
            r: Math.floor(dc.r * daylightStrength),
            g: Math.floor(dc.g * daylightStrength),
            b: Math.floor(dc.b * daylightStrength),
        }
        tempColorRgbMap[temperature] = resColor;
        tempColorRgbaMap[temperature] = rgbToRgba(resColor.r, resColor.g, resColor.b, opacity);
        currentLightColorTemperature = tempColorRgbMap[temperature];
        return tempColorRgbaMap[temperature];
    }
}


export function tempToColorForStar(temperature) {
    let dc = calculateTempColor(temperature);
    return [dc.r, dc.g, dc.b];
}


export function calculateTempColorRgbaNoCache(daylightStrength, opacity) {
    let temperature = Math.floor(daylightStrength * 6600);
    let dc = calculateTempColor(temperature);
    let resColor = {
        r: Math.floor(dc.r * daylightStrength),
        g: Math.floor(dc.g * daylightStrength),
        b: Math.floor(dc.b * daylightStrength),
    }
    return rgbToRgba(resColor.r, resColor.g, resColor.b, opacity);
}

// "floor bound color"
export function fbc(v) {
    return Math.min(v, Math.max(v, 0, 255));
}

function temp_red(temperature) {
    let red;
    if (temperature < 66) {
        red = 255;
    } else {
        red = temperature - 60;
        red = 329.698727446 * (red ** (-0.1332047592))
    }
    return red;
}

function temp_green(temperature) {
    let green = 0;
    if (temperature < 66) {
        green = temperature;
        green = 99.4708 * Math.log(green) - 161.1195;
    } else {
        green = temperature - 60;
        green = 288.122169 * (green ** (-.0755));
    }
    return green;
}

function temp_blue(temperature) {
    let blue = 0;
    if (temperature > 66) {
        blue = 255;
    } else if (temperature <= 19) {
        blue = 0;
    } else {
        blue = temperature - 10;
        blue = 138.517 * Math.log(blue) - 305.0447;
    }
    return blue;
}


export { getDaylightStrength, getPrevDay, getPrevTime, updateTime, renderTime, initializeStarMap }
