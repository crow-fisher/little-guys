import { doWaterFlow, physics, physicsOnlyGravity, physicsOnlyWater, physicsWaterSimplePhysics, processOrganisms, purge, renderOrganisms, renderSolidSquares, renderWaterSquares, reset } from "./globalOperations.js";
import { doClickAdd, doClickAddEyedropperMixer } from "./manipulation.js";
import { resetFrameDivMult } from "./lighting/lightingProcessing.js";
import { renderClouds, renderTemperature, renderWaterSaturation } from "./climate/temperatureHumidity.js";
import { doTimeSeek, getTimeScale, renderTime, updateTime } from "./climate/time.js";
import { executeFunctionQueue, loadUI, UI_SIMULATION_CLOUDS, UI_SIMULATION_SIMPLESQUARE, UI_TOPBAR_SIMULATION, UI_VIEWMODE_MOISTURE, UI_VIEWMODE_NORMAL, UI_VIEWMODE_SELECT, UI_VIEWMODE_TEMPERATURE, UI_VIEWMODE_WIND } from "./ui/UIData.js";
import { initUI, renderWindows, resetWindowHovered, updateWindows } from "./ui/WindowManager.js";
import { renderWindPressureMap } from "./climate/wind.js";
import { LightingHandler } from "./lighting/lightingHandler.js";
import { ClimateHandler } from "./climate/climateHandler.js";
import { isLeftMouseClicked } from "./mouse.js";
 
const SQUARE_UPDATE_MILLIS = 0;
const ORG_UPDATE_MILLIS = 0;

let last_square_tick = 0;
let last_org_tick = 0;

let updated = false;

initUI();

const lightingHandler = new LightingHandler();
const climateHandler = new ClimateHandler();

export function resetClimate() {
    climateHandler.reset();
}

export function triggerEarlySquareScheduler() {
    last_square_tick = 0;
}

export function scheduler_main() {
    updateTime();
    doClickAdd();
    doClickAddEyedropperMixer();
    resetWindowHovered(); 
    if (loadUI(UI_SIMULATION_SIMPLESQUARE)) {
        squareTickSimplePhysics();
    } else {
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
    }

    render();
    renderWindows();
    updateWindows();
    if (!isLeftMouseClicked()) 
        executeFunctionQueue();
    
    setTimeout(scheduler_main, 0);
}

function render() {
    var selectedViewMode = loadUI(UI_VIEWMODE_SELECT);
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
    if (selectedViewMode == UI_VIEWMODE_NORMAL && loadUI(UI_SIMULATION_CLOUDS)) {
        renderClouds();
    }
    renderWindows();
}


function orgTick() {
    processOrganisms();
}



function squareTickSimplePhysics() {
    reset();
    physicsOnlyGravity();
    physicsWaterSimplePhysics();
    doWaterFlow();
    purge();

    if (loadUI(UI_SIMULATION_CLOUDS)) {
        climateHandler.climateTick();
    }
}

function squareTick() {
    reset();
    physics();
    doWaterFlow();
    purge();

    if (loadUI(UI_SIMULATION_CLOUDS)) {
        climateHandler.climateTick();
    }
}