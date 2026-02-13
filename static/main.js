import { doWaterFlow, periodicPurgeOldGroupData, physics, processOrganisms, renderCandidateMap, renderOrganisms, renderSolidSquares, renderTargetMap, renderWaterSquares, reset, setFrameCartesians } from "./globalOperations.js";
import { doClickAdd, doClickAddEyedropperMixer } from "./manipulation.js";
import { renderClouds, renderTemperature, renderWaterSaturation } from "./climate/simulation/temperatureHumidity.js";
import { doTimeSeek, doTimeSkipToNow, getTimeScale, isTimeSeeking, renderTime, updateTime } from "./climate/time.js";
import { executeFunctionQueue, loadGD, saveGD, UI_CAMERA_CENTER_SELECT_POINT, UI_CAMERA_EXPOSURE, UI_LIGHTING_GLOBAL, UI_SIMULATION_CLOUDS, UI_VIEWMODE_3D, UI_VIEWMODE_AIRTICKRATE, UI_VIEWMODE_DEV1, UI_VIEWMODE_DEV2, UI_VIEWMODE_DEV5, UI_VIEWMODE_NORMAL, UI_VIEWMODE_SELECT, UI_VIEWMODE_TEMPERATURE, UI_VIEWMODE_WIND } from "./ui/UIData.js";
import { initUI, renderMouseHover, renderWindows, resetWindowHovered, updateWindows } from "./ui/WindowManager.js";
import { renderWindPressureMap } from "./climate/simulation/wind.js";
import { LightingHandler } from "./lighting/lightingHandler.js";
import { ClimateHandler } from "./climate/climateHandler.js";
import { isLeftMouseClicked } from "./mouse.js";
import { iterateOnSquares, resetSqColChangeMap } from "./squares/_sqOperations.js";
import { isSaveOrLoadInProgress } from "./saveAndLoad.js";
import { renderThrottleMap } from "./climate/simulation/throttler.js";
import { playerTick, renderPlayer } from "./player/playerMain.js";
import { gamepadInputLoop } from "./gamepad.js";
import { renderCloudsDebug } from "./climate/weather/weatherManager.js";
import { clearTimeouts, completeActiveJobs, prepareTickJobs } from "./scheduler.js";
import { canvasPanRoutine, getBaseSize, zoomCanvasFillRect } from "./canvas.js";
import { render3DHud, tickFrameMatrix } from "./rendering/camera.js";
import { gamepadCameraInput } from "./gamepadCameraInput.js";
import { executeRenderJobs } from "./rendering/rasterizer.js";
import { StarHandler } from "./climate/stars/starHandler.js";
import { MAIN_CONTEXT } from "./index.js";
import { COLOR_VERY_FUCKING_RED } from "./colors.js";


let starHandler;
let lightingHandler;
let climateHandler;

export function getLightingHandler() {
    return lightingHandler;
}

export function getStarHandler() {
    return starHandler;
}

export function getClimateHandler() {
    return climateHandler;
}

function initHandlers(force) {
    starHandler = (force ? new StarHandler() : starHandler ?? new StarHandler());
    lightingHandler = (force ? new LightingHandler() : lightingHandler ?? new LightingHandler());
    climateHandler = (force ? new ClimateHandler() : climateHandler ?? new ClimateHandler());
}

export function lightingExposureAdjustment() {
    let mult = loadGD(UI_LIGHTING_GLOBAL) / lightingHandler.plantAvailableLighting;
    saveGD(UI_CAMERA_EXPOSURE, mult);
}

export function resetLighting() {
    clearTimeouts();
    lightingHandler.destroy();
    iterateOnSquares((sq) => sq.purgeLighting());
    lightingHandler = new LightingHandler();
}

export function resetClimateAndLighting() {
    resetLighting();
    climateHandler = new ClimateHandler();
}

export function resetClimate() {
    climateHandler.reset();
}

function gamepadAndPlayerTick() {
    gamepadInputLoop();

    if (loadGD(UI_VIEWMODE_SELECT) == UI_VIEWMODE_3D) {
        gamepadCameraInput();
    }
    else {
        if (getTimeScale() > 0) {
            playerTick();
        }
    }

}

export function scheduler_main() {
    if (!isSaveOrLoadInProgress()) {
        initHandlers();
        resetSqColChangeMap();
        updateTime();
        doClickAdd();
        doClickAddEyedropperMixer();
        resetWindowHovered();
        canvasPanRoutine();
        squareTick();
        gamepadAndPlayerTick();
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
        render3DHud();
        renderMainDebug();
    }
    setTimeout(scheduler_main, 0);
}


function render() {
    tickFrameMatrix();

    let selectedViewMode = loadGD(UI_VIEWMODE_SELECT);
    doTimeSeek();
    renderTime();
    starHandler.render();

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
    if (selectedViewMode == UI_VIEWMODE_3D) {
        setFrameCartesians();
    }
    lightingHandler.lightingTick();

    lightingExposureAdjustment();


    if (selectedViewMode != UI_VIEWMODE_3D) 
        executeRenderJobs();

    renderSolidSquares();
    renderOrganisms();
    renderWaterSquares();

    if (selectedViewMode == UI_VIEWMODE_3D) 
        executeRenderJobs();
    
    if (loadGD(UI_SIMULATION_CLOUDS)) {
        if (selectedViewMode == UI_VIEWMODE_NORMAL || selectedViewMode == UI_VIEWMODE_DEV5)
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
let debug = new URLSearchParams(document.location.search).get("debug");

function renderMainDebug() {
        if (!debug)
            return;
    renderCenterSelect();
}

function renderCenterSelect() {
    let csp = loadGD(UI_CAMERA_CENTER_SELECT_POINT) ?? [0, 0];
    MAIN_CONTEXT.fillStyle = COLOR_VERY_FUCKING_RED;
    zoomCanvasFillRect(
        csp[0] * getBaseSize(),
        csp[1] * getBaseSize(),
        getBaseSize(),
        getBaseSize()
    );
}
