import { getBaseUISize } from "../canvas.js";
import { BlockBuildingComponent } from "./components/BlockBuildingComponent.js";
import { LightingComponent } from "./components/LightingComponent.js";
import { OrganismComponent } from "./components/OrganismComponent.js";
import { SpecialBlockComponent } from "./components/SpecialBlockComponent.js";
import { SubMenuComponent } from "./components/SubMenuComponent.js";
import { TopBarComponent } from "./topbar/TopBarComponent.js";
import { ViewModeComponent } from "./components/ViewModeComponent.js";
import { loadUI, UI_BB_MODE, UI_MODE_ROCK, UI_MODE_SOIL, UI_SM_BB, UI_SM_CLIMATE, UI_SM_GODMODE, UI_SM_LIGHTING, UI_SM_ORGANISM, UI_TOPBAR_SM, UI_SM_SPECIAL, UI_TOPBAR_MAINMENU, UI_TOPBAR_VIEWMODE, saveUI, UI_BB_MIXER, addUIFunctionMap } from "./UIData.js";
import { getSquares } from "../squares/_sqOperations.js";
import { GodModeComponent } from "./components/GodModeComponent.js";
import { ClimateComponent } from "./components/ClimateComponent.js";
import { getCurMixIdx, getMixArr, getMixArrLen, getTargetMixIdx, setCurMixIdx, setTargetMixIdx } from "../globals.js";
import { MainMenuSubtreeComponent } from "./components/MainMenuSubtreeComponent.js";

var topBarComponent;
var blockBuildingComponent;
var all_components;

all_components = [];
topBarComponent = new TopBarComponent("UI_TOPBAR");
blockBuildingComponent = new BlockBuildingComponent(getBaseUISize() * 34, getBaseUISize() * 6, 10, 0, UI_SM_BB);
export function initUI() {
    all_components = [];
    topBarComponent = new TopBarComponent("UI_TOPBAR");
    blockBuildingComponent = new BlockBuildingComponent(getBaseUISize() * 34, getBaseUISize() * 6, 10, 0, UI_SM_BB);
    
    all_components.push(new MainMenuSubtreeComponent(() => 0, () => topBarComponent.ySize(), 0, 0, UI_TOPBAR_MAINMENU));
    all_components.push(new SubMenuComponent(() => topBarComponent.getElementXPositionFunc(0, 1), () => topBarComponent.ySize(), 0, 0, UI_TOPBAR_SM));
    all_components.push(new ViewModeComponent(() => topBarComponent.getElementXPositionFunc(0, 2), () => topBarComponent.ySize(), 0, 0, UI_TOPBAR_VIEWMODE));
    all_components.push(blockBuildingComponent);
    all_components.push(new SpecialBlockComponent(getBaseUISize() * 34, getBaseUISize() * 6, 10, 0, UI_SM_SPECIAL));
    all_components.push(new LightingComponent(getBaseUISize() * 34, getBaseUISize() * 6, 10, 0, UI_SM_LIGHTING));
    all_components.push(new OrganismComponent(getBaseUISize() * 34, getBaseUISize() * 6, 10, 0, UI_SM_ORGANISM));
    all_components.push(new GodModeComponent(getBaseUISize() * 34, getBaseUISize() * 6, 10, 0, UI_SM_GODMODE));
    all_components.push(new ClimateComponent(getBaseUISize() * 34, getBaseUISize() * 6, 10, 0, UI_SM_CLIMATE));

}

export function renderWindows() {
    topBarComponent.render();
    all_components.forEach((window) => window.render());
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
    let targetProto;
    if (loadUI(UI_BB_MODE) == UI_MODE_ROCK) 
        targetProto = "RockSquare";
    else if (loadUI(UI_BB_MODE) == UI_MODE_SOIL)
        targetProto = "SoilSquare";
    else 
        return; 
    getSquares(posX, posY).filter((sq) => sq.proto == targetProto).forEach((sq) => {
        blockBuildingComponent.setHover(sq.sand, sq.silt, sq.clay);
    });
}

export function eyedropperBlockClick(posX, posY) {
    let targetProto;
    if (loadUI(UI_BB_MODE) == UI_MODE_ROCK) 
        targetProto = "RockSquare";
    else if (loadUI(UI_BB_MODE) == UI_MODE_SOIL)
        targetProto = "SoilSquare";
    else 
        return; 
    getSquares(posX, posY).filter((sq) => sq.proto == targetProto).forEach((sq) => {
        blockBuildingComponent.setClick(sq.sand, sq.silt, sq.clay);
    });
}

export function mixerBlockClick(posX, posY) {
    let targetProto;
    if (loadUI(UI_BB_MODE) == UI_MODE_ROCK) 
        targetProto = "RockSquare";
    else if (loadUI(UI_BB_MODE) == UI_MODE_SOIL)
        targetProto = "SoilSquare";
    else 
        return; 
    let sq = getSquares(posX, posY).filter((sq) => sq.proto == targetProto).at(0);
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
        blockBuildingComponent.setClick(comp[0] / sum, comp[1] / sum, comp[2] / sum);
        saveUI(UI_BB_MIXER, false);
        return;
    }
}

addUIFunctionMap(UI_BB_MIXER, () => setTargetMixIdx(getCurMixIdx() + getMixArrLen()));