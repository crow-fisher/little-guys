import { gaussianRandom, randRange, randRangeFactor } from "../../common.js";
import { addUIFunctionMap, UI_CLIMATE_WEATHER_CLEAR, UI_CLIMATE_WEATHER_LIGHTRAIN, UI_CLIMATE_WEATHER_HEAVYRAIN, loadGD, saveGD, UI_CLIMATE_WEATHER_PARTLY_CLOUDY, UI_CLIMATE_WEATHER_MOSTLY_CLOUDY, UI_CLIMATE_WEATHER_FOGGY, UI_CLIMATE_WEATHER_DURATION, UI_CLIMATE_WEATHER_ACTIVE, UI_SIMULATION_GENS_PER_DAY, UI_CLIMATE_WEATHER_TOOL_SELECT, UI_SIMULATION_CLOUDS, UI_CLIMATE_WEATHER_NULL, UI_DEBUG_CLIMATE_WEATHER_FOREVER } from "../../ui/UIData.js";
import { getActiveClimate } from "../climateManager.js";
import { cloudRainThresh } from "../simulation/temperatureHumidity.js";
import { getCurDay, getDt, getTimeScale } from "../time.js";
import { getFrameXMaxWsq, getFrameXMinWsq, getFrameYMaxWsq, getFrameYMinWsq, getWindSquaresX, getWindSquaresY } from "../simulation/wind.js";
import { Cloud } from "./cloud.js";
import { Weather } from "./weather.js";
import { topbarWeatherTextReset } from "../../ui/WindowManager.js";
import { isSquareOnCanvas } from "../../canvas.js";
import { MAIN_CANVAS, MAIN_CONTEXT } from "../../index.js";
import { COLOR_VERY_FUCKING_RED } from "../../colors.js";

let weatherClear, weatherPartlyCloudy, weatherMostlyCloudy, weatherFoggy, weatherLightRain, weatherHeavyRain;
let ui_weatherMap = new Map();

let curRainFallAmount = 0;
let curWeatherStartTime = 0;
let curWeatherInterval = 1;
let curWeather = null;
let curClimate = null;

export function getCurWeather() {
    return curWeather;
}
export function getCurWeatherInterval() {
    let int = ((curWeatherInterval) - (getCurDay() - curWeatherStartTime)) / 0.000694444;
    int -= getCurDay() % (0.000694444 / 60);
    return int;
}

let curClouds = [];
let curWinds = [];

let cloudDuration = () => getTimeScale() * randRange(4, 8) / loadGD(UI_SIMULATION_GENS_PER_DAY);
let cloudXSize = (min=0.4, max=0.8) => randRange(min, max) * (getFrameXMaxWsq() - getFrameXMinWsq());
let cloudYSize = (min=0.1, max=0.2) => randRange(min, max) * (getFrameXMaxWsq() - getFrameXMinWsq());

function spawnFogCloud() {
    curClouds.push(new Cloud(
        randRange(getFrameXMinWsq(), getFrameXMaxWsq()),
        randRange(getFrameYMinWsq(), getFrameYMaxWsq()),
        cloudXSize(.7, 1), cloudYSize(.7, 1),
        getCurDay(), cloudDuration(),
        1.2, randRange(.0001, .002)));
}

function spawnCumulusCloud() {
    curClouds.push(new Cloud(
        randRange(getFrameXMinWsq(), getFrameXMaxWsq()),
        randRangeFactor(getFrameYMinWsq(), getFrameYMaxWsq(), 0.25),
        cloudXSize(), cloudYSize(),
        getCurDay(), cloudDuration(),
        2, randRange(.001, .005)));
}

function spawnNimbusCloud(rainFactor) {
    curClouds.push(new Cloud(
        randRange(getFrameXMinWsq(), getFrameXMaxWsq()),
        randRangeFactor(getFrameYMinWsq(), getFrameYMaxWsq(), 0.1),
        cloudXSize(.4, .7), cloudYSize(),
        getCurDay(), cloudDuration(),
        2, rainFactor * randRange(.025, .04)));
}

