import { getBaseSize, getBaseUISize, getCanvasHeight, getCanvasWidth, transformPixelsToCanvasSquares, zoomCanvasFillRect } from "../canvas.js";
import { OrganismComponent } from "./components/OrganismComponent.js";
import { BlockPalette } from "./components/BlockPalette.js";
import { BlockSubtreeComponent as BlockSubtree } from "./components/BlockSubtreeComponent.js";
import { TopBarComponent } from "./topbar/TopBarComponent.js";
import { ViewSubtreeComponent } from "./components/ViewSubtreeComponent.js";
import { loadGD, UI_SM_LIGHTING, UI_PALETTE_PLANTS, UI_TOPBAR_BLOCK, UI_PALETTE_BLOCKS, UI_TOPBAR_MAINMENU, UI_TOPBAR_VIEWMODE, saveGD, UI_PALETTE_MIXER, addUIFunctionMap, UI_TOPBAR_LIGHTING, UI_TOPBAR_TIME, UI_TOPBAR_WEATHER, UI_MAIN_NEWWORLD, saveUI, UI_UI_SIZE, UI_PALETTE_SOILIDX, UI_PALETTE_ROCKIDX, UI_CLIMATE_SELECT_CLOUDS, UI_PALETTE_MODE, UI_PALETTE_MODE_ROCK, UI_PALETTE_SELECT, UI_PALETTE_SOILROCK, UI_PALETTE_MODE_SOIL, UI_PALETTE_CLIPS, UI_PALETTE_CLIPS_WAYPOINT_NAME, UI_PALETTE_STRENGTH, UI_PALETTE_WATER, UI_PALETTE_SURFACE, UI_PALETTE_SURFACE_OFF, UI_PALETTE_COMPOSITION, UI_LIGHTING_ENABLED, UI_PALETTE_AQUIFER, UI_TOPBAR_STARGAZER, UI_PLOTCONTAINER_ACTIVE } from "./UIData.js";
import { getSquares } from "../squares/_sqOperations.js";
import { ClipComponent } from "./components/ClipComponent.js";
import { getCurMixIdx, getMixArr, getMixArrLen, getTargetMixIdx, setCurMixIdx, setTargetMixIdx } from "../globals.js";
import { MainMenuComponent } from "./components/MainMenuComponent.js";
import { LightingSubtree } from "./components/LightingSubtree.js";
import { LightingComponent } from "./components/LightingComponent.js";
import { WeatherSelectionComponent } from "./components/WeatherSelectionComponent.js";
import { TimeSkipComponent } from "./components/TimeSkipComponent.js";
import { CloudControlComponent } from "./components/CloudControlComponent.js";
import { getLastMouseDown, getLastMoveOffset, isLeftMouseClicked, isTouchActive, isTouchMode } from "../mouse.js";
import { MAIN_CONTEXT } from "../index.js";
import { doBrushFunc } from "../manipulation.js";
import { hexToRgb, rgbToRgba } from "../common.js";
import { getActiveClimate } from "../climate/climateManager.js";
import { SoilSquare } from "../squares/parameterized/SoilSquare.js";
import { getDefaultLighting } from "../lighting/lightingProcessing.js";
import { WorldSetupComponent } from "./components/WorldSetupComponent.js";
import { RockSquare } from "../squares/parameterized/RockSquare.js";
import { WaterSquare } from "../squares/WaterSquare.js";
import { StargazerComponent } from "./components/StargazerComponent.js";
import { PlotContainerComponent } from "./components/PlotContainerComponent.js";

let topBarComponent;
let mainMenuComponent;
let blockPalette;
let all_components;
let playerSetup;

all_components = [];
topBarComponent = new TopBarComponent("UI_TOPBAR");

