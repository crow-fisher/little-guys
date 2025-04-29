import { initializeStarMap } from "./time.js";
import { initTemperatureHumidity, restingValues, tickMaps } from "./simulation/temperatureHumidity.js";
import { initWeather, weather } from "./weather/weatherManager.js";
import { initWindPressure, tickWindPressureMap } from "./simulation/wind.js";
import { initWindThrottleMap } from "./simulation/throttler.js";

export class ClimateHandler {   
    constructor() {
        this.reset();
    }

    reset() {
        initWindPressure();
        initWeather();
        initTemperatureHumidity();
        initWindThrottleMap();
        initializeStarMap();
    }

    climateTick() {
        weather();
        tickWindPressureMap();
        tickMaps();
        restingValues();
    }
}