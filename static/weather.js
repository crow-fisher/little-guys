import { randRange } from "./common.js";
import { CANVAS_SQUARES_X } from "./index.js";
import { addWaterSaturationPascals, getHumidity, getWaterSaturation, setRestingHumidityGradient, setRestingTemperatureGradient } from "./temperatureHumidity.js";
import { getCurDay, timeScaleFactor } from "./time.js";
import { getPressure, isPointInWindBounds } from "./wind.js";

const WEATHER_SUNNY = "WEATHER_SUNNY";
const WEATHER_CLOUDY = "WEATHER_CLOUDY";
const WEATHER_LIGHTRAIN = "WEATHER_LIGHTRAIN";
const WEATHER_HEAVYRAIN = "WEATHER_HEAVYRAIN";

var weatherSunny, weatherCloudy, weatherLightRain, weatherHeavyRain;

var curRainFallAmount = 0;
var curWeatherStartTime = 0;
var curWeatherInterval = 2;
var curWeather = null;
var curClouds = [];

class Cloud {
    constructor(centerX, centerY, sizeX, sizeY, startDay, duration, targetHumidity, strength) {
        this.centerX = Math.floor(centerX);
        this.centerY = Math.floor(centerY);
        this.sizeX = Math.floor(sizeX);
        this.sizeY = Math.floor(sizeY);
        this.startDay = startDay; 
        this.duration = duration;
        this.targetHumidity = targetHumidity;
        this.strength = strength;


        this.startElipse = [];
        this.centerElipse = [];
        this.endElipse = [];
        this.initCloud();
    }

    initCloud() {
        this.centerElipse = [this.centerX, this.centerY, this.sizeX, this.sizeY];
        this.startElipse = [this.centerX, this.centerY, this.sizeX / (2 + Math.random()), this.sizeY / (2 + Math.random())];
        this.endElipse = [this.centerX, this.centerY, this.sizeX / (2 + Math.random()), this.sizeY / (2 + Math.random())];
    }

    tick() {
        if (getCurDay() < this.startDay) {
            return;
        }
        var startElipse, endElipse;
        var durationFrac = (getCurDay() - this.startDay) / this.duration;

        var curDuration;
        if (durationFrac > 0.5) {
            startElipse = this.centerElipse;
            endElipse = this.endElipse;
            curDuration = durationFrac - 0.5;
        } else {
            startElipse = this.startElipse;
            endElipse = this.centerElipse;
            curDuration = durationFrac;
        }
        curDuration *= 2;

        var curElipse = [
            startElipse[0] * (1 - curDuration) + endElipse[0] * (curDuration),
            startElipse[1] * (1 - curDuration) + endElipse[1] * (curDuration),
            startElipse[2] * (1 - curDuration) + endElipse[2] * (curDuration),
            startElipse[3] * (1 - curDuration) + endElipse[3] * (curDuration)
        ];

        for (let i = 0; i < this.sizeX; i++) {
            for (let j = 0; j < this.sizeY; j++) {
                let curLoc = (i/curElipse[2]) ** 2 + (j/curElipse[3]) ** 2;
                if (curLoc > 1) {
                    continue;
                }
                for (let xside = -1; xside <= 1; xside += 2) {
                    for (let yside = -1; yside <= 1; yside += 2) {
                        var wx = this.centerX + (xside * i);
                        var wy = this.centerY + (yside * j);
                        if (!isPointInWindBounds(wx, wy) || getPressure(wx, wy) < 0) {
                            continue;
                        }

                        var cur = getHumidity(wx, wy);
                        if (cur > this.targetHumidity) {
                            return;
                        }
                        var pascals = (this.targetHumidity - cur) * (getWaterSaturation(wx, wy) / cur) * this.strength / timeScaleFactor();
                        addWaterSaturationPascals(wx, wy, pascals);
                    }
                }
            }
        }

    }
}

class Weather {
    constructor(hg, tg, f) {
        this.hg = hg;
        this.tg = tg;
        this.f = f;
    }
    weather() {
        setRestingHumidityGradient(this.hg);
        setRestingTemperatureGradient(this.tg);
        this.f();
    }
}

// https://www.noaa.gov/jetstream/clouds/four-core-types-of-clouds
function spawnCumulusCloud() {
    curClouds.push(new Cloud(
        randRange(-CANVAS_SQUARES_X/4, CANVAS_SQUARES_X * (0.75)),
        randRange(4, 8),
        randRange(8, 12), randRange(3, 9), 
        getCurDay() + 0.00001 * randRange(1, 30), .1 * randRange(2, 4), 
        randRange(1.0, 1.01), 0.8 * randRange(1, 2)));
}

function spawnStratusCloud() {
}

function spawnNimbusCloud(rainFactor) {
    curClouds.push(new Cloud(
        randRange(-CANVAS_SQUARES_X/4, CANVAS_SQUARES_X*0.6),
        randRange(4, 6),
        randRange(23, 35), randRange(3, 5), 
        getCurDay() + 0.00001 * randRange(1, 30), .01 * randRange(2, 4), 
        1 + 0.05 * rainFactor, 0.8));
}


// WEATHER_SUNNY

var sunnyHg = [
    [0, 0.10],
    [0.15, 0.15],
    [0.25, 0.15],
    [1, 0.30]
]
var sunnyTg = [
    [0, 273 + 30],
    [0.5, 273 + 35],
    [1, 273 + 40]
]

function sunnyWeather() {
    curClouds = new Array();
}

weatherSunny = new Weather(sunnyHg, sunnyTg, sunnyWeather);

var cloudyHg = [
    [0, 0.95],
    [0.15, 0.99],
    [0.25, 0.95],
    [1, 0.75]
]
var cloudyTg = [
    [0, 273 + 25],
    [0.5, 273 + 30],
    [1, 273 + 35]
]

function cloudyWeather() {
    if (curClouds.length > 5) {
        return;
    }
    spawnCumulusCloud();
}
weatherCloudy = new Weather(cloudyHg, cloudyTg, cloudyWeather);

export function logRainFall(amount) {
    curRainFallAmount += amount;
}

var rainyHumidityGradient = [
    [0, 1],
    [0.25, 1],
    [1, 0.9]
]
var rainyTemperatureGradient = [
    [0, 273 + 25],
    [0.5, 273 + 30],
    [1, 273 + 35]
]
function generalRainyWeather(rainFactor) {
    return () => {
        if (curClouds.length > 5) {
            return;
        }
        spawnNimbusCloud(rainFactor);
    }
}

weatherLightRain = new Weather(rainyHumidityGradient, rainyTemperatureGradient, generalRainyWeather(0.25));
weatherHeavyRain = new Weather(rainyHumidityGradient, rainyTemperatureGradient, generalRainyWeather(1));

function weatherChange() {
    if (curWeather == null) {
        curWeather = weatherSunny; 
    }
}

export function setWeather(w) {
    switch (w) {
        case 1: 
            curWeather = weatherSunny;
            break;
        case 2:
            curWeather = weatherCloudy;
            break;
        case 3:
            curWeather = weatherLightRain;
            break;
        case 4:
            curWeather = weatherHeavyRain;
            break;
        default:
            curWeather = weatherSunny;
    }
}

export function weather() {
    curClouds.forEach((cloud) => cloud.tick());
    if (curClouds.some((cloud) => getCurDay() > cloud.startDay + cloud.duration)) {
        curClouds = Array.from(curClouds.filter((cloud) => getCurDay() < cloud.startDay + cloud.duration));
    }
    weatherChange();
    curWeather.weather();
}