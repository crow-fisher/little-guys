import { setNextLightUpdateTime } from "../globalOperations.js";
import { isLeftMouseClicked } from "../index.js";
import { R_COLORS } from "./elements/SoilPicker.js";

export const UI_MODE_SOIL = "soil";
export const UI_MODE_ROCK = "rock";

export const UI_BB_MODE = "UI_BB_MODE";
export const UI_BB_SIZE = "UI_BB_SIZE";
export const UI_BB_STRENGTH = "UI_BB_STRENGTH";

export const UI_SOIL_COMPOSITION = "UI_SOIL_COMPOSITION";
export const UI_ROCK_COMPOSITION = "UI_ROCK_COMPOSITION";
export const UI_SOIL_VIEWMODE = "UI_SOIL_VIEWMODE";
export const UI_SOIL_INITALWATER = "UI_SOIL_INITALWATER";

export const UI_SM_BB = "UI_SM_BB";
export const UI_SM_LIGHTING = "UI_SM_LIGHTING";

export const UI_LIGHTING_SUN = "UI_LIGHTING_SUN";
export const UI_LIGHTING_MOON = "UI_LIGHTING_MOON";
export const UI_LIGHTING_WATER = "UI_LIGHTING_WATER";
export const UI_LIGHTING_ROCK = "UI_LIGHTING_ROCK";
export const UI_LIGHTING_PLANT = "UI_LIGHTING_PLANT";
export const UI_LIGHTING_DECAY = "UI_LIGHTING_DECAY";

export const UI_TOOL_MODE_LEFT = "UI_TOOL_MODE_LEFT";
export const UI_TOOL_MODE_RIGHT = "UI_TOO_MODE_RIGHT";
export const UI_TOOL_MIX = "mix";
export const UI_TOOL_BLUR = "blur";
export const UI_TOOL_ERASE = "erase";

// put default values in here
var UI_DATA = {
    UI_BB_MODE: UI_MODE_SOIL,
    UI_BB_SIZE: 3,
    UI_BB_STRENGTH: 1,
    UI_SM_BB: false,
    UI_SM_LIGHTING: true,
    UI_SOIL_COMPOSITION: [40, 40, 20],
    UI_ROCK_COMPOSITION: [40, 40, 20],
    UI_SOIL_VIEWMODE: "🎨",
    UI_SOIL_INITALWATER: -5,
    UI_LIGHTING_SUN: .129,
    UI_LIGHTING_MOON: .05,
    UI_LIGHTING_WATER: 1,
    UI_LIGHTING_ROCK: 1,
    UI_LIGHTING_PLANT: 1,
    UI_LIGHTING_DECAY: .999
};

var UI_FUNCTION_MAP = {
    UI_LIGHTING_WATER: () => setNextLightUpdateTime(0),
    UI_LIGHTING_ROCK: () => setNextLightUpdateTime(0),
    UI_LIGHTING_PLANT: () => setNextLightUpdateTime(0),
    UI_LIGHTING_DECAY: () => setNextLightUpdateTime(0)
}

var functionQueue = [];

export function saveUI(key, value) {
    UI_DATA[key] = value;
    if (key in UI_FUNCTION_MAP) {
        functionQueue.push(UI_FUNCTION_MAP[key]);
    }
}

export function loadUI(key) {
    return UI_DATA[key];
}

export function saveUIMap(map) {
    UI_DATA = map;
}

export function getUIMap() {
    return UI_DATA;
}

export function executeFunctionQueue() {
    if (isLeftMouseClicked()) {
        return;
    }
    
    functionQueue.forEach((f) => f());
    functionQueue = new Array();
}