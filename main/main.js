import { doWaterFlow, periodicPurgeOldGroupData, physics, processOrganisms, renderCandidateMap, renderOrganisms, renderSolidSquares, renderTargetMap, renderWaterSquares, reset, setFrameCartesians } from "./globalOperations.js";
import { doClickAdd, doClickAddEyedropperMixer } from "./manipulation.js";
import { renderClouds, renderWaterSaturation } from "./world/climate/simulation/temperatureHumidity.js";
import { doTimeSeek, getTimeScale, isTimeSeeking, renderTime, updateTime } from "./world/time/time.js";
import { executeFunctionQueue, loadGD, saveGD, UI_CAMERA_CENTER_SELECT_POINT, UI_CAMERA_EXPOSURE, UI_LIGHTING_GLOBAL, UI_SIMULATION_CLOUDS, UI_VIEWMODE_3D, UI_VIEWMODE_AIRTICKRATE, UI_VIEWMODE_DEV1, UI_VIEWMODE_DEV2, UI_VIEWMODE_DEV5, UI_VIEWMODE_NORMAL, UI_VIEWMODE_SELECT, UI_VIEWMODE_TEMPERATURE, UI_VIEWMODE_WIND } from "./ui/UIData.js";
import { renderMouseHover, renderWindows, resetWindowHovered, updateWindows } from "./ui/WindowManager.js";
import { LightingHandler } from "./world/lighting/lightingHandler.js";
import { isLeftMouseClicked } from "./mouse.js";
import { iterateOnSquares, resetSqColChangeMap } from "./squares/_sqOperations.js";
import { isSaveOrLoadInProgress } from "./saveAndLoad.js";
import { renderThrottleMap } from "./world/climate/simulation/throttler.js";
import { playerTick, renderPlayer } from "./player/playerMain.js";
import { gamepadInputLoop } from "./gamepad.js";
import { renderCloudsDebug } from "./world/climate/weather/weatherManager.js";
import { clearTimeouts, completeActiveJobs, prepareTickJobs } from "./scheduler.js";
import { canvasPanRoutine, getBaseSize, zoomCanvasFillRect } from "./canvas.js";
import { render3DHud, tickFrameMatrix } from "./rendering/camera.js";
import { gamepadCameraInput } from "./gamepadCameraInput.js";
import { executeRenderJobs } from "./rendering/rasterizer.js";
import { StarHandler } from "./world/climate/stars/starHandler.js";
import { MAIN_CONTEXT, NOORG } from "./index.js";
import { COLOR_VERY_FUCKING_RED } from "./colors.js";
import { AtmosphereHandler } from "./world/atmosphere/AtmosphereHandler.js";
import { renderIBODEvents } from "./ibod/IBODManager.js";


let starHandler;
let lightingHandler;
let atmosphereHandler;

export function getLightingHandler() {
    return lightingHandler;
}

export function getStarHandler() {
    return starHandler;
}

export function getAtmosphereHandler() {
    return atmosphereHandler;
}

function initHandlers(force) {
    starHandler = (force ? new StarHandler() : starHandler ?? new StarHandler());
    lightingHandler = (force ? new LightingHandler() : lightingHandler ?? new LightingHandler());
    atmosphereHandler = (force ? new AtmosphereHandler() : atmosphereHandler ?? new AtmosphereHandler());
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
    atmosphereHandler = new AtmosphereHandler();
}

export function resetAtmosphere() {
    atmosphereHandler.reset();
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

        /** BOOP BOOP */
        renderIBODEvents();
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
        // renderTemperature();
    }
    if (selectedViewMode == UI_VIEWMODE_WIND) {
        renderWaterSaturation();
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
    if (NOORG || getTimeScale() == 0) {
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
        atmosphereHandler.tick();
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
export function getWindSpeedAtLocationXY(x, y) {
    return getWindSpeedAtLocation([x, y, 0]);
}

export function getWindSpeedAtLocation(loc) {
    return getAtmosphereHandler().getWindSpeedAtLocation(loc);
}

export function addWindAtCanvasLocation(x, y, pressure) { 
    let s = getAtmosphereHandler().indexAtmosphereUnit2D(x, y);
    if (s) 
        s.pressure += pressure;
}