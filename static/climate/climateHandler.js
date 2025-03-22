import { initializeStarMap } from "./time.js";
import { initTemperatureHumidity, restingValues, tickMaps } from "./temperatureHumidity.js";
import { initWeather, weather } from "./weather/weatherManager.js";
import { initWindPressure, tickWindPressureMap } from "./wind.js";

export class ClimateHandler {   
    constructor() {
        initWindPressure();
        initWeather();
        initTemperatureHumidity();
        initializeStarMap();
    }

    reset() {
        initWindPressure();
        initWeather();
        initTemperatureHumidity();
        initializeStarMap();
    }

    climateTick() {
        weather();
        tickWindPressureMap();
        tickMaps();
        restingValues();
    }
}