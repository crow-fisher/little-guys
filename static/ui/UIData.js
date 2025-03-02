
export const UI_MODE_SOIL = "soil";
export const UI_MODE_ROCK = "rock";

export const UI_BB_MODE = "UI_BB_MODE";
export const UI_BB_SIZE = "UI_BB_SIZE";
export const UI_BB_STRENGTH = "UI_BB_STRENGTH";
export const UI_BB_EYEDROPPER = "UI_BB_EYEDROPPER";
export const UI_BB_MIXER = "UI_BB_MIXER";

export const UI_NULL = "UI_NULL";

export const UI_SOIL_COMPOSITION = "UI_SOIL_COMPOSITION";
export const UI_ROCK_COMPOSITION = "UI_ROCK_COMPOSITION";
export const UI_SOIL_VIEWMODE = "UI_SOIL_VIEWMODE";
export const UI_SOIL_INITALWATER = "UI_SOIL_INITALWATER";

export const UI_SM_BB = "UI_SM_BB";
export const UI_SM_LIGHTING = "UI_SM_LIGHTING";
export const UI_SM_SPECIAL = "UI_SM_SPECIAL";
export const UI_SM_ORGANISM = "UI_SM_ORGANISM";
export const UI_SM_GODMODE = "UI_SM_GODMODE";
export const UI_SM_CLIMATE = "UI_SM_CLIMATE";

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

export const UI_ORGANISM_SELECT = "UI_ORGANISM_SELECT";
export const UI_ORGANISM_WHEAT = "wheat";

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

export const UI_TOPBAR = "UI_TOPBAR";
export const UI_TOOL_MODE_LEFT = "UI_TOOL_MODE_LEFT";
export const UI_TOOL_MODE_RIGHT = "UI_TOO_MODE_RIGHT";

export const UI_GODMODE_SELECT = "UI_GODMODE_SELECT";
export const UI_GODMODE_WIND = "wind";
export const UI_GODMODE_TEMPERATURE = "temperature";
export const UI_GODMODE_MOISTURE = "moisture";
export const UI_GODMODE_KILL = "kill";
export const UI_GODMODE_FASTPLANT = "UI_GODMODE_FASTPLANT";


export const UI_CLIMATE_SELECT = "UI_CLIMATE_SELECT";
export const UI_CLIMATE_MIDWEST = "midwest";
export const UI_CLIMATE_DESERT = "desert";
export const UI_CLIMATE_FANTASY = "fantasy";

export const UI_CLIMATE_WEATHER_SUNNY = "sunny";
export const UI_CLIMATE_WEATHER_CLOUDY = "cloudy";
export const UI_CLIMATE_WEATHER_LIGHTRAIN = "light rain";
export const UI_CLIMATE_WEATHER_HEAVYRAIN = "heavy rain";

export const UI_TOPBAR_MAINMENU = "UI_TOPBAR_MAINMENU"; 
export const UI_TOPBAR_SM = "UI_TOPBAR_SM";
export const UI_TOPBAR_TOGGLELIGHTING = "UI_TOPBAR_TOGGLELIGHTING";
export const UI_TOPBAR_VIEWMODE = "UI_TOPBAR_VIEWMODE";
export const UI_TOPBAR_DESIGNERMODE = "UI_TOPBAR_DESIGNERMODE";

export const UI_SPEED = "UI_SPEED";
export const UI_SPEED_0 = "UI_SPEED_0";
export const UI_SPEED_1 = "UI_SPEED_1";
export const UI_SPEED_2 = "UI_SPEED_2";
export const UI_SPEED_3 = "UI_SPEED_3";
export const UI_SPEED_4 = "UI_SPEED_4";
export const UI_SPEED_5 = "UI_SPEED_5";
export const UI_SPEED_6 = "UI_SPEED_6";
export const UI_SPEED_7 = "UI_SPEED_7";
export const UI_SPEED_8 = "UI_SPEED_8";
export const UI_SPEED_9 = "UI_SPEED_9";

export const UI_SPEEDS = [UI_SPEED_1, UI_SPEED_2, UI_SPEED_3, UI_SPEED_4, UI_SPEED_5, UI_SPEED_6, UI_SPEED_7, UI_SPEED_8, UI_SPEED_9]

export const UI_BOOLEAN = "UI_BOOLEAN";


// put default values in here
var UI_DATA = {
    UI_BB_MODE: UI_MODE_SOIL,
    UI_BB_SIZE: 3,
    UI_BB_STRENGTH: 1,
    UI_TOPBAR_SM: false,
    UI_SPECIAL_SELECT: UI_SPECIAL_WATER,
    UI_SOIL_COMPOSITION: [40, 40, 20],
    UI_ROCK_COMPOSITION: [40, 40, 20],
    UI_SOIL_VIEWMODE: "🎨",
    UI_SOIL_INITALWATER: -2,
    UI_LIGHTING_SUN: .259,
    UI_LIGHTING_MOON: .15,
    UI_LIGHTING_WATER: 1,
    UI_LIGHTING_ROCK: 1,
    UI_LIGHTING_PLANT: 1,
    UI_LIGHTING_DECAY: .98,
    UI_VIEWMODE_SELECT: UI_VIEWMODE_NORMAL,
    UI_TOPBAR: true,
    UI_SPEED: UI_SPEED_1,
    UI_CLIMATE_SELECT: UI_CLIMATE_MIDWEST
};
var UI_FUNCTION_MAP = new Map();

var UI_SINGLE_GROUPS = [
    [UI_SM_BB, UI_SM_SPECIAL, UI_SM_LIGHTING, UI_SM_ORGANISM, UI_SM_GODMODE, UI_SM_CLIMATE],
    [UI_TOPBAR_MAINMENU, UI_TOPBAR_SM],
    [UI_BB_MIXER, UI_BB_EYEDROPPER],
    [UI_TOPBAR_SM, UI_TOPBAR_MAINMENU],
    [UI_SM_ORGANISM, UI_TOPBAR_DESIGNERMODE]
]

var queuedFunction = null;

export function addUIFunctionMap(key, value) {
    UI_FUNCTION_MAP[key] = value;
}

export function saveUI(key, value) {
    let singleGroup = (UI_SINGLE_GROUPS.find((group) => group.indexOf(key) > -1));
    if (singleGroup != null) {
        singleGroup.filter((k) => loadUI(k)).forEach((k) => UI_DATA[k] = false);
    }

    UI_DATA[key] = value;
    if (key in UI_FUNCTION_MAP) {
        queuedFunction = UI_FUNCTION_MAP[key];
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
    if (queuedFunction != null) {
        queuedFunction();
    }
    queuedFunction = null;
}