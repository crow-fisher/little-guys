import { doLightSourceRaycasting, doWaterFlow, lightingPreRender, physics, processOrganisms, purge, renderOrganisms, renderSquares, renderWater, reset } from "./globalOperations.js";
import { LIGHT_SOURCES } from "./globals.js";
import { doClickAdd, doMouseHover, getBlockModification_val, getLastMode, getSelectedViewMode } from "./index.js";
import { lightingClearLifeSquarePositionMap } from "./lighting.js";
import { initTemperatureHumidity, renderClouds, renderTemperature, renderWaterSaturation, restingValues, tickMaps } from "./temperatureHumidity.js";
import { doTimeSeek, getTimeScale, initializeStarMap, renderTime, updateTime } from "./time.js";
import { weather } from "./weather.js";
import { initializeWindPressureMap, renderWindPressureMap, tickWindPressureMap } from "./wind.js";

const SQUARE_UPDATE_MILLIS = 0;
const ORG_UPDATE_MILLIS = 0;

let last_square_tick = 0;
let last_org_tick = 0;

let updated = false;
let firstTime = true;

export function triggerEarlySquareScheduler() {
    last_square_tick = 0;
}

export function scheduler_main() {
    if (firstTime) {
        init();
        firstTime = false;
    }
    updateTime();
    doMouseHover();
    doClickAdd();

    if (getTimeScale() != 0) {
        if (Date.now() - last_square_tick > SQUARE_UPDATE_MILLIS) {
            squareTick();
            last_square_tick = Date.now();
            updated = true;
        }
        if (Date.now() - last_org_tick > ORG_UPDATE_MILLIS) {
            orgTick();
            last_org_tick = Date.now();
            updated = true;
        }
    }

    if (updated) {
        render();
        updated = false;
    }
    setTimeout(scheduler_main, 0);
}

function init() {
    initTemperatureHumidity();
    initializeWindPressureMap();
    initializeStarMap();
}

function preRender() {
    lightingPreRender();
}

function render() {
    var selectedViewMode = getSelectedViewMode();
    var lastMode = getLastMode();
    var blockModification_val = getBlockModification_val();
    doTimeSeek();
    renderTime();

    if (selectedViewMode == "temperature") {
        renderTemperature();
    }
    if (selectedViewMode == "wind" || (lastMode == "blockModification" && (blockModification_val == "windAdd" || blockModification_val == "windClear"))) {
        renderWindPressureMap();
    }
    if (selectedViewMode == "watersaturation") {
        renderWaterSaturation();
    }

    preRender();
    doLightSourceRaycasting();
    renderSquares();
    renderWater();
    lightingClearLifeSquarePositionMap();
    renderOrganisms();

    if (selectedViewMode == "normal") {
        renderClouds();
    }

}



function windMapsTick() {
    weather();
    tickWindPressureMap();
    tickMaps();
    restingValues();
}

function orgTick() {
    processOrganisms();
}

function squareTick() {
    reset();
    physics();
    doWaterFlow();
    purge();
    windMapsTick();
}