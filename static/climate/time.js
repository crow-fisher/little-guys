import { getBaseSize, getCanvasSquaresX, getCanvasSquaresY, zoomCanvasFillCircle, zoomCanvasFillRectTheta } from "../canvas.js";
import { hexToRgb, hsv2rgb, randNumber, randRange, rgb2hsv, rgbToRgba } from "../common.js";
import { getTotalCanvasPixelHeight, getTotalCanvasPixelWidth, MAIN_CONTEXT, setBackgroundColor } from "../index.js";
import { calculateColorRGB, getFrameRelCloud } from "./temperatureHumidity.js";
import { zoomCanvasFillRect } from "../canvas.js";
import {
    loadGD, UI_SPEED_1, UI_SPEED_2, UI_SPEED_3,
    UI_SPEED_4,
    UI_SPEED_5,
    UI_SPEED_6,
    UI_SPEED_7,
    UI_SPEED_8,
    UI_SPEED_9,
    UI_SPEED,
    UI_SPEED_0,
    UI_LIGHTING_SUN,
    UI_LIGHTING_MOON,
    saveGD
} from "../ui/UIData.js";
import { iterateOnOrganisms } from "../organisms/_orgOperations.js";

let TIME_SCALE = 1;
let curUIKey = UI_SPEED_1;

export let millis_per_day = 60 * 60 * 24 * 1000;
var curDay = 0.4;
var prevDay = 0;
var curTime = 0.8;
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
let _cdaylightStrength, _prevDaylightStrength;
export function setTimeScale(timeScale) {
    seekTimeTarget = 0;
    TIME_SCALE = timeScale;
}

export function getDaylightStrengthFrameDiff() {
    return _cdaylightStrength - _prevDaylightStrength;
}

// for time skipping 
let startSeekTime = 0;
let seekTimeTarget = 0;

export function isTimeSeeking() {
    return !(seekTimeTarget == 0);
}

function endTimeSeek() {
    iterateOnOrganisms((org) => org.curLifeTimeOffset += (seekTimeTarget - startSeekTime))
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
    TIME_SCALE = Math.min(TIME_SCALE, 9);
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
    }
}

// targetTime between 0 and 1
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

export function doTimeSkipToNow() {
    let nowLocalTimeMillis = Date.now() - new Date().getTimezoneOffset() * 60000;
    let timeOffset = (nowLocalTimeMillis % millis_per_day) / millis_per_day;
    let start = curDay;
    curDay = (nowLocalTimeMillis / millis_per_day - timeOffset) + (start % 1);
    if (curTime > timeOffset) {
        curDay -= 1;
    }
    iterateOnOrganisms((org) => org.curLifeTimeOffset += (curDay - start))
    seek(timeOffset);
}

function getPrevTime() {
    return prevTime;
}

function initializeStarMap() {
    starMap = new Map();
    starColorTemperatureMap = new Map();
    starMapCenterX = randNumber(getCanvasSquaresX() / 4, getCanvasSquaresX() * 0.75);
    starMapCenterY = randNumber(getCanvasSquaresY() / 4, getCanvasSquaresY() * 0.75);

    let numStars = randNumber(22000, 33000) * ((getCanvasSquaresY() / 100) ** 0.1);

    for (let i = 0; i < numStars; i++) {
        let starX = randNumber(-getCanvasSquaresX() * 4, getCanvasSquaresX() * 4);
        let starY = randNumber(-getCanvasSquaresY() * 4, getCanvasSquaresY() * 4);
        let starBrightness = (Math.random() ** 0.7) * 0.3;

        if (!(starX in starMap)) {
            starMap[starX] = new Map();
            starColorTemperatureMap[starX] = new Map();
        }
        starMap[starX][starY] = starBrightness;
        starColorTemperatureMap[starX][starY] = randRange(0.63, 1);
    }
}

