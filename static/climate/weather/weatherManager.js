import { gaussianRandom, randRange } from "../../common.js";
import { addUIFunctionMap, UI_CLIMATE_WEATHER_CLEAR, UI_CLIMATE_WEATHER_LIGHTRAIN, UI_CLIMATE_WEATHER_HEAVYRAIN, loadGD, saveGD, UI_CLIMATE_WEATHER_PARTLY_CLOUDY, UI_CLIMATE_WEATHER_MOSTLY_CLOUDY, UI_CLIMATE_WEATHER_FOGGY, UI_CLIMATE_WEATHER_DURATION, UI_CLIMATE_WEATHER_ACTIVE, UI_SIMULATION_GENS_PER_DAY, UI_CLIMATE_WEATHER_TOOL_SELECT, UI_SIMULATION_CLOUDS, UI_CLIMATE_WEATHER_NULL } from "../../ui/UIData.js";
import { getActiveClimate } from "../climateManager.js";
import { cloudRainThresh } from "../simulation/temperatureHumidity.js";
import { getCurDay, getDt } from "../time.js";
import { getWindSquaresX, getWindSquaresY } from "../simulation/wind.js";
import { Cloud } from "./cloud.js";
import { Weather } from "./weather.js";

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
    return ((curWeatherInterval) - (getCurDay() - curWeatherStartTime)) / 0.000694444;
}

let curClouds = [];
let curWinds = [];

let cloudDuration = randRange(0.5, 1) / loadGD(UI_SIMULATION_GENS_PER_DAY);

function spawnFogCloud() {
    let wsx = getWindSquaresX();
    let wsy = getWindSquaresY();
    curClouds.push(new Cloud(
        randRange(0, wsx),
        randRange(0, wsy),
        randRange(0.5, 0.9) * wsx, randRange(0.4, 0.9) * wsy,
        getCurDay(), cloudDuration,
        randRange(1.004, 1.006), 0.4));
}

function spawnCumulusCloud() {
    let wsx = getWindSquaresX();
    let wsy = getWindSquaresY();
    curClouds.push(new Cloud(
        randRange(0, wsx),
        gaussianRandom( wsy/15, wsy/10),
        randRange(0.4, 0.9) * wsx, randRange(0.2, 0.35) * wsy,
        getCurDay(), cloudDuration,
        randRange((1 + cloudRainThresh) / 2, cloudRainThresh), 0.8));
}

function spawnNimbusCloud(rainFactor) {
    let wsx = getWindSquaresX();
    let wsy = getWindSquaresY();
    curClouds.push(new Cloud(
        randRange(0, wsx),
        randRange(0, wsy / 8),
        randRange(0.4, 0.9) * wsy, randRange(0.15, 0.25) * wsy,
        getCurDay(), cloudDuration,
        1 + 0.05 * rainFactor, 0.8));
}

function spawnWindGust() {
    let wsx = getWindSquaresX();
    let wsy = getWindSquaresY();
    curClouds.push(new Cloud(
        randRange(-wsx, wsx),
        randRange(-wsy, wsy),
        randRange(0, 0.2) * wsx, randRange(0.05, 0.1) * wsy,
        getCurDay(), cloudDuration,
        -1, 0.8));
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

function windyWeather(windAmount) {
    return () => {
        if (curWinds.length > windAmount) {
            return;
        }
        if (spawnRateThrottle())
            spawnWindGust();
    }
}

function cloudyWeather(cloudCount) {
    return () => {
        if (curClouds.length > cloudCount) {
            return;
        }
        if (spawnRateThrottle()) {
            spawnCumulusCloud();
        }
        windyWeather(10);
    }
}

function foggyWeather() {
    if (curClouds.length > 20) {
        return;
    }
    if (spawnRateThrottle()) {
        spawnFogCloud();
    }
}

weatherPartlyCloudy = new Weather(UI_CLIMATE_WEATHER_PARTLY_CLOUDY, cloudyHg, cloudyTg, 50, cloudyWeather(6));
weatherMostlyCloudy = new Weather(UI_CLIMATE_WEATHER_MOSTLY_CLOUDY, cloudyHg, cloudyTg, 50, cloudyWeather(20));
weatherFoggy = new Weather(UI_CLIMATE_WEATHER_FOGGY, foggyHg, foggyTg, 50, foggyWeather);

export function logRainFall(amount) {
    curRainFallAmount += amount;
}


function generalRainyWeather(rainFactor) {
    return () => {
        if (curClouds.length > 10) {
            return;
        }
        if (spawnRateThrottle()) {
            spawnNimbusCloud(rainFactor);
        }
        windyWeather(10);
    }
}

weatherLightRain = new Weather(UI_CLIMATE_WEATHER_LIGHTRAIN, rainyHumidityGradient, rainyTemperatureGradient, 50, generalRainyWeather(0.6));
weatherHeavyRain = new Weather(UI_CLIMATE_WEATHER_HEAVYRAIN, rainyHumidityGradient, rainyTemperatureGradient, 50, generalRainyWeather(2));

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
    if (curClouds.some((cloud) => getCurDay() > cloud.startDay + cloud.duration)) {
        curClouds = Array.from(curClouds.filter((cloud) => getCurDay() < cloud.startDay + cloud.duration));
    }
    if (curWinds.some((wind) => getCurDay() > wind.startDay + wind.duration)) {
        curWinds = Array.from(curWinds.filter((wind) => getCurDay() < wind.startDay + wind.duration));
    }

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
    curWeatherInterval = randRange(	7 / loadGD(UI_SIMULATION_GENS_PER_DAY), 16 / loadGD(UI_SIMULATION_GENS_PER_DAY));
    curWeatherStartTime = getCurDay();
    console.log("Next weather: ", curWeather.type + ", for " + Math.round(curWeatherInterval / 0.000694444) + " minutes")
}

addUIFunctionMap(UI_CLIMATE_WEATHER_ACTIVE, () => {
    if (!loadGD(UI_SIMULATION_CLOUDS) && loadGD(UI_CLIMATE_WEATHER_ACTIVE) != UI_CLIMATE_WEATHER_NULL) {
        saveGD(UI_SIMULATION_CLOUDS, true);
    }
    applyUIWeatherChange();
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
})