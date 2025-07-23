import { doWaterFlow, periodicPurgeOldGroupData, physics, processOrganisms, renderCandidateMap, renderOrganisms, renderSolidSquares, renderTargetMap, renderWaterSquares, reset } from "./globalOperations.js";
import { doClickAdd, doClickAddEyedropperMixer } from "./manipulation.js";
import { renderClouds, renderTemperature, renderWaterSaturation } from "./climate/simulation/temperatureHumidity.js";
import { doTimeSeek, doTimeSkipToNow, getTimeScale, isTimeSeeking, renderTime, updateTime } from "./climate/time.js";
import { addUIFunctionMap, executeFunctionQueue, loadGD, UI_CANVAS_VIEWPORT_CENTER_X, UI_SIMULATION_CLOUDS, UI_VIEWMODE_AIRTICKRATE, UI_VIEWMODE_DEV1, UI_VIEWMODE_DEV2, UI_VIEWMODE_NORMAL, UI_VIEWMODE_SELECT, UI_VIEWMODE_TEMPERATURE, UI_VIEWMODE_WIND } from "./ui/UIData.js";
import { initUI, renderMouseHover, renderWindows, resetWindowHovered, updateWindows } from "./ui/WindowManager.js";
import { renderWindPressureMap } from "./climate/simulation/wind.js";
import { LightingHandler } from "./lighting/lightingHandler.js";
import { ClimateHandler } from "./climate/climateHandler.js";
import { isLeftMouseClicked } from "./mouse.js";
import { iterateOnSquares, resetSqColChangeMap } from "./squares/_sqOperations.js";
import { doPeriodicSave, isSaveOrLoadInProgress } from "./saveAndLoad.js";
import { renderThrottleMap } from "./climate/simulation/throttler.js";
import { Player } from "./player/player.js";
import { playerTick, renderPlayer } from "./player/playerMain.js";
import { gamepadInputLoop } from "./gamepad.js";
import { renderCloudsDebug } from "./climate/weather/weatherManager.js";
import { completeActiveJobs, prepareTickJobs, schedulerTickStart } from "./scheduler.js";

initUI();
let lightingHandler = new LightingHandler();
let climateHandler = new ClimateHandler();
doTimeSkipToNow();

export function resetLighting() {
    lightingHandler.destroy();
    iterateOnSquares((sq) => sq.lighting = new Array());
    lightingHandler = new LightingHandler();
}

export function resetClimateAndLighting() {
    resetLighting();
    climateHandler = new ClimateHandler();
}

export function resetClimate() {
    climateHandler.reset();
}

function playerMainTick() {
    if (getTimeScale() > 0) {
        gamepadInputLoop();
        playerTick();
    }
}

export function scheduler_main() {
    if (!isSaveOrLoadInProgress()) {
        schedulerTickStart();

        resetSqColChangeMap();
        updateTime();
        doClickAdd();
        doClickAddEyedropperMixer();
        resetWindowHovered();
        squareTick();
        playerMainTick();
        orgTick();
        render();
        renderWindows();
        updateWindows();
        if (!isLeftMouseClicked())
            executeFunctionQueue();
        periodicPurgeOldGroupData();
        // doPeriodicSave();
        renderPlayer();

        prepareTickJobs();
        completeActiveJobs();
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
        renderWaterSaturation();
        renderWindPressureMap();
    }
    if (selectedViewMode == UI_VIEWMODE_AIRTICKRATE) {
        renderThrottleMap();
    }
    if (selectedViewMode == UI_VIEWMODE_DEV1) {
        renderCandidateMap();
    }
    if (selectedViewMode == UI_VIEWMODE_DEV2) {
        renderTargetMap();
    }
    lightingHandler.lightingTick();

    renderSolidSquares();
    renderOrganisms();
    renderWaterSquares();
    if (loadGD(UI_SIMULATION_CLOUDS)) {
        if (selectedViewMode == UI_VIEWMODE_NORMAL)
            renderClouds();
        if (selectedViewMode == UI_VIEWMODE_WIND)
            renderCloudsDebug();
    }
    renderMouseHover();
    renderWindows();
}


function orgTick() {
    if (getTimeScale() == 0) {
        return;
    }
    if (!isTimeSeeking())
        processOrganisms();
}

function squareTick() {
    reset();
    physics();
    doWaterFlow();

    if (getTimeScale() > 0) {
        if (loadGD(UI_SIMULATION_CLOUDS)) {
            climateHandler.climateTick();
        }
    }

}