function spawnWindGust(airPressure) {
    curClouds.push(new Cloud(
        randRange(getFrameXMinWsq(), getFrameXMaxWsq()),
        randRangeFactor(getFrameYMinWsq(), getFrameYMaxWsq(), 0.7),
        cloudXSize(), cloudYSize(),
        getCurDay(), cloudDuration() * 4 * Math.random(),
        -1, 0.8, Math.random() * airPressure));
}

// UI_CLIMATE_WEATHER_CLEAR
let clearHg = [
    [0, 0.9],
    [0.15, 0.9],
    [0.25, 0.9],
    [1, 0.9]
]
let clearTg = [
    [0, 273 + 10],
    [0.5, 273 + 10],
    [1, 273 + 10]
]

function clearWeather() {
    windyWeather(10, .2);
}

weatherClear = new Weather(UI_CLIMATE_WEATHER_CLEAR, clearHg, clearTg, 100, clearWeather);

let cloudyHg = [
    [0, 1],
    [0.15, 1],
    [0.25, 1],
    [1, 0.95]
]
let cloudyTg = [
    [0, 273 + 10],
    [0.5, 273 + 10],
    [1, 273 + 10]
]

let foggyHg = [
    [0, 1],
    [0.15, 1],
    [0.25, 1],
    [1, 0.99]
]
let foggyTg = [
    [0, 273 + 10],
    [0.5, 273 + 10],
    [1, 273 + 10]
]
let rainyHumidityGradient = [
    [0, 1],
    [0.25, 1],
    [0.5, 1],
    [1, .99]
]
let rainyTemperatureGradient = [
    [0, 273 + 10],
    [0.5, 273 + 10],
    [1, 273 + 10]
]

function spawnRateThrottle() {
    return Math.random() > 0.9
}

function windyWeather(windAmount, airPressure) {
    airPressure /= 10000;
    if (curWinds.length > windAmount) {
        return;
    }
    if (spawnRateThrottle())
        spawnWindGust(airPressure);
}

function cloudyWeather(cloudCount) {
    return () => {
        if (curClouds.length > cloudCount) {
            return;
        }
        if (spawnRateThrottle()) {
            spawnCumulusCloud();
        }
        windyWeather(10, .2);
    }
}

function foggyWeather() {
    if (curClouds.length > 20) {
        return;
    }
    if (spawnRateThrottle()) {
        spawnFogCloud();
    }
    windyWeather(10, .2);
}

weatherPartlyCloudy = new Weather(UI_CLIMATE_WEATHER_PARTLY_CLOUDY, cloudyHg, cloudyTg, 50, cloudyWeather(6));
weatherMostlyCloudy = new Weather(UI_CLIMATE_WEATHER_MOSTLY_CLOUDY, cloudyHg, cloudyTg, 50, cloudyWeather(20));
weatherFoggy = new Weather(UI_CLIMATE_WEATHER_FOGGY, foggyHg, foggyTg, 50, foggyWeather);

export function logRainFall(amount) {
    curRainFallAmount += amount;
}


function generalRainyWeather(rfMin, rfMax) {
    return () => {
        if (curClouds.length > 10) {
            return;
        }
        if (spawnRateThrottle()) {
            spawnNimbusCloud(randRange(rfMin, rfMax));
        }
        windyWeather(10, 3 * rfMin);
    }
}

weatherLightRain = new Weather(UI_CLIMATE_WEATHER_LIGHTRAIN, rainyHumidityGradient, rainyTemperatureGradient, 50, generalRainyWeather(0.1, 0.3));
weatherHeavyRain = new Weather(UI_CLIMATE_WEATHER_HEAVYRAIN, rainyHumidityGradient, rainyTemperatureGradient, 50, generalRainyWeather(0.4, 0.8));

ui_weatherMap.set(UI_CLIMATE_WEATHER_CLEAR, weatherClear)
ui_weatherMap.set(UI_CLIMATE_WEATHER_PARTLY_CLOUDY, weatherPartlyCloudy)
ui_weatherMap.set(UI_CLIMATE_WEATHER_MOSTLY_CLOUDY, weatherMostlyCloudy)
ui_weatherMap.set(UI_CLIMATE_WEATHER_FOGGY, weatherFoggy)
ui_weatherMap.set(UI_CLIMATE_WEATHER_LIGHTRAIN, weatherLightRain)
ui_weatherMap.set(UI_CLIMATE_WEATHER_HEAVYRAIN, weatherHeavyRain)
ui_weatherMap.set(UI_CLIMATE_WEATHER_NULL, weatherClear)