export function initUI() {
    if (getBaseUISize() * 40 > getCanvasHeight() && getCanvasHeight() > 500) {
        saveUI(UI_UI_SIZE, 8);
    }

    const palette_y_offset = getBaseUISize() * 4;

    all_components = [];
    topBarComponent = new TopBarComponent("UI_TOPBAR");
    mainMenuComponent = new MainMenuComponent(() => 0, () => topBarComponent.ySize(), 0, 0, UI_TOPBAR_MAINMENU);
    all_components.push(mainMenuComponent);
    all_components.push(new BlockSubtree(() => topBarComponent.getElementXPositionFunc(0, 1), () => topBarComponent.ySize(), 0, 0, UI_TOPBAR_BLOCK));
    all_components.push(new CloudControlComponent(getBaseUISize() * 24, palette_y_offset, 0, 0, UI_CLIMATE_SELECT_CLOUDS));
    all_components.push(new ViewSubtreeComponent(() => topBarComponent.getElementXPositionFunc(0, 3), () => topBarComponent.ySize(), 0, 0, UI_TOPBAR_VIEWMODE));
    blockPalette = new BlockPalette(getBaseUISize() * 24, palette_y_offset, 0, 0, UI_PALETTE_BLOCKS)
    all_components.push(blockPalette);

    all_components.push(new LightingComponent(getBaseUISize() * 63, palette_y_offset, 0, 0, UI_SM_LIGHTING));
    all_components.push(new LightingSubtree(() => topBarComponent.getElementXPositionFunc(0, 5), () => topBarComponent.ySize(), 0, 0, UI_TOPBAR_LIGHTING));
    all_components.push(new OrganismComponent(getBaseUISize() * 24, palette_y_offset, 0, 0, UI_PALETTE_PLANTS));
    playerSetup = new ClipComponent(getBaseUISize() * 34, getBaseUISize() * 6, 0, 0, UI_PALETTE_CLIPS);
    all_components.push(playerSetup);
    all_components.push(new TimeSkipComponent(() => topBarComponent.getElementXPositionFunc(0, 18 - 5), () => topBarComponent.ySize(), 0, 0, UI_TOPBAR_TIME));
    all_components.push(new WeatherSelectionComponent(() => topBarComponent.getElementXPositionFunc(0, 20 - 5), () => topBarComponent.ySize(), 0, 0, UI_TOPBAR_WEATHER));
    all_components.push(new WorldSetupComponent(() => getCanvasWidth() / 2, () => getBaseUISize() * 30, 0, 0, UI_MAIN_NEWWORLD));
    all_components.push(new StargazerComponent(() => topBarComponent.getElementXPositionFunc(0, 7), () => topBarComponent.ySize(), 0, 0, UI_TOPBAR_STARGAZER)); 
    all_components.push(new PlotContainerComponent(getBaseUISize() * 12, getBaseUISize() * 30, 0, 0, UI_PLOTCONTAINER_ACTIVE));

}

export function getMainMenuComponent() {
    return mainMenuComponent;
}

export function getTopBarComponent() {
    return topBarComponent;
}

export function renderWindows() {
    all_components.forEach((window) => window.render());
    topBarComponent.render();

}
export function updateWindows() {
    topBarComponent.update();
    all_components.forEach((window) => window.update());
}

export function resetWindowHovered() {
    all_components.forEach((component) => {
        component.window.hovered = false;
        component.window.locked = false;
    });
    topBarComponent.hovered = false;
}
export function isWindowHovered() {
    return all_components.some((component) => component.window.hovered) || topBarComponent.hovered;
}

export function eyedropperBlockHover(posX, posY) {
    let targetProto = loadGD(UI_PALETTE_MODE) == UI_PALETTE_MODE_ROCK ? "RockSquare" : "SoilSquare";
    getSquares(Math.floor(posX), Math.floor(posY)).filter((sq) => sq.proto == targetProto).forEach((sq) => {
        blockPalette.setHover(sq.sand, sq.silt, sq.clay);
    });
}

