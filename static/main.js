import { doWaterFlow, physics, physicsOnlyGravity, physicsWaterSimplePhysics, processOrganisms, renderOrganisms, renderSolidSquares, renderWaterSquares, reset } from "./globalOperations.js";
import { doClickAdd, doClickAddEyedropperMixer } from "./manipulation.js";
import { resetFrameDivMult } from "./lighting/lightingProcessing.js";
import { renderClouds, renderTemperature, renderWaterSaturation } from "./climate/temperatureHumidity.js";
import { doTimeSeek, isTimeSeeking, renderTime, updateTime } from "./climate/time.js";
import { executeFunctionQueue, loadGD, UI_SIMULATION_CLOUDS, UI_SIMULATION_SIMPLESQUARE, UI_VIEWMODE_MOISTURE, UI_VIEWMODE_NORMAL, UI_VIEWMODE_SELECT, UI_VIEWMODE_TEMPERATURE, UI_VIEWMODE_WIND } from "./ui/UIData.js";
import { initUI, renderWindows, resetWindowHovered, updateWindows } from "./ui/WindowManager.js";
import { renderWindPressureMap } from "./climate/wind.js";
import { LightingHandler } from "./lighting/lightingHandler.js";
import { ClimateHandler } from "./climate/climateHandler.js";
import { isLeftMouseClicked, isRightMouseClicked } from "./mouse.js";
import { iterateOnSquares } from "./squares/_sqOperations.js";
 
const SQUARE_UPDATE_MILLIS = 0;
const ORG_UPDATE_MILLIS = 0;

let last_square_tick = 0;
let last_org_tick = 0;

let updated = false;

initUI();

let lightingHandler = new LightingHandler();
let climateHandler = new ClimateHandler();

let liveTimeouts = new Array();

export function addTimeout(timeout) {
    liveTimeouts.push(timeout);
}
export function clearTimeouts() {
    liveTimeouts.forEach((timeout) => clearTimeout(timeout));
    liveTimeouts = new Array();
}

export function resetClimateAndLighting() {
    lightingHandler = new LightingHandler();
    climateHandler = new ClimateHandler();
    iterateOnSquares((sq) => sq.lighting = new Array());
}

export function triggerEarlySquareScheduler() {
    last_square_tick = 0;
}

export function scheduler_main() {
    updateTime();
    doClickAdd();
    doClickAddEyedropperMixer();
    resetWindowHovered(); 
    if (loadGD(UI_SIMULATION_SIMPLESQUARE) || isLeftMouseClicked() || isRightMouseClicked()) {
        squareTickSimplePhysics();
    } else {
        squareTick();
    }
    orgTick();
    render();
    renderWindows();
    updateWindows();
    if (!isLeftMouseClicked()) 
        executeFunctionQueue();
    
    setTimeout(scheduler_main, 0);
}

function render() {
    let selectedViewMode = loadGD(UI_VIEWMODE_SELECT);
    resetFrameDivMult();
    doTimeSeek();
    renderTime();

    if (selectedViewMode == UI_VIEWMODE_TEMPERATURE) {
        renderTemperature();
    }
    if (selectedViewMode == UI_VIEWMODE_WIND) {
        renderWindPressureMap();
    }
    if (selectedViewMode == UI_VIEWMODE_MOISTURE) {
        renderWaterSaturation();
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


function squareTickSimplePhysics() {
    reset();
    physicsOnlyGravity();
    physicsWaterSimplePhysics();
    doWaterFlow();

    if (loadGD(UI_SIMULATION_CLOUDS)) {
        climateHandler.climateTick();
    }
}

function squareTick() {
    reset();
    physics();
    doWaterFlow();

    if (loadGD(UI_SIMULATION_CLOUDS)) {
        climateHandler.climateTick();
    }
}