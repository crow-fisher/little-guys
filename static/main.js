import { doWaterFlow, physics, processOrganisms, purge, renderOrganisms, renderSolidSquares, renderWaterSquares, reset } from "./globalOperations.js";
import { doClickAdd } from "./manipulation.js";
import { resetFrameDivMult } from "./lighting/lightingProcessing.js";
import { renderClouds, renderTemperature, renderWaterSaturation } from "./climate/temperatureHumidity.js";
import { doTimeSeek, getTimeScale, renderTime, updateTime } from "./climate/time.js";
import { executeFunctionQueue, loadUI, UI_VIEWMODE_MOISTURE, UI_VIEWMODE_NORMAL, UI_VIEWMODE_SELECT, UI_VIEWMODE_TEMPERATURE, UI_VIEWMODE_WIND } from "./ui/UIData.js";
import { renderWindows, resetWindowHovered, updateWindows } from "./ui/WindowManager.js";
import { renderWindPressureMap } from "./climate/wind.js";
import { LightingHandler } from "./lighting/lightingHandler.js";
import { ClimateHandler } from "./climate/climateHandler.js";
import { isLeftMouseClicked } from "./mouse.js";
 
const SQUARE_UPDATE_MILLIS = 0;
const ORG_UPDATE_MILLIS = 0;

let last_square_tick = 0;
let last_org_tick = 0;

let updated = false;

const lightingHandler = new LightingHandler();
const climateHandler = new ClimateHandler();

export function setNextLightUpdateTime(t) {
    lightingHandler.setNextLightingUpdateTime(t);
}

export function triggerEarlySquareScheduler() {
    last_square_tick = 0;
}

export function scheduler_main() {
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

    renderWaterSquares();
    if (selectedViewMode == UI_VIEWMODE_NORMAL) {
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