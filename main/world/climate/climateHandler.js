import { initTemperatureHumidity, restingValues, tickMaps } from "./simulation/temperatureHumidity.js";
import { initWindThrottleMap } from "./simulation/throttler.js";
import { AtmosphereHandler } from "../atmosphere/AtmosphereHandler.js";

export class ClimateHandler {   
    constructor() {
        this.atmosphereHandler = null;
        this.reset();
    }

    reset() {
        this.atmosphereHandler = new AtmosphereHandler();
    }
}