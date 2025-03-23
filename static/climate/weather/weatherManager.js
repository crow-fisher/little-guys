import { getCanvasSquaresX } from "../../canvas.js";
import { randRange } from "../../common.js";
import { addUIFunctionMap, UI_CLIMATE_WEATHER_SUNNY, UI_CLIMATE_WEATHER_LIGHTRAIN, UI_CLIMATE_WEATHER_HEAVYRAIN, loadUI, saveUI, UI_CLIMATE_WEATHER_PARTLY_CLOUDY, UI_CLIMATE_WEATHER_MOSTLY_CLOUDY, UI_CLIMATE_WEATHER_FOGGY, UI_CLIMATE_WEATHER_DURATION } from "../../ui/UIData.js";
import { getActiveClimate } from "../climateManager.js";
import { cloudRainThresh, setRestingGradientStrength, setRestingHumidityGradient, setRestingTemperatureGradient } from "../temperatureHumidity.js";
import { getCurDay } from "../time.js";
import { getWindSquaresX, getWindSquaresY } from "../wind.js";
import { Cloud } from "./cloud.js";
import { Weather } from "./weather.js";

var weatherSunny, weatherPartlyCloudy, weatherMostlyCloudy, weatherFoggy, weatherLightRain, weatherHeavyRain;
var ui_weatherMap = new Map();

var curRainFallAmount = 0;
var curWeatherStartTime = 0;
var curWeatherInterval = 1;
var curWeather = null;
var curClimate = null;

var curClouds = [];
var curWinds = [];

function spawnFogCloud() {
    let wsx = getWindSquaresX();
    let wsy = getWindSquaresY();
    curClouds.push(new Cloud(
        randRange(0, wsx),
        randRange(0, wsy),
        randRange(0.4, 0.9) * wsx, randRange(0.3, 0.7) * wsy,
        getCurDay() + 0.00069444444 * randRange(0.5, 4), 0.00069444444 * randRange(0.5, 4),
        randRange(1, 1.001), randRange(0, .3)));
}

function spawnCumulusCloud() {
    let wsx = getWindSquaresX();
    let wsy = getWindSquaresY();
    curClouds.push(new Cloud(
        randRange(0, wsx),
        randRange(0, wsy / 3),
        randRange(0.1, 0.3) * wsx, randRange(0.05, 0.15) * (wsx / 3),
        getCurDay() + 0.00069444444 * randRange(0.5, 4), 0.00069444444 * randRange(0.5, 4),
        randRange(1.001, cloudRainThresh), 0.8 * randRange(1, 2)));
}

function spawnNimbusCloud(rainFactor) {
    let wsx = getWindSquaresX();
    let wsy = getWindSquaresY();
    curClouds.push(new Cloud(
        randRange(0, wsx),
        2,
        randRange(0.5, 0.7) * wsx, randRange(0.05, 0.1) * wsy,
        getCurDay() + 0.00001 * randRange(1, 30), .01 * randRange(2, 4),
        1 + 0.05 * rainFactor, 0.8));
}

function spawnWindGust() {
    let wsx = getWindSquaresX();
    let wsy = getWindSquaresY();
    curClouds.push(new Cloud(
        randRange(-wsx, wsx),
        randRange(-wsy, wsy),
        randRange(0, 0.2) * wsx, randRange(0.05, 0.1) * wsy,
        getCurDay(), .0001 * randRange(2, 4),
        -1, 0.8));
}

// UI_CLIMATE_WEATHER_SUNNY
var sunnyHg = [
    [0, 0.2],
    [0.15, 0.3],
    [0.25, 0.3],
    [1, 0.4]
]
var sunnyTg = [
    [0, 273 + 30],
    [0.5, 273 + 35],
    [1, 273 + 40]
]

function sunnyWeather() {
    curClouds = new Array();
}

weatherSunny = new Weather(UI_CLIMATE_WEATHER_SUNNY, sunnyHg, sunnyTg, 100, sunnyWeather);

var cloudyHg = [
    [0, 0.999],
    [0.15, 0.999],
    [0.25, 0.98],
    [1, 0.75]
]
var cloudyTg = [
    [0, 273 + 30],
    [0.5, 273 + 35],
    [1, 273 + 40]
]


var foggyHg = [
    [0, 1],
    [0.15, 1],
    [0.25, 1],
    [1, 0.99]
]
var foggyTg = [
    [0, 273 + 30],
    [0.5, 273 + 35],
    [1, 273 + 40]
]
var rainyHumidityGradient = [
    [0, 1],
    [0.25, 1],
    [0.5, 0.85],
    [1, .7]
]
var rainyTemperatureGradient = [
    [0, 273 + 30],
    [0.5, 273 + 35],
    [1, 273 + 40]
]

function windyWeather(windAmount) {
    return () => {
        if (curWinds.length > windAmount) {
            return;
        }
        spawnWindGust();
    }
}

