import { initTemperatureHumidity, restingValues, tickMaps } from "./simulation/temperatureHumidity.js";
import { initWeather, weather } from "./weather/weatherManager.js";
import { initWindPressure, tickWindPressureMap } from "./simulation/wind.js";
import { initWindThrottleMap } from "./simulation/throttler.js";
import { AtmosphereHandler } from "./simulation/atmosphere/AtmosphereHandler.js";

export class ClimateHandler {   
    constructor() {
        this.atmosphereHandler = null;
        this.reset();
    }

    reset() {
        this.atmosphereHandler = new AtmosphereHandler();
        // initWeather();
        // initTemperatureHumidity();
        // initWindThrottleMap();
    }

    climateTick() {
        weather();
        // tickWindPressureMap();
        // tickMaps();
        // restingValues();
    }
}