import { randNumber, randRange } from "./common.js";
import { CANVAS_SQUARES_X } from "./index.js";
import { addWaterSaturationPascals, getHumidity, getWaterSaturation, setRestingGradientStrength, setRestingHumidityGradient, setRestingTemperatureGradient } from "./temperatureHumidity.js";
import { getCurDay, timeScaleFactor } from "./time.js";
import { getPressure, isPointInWindBounds } from "./wind.js";

const WEATHER_SUNNY = "WEATHER_SUNNY";
const WEATHER_CLOUDY = "WEATHER_CLOUDY";
const WEATHER_LIGHTRAIN = "WEATHER_LIGHTRAIN";
const WEATHER_HEAVYRAIN = "WEATHER_HEAVYRAIN";

var weatherSunny, weatherCloudy, weatherLightRain, weatherHeavyRain;

var curRainFallAmount = 0;
var curWeatherStartTime = 0;
var curWeatherInterval = 1;
var curWeather = null;
var curClimate = null;
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
    constructor(type, hg, tg, strength, f) {
        this.type = type;
        this.hg = hg;
        this.tg = tg;
        this.strength = strength;
        this.f = f;
    }
    weather() {
        setRestingHumidityGradient(this.hg);
        setRestingTemperatureGradient(this.tg);
        setRestingGradientStrength(this.strength);
        this.f();
    }
}

// https://www.noaa.gov/jetstream/clouds/four-core-types-of-clouds
function spawnCumulusCloud() {
    curClouds.push(new Cloud(
        randRange(-CANVAS_SQUARES_X/4, CANVAS_SQUARES_X * (0.75)),
        randRange(4, 8),
        randRange(4, 8), randRange(3, 5), 
        getCurDay() + 0.00001 * randRange(1, 30), .1 * randRange(2, 4), 
        randRange(1.0, 1.00999), 0.8 * randRange(1, 2)));
}

function spawnStratusCloud() {
}

function spawnNimbusCloud(rainFactor) {
    curClouds.push(new Cloud(
        randRange(0, CANVAS_SQUARES_X * 0.25),
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

weatherSunny = new Weather(WEATHER_SUNNY, sunnyHg, sunnyTg, 100, sunnyWeather);

var cloudyHg = [
    [0, 0.999],
    [0.15, 0.999],
    [0.25, 0.98],
    [1, 0.75]
]
var cloudyTg = [
    [0, 273 + 30],
    [0.5, 273 + 30],
    [1, 273 + 35]
]

function cloudyWeather() {
    if (curClouds.length > 15) {
        return;
    }
    spawnCumulusCloud();
}
weatherCloudy = new Weather(WEATHER_CLOUDY, cloudyHg, cloudyTg, 100, cloudyWeather);

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

weatherLightRain = new Weather(WEATHER_LIGHTRAIN, rainyHumidityGradient, rainyTemperatureGradient, 100, generalRainyWeather(0.25));
weatherHeavyRain = new Weather(WEATHER_HEAVYRAIN, rainyHumidityGradient, rainyTemperatureGradient, 100, generalRainyWeather(1));

var weatherMap = {
    WEATHER_SUNNY: weatherSunny,
    WEATHER_CLOUDY: weatherCloudy,
    WEATHER_LIGHTRAIN: weatherLightRain,
    WEATHER_HEAVYRAIN: weatherHeavyRain
}

var climateDry = {
    WEATHER_SUNNY: 70,
    WEATHER_CLOUDY: 20,
    WEATHER_LIGHTRAIN: 10,
    WEATHER_HEAVYRAIN: 1

}

var climateTemperate = {
    WEATHER_SUNNY: 60,
    WEATHER_CLOUDY: 30,
    WEATHER_LIGHTRAIN: 20,
    WEATHER_HEAVYRAIN: 10 

}

var climateMoist = {
    WEATHER_SUNNY: 50,
    WEATHER_CLOUDY: 60,
    WEATHER_LIGHTRAIN: 40,
    WEATHER_HEAVYRAIN: 30
}

var climateWet = {
    WEATHER_SUNNY: 30,
    WEATHER_CLOUDY: 35,
    WEATHER_LIGHTRAIN: 45,
    WEATHER_HEAVYRAIN: 45

}

curWeather = weatherSunny;
curClimate = climateDry;

function weatherChange() {
    if (getCurDay() < curWeatherStartTime + curWeatherInterval) {
        return;
    }
    var sum = Object.values(curClimate).reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0,
    );
    var target = Math.floor(Math.random() * sum);
    var cur = 0;
    var nextWeather = Object.keys(curClimate).find((key) => {
        if (target <= cur) {
            return true;
        };
        cur += curClimate[key];
        if (target <= cur) {
            return true;
        };
        return false;
    });
    curWeather = weatherMap[nextWeather];
    curWeatherInterval = randRange(0, 2);
    curWeatherStartTime = getCurDay();
    console.log("Next weather: ", nextWeather + ", for " + Math.round(curWeatherInterval * 100) / 100 + " days") 

}

export function setWeather(w) {
    curWeatherInterval = 0;
    switch (w) {
        case 1: 
            curClimate = climateDry;
            break;
        case 2:
            curClimate = climateTemperate;
            break;
        case 3:
            curClimate = climateMoist;
            break;
        case 4:
            curClimate = climateWet;
            break;
        default:
            curClimate = climateDry;
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