function cloudyWeather(cloudCount) {
    return () => {
        if (curClouds.length > cloudCount) {
            return;
        }
        spawnCumulusCloud();
        windyWeather(10);
    }
}

function foggyWeather() {
    if (curClouds.length > 35) {
        return;
    }
    spawnFogCloud();
}

weatherPartlyCloudy = new Weather(UI_CLIMATE_WEATHER_PARTLY_CLOUDY, cloudyHg, cloudyTg, 100, cloudyWeather(15));
weatherMostlyCloudy = new Weather(UI_CLIMATE_WEATHER_MOSTLY_CLOUDY, cloudyHg, cloudyTg, 100, cloudyWeather(35));
weatherFoggy = new Weather(UI_CLIMATE_WEATHER_FOGGY, foggyHg, foggyTg, 100, foggyWeather);

export function logRainFall(amount) {
    curRainFallAmount += amount;
}


function generalRainyWeather(rainFactor) {
    return () => {
        if (curClouds.length > 5) {
            return;
        }
        spawnNimbusCloud(rainFactor);
        windyWeather(10);
    }
}

weatherLightRain = new Weather(UI_CLIMATE_WEATHER_LIGHTRAIN, rainyHumidityGradient, rainyTemperatureGradient, 1, generalRainyWeather(0.25));
weatherHeavyRain = new Weather(UI_CLIMATE_WEATHER_HEAVYRAIN, rainyHumidityGradient, rainyTemperatureGradient, 1, generalRainyWeather(1));

ui_weatherMap.set(UI_CLIMATE_WEATHER_SUNNY, weatherSunny)
ui_weatherMap.set(UI_CLIMATE_WEATHER_PARTLY_CLOUDY, weatherPartlyCloudy)
ui_weatherMap.set(UI_CLIMATE_WEATHER_MOSTLY_CLOUDY, weatherMostlyCloudy)
ui_weatherMap.set(UI_CLIMATE_WEATHER_FOGGY, weatherFoggy)
ui_weatherMap.set(UI_CLIMATE_WEATHER_LIGHTRAIN, weatherLightRain)
ui_weatherMap.set(UI_CLIMATE_WEATHER_HEAVYRAIN, weatherHeavyRain)

function weatherChange() {
    if (getCurDay() < curWeatherStartTime + curWeatherInterval) {
        return;
    }
    let curWeatherPatternMap = getActiveClimate().weatherPatternMap;
    var sum = curWeatherPatternMap.values().reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0,
    );
    var target = Math.floor(Math.random() * sum);
    var cur = 0;
    var nextWeather = curWeatherPatternMap.keys().find((key) => {
        if (target <= cur) {
            return true;
        };
        cur += curWeatherPatternMap.get(key);
        if (target <= cur) {
            return true;
        };
        return false;
    });
    saveUI(nextWeather, true);

}


export function weather() {
    curClouds.forEach((cloud) => cloud.tick());
    curWinds.forEach((wind) => wind.tick());
    if (curClouds.some((cloud) => getCurDay() > cloud.startDay + cloud.duration)) {
        curClouds = Array.from(curClouds.filter((cloud) => getCurDay() < cloud.startDay + cloud.duration));
    }
    weatherChange();
    curWeather.weather();
}

export function initWeather() {
    weatherChange();
    saveUI(UI_CLIMATE_WEATHER_SUNNY, true);
    curWeather = weatherSunny;
    curWeather.setRestingValues();
}

function applyUIWeatherChange() {
    ui_weatherMap.keys().forEach((key) => {
        if (loadUI(key)) {
            curWeather = ui_weatherMap.get(key);
            curWeatherInterval = randRange(	loadUI(UI_CLIMATE_WEATHER_DURATION) / 4, loadUI(UI_CLIMATE_WEATHER_DURATION));
            curWeatherStartTime = getCurDay();
            console.log("Next weather: ", curWeather.type + ", for " + Math.round(curWeatherInterval / 0.000694444) + " minutes")
        }
    });
}
addUIFunctionMap(UI_CLIMATE_WEATHER_SUNNY, applyUIWeatherChange);
addUIFunctionMap(UI_CLIMATE_WEATHER_PARTLY_CLOUDY, applyUIWeatherChange);
addUIFunctionMap(UI_CLIMATE_WEATHER_MOSTLY_CLOUDY, applyUIWeatherChange);
addUIFunctionMap(UI_CLIMATE_WEATHER_FOGGY, applyUIWeatherChange);
addUIFunctionMap(UI_CLIMATE_WEATHER_LIGHTRAIN, applyUIWeatherChange);
addUIFunctionMap(UI_CLIMATE_WEATHER_HEAVYRAIN, applyUIWeatherChange);
addUIFunctionMap(UI_CLIMATE_WEATHER_DURATION, applyUIWeatherChange);