function renderStarMap(brightnessMult) {
    if (starMap == null) {
        initializeStarMap();
    }

    let frameCloudColor = getFrameRelCloud();
    let frameCloudMult = Math.min(1, ((frameCloudColor.r + frameCloudColor.g + frameCloudColor.b) / (3 * 255) * 20));

    if (getDaylightStrength() > 0.85) {
        return;
    }

    let xKeys = Array.from(Object.keys(starMap));
    for (let i = 0; i < xKeys.length; i++) {
        let yKeys = Array.from(Object.keys(starMap[xKeys[i]]));
        for (let j = 0; j < yKeys.length; j++) {
            let starX = xKeys[i];
            let starY = yKeys[j];
            let starbrightness = starMap[starX][starY] * Math.max(brightnessMult, 0);

            let starXRelOrigin = starX - starMapCenterX;
            let starYRelOrigin = starY - starMapCenterY;

            let dayTheta = (getCurDay() % 1) * 2 * Math.PI;

            let rotatedX = starXRelOrigin * Math.cos(dayTheta) - starYRelOrigin * Math.sin(dayTheta);
            let rotatedY = starYRelOrigin * Math.cos(dayTheta) + starXRelOrigin * Math.sin(dayTheta);

            let endX = rotatedX + starMapCenterX;
            let endY = rotatedY + starMapCenterX;

            if (endX < 0 || endY < 0) {
                continue;
            }
            if (endX > getCanvasSquaresX() || endY > getCanvasSquaresY()) {
                continue;
            }

            let r = 0.4;
            let b = (starbrightness) * r + (1) * (1 - r);
            MAIN_CONTEXT.fillStyle = calculateTempColorRgbaNoCache(starColorTemperatureMap[starX][starY], (b * (1 - frameCloudMult)));
            zoomCanvasFillCircle(
                endX * getBaseSize(),
                endY * getBaseSize(),
                starbrightness * getBaseSize() * (getCanvasSquaresY() / 100)
            );
        }
    }
}


export function getDt() {
    return curDay - prevDay;
}

export function getCurDay() {
    return curDay;
}

export function setCurDay(newCurDay) {
    curDay = newCurDay;
}

function getPrevDay() {
    return prevDay;
}

function getCurTime() {
    return curTime;
}

export function getCurTimeScale() {
    return (3.5 ** (TIME_SCALE - 1));
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
            default:
                TIME_SCALE = 1;
                break;
        }
        curUIKey = loadGD(UI_SPEED);
    }

    if (TIME_SCALE == 0) {
        return;
    }
    dt = Date.now() - prevRealTime;
    if (dtRollingAverage == 0) {
        dtRollingAverage = dt;
    } else if (document.hasFocus()) {
        dtRollingAverage *= 0.99;
        dtRollingAverage += .01 * dt;
    }
    if (dt > 10000) {
        prevRealTime = Date.now();
        dtRollingAverage = 0;
        dt = 100;
    } else {
        prevTime = curTime;
        prevDay = curDay;
        curTime += dt;
        curDay += dt / (millis_per_day / getCurTimeScale());
        prevRealTime = Date.now();
        _prevDaylightStrength = _cdaylightStrength;
        _cdaylightStrength = null;
    }
}

function renderSkyBackground(time) {
    let processed = Math.max(0, (1 - Math.abs(0.5 - time) * 2) * 2.5 - 1)
    let minColor, maxColor, min, max, starBrightness;

    let duskEnd = 0.2;
    let morningEnd = 0.5;
    let nearNoon = 0.8;
    let noon = 1.5;

    if (processed < duskEnd) {
        minColor = sky_nightRGB;
        maxColor = sky_duskRGB;
        min = 0;
        max = duskEnd;
    } else if (processed < morningEnd) {
        minColor = sky_duskRGB;
        maxColor = sky_colorEveningMorningRGB;
        min = duskEnd;
        max = morningEnd;
        starBrightness = 1 - ((processed - min) / (max - min));
    } else if (processed < nearNoon) {
        minColor = sky_colorEveningMorningRGB;
        maxColor = sky_colorNearNoonRGB;
        min = morningEnd;
        max = nearNoon;
    } else {
        minColor = sky_colorNearNoonRGB
        maxColor = sky_colorNoonRGB;
        min = nearNoon;
        max = noon;
    }
    let processedColor = calculateColorRGB(processed, min, max, minColor, maxColor);
    let frameCloudColor = getFrameRelCloud();
    let frameCloudMult = Math.min(1, (frameCloudColor.r + frameCloudColor.g + frameCloudColor.b) / (3 * 255) * 5);

    let processedColorHsv = rgb2hsv(processedColor.r, processedColor.g, processedColor.b);
    processedColorHsv[1] *= (1 - frameCloudMult);

    let processedColorRGBArr = hsv2rgb(processedColorHsv[0], processedColorHsv[1], processedColorHsv[2]);

    processedColor.r = processedColorRGBArr[0] - (frameCloudColor.r)
    processedColor.g = processedColorRGBArr[1] - (frameCloudColor.g)
    processedColor.b = processedColorRGBArr[2] - (frameCloudColor.b)

    let processedColorRgba = rgbToRgba(Math.floor(processedColor.r), Math.floor(processedColor.g), Math.floor(processedColor.b), 1);
    MAIN_CONTEXT.fillStyle = processedColorRgba;
    setBackgroundColor(processedColorRgba);

    MAIN_CONTEXT.fillRect(
        0,
        0,
        getTotalCanvasPixelWidth(),
        getTotalCanvasPixelHeight()
    );

    renderStarMap(1 - getDaylightStrength());
}

