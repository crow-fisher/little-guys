import { randRange } from "./common.js";
import { CANVAS_SQUARES_X, CANVAS_SQUARES_Y } from "./index.js";
import { addWaterSaturationPascals, getHumidity, getWaterSaturation, getWindSquaresX, getWindSquaresY, isPointInWindBounds, setRestingHumidityGradient, setRestingTemperatureGradient, timeScaleFactor } from "./temperatureHumidity.js";
import { getCurDay } from "./time.js";


const WEATHER_RAINY = "WEATHER_RAINY";
const WEATHER_MOSTLYCLOUDY = "WEATHER_MOSTLYCLOUDY";


var curRainFallAmount = 0;
var curWeatherStartTime = 0;
var curWeatherInterval = 2;
var curWeather = WEATHER_RAINY;

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
                        if (!isPointInWindBounds(wx, wy)) {
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

// https://www.noaa.gov/jetstream/clouds/four-core-types-of-clouds
function spawnCumulusCloud() {
    ALL_CLOUDS.push(new Cloud(
        randRange(-CANVAS_SQUARES_X/4, CANVAS_SQUARES_X * (0.75)),
        randRange(4, 8),
        randRange(8, 12), randRange(4, 8), 
        getCurDay() + 0.00001 * randRange(1, 30), .1 * randRange(2, 4), 
        randRange(1.0, 1.01), 0.1 * randRange(0.02, 0.2)));
}

function spawnStratusCloud() {

}

function spawnNimbusCloud() {
    ALL_CLOUDS.push(new Cloud(
        randRange(CANVAS_SQUARES_X/16, CANVAS_SQUARES_X * (0.75/4)),
        randRange(4, 6),
        randRange(12, 17), randRange(2, 4), 
        getCurDay() + 0.00001 * randRange(1, 30), .01 * randRange(2, 4), 
        randRange(1.01, 1.05), 0.8));
}


var ALL_CLOUDS = [];


var partlyCloudyHumidityGradient = [
    [0, 0.95],
    [0.15, 0.99],
    [0.25, 0.95],
    [1, 0.75]
]
var partlyCloudyTemperatureGradient = [
    [0, 273 + 10],
    [0.5, 273 + 20],
    [1, 273 + 30]
]
function mostlyCloudyWeather() {
    setRestingHumidityGradient(partlyCloudyHumidityGradient);
    setRestingTemperatureGradient(partlyCloudyTemperatureGradient);

    if (ALL_CLOUDS.length > 3) {
        return;
    }
    spawnCumulusCloud();
}


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
function rainyWeather() {
    setRestingHumidityGradient(rainyHumidityGradient);
    setRestingTemperatureGradient(rainyTemperatureGradient);
    if (ALL_CLOUDS.length > 5) {
        return;
    }
    spawnNimbusCloud();
}

export function weather() {
    ALL_CLOUDS.forEach((cloud) => cloud.tick());
    if (ALL_CLOUDS.some((cloud) => getCurDay() > cloud.startDay + cloud.duration)) {
        ALL_CLOUDS = Array.from(ALL_CLOUDS.filter((cloud) => getCurDay() < cloud.startDay + cloud.duration));
    }

    if (getCurDay() > curWeatherStartTime + curWeatherInterval) {
        if (curWeather == WEATHER_MOSTLYCLOUDY) {
            console.log("Starting rain...");
            curWeather = WEATHER_RAINY;
            curRainFallAmount = 0;
            curWeatherStartTime = getCurDay();
        }
        else if (curWeather == WEATHER_RAINY) {
            console.log("Rainfall finished; rained this amount:", curRainFallAmount);
            curWeather = WEATHER_MOSTLYCLOUDY;
            curWeatherStartTime = getCurDay();
        }
    }
    rainyWeather();
    return;
    switch (curWeather) {
        
        case WEATHER_RAINY:
            rainyWeather();
            break;
        case WEATHER_MOSTLYCLOUDY:
            mostlyCloudyWeather();
            break;
    }
}