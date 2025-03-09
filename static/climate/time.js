import { getBaseSize, getCanvasSquaresX, getCanvasSquaresY, zoomCanvasFillCircle, zoomCanvasFillRectTheta } from "../canvas.js";
import { hexToRgb, hsv2rgb, randNumber, randRange, rgb2hsv, rgbToRgba } from "../common.js";
import { getTotalCanvasPixelHeight, getTotalCanvasPixelWidth, MAIN_CONTEXT, setBackgroundColor } from "../index.js";
import { calculateColorRGB, getFrameRelCloud } from "./temperatureHumidity.js";
import { zoomCanvasFillRect } from "../canvas.js";
import {
    loadUI, UI_SPEED_1, UI_SPEED_2, UI_SPEED_3,
    UI_SPEED_4,
    UI_SPEED_5,
    UI_SPEED_6,
    UI_SPEED_7,
    UI_SPEED_8,
    UI_SPEED_9,
    UI_SPEED,
    UI_SPEED_0,
    UI_LIGHTING_SUN,
    UI_LIGHTING_MOON
} from "../ui/UIData.js";

var TIME_SCALE = 1;
var curUIKey = UI_SPEED_1;

export var millis_per_day = 60 * 60 * 24 * 1000;
var curDay = 0.88   ;
var prevDay = 0;
var curTime = 0.8;
var prevTime = 0;

var prevRealTime = Date.now();
var dt = 0;

export function getFrameDt() {
    return dt;
}

var starMap;
var starColorTemperatureMap;
var starMapCenterX;
var starMapCenterY;
// https://coolors.co/gradient-maker/18254c-5a4d41-a49f67-7e9fb1-84b2e2?position=0,43,53,73,100&opacity=100,100,100,100,100&type=linear&rotation=90
var sky_nightRGB = hexToRgb("#121622");
var sky_duskRGB = hexToRgb("#5A4D41");
var sky_colorEveningMorningRGB = hexToRgb("#A49F67");
var sky_colorNearNoonRGB = hexToRgb("#7E9FB1");
var sky_colorNoonRGB = hexToRgb("#84B2E2");

var currentLightColorTemperature = sky_nightRGB; 
var _cdaylightStrength = null;

export function setTimeScale(timeScale) {
    seekTimeTarget = 0;
    TIME_SCALE = timeScale;
}

// for time skipping 
var seekTimeTarget = 0;

export function doTimeSeek() {
    if (seekTimeTarget == 0) {
        return;
    }
    if (TIME_SCALE <= 1) {
        seekTimeTarget = 0;
        return;
    }
    if (getCurDay() > seekTimeTarget) {
        TIME_SCALE -= 1;
        if (TIME_SCALE == 1) {
            seekTimeTarget = 0;
        }
        return;
    }
    var dayRemaining = seekTimeTarget - getCurDay();
    var timeRemaining = millis_per_day * (dayRemaining / getCurTimeScale());

    if (timeRemaining < 500) {
        TIME_SCALE -= 1;
    } else {
        TIME_SCALE += 1;
    }

    TIME_SCALE = Math.min(TIME_SCALE, 9);
}

// targetTime between 0 and 1
export function seek(targetTime) {
    var targetTimeCurDay = Math.floor(getCurDay()) + targetTime;
    TIME_SCALE = 2;
    if (targetTimeCurDay < getCurDay()) {
        seekTimeTarget = targetTimeCurDay + 1;
    } else {
        seekTimeTarget = targetTimeCurDay;
    }
}

function getPrevTime() {
    return prevTime;
}