function weatherChange() {
    if (!loadGD(UI_SIMULATION_CLOUDS)) {
        return;
    }
    curWeatherStartTime = Math.min(curWeatherStartTime, getCurDay());
    curWeather = ui_weatherMap.get(loadGD(UI_CLIMATE_WEATHER_ACTIVE));

    if (getCurDay() - getDt() < Math.min(curWeatherStartTime + curWeatherInterval)) {
        return;
    }
    let curWeatherPatternMap = getActiveClimate().weatherPatternMap;
    let sum = curWeatherPatternMap.values().reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0,
    );
    let target = Math.floor(Math.random() * sum);
    let cur = 0;
    let nextWeather = curWeatherPatternMap.keys().find((key) => {
        if (target <= cur) {
            return true;
        };
        cur += curWeatherPatternMap.get(key);
        if (target <= cur) {
            return true;
        };
        return false;
    });
    saveGD(UI_CLIMATE_WEATHER_ACTIVE, nextWeather);
}


export function weather() {
    curClouds.forEach((cloud) => cloud.tick());
    curWinds.forEach((wind) => wind.tick());
    curClouds = Array.from(curClouds.filter((cloud) => getCurDay() < cloud.startDay + cloud.duration));
    curClouds = Array.from(curClouds.filter((cloud) => getCurDay() > cloud.startDay - cloud.duration));
    curClouds = Array.from(curClouds.filter((cloud) => isSquareOnCanvas(cloud.centerX * 4, cloud.centerY * 4)));
    curWinds = Array.from(curWinds.filter((wind) => getCurDay() < wind.startDay + wind.duration));
    curWinds = Array.from(curWinds.filter((wind) => getCurDay() > wind.startDay - wind.duration));
    curWinds = Array.from(curWinds.filter((wind) => isSquareOnCanvas(wind.centerX * 4, wind.centerY * 4)));


    weatherChange();
    curWeather.weather();
}

export function initWeather() {
    weatherChange();
    curWeather = ui_weatherMap.get(loadGD(UI_CLIMATE_WEATHER_ACTIVE));
    curWeather.setRestingValues();
}

function applyUIWeatherChange() {
    curWeather = ui_weatherMap.get(loadGD(UI_CLIMATE_WEATHER_ACTIVE));
    curWeatherInterval = randRange(.001, .004);
    curWeatherStartTime = getCurDay();
    curWeatherStartTime -= curWeatherStartTime % (0.000694444 / 60);

    if (loadGD(UI_DEBUG_CLIMATE_WEATHER_FOREVER))
        curWeatherInterval *= 10 ** 8;

    console.log("Next weather: ", curWeather.type + ", for " + Math.round(curWeatherInterval / 0.000694444) + " minutes")
}

export function renderCloudsDebug() {
    MAIN_CONTEXT.fillStyle = COLOR_VERY_FUCKING_RED;
    curClouds.forEach((cloud) => cloud.renderDebug());

}

addUIFunctionMap(UI_CLIMATE_WEATHER_ACTIVE, () => {
    if (!loadGD(UI_SIMULATION_CLOUDS) && loadGD(UI_CLIMATE_WEATHER_ACTIVE) != UI_CLIMATE_WEATHER_NULL) {
        saveGD(UI_SIMULATION_CLOUDS, true);
    }
    applyUIWeatherChange();
    topbarWeatherTextReset();
});

addUIFunctionMap(UI_CLIMATE_WEATHER_DURATION, applyUIWeatherChange);
addUIFunctionMap(UI_SIMULATION_GENS_PER_DAY, applyUIWeatherChange);
addUIFunctionMap(UI_SIMULATION_CLOUDS, () => {
    if (!loadGD(UI_SIMULATION_CLOUDS)) {
        saveGD(UI_CLIMATE_WEATHER_ACTIVE, UI_CLIMATE_WEATHER_NULL);
    } else {
        saveGD(UI_CLIMATE_WEATHER_ACTIVE, UI_CLIMATE_WEATHER_CLEAR);
        weatherChange();
    }
    topbarWeatherTextReset();
})