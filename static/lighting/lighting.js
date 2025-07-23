import { getCurrentLightColorTemperature, getDaylightStrength, getMoonlightColor } from "../climate/time.js";
import { loadGD, UI_GAME_MAX_CANVAS_SQUARES_X, UI_GAME_MAX_CANVAS_SQUARES_Y, UI_LIGHTING_MOON, UI_LIGHTING_QUALITY, UI_LIGHTING_SUN } from "../ui/UIData.js";
import { StationaryWideLightGroup } from "./model/StationaryWideLightGroup.js";

export let MAX_BRIGHTNESS = 8;
export function createSunLightGroup() {
    let numNodes = loadGD(UI_LIGHTING_QUALITY);
    let sunLightGroup = new StationaryWideLightGroup(
        loadGD(UI_GAME_MAX_CANVAS_SQUARES_X) / 2,
        -loadGD(UI_GAME_MAX_CANVAS_SQUARES_Y),
        loadGD(UI_GAME_MAX_CANVAS_SQUARES_X),
        numNodes,
        getCurrentLightColorTemperature,
        () => Math.exp(loadGD(UI_LIGHTING_SUN)) * getDaylightStrength() / numNodes
    );
    return sunLightGroup;
}

export function createMoonLightGroup() {
    let numNodes = Math.ceil(loadGD(UI_LIGHTING_QUALITY) / 2);
    let moonLightGroup = new StationaryWideLightGroup(
        loadGD(UI_GAME_MAX_CANVAS_SQUARES_X) / 2,
        -loadGD(UI_GAME_MAX_CANVAS_SQUARES_Y),
        loadGD(UI_GAME_MAX_CANVAS_SQUARES_X),
        Math.ceil(loadGD(UI_LIGHTING_QUALITY) / 2),
        getMoonlightColor,
        () => Math.exp(loadGD(UI_LIGHTING_MOON)) / numNodes
    );
    return moonLightGroup;
}
