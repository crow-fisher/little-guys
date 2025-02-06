import { hexToRgb, randNumber, randRange, rgbToRgba } from "./common.js";
import { CANVAS_SQUARES_X, CANVAS_SQUARES_Y, BASE_SIZE, MAIN_CONTEXT, zoomCanvasFillRect, TIME_SCALE} from "./index.js";
import { calculateColor, calculateColorProvideOpacity } from "./temperature_humidity.js";

var millis_per_day = 100 * 1000;
var curDay = 0.5;
var prevDay = 0;
var curTime = 0.2;
var prevTime = 0;

var prevRealTime = Date.now();

var starMap;
var starMapCenterX;
var starMapCenterY;
// https://coolors.co/gradient-maker/18254c-5a4d41-a49f67-7e9fb1-84b2e2?position=0,43,53,73,100&opacity=100,100,100,100,100&type=linear&rotation=90
var sky_nightRGB = hexToRgb("#121622");
var sky_duskRGB = hexToRgb("#5A4D41");
var sky_colorEveningMorningRGB = hexToRgb("#A49F67");
var sky_colorNearNoonRGB = hexToRgb("#7E9FB1");
var sky_colorNoonRGB = hexToRgb("#84B2E2");

var currentLightColorTemperature = sky_nightRGB; 


function getPrevTime() {
    return prevTime;
}

function initializeStarMap() {
    starMap = new Map();
    starMapCenterX = randNumber(CANVAS_SQUARES_X / 4, CANVAS_SQUARES_X * 0.75);
    starMapCenterY = randNumber(CANVAS_SQUARES_Y / 4, CANVAS_SQUARES_Y * 0.75);

    var numStars = randNumber(100, 50000);

    for (let i = 0; i < numStars; i++) {
        var starX = randNumber(-CANVAS_SQUARES_X * 4, CANVAS_SQUARES_X * 4);
        var starY = randNumber(-CANVAS_SQUARES_Y * 4, CANVAS_SQUARES_Y * 4);
        var starBrightness = Math.random();

        if (!(starX in starMap)) {
            starMap[starX] = new Map();
        }
        starMap[starX][starY] = starBrightness;
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
            if (endX > CANVAS_SQUARES_X || endY > CANVAS_SQUARES_Y) {
                continue;
            }

            MAIN_CONTEXT.fillStyle = rgbToRgba(255, 255, 255, starbrightness);
            zoomCanvasFillRect(
                endX * BASE_SIZE,
                endY * BASE_SIZE,
                starbrightness * BASE_SIZE,
                starbrightness * BASE_SIZE
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

function updateTime() {
    var dt = Date.now() - prevRealTime;
    if (dt > 10000) {
        prevRealTime = Date.now();
    } else {
        prevTime = curTime;
        prevDay = curDay;
        curTime += dt; 
        curDay += dt / (millis_per_day / TIME_SCALE);
        prevRealTime = Date.now();
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

    MAIN_CONTEXT.fillStyle = calculateColorProvideOpacity(processed, min, max, minColor, maxColor, 0.8);
    zoomCanvasFillRect(
        0,
        0,
        CANVAS_SQUARES_X * BASE_SIZE,
        CANVAS_SQUARES_Y * BASE_SIZE
    );

    renderStarMap(1 - getDaylightStrength());
}

function getDaylightStrength() {
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

    MAIN_CONTEXT.fillStyle = calculateTempColorRgba(daylightStrength);
    zoomCanvasFillRect(
        0,
        0,
        CANVAS_SQUARES_X * BASE_SIZE,
        CANVAS_SQUARES_Y * BASE_SIZE
    );

    renderSkyBackground(currentTime);
}

export function getCurrentLightColorTemperature() {
    return currentLightColorTemperature;
}

var moonlightColor = calculateTempColor(4100);

export function getMoonlightColor() {
    return moonlightColor;
}

// https://www.researchgate.net/publication/328726901_Real-time_adaptable_and_coherent_rendering_for_outdoor_augmented_reality/download

function calculateTempColor(temperature) {
    temperature /= 100;
    temperature = Math.max(10, temperature);
    currentLightColorTemperature = {
        r: temp_red(temperature),
        g: temp_green(temperature),
        b: temp_blue(temperature)
    };
    return currentLightColorTemperature;
}

let tempColorRgbaMap = new Map();
let tempColorRgbMap = new Map();

function calculateTempColorRgba(daylightStrength) {
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
        tempColorRgbaMap[temperature] = rgbToRgba(resColor.r, resColor.g, resColor.b, 0.35);
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
