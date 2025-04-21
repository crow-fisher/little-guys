import { doWaterFlow, physics, processOrganisms, renderOrganisms, renderSolidSquares, renderWaterSquares, reset } from "./globalOperations.js";
import { doClickAdd, doClickAddEyedropperMixer } from "./manipulation.js";
import { renderClouds, renderTemperature, renderWaterSaturation } from "./climate/temperatureHumidity.js";
import { doTimeSeek, doTimeSkipToNow, isTimeSeeking, renderTime, updateTime } from "./climate/time.js";
import { executeFunctionQueue, loadGD, UI_SIMULATION_CLOUDS, UI_VIEWMODE_MOISTURE, UI_VIEWMODE_NORMAL, UI_VIEWMODE_SELECT, UI_VIEWMODE_TEMPERATURE, UI_VIEWMODE_WIND } from "./ui/UIData.js";
import { initUI, renderWindows, resetWindowHovered, updateWindows } from "./ui/WindowManager.js";
import { renderWindPressureMap } from "./climate/wind.js";
import { LightingHandler } from "./lighting/lightingHandler.js";
import { ClimateHandler } from "./climate/climateHandler.js";
import { isLeftMouseClicked } from "./mouse.js";
import { iterateOnSquares } from "./squares/_sqOperations.js";
import { doPeriodicSave, isSaveOrLoadInProgress } from "./saveAndLoad.js";
 
initUI();
let lightingHandler = new LightingHandler();
let climateHandler = new ClimateHandler();
let liveTimeouts = new Array();
doTimeSkipToNow();

export function addTimeout(timeout) {
    liveTimeouts.push(timeout);
}
export function clearTimeouts() {
    liveTimeouts.forEach((timeout) => clearTimeout(timeout));
    liveTimeouts = new Array();
}

export function resetLighting() {
    // lightingHandler.destroy();
    // clearTimeouts();
    // iterateOnSquares((sq) => sq.lighting = new Array());
    // lightingHandler = new LightingHandler();
}
    
export function resetClimateAndLighting() {
    resetLighting();
    climateHandler = new ClimateHandler();
}

export function scheduler_main() {
    if (!isSaveOrLoadInProgress()) {
        updateTime();
        doClickAdd();
        doClickAddEyedropperMixer();
        resetWindowHovered(); 
        squareTick();
        orgTick();
        render();
        renderWindows();
        updateWindows();
        if (!isLeftMouseClicked()) 
            executeFunctionQueue();
        
        doPeriodicSave();
    }
    setTimeout(scheduler_main, 0);
}

function render() {
    let selectedViewMode = loadGD(UI_VIEWMODE_SELECT);
    doTimeSeek();
    renderTime();

    if (selectedViewMode == UI_VIEWMODE_TEMPERATURE) {
        renderTemperature();
        renderWindPressureMap();
    }
    if (selectedViewMode == UI_VIEWMODE_WIND) {
        renderWindPressureMap();
    }
    if (selectedViewMode == UI_VIEWMODE_MOISTURE) {
        renderWaterSaturation();
        renderWindPressureMap();
    }
    lightingHandler.lightingTick();

    renderSolidSquares();
    renderOrganisms();
    renderWaterSquares();
    if (selectedViewMode == UI_VIEWMODE_NORMAL && loadGD(UI_SIMULATION_CLOUDS)) {
        renderClouds();
    }
    renderWindows();
}


function orgTick() {
    if (!isTimeSeeking())
        processOrganisms();
}


function squareTick() {
    reset();
    physics();
    doWaterFlow();

    if (loadGD(UI_SIMULATION_CLOUDS)) {
        climateHandler.climateTick();
    }
}