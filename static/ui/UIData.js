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
    UI_SOIL_COMPOSITION: [40, 40, 20],
    UI_ROCK_COMPOSITION: [40, 40, 20],
    UI_SOIL_VIEWMODE: "🎨",
    UI_SOIL_INITALWATER: -5
};

export function saveUI(key, value) {
    UI_DATA[key] = value;
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