function initializeStarMap() {
    starMap = new Map();
    starColorTemperatureMap = new Map();
    starMapCenterX = randNumber(getCanvasSquaresX() / 4, getCanvasSquaresX() * 0.75);
    starMapCenterY = randNumber(getCanvasSquaresY() / 4, getCanvasSquaresY() * 0.75);

    var numStars = randNumber(22000, 33000);

    for (let i = 0; i < numStars; i++) {
        var starX = randNumber(-getCanvasSquaresX() * 4, getCanvasSquaresX() * 4);
        var starY = randNumber(-getCanvasSquaresY() * 4, getCanvasSquaresY() * 4);
        var starBrightness = (Math.random() ** 0.7) * 0.3;

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
    
    var xKeys = Array.from(Object.keys(starMap));
    for (let i = 0; i < xKeys.length; i++) {
        var yKeys = Array.from(Object.keys(starMap[xKeys[i]]));
        for (let j = 0; j < yKeys.length; j++) {
            var starX = xKeys[i];
            var starY = yKeys[j];
            var starbrightness = starMap[starX][starY] * Math.max(brightnessMult, 0);

            var starXRelOrigin = starX - starMapCenterX;
            var starYRelOrigin = starY - starMapCenterY;

            var dayTheta = (getCurDay() % 1) * 2 * Math.PI;

            var rotatedX = starXRelOrigin * Math.cos(dayTheta) - starYRelOrigin * Math.sin(dayTheta);
            var rotatedY = starYRelOrigin * Math.cos(dayTheta) + starXRelOrigin * Math.sin(dayTheta);

            var endX = rotatedX + starMapCenterX;
            var endY = rotatedY + starMapCenterX;

            if (endX < 0 || endY < 0) {
                continue;
            }
            if (endX > getCanvasSquaresX() || endY > getCanvasSquaresY()) {
                continue;
            }

            let r = 0.4;
            let b = (starbrightness) * r + (1) * (1 - r);
            MAIN_CONTEXT.fillStyle = calculateTempColorRgbaNoCache(starColorTemperatureMap[starX][starY], b);
            zoomCanvasFillCircle(
                endX * getBaseSize(),
                endY * getBaseSize(),
                starbrightness * getBaseSize()
            );
        }
    }
}


export function getDt() {
    return curDay - prevDay;
}

function getCurDay() {
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
    if (curUIKey != loadUI(UI_SPEED)) {
        switch (loadUI(UI_SPEED)) {
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
        curUIKey = loadUI(UI_SPEED);
    }

    if (TIME_SCALE == 0) {
        return;
    }
    dt = Date.now() - prevRealTime;
    if (dt > 10000) {
        prevRealTime = Date.now();
    } else {
        prevTime = curTime;
        prevDay = curDay;
        curTime += dt; 
        curDay += dt / (millis_per_day / getCurTimeScale());
        prevRealTime = Date.now();
        _cdaylightStrength = null;
    }
}

function renderSkyBackground(time) {
    var processed = Math.max(0, (1 - Math.abs(0.5 - time) * 2) * 2.5 - 1)
    var minColor, maxColor, min, max, starBrightness;

    var duskEnd = 0.2;
    var morningEnd = 0.5;
    var nearNoon = 0.8;
    var noon = 1.5;

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
    var processedColor = calculateColorRGB(processed, min, max, minColor, maxColor);
    var frameCloudColor = getFrameRelCloud();

    var frameCloudMult = Math.min(1, (frameCloudColor.r + frameCloudColor.g + frameCloudColor.b) / (3 * 255) * 5);

    var processedColorHsv = rgb2hsv(processedColor.r, processedColor.g, processedColor.b);
    processedColorHsv[1] *= (1 - frameCloudMult);

    var processedColorRGBArr = hsv2rgb(processedColorHsv[0], processedColorHsv[1], processedColorHsv[2]);

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
    var currentTime = getCurDay() % 1;

    var darkness = 0.05;
    if (currentTime < 0.25 || currentTime > 0.75) {
        return darkness;
    }
    return darkness + (Math.sin(currentTime * 2 * Math.PI - (Math.PI / 2)) ** 0.35) * (1 - darkness);
}

function renderTime() {
    // 0.5 is noon, 0.25 is sunrise, 0.75 is sunset
    var daylightStrength = 0;
    var currentTime = getCurDay() % 1;

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

var moonlightColor = calculateTempColor(6599);
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
    var temperature = Math.floor(daylightStrength * 6600);
    if (temperature in tempColorRgbaMap) {
        currentLightColorTemperature = tempColorRgbMap[temperature];
        return tempColorRgbaMap[temperature];
    } else {
        var dc = calculateTempColor(temperature);
        var resColor = {
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
    var temperature = Math.floor(daylightStrength * 6600);
    if (temperature in tempColorRgbaMap) {
        return tempColorRgbaMap[temperature];
    } else {
        var dc = calculateTempColor(temperature);
        var resColor = {
            r: Math.floor(dc.r * daylightStrength),
            g: Math.floor(dc.g * daylightStrength),
            b: Math.floor(dc.b * daylightStrength),
        }
        tempColorRgbMap[temperature] = resColor;
        tempColorRgbaMap[temperature] = rgbToRgba(resColor.r, resColor.g, resColor.b, opacity);
        return tempColorRgbaMap[temperature];
    }
}

function temp_red(temperature) {
    var red;
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
    var green = 0;
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
    var blue = 0;
    if (temperature >= 66) {
        blue = 255;
    } else {
        blue = temperature -10;
    }
    blue = 138.517 * Math.log(blue) - 305.0447;
    blue = Math.max(0, blue);
    blue = Math.min(255, blue);
    return Math.floor(blue);
}


export { getDaylightStrength, getPrevDay, getCurDay, getCurTime, getPrevTime, updateTime, renderTime, initializeStarMap}