function getDaylightStrength() {
    if (_cdaylightStrength == null) {
        _cdaylightStrength = _getDaylightStrength();
    };
    return _cdaylightStrength;
}

function _getDaylightStrength() {
    let currentTime = getCurDay() % 1;

    let darkness = 0.05;
    if (currentTime < 0.25 || currentTime > 0.75) {
        return darkness;
    }
    return darkness + (Math.sin(currentTime * 2 * Math.PI - (Math.PI / 2)) ** 0.35) * (1 - darkness);
}

function renderTime() {
    // 0.5 is noon, 0.25 is sunrise, 0.75 is sunset
    let daylightStrength = 0;
    let currentTime = getCurDay() % 1;

    if (currentTime > 0.25 && currentTime < 0.75) {
        daylightStrength = getDaylightStrength();
    }

    MAIN_CONTEXT.fillStyle = calculateTempColorRgbaCache(daylightStrength, 0.35);
    MAIN_CONTEXT.fillRect(
        0,
        0,
        getTotalCanvasPixelWidth(),
        getTotalCanvasPixelHeight()
    );

    renderSkyBackground(currentTime);
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

// https://www.researchgate.net/publication/328726901_Real-time_adaptable_and_coherent_rendering_for_outdoor_augmented_reality/download

function calculateTempColor(temperature) {
    temperature /= 100;
    temperature = Math.max(10, temperature);
    return {
        r: temp_red(temperature),
        g: temp_green(temperature),
        b: temp_blue(temperature)
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

function calculateTempColorRgbaNoCache(daylightStrength, opacity) {
    let temperature = Math.floor(daylightStrength * 6600);
    let dc = calculateTempColor(temperature);
    let resColor = {
        r: Math.floor(dc.r * daylightStrength),
        g: Math.floor(dc.g * daylightStrength),
        b: Math.floor(dc.b * daylightStrength),
    }
    return rgbToRgba(resColor.r, resColor.g, resColor.b, opacity);
}

function temp_red(temperature) {
    let red;
    if (temperature < 66) {
        red = 255;
    } else {
        red = temperature - 60;
        red = 329.698727446 * (red ** (-0.1332047592))
    }
    red = Math.max(0, red);
    red = Math.min(255, red);
    return Math.floor(red);
}

function temp_green(temperature) {
    let green = 0;
    if (temperature < 66) {
        green = temperature;
        green = 99.4708 * Math.log(green) - 161.1195;
    } else {
        green = temperature - 60;
        green = 288.122169 * (green * (-.0755));
    }
    green = Math.max(0, green);
    green = Math.min(255, green);
    return Math.floor(green);
}

function temp_blue(temperature) {
    let blue = 0;
    if (temperature >= 66) {
        blue = 255;
    } else {
        blue = temperature - 10;
    }
    blue = 138.517 * Math.log(blue) - 305.0447;
    blue = Math.max(0, blue);
    blue = Math.min(255, blue);
    return Math.floor(blue);
}


export { getDaylightStrength, getPrevDay, getCurTime, getPrevTime, updateTime, renderTime, initializeStarMap }