function setPaletteForMixerEyedropper(posX, posY) {
    if (getSquares(posX, posY).some((sq) => sq.proto == "SoilSquare")) {
        saveGD(UI_PALETTE_MODE, UI_PALETTE_MODE_SOIL);
    };
    if (getSquares(posX, posY).some((sq) => sq.proto == "RockSquare")) {
        saveGD(UI_PALETTE_MODE, UI_PALETTE_MODE_ROCK);
    };
}

export function eyedropperBlockClick(posX, posY) {
    setPaletteForMixerEyedropper(posX, posY);
    let targetProto = loadGD(UI_PALETTE_MODE) == UI_PALETTE_MODE_ROCK ? "RockSquare" : "SoilSquare";
    let targetIdx = loadGD(UI_PALETTE_MODE) == UI_PALETTE_MODE_ROCK ? UI_PALETTE_ROCKIDX : UI_PALETTE_SOILIDX;

    getSquares(posX, posY).filter((sq) => sq.proto == targetProto).forEach((sq) => {
        blockPalette.setClick(sq.sand, sq.silt, sq.clay);
        saveGD(targetIdx, sq.colorVariant);
    });
    saveGD(UI_PALETTE_SELECT, UI_PALETTE_SOILROCK);
    mixerReset();
}

export function mixerBlockClick(posX, posY) {
    setPaletteForMixerEyedropper(posX, posY);
    let targetProto = loadGD(UI_PALETTE_MODE) == UI_PALETTE_MODE_ROCK ? "RockSquare" : "SoilSquare";
    let targetIdx = loadGD(UI_PALETTE_MODE) == UI_PALETTE_MODE_ROCK ? UI_PALETTE_ROCKIDX : UI_PALETTE_SOILIDX;

    let sq = getSquares(Math.floor(posX), Math.floor(posY)).filter((sq) => sq.proto == targetProto).at(0);
    if (sq == null) {
        return;
    }
    saveGD(targetIdx, sq.colorVariant);
    let sqComp = [sq.sand, sq.silt, sq.clay];
    if (!getMixArr().some((arr) => arr[0] == sqComp[0] && arr[1] == sqComp[1] && arr[2] == sqComp[2])) {
        getMixArr()[getCurMixIdx() % getMixArrLen()] = sqComp;
        sq.mixIdx = getCurMixIdx();
        setCurMixIdx(getCurMixIdx() + 1);
    }
    if (getCurMixIdx() == getTargetMixIdx()) {
        let comp = getMixArr().reduce(
            (a, b) => [(a[0] + b[0]), (a[1] + b[1]), (a[2] + b[2])],
            [0, 0, 0],
        );
        let sum = comp[0] + comp[1] + comp[2];
        blockPalette.setClick(comp[0] / sum, comp[1] / sum, comp[2] / sum);
        saveGD(UI_PALETTE_SELECT, UI_PALETTE_SOILROCK);
        mixerReset();
        return;
    }
}

addUIFunctionMap(UI_PALETTE_MIXER, () => { setCurMixIdx(getCurMixIdx() - (getCurMixIdx() % 3) + 1); setTargetMixIdx(getCurMixIdx() + getMixArrLen()); });
addUIFunctionMap(UI_PALETTE_CLIPS_WAYPOINT_NAME, () => (playerSetup != null ? playerSetup.handleTextInput() : null));

export function mixerReset() {
    setCurMixIdx(getCurMixIdx() - (getCurMixIdx() % 3) + 1);
    setTargetMixIdx(getCurMixIdx() + getMixArrLen());
}

export function topbarWeatherTextReset() {
    topBarComponent.weatherStringCache = null;
}

let mouseHoverColorCacheMap = new Map();
let mouseHoverColorCacheMode = null;

let curMouseClickTime = null;
let curMouseClickLighting = null;

function getLighting(x, y) {
    if (isLeftMouseClicked() && getLastMouseDown() == curMouseClickTime)
        return curMouseClickLighting;
    curMouseClickTime = getLastMouseDown();
    curMouseClickLighting = getDefaultLighting();
    if (loadGD(UI_LIGHTING_ENABLED)) {
        let sq = getSquares(x, y).find((sq) => sq.visible);
        if (sq != null) {
            curMouseClickLighting = sq.processLighting();
        }
    }
    return curMouseClickLighting;
}

