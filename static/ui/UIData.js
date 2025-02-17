import { R_COLORS } from "./SoilPicker.js";

export const UI_SOIL_COMPOSITION = "UI_SOIL_COMPOSITION";
export const UI_ROCK_COMPOSITION = "UI_ROCK_COMPOSITION";
export const UI_SOIL_VIEWMODE = "UI_SOIL_VIEWMODE";
export const UI_SOIL_INITALWATER = "UI_SOIL_INITALWATER";

// put default values in here
var UI_DATA = {
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