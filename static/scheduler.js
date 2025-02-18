import { doLightSourceRaycasting, doWaterFlow, lightingPreRender, physics, processOrganisms, purge, renderOrganisms, renderSolidSquares, renderWaterSquares, reset } from "./globalOperations.js";
import { doClickAdd, getBlockModification_val, getLastMode, getSelectedViewMode } from "./index.js";
import { lightingClearLifeSquarePositionMap } from "./lighting/lighting.js";
import { resetFrameDivMult } from "./lighting/lightingProcessing.js";
import { initTemperatureHumidity, renderClouds, renderTemperature, renderWaterSaturation, restingValues, tickMaps } from "./temperatureHumidity.js";
import { doTimeSeek, getTimeScale, initializeStarMap, renderTime, updateTime } from "./climate/time.js";
import { executeFunctionQueue } from "./ui/UIData.js";
import { renderWindows, resetWindowHovered, updateWindows } from "./ui/WindowManager.js";
import { weather } from "./climate/weather.js";
import { initWindPressure, renderWindPressureMap, tickWindPressureMap } from "./climate/wind.js";
import { LightingHandler } from "./lighting/lightingHandler.js";
import { ClimateHandler } from "./climate/climateHandler.js";

const SQUARE_UPDATE_MILLIS = 0;
const ORG_UPDATE_MILLIS = 0;

let last_square_tick = 0;
let last_org_tick = 0;

let updated = false;
let firstTime = true;

const lightingHandler = new LightingHandler();
const climateHandler = new ClimateHandler();

export function triggerEarlySquareScheduler() {
    last_square_tick = 0;
}

export function scheduler_main() {
    if (firstTime) {
        init();
        firstTime = false;
    }
    updateTime();
    doClickAdd();
    resetWindowHovered(); 

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

    updateWindows();
    executeFunctionQueue();
    setTimeout(scheduler_main, 0);
}

function init() {
    initTemperatureHumidity();
    initWindPressure();
    initializeStarMap();
}

function preRender() {
    lightingHandler.preRender();
}

function render() {
    var selectedViewMode = getSelectedViewMode();
    var lastMode = getLastMode();
    var blockModification_val = getBlockModification_val();
    resetFrameDivMult();
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
    lightingHandler.lightingTick();

    renderWaterSquares();
    if (selectedViewMode == "normal") {
        renderClouds();
    }
    renderSolidSquares();
    renderOrganisms();
    renderWindows();
}


function orgTick() {
    processOrganisms();
}

function squareTick() {
    reset();
    physics();
    doWaterFlow();
    purge();

    climateHandler.climateTick();
}