function getColorFromColorCacheMap(x, y, mode, func) {
    if (mode != mouseHoverColorCacheMode) {
        mouseHoverColorCacheMap = new Map();
        mouseHoverColorCacheMode = mode;
    }
    if (!mouseHoverColorCacheMap.has(x))
        mouseHoverColorCacheMap.set(x, new Map());
    if (!mouseHoverColorCacheMap.get(x).has(y))
        mouseHoverColorCacheMap.get(x).set(y, func());
    let rgb = mouseHoverColorCacheMap.get(x).get(y);
    return rgbToRgba(rgb.r, rgb.g, rgb.b, loadGD(UI_PALETTE_STRENGTH));
}

export function clearMouseHoverColorCacheMap() {
    mouseHoverColorCacheMap = new Map();
    mouseHoverColorCacheMode = null;
}



export function renderMouseHover() {
    let lastMoveOffset = getLastMoveOffset();
    if (lastMoveOffset == null)
        return;

    if (!loadGD(UI_PALETTE_BLOCKS))
        return;

    if (isTouchMode() && !isTouchActive())
        return;

    let offsetTransformed = transformPixelsToCanvasSquares(lastMoveOffset.x, lastMoveOffset.y);
    let offsetX = Math.floor(offsetTransformed[0]);
    let offsetY = Math.floor(offsetTransformed[1]);

    let color = null;
    let colorFunc = null;
    let mode = loadGD(UI_PALETTE_MODE);
    switch (loadGD(UI_PALETTE_SELECT)) {
        case (UI_PALETTE_SOILROCK):
            if (mode == UI_PALETTE_MODE_SOIL) {
                colorFunc = () => {
                    let outColorBase = new SoilSquare(-1, -1).getColorBase();
                    let lightingColor = getLighting(offsetX, offsetY);
                    return { r: lightingColor.r * outColorBase.r / 255, g: lightingColor.g * outColorBase.g / 255, b: lightingColor.b * outColorBase.b / 255 };
                }
            }
            if (mode == UI_PALETTE_MODE_ROCK) {
                colorFunc = () => {
                    let outColorBase = new RockSquare(-1, -1).getColorBase();
                    let lightingColor = getLighting(offsetX, offsetY);
                    return { r: lightingColor.r * outColorBase.r / 255, g: lightingColor.g * outColorBase.g / 255, b: lightingColor.b * outColorBase.b / 255 };
                }
            }
            else
                color = hexToRgb(getActiveClimate().getPaletteRockColor(0.65));
            break;
        case UI_PALETTE_WATER:
        case UI_PALETTE_AQUIFER:
            colorFunc = () => {
                let outColorBase = new WaterSquare(-1, -1).getColorBase();
                let lightingColor = getLighting(offsetX, offsetY);
                return { r: lightingColor.r * outColorBase.r / 255, g: lightingColor.g * outColorBase.g / 255, b: lightingColor.b * outColorBase.b / 255 };
            }
            break;
        case UI_PALETTE_SURFACE:
            colorFunc = () => "rgba(50, 50, 50, 0.1)";
            break;
        case UI_PALETTE_SURFACE_OFF:
            colorFunc = () => "rgba(50, 50, 50, 0.1)";
            break;
        default:
            colorFunc = () => "rgba(50, 50, 50, 0.3)";
            break;
    }

    if (colorFunc != null) {
        doBrushFunc(offsetX, offsetY, (x, y) => {
            MAIN_CONTEXT.fillStyle = getColorFromColorCacheMap(x, y, mode, colorFunc);
            zoomCanvasFillRect(x * getBaseSize(), y * getBaseSize(), getBaseSize(), getBaseSize());
        }, false);
    }
}

addUIFunctionMap(UI_PALETTE_COMPOSITION, clearMouseHoverColorCacheMap);