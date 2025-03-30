import { getBaseUISize } from "../canvas.js";
import { OrganismComponent } from "./components/OrganismComponent.js";
import { BlockPalette } from "./components/BlockPalette.js";
import { BlockSubtreeComponent as BlockSubtree } from "./components/BlockSubtreeComponent.js";
import { TopBarComponent } from "./topbar/TopBarComponent.js";
import { ViewSubtreeComponent } from "./components/ViewSubtreeComponent.js";
import { loadGD, UI_SM_GODMODE, UI_SM_LIGHTING, UI_SM_ORGANISM, UI_TOPBAR_BLOCK, UI_PALETTE_ACTIVE, UI_TOPBAR_MAINMENU, UI_TOPBAR_VIEWMODE, saveGD, UI_PALETTE_MIXER, addUIFunctionMap, UI_TOPBAR_LIGHTING, UI_TOPBAR_SIMULATION, UI_TOPBAR_TIME, UI_TOPBAR_CLIMATE, UI_PALETTE_ROCKMODE, UI_PALETTE_EYEDROPPER, UI_CLIMATE_SELECT_MENU, UI_CILMATE_SELECT_WEATHER, UI_CLIMATE_SELECT_CLOUDS } from "./UIData.js";
import { getSquares } from "../squares/_sqOperations.js";
import { GodModeComponent } from "./components/GodModeComponent.js";
import { getCurMixIdx, getMixArr, getMixArrLen, getTargetMixIdx, setCurMixIdx, setTargetMixIdx } from "../globals.js";
import { MainMenuComponent as MainMenuSubtree } from "./components/MainMenuComponent.js";
import { LightingSubtree } from "./components/LightingSubtree.js";
import { LightingComponent } from "./components/LightingComponent.js";
import { SimulationSubtree } from "./components/SimulationSubtree.js";
import { TimeSubtree } from "./components/TimeSubtree.js";
import { ClimateSubtreeComponent } from "./components/ClimateSubtreeComponent.js";
import { ClimateSelectionComponent } from "./components/ClimateSelectionComponent.js";
import { WeatherSelectionComponent } from "./components/WeatherSelectionComponent.js";
import { CloudControlComponent } from "./components/CloudControlComponent.js";

let topBarComponent;
let blockPalette;
let all_components;

all_components = [];
topBarComponent = new TopBarComponent("UI_TOPBAR");
export function initUI() {
    all_components = [];
    topBarComponent = new TopBarComponent("UI_TOPBAR");
    all_components.push(new MainMenuSubtree(() => 0, () => topBarComponent.ySize(), 0, 0, UI_TOPBAR_MAINMENU));
    all_components.push(new BlockSubtree(() => topBarComponent.getElementXPositionFunc(0, 1), () => topBarComponent.ySize(), 0, 0, UI_TOPBAR_BLOCK));
    
    let climateSubtreeComponent = new ClimateSubtreeComponent(() => topBarComponent.getElementXPositionFunc(0, 3), () => topBarComponent.ySize(), 0, 0, UI_TOPBAR_CLIMATE);
    all_components.push(climateSubtreeComponent);
    all_components.push(new ClimateSelectionComponent(() => topBarComponent.getElementXPositionFunc(0, 4) + climateSubtreeComponent.window.sizeX + getBaseUISize(), () => topBarComponent.ySize() + getBaseUISize() * 3, 0, 0, UI_CLIMATE_SELECT_MENU));
    all_components.push(new WeatherSelectionComponent(() => topBarComponent.getElementXPositionFunc(0, 4) + climateSubtreeComponent.window.sizeX + getBaseUISize(), () => topBarComponent.ySize() + getBaseUISize() * 6, 0, 0, UI_CILMATE_SELECT_WEATHER));
    all_components.push(new CloudControlComponent(() => topBarComponent.getElementXPositionFunc(0, 4) + climateSubtreeComponent.window.sizeX + getBaseUISize(), () => topBarComponent.ySize() + getBaseUISize() * 9, 0, 0, UI_CLIMATE_SELECT_CLOUDS));

    all_components.push(new ViewSubtreeComponent(() => topBarComponent.getElementXPositionFunc(0, 5), () => topBarComponent.ySize(), 0, 0, UI_TOPBAR_VIEWMODE));
    blockPalette = new BlockPalette(getBaseUISize() * 1, getBaseUISize() * 10, 0, 0, UI_PALETTE_ACTIVE)
    all_components.push(blockPalette);

    all_components.push(new LightingComponent(getBaseUISize() * 10, getBaseUISize() * 10, 0, 0, UI_SM_LIGHTING));
    all_components.push(new LightingSubtree(() => topBarComponent.getElementXPositionFunc(0, 7), () => topBarComponent.ySize(), 0, 0, UI_TOPBAR_LIGHTING));
    all_components.push(new SimulationSubtree(() => topBarComponent.getElementXPositionFunc(0, 9), () => topBarComponent.ySize(), 0, 0, UI_TOPBAR_SIMULATION));
    all_components.push(new OrganismComponent(getBaseUISize() * 1, getBaseUISize() * 10, 0, 0, UI_SM_ORGANISM));
    all_components.push(new GodModeComponent(getBaseUISize() * 34, getBaseUISize() * 6, 10, 0, UI_SM_GODMODE));
    all_components.push(new TimeSubtree(() => topBarComponent.getElementXPositionFunc(0, 22), () => topBarComponent.ySize(), 0, 0, UI_TOPBAR_TIME));

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
    let targetProto = loadGD(UI_PALETTE_ROCKMODE) ? "RockSquare" : "SoilSquare";
    getSquares(Math.floor(posX), Math.floor(posY)).filter((sq) => sq.proto == targetProto).forEach((sq) => {
        blockPalette.setHover(sq.sand, sq.silt, sq.clay);
    });
}

export function eyedropperBlockClick(posX, posY) {
    let targetProto = loadGD(UI_PALETTE_ROCKMODE) ? "RockSquare" : "SoilSquare";
    getSquares(posX, posY).filter((sq) => sq.proto == targetProto).forEach((sq) => {
        blockPalette.setClick(sq.sand, sq.silt, sq.clay);
    });
    saveGD(UI_PALETTE_EYEDROPPER, false);
    setTargetMixIdx(getCurMixIdx() + 4);
}

export function mixerBlockClick(posX, posY) {
    let targetProto = loadGD(UI_PALETTE_ROCKMODE) ? "RockSquare" : "SoilSquare";
    let sq = getSquares(Math.floor(posX), Math.floor(posY)).filter((sq) => sq.proto == targetProto).at(0);
    if (sq == null) {
        return;
    }
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
        saveGD(UI_PALETTE_MIXER, false);
        return;
    }
}

addUIFunctionMap(UI_PALETTE_MIXER, () => {setCurMixIdx(getCurMixIdx() - (getCurMixIdx() % 3) + 1); setTargetMixIdx(getCurMixIdx() + getMixArrLen()); });