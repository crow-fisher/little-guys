export const UI_MODE_SOIL = "soil";
export const UI_MODE_ROCK = "rock";

export const UI_BB_MODE = "UI_BB_MODE";
export const UI_BB_SIZE = "UI_BB_SIZE";
export const UI_BB_STRENGTH = "UI_BB_STRENGTH";

export const UI_NULL = "UI_NULL";

export const UI_SOIL_COMPOSITION = "UI_SOIL_COMPOSITION";
export const UI_ROCK_COMPOSITION = "UI_ROCK_COMPOSITION";
export const UI_SOIL_VIEWMODE = "UI_SOIL_VIEWMODE";
export const UI_SOIL_INITALWATER = "UI_SOIL_INITALWATER";

export const UI_SM_SM = "UI_SM_SM";
export const UI_SM_BB = "UI_SM_BB";
export const UI_SM_LIGHTING = "UI_SM_LIGHTING";
export const UI_SM_SPECIAL = "UI_SM_SPECIAL";
export const UI_SM_VIEWMODE = "UI_SM_VIEWMODE";

export const UI_LIGHTING_SUN = "UI_LIGHTING_SUN";
export const UI_LIGHTING_MOON = "UI_LIGHTING_MOON";
export const UI_LIGHTING_WATER = "UI_LIGHTING_WATER";
export const UI_LIGHTING_ROCK = "UI_LIGHTING_ROCK";
export const UI_LIGHTING_PLANT = "UI_LIGHTING_PLANT";
export const UI_LIGHTING_DECAY = "UI_LIGHTING_DECAY";

export const UI_SPECIAL_SELECT = "UI_SPECIAL_SELECT";

export const UI_SPECIAL_WATER = "water"
export const UI_SPECIAL_AQUIFER = "aquifer"
export const UI_SPECIAL_MIX = "mix"
export const UI_SPECIAL_SURFACE = "surface"

export const UI_VIEWMODE_SELECT = "UI_VIEWMODE_SELECT";

export const UI_VIEWMODE_NORMAL = "normal";
export const UI_VIEWMODE_LIGHTIHNG = "lighting";
export const UI_VIEWMODE_NITROGEN = "nitrogen";
export const UI_VIEWMODE_PHOSPHORUS = "phosphorus";
export const UI_VIEWMODE_WIND = "wind";
export const UI_VIEWMODE_TEMPERATURE = "temperature";
export const UI_VIEWMODE_MOISTURE = "moisture";
export const UI_VIEWMODE_SURFACE = "surface";
export const UI_VIEWMODE_ORGANISMS = "organisms";

export const UI_TOOL_MODE_LEFT = "UI_TOOL_MODE_LEFT";
export const UI_TOOL_MODE_RIGHT = "UI_TOO_MODE_RIGHT";

// put default values in here
var UI_DATA = {
    UI_BB_MODE: UI_MODE_SOIL,
    UI_BB_SIZE: 3,
    UI_BB_STRENGTH: 1,
    UI_SM_SM: true,
    UI_SM_BB: false,
    UI_SM_LIGHTING: false,
    UI_SM_SPECIAL: false,
    UI_SM_VIEWMODE: false,
    UI_SOIL_COMPOSITION: [40, 40, 20],
    UI_ROCK_COMPOSITION: [40, 40, 20],
    UI_SOIL_VIEWMODE: "🎨",
    UI_SOIL_INITALWATER: -5,
    UI_LIGHTING_SUN: .129,
    UI_LIGHTING_MOON: .05,
    UI_LIGHTING_WATER: 1,
    UI_LIGHTING_ROCK: 1,
    UI_LIGHTING_PLANT: 1,
    UI_LIGHTING_DECAY: .999,
    UI_VIEWMODE_SELECT: UI_VIEWMODE_NORMAL
};

var UI_FUNCTION_MAP = {
    UI_LIGHTING_WATER: () => setNextLightUpdateTime(0),
    UI_LIGHTING_ROCK: () => setNextLightUpdateTime(0),
    UI_LIGHTING_PLANT: () => setNextLightUpdateTime(0),
    UI_LIGHTING_DECAY: () => setNextLightUpdateTime(0)
}

var UI_SINGLE_GROUPS = [
    [UI_SM_BB, UI_SM_SPECIAL, UI_SM_LIGHTING]
]

var functionQueue = [];

export function saveUI(key, value) {
    let singleGroup = (UI_SINGLE_GROUPS.find((group) => group.indexOf(key) > -1));
    if (singleGroup != null) {
        singleGroup.filter((k) => loadUI(k)).forEach((k) => UI_DATA[k] = false);
    }

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
    functionQueue.forEach((f) => f());
    functionQueue = new Array();
}