import { addUIFunctionMap, UI_LIGHTING_FLATLIGHTING_BRIGHTNESS, UI_LIGHTING_FLATLIGHTING_HUE, UI_LIGHTING_FLATLIGHTING_SATURATION } from "../ui/UIData.js";
import { MoonMovingLightGroup } from "./model/MoonMovingLightGroup.js";
import { PermanentLightGroup } from "./model/PermanentLightGroup.js";
import { SunMovingLightGroup } from "./model/SunMovingLightGroup.js";

export let MAX_BRIGHTNESS = 8;

let sunLightGroup, moonLightGroup, permanantLightGroup;
export function createSunLightGroup() {
    sunLightGroup = new SunMovingLightGroup();
    return sunLightGroup;
}

export function createMoonLightGroup() {
    moonLightGroup = new MoonMovingLightGroup();
    return moonLightGroup;
}

export function createPermanantLightGroup() {
    permanantLightGroup = new PermanentLightGroup();
    return permanantLightGroup;
}

addUIFunctionMap(UI_LIGHTING_FLATLIGHTING_BRIGHTNESS, () => permanantLightGroup.colorFuncRefresh());
addUIFunctionMap(UI_LIGHTING_FLATLIGHTING_HUE, () => permanantLightGroup.colorFuncRefresh());
addUIFunctionMap(UI_LIGHTING_FLATLIGHTING_SATURATION, () => permanantLightGroup.colorFuncRefresh());