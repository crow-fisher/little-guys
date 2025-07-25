import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { getMoonlightColorRgb } from "../../climate/time.js";
import { hexToRgb, hsv2rgb, rgb2hsv, rgbToHex, rgbToRgba } from "../../common.js";
import { WaterSquare } from "../../squares/WaterSquare.js";
import { Component } from "../Component.js";
import { ConditionalContainer } from "../ConditionalContainer.js";
import { Container } from "../Container.js";
import { RadioToggleLabel } from "../elements/RadioToggleLabel.js";
import { SliderGradientBackgroundWaterHue } from "../elements/SliderGradientWaterBackgroundHue.js";
import { SliderGradientBackground } from "../elements/SliderGradientBackground.js";
import { TextBackground } from "../elements/TextBackground.js";
import { TextFunctionalBackground } from "../elements/TextFunctionalBackground.js";
import { loadGD, UI_LIGHTING_SUN, UI_LIGHTING_MOON, UI_LIGHTING_WATER, UI_LIGHTING_ROCK, UI_LIGHTING_PLANT, UI_LIGHTING_DECAY, UI_CENTER, UI_LIGHTING_WATER_OPACITY, UI_LIGHTING_WATER_VALUE, UI_LIGHTING_WATER_SATURATION, UI_LIGHTING_WATER_HUE, UI_LIGHTING_PLANT_GRASS, UI_LIGHTING_PLANT_TREE, UI_LIGHTING_SCENE_MODE, UI_LIGHTING_SCENE_MODE_WATER, UI_LIGHTING_SCENE_MODE_PLANT, UI_LIGHTING_SCENE_MODE_BRIGHTNESS, UI_LIGHTING_SCENE_MODE_DECAY, UI_CLIMATE_RAINFALL_DENSITY, loadUI, UI_UI_PHONEMODE, UI_LIGHTING_GLOBAL, UI_LIGHTING_DISABLED_BRIGHTNESS, UI_LIGHTING_CLOUDCOVER_OPACITY } from "../UIData.js";
import { Text } from "../elements/Text.js";

export function getWaterColorDark() {
    return getWaterColor(0.5)
}

export function getWaterColor(mult = 1) {
    let s = new WaterSquare(-1, -1);
    let rgb = s.getColorBase();
    let waterHsv = rgb2hsv(rgb.r, rgb.g, rgb.b);
    waterHsv[1] = 0.6;
    waterHsv[2] = 200;
    waterHsv[2] *= mult;
    return rgbToHex(...hsv2rgb(...waterHsv));
}

export const NULL = -(10 ** 8);
export function getWaterColorTransformed(h, s, v, a) {
    if (h == NULL)
        h = loadGD(UI_LIGHTING_WATER_HUE);
    if (s == NULL)
        s = loadGD(UI_LIGHTING_WATER_SATURATION);
    if (v == NULL)
        v = loadGD(UI_LIGHTING_WATER_VALUE);
    if (a == NULL)
        a = loadGD(UI_LIGHTING_WATER_OPACITY);
    let rgb = getActiveClimate().waterColor;
    let waterHsv = rgb2hsv(rgb.r, rgb.g, rgb.b);
    waterHsv[0] += 380 * h;
    waterHsv[1] = s;
    waterHsv[2] = 255 * v;
    return rgbToRgba(...hsv2rgb(...waterHsv), a);
}

function getRockColor() {
    return getActiveClimate().getPaletteRockColor();
}

function getRockColorDark() {
    let rockColorHex = getActiveClimate().getPaletteRockColor();
    let rockColorRgb = hexToRgb(rockColorHex);
    let rockColorHsv = rgb2hsv(rockColorRgb.r, rockColorRgb.g, rockColorRgb.b);
    rockColorHsv.v *= 0.15;
    return rgbToHex(...hsv2rgb(rockColorHsv))
}

function getPlantColor() {
    return "#5f964a";
}

function getPlantColorDark() {
    return "#243b1c";
}


function getTreeColor() {
    return "#5c370a";
}

function getTreeColorDark() {
    return "#1c1307";
}

export class LightingComponent extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        let container = new Container(this.window, 0, 1);
        this.window.container = container;

        this.phoneModeOffset = 0;

        let sizeX = getBaseUISize() * 36;
        let half = sizeX / 2;
        let third = sizeX / 3;
        let quarter = sizeX / 4;
        let offsetX = getBaseUISize() * 0.8;

        let h1 = getBaseUISize() * 3;
        let h2 = getBaseUISize() * 3;
        let br = getBaseUISize() * .5;

        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 0.5, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.65), 0.75, " "))
        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 2.8, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.9, "lighting editor"))
        container.addElement(new TextBackground(this.window, sizeX, br, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.70), 0.75, ""));

        let modeSelectRow1 = new Container(this.window, 0, 0);
        let modeSelectRow2 = new Container(this.window, 0, 0);
        container.addElement(modeSelectRow1);
        container.addElement(modeSelectRow2);

        modeSelectRow1.addElement(new RadioToggleLabel(this.window, half, getBaseUISize() * 3, offsetX, "brightness", UI_LIGHTING_SCENE_MODE, UI_LIGHTING_SCENE_MODE_BRIGHTNESS, () => getActiveClimate().getUIColorInactiveCustom(0.66), () => getActiveClimate().getUIColorInactiveCustom(0.55)));
        modeSelectRow1.addElement(new RadioToggleLabel(this.window, half, getBaseUISize() * 3, offsetX, "decay", UI_LIGHTING_SCENE_MODE, UI_LIGHTING_SCENE_MODE_DECAY, () => getActiveClimate().getUIColorInactiveCustom(0.66), () => getActiveClimate().getUIColorInactiveCustom(0.55)));
        modeSelectRow2.addElement(new RadioToggleLabel(this.window, half, getBaseUISize() * 3, offsetX, "water", UI_LIGHTING_SCENE_MODE, UI_LIGHTING_SCENE_MODE_WATER, () => getActiveClimate().getUIColorInactiveCustom(0.72), () => getActiveClimate().getUIColorInactiveCustom(0.59)));
        modeSelectRow2.addElement(new RadioToggleLabel(this.window, half, getBaseUISize() * 3, offsetX, "plant", UI_LIGHTING_SCENE_MODE, UI_LIGHTING_SCENE_MODE_PLANT, () => getActiveClimate().getUIColorInactiveCustom(0.69), () => getActiveClimate().getUIColorInactiveCustom(0.56)));

        let brightnessConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_LIGHTING_SCENE_MODE) == UI_LIGHTING_SCENE_MODE_BRIGHTNESS);
        let decayConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_LIGHTING_SCENE_MODE) == UI_LIGHTING_SCENE_MODE_DECAY);
        let waterConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_LIGHTING_SCENE_MODE) == UI_LIGHTING_SCENE_MODE_WATER);
        let plantConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_LIGHTING_SCENE_MODE) == UI_LIGHTING_SCENE_MODE_PLANT);

        container.addElement(new TextBackground(this.window, sizeX, br, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""));

        container.addElement(brightnessConditionalContainer);
        container.addElement(decayConditionalContainer);
        container.addElement(waterConditionalContainer);
        container.addElement(plantConditionalContainer);

        let sliderSizeY = getBaseUISize() * (35 / 10);


        brightnessConditionalContainer.addElement(new TextFunctionalBackground(this.window, sizeX, h2, offsetX, () => "sun", () => getActiveClimate().getUIColorInactiveCustom(0.55)));
        brightnessConditionalContainer.addElement(new SliderGradientBackground(this.window, UI_LIGHTING_SUN, sizeX, sliderSizeY, -4, 4, () => "#000000", () => "#FFF0FF"));
        brightnessConditionalContainer.addElement(new TextBackground(this.window, sizeX, br, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""));

        brightnessConditionalContainer.addElement(new TextFunctionalBackground(this.window, sizeX, h2, offsetX, () => "moon", () => getActiveClimate().getUIColorInactiveCustom(0.62)));
        brightnessConditionalContainer.addElement(new SliderGradientBackground(this.window, UI_LIGHTING_MOON, sizeX, sliderSizeY, -3, 0, () => "#000000", () => getMoonlightColorRgb()));

        brightnessConditionalContainer.addElement(new TextFunctionalBackground(this.window, sizeX, h2, offsetX, () => "global", () => getActiveClimate().getUIColorInactiveCustom(0.55)));
        brightnessConditionalContainer.addElement(new SliderGradientBackground(this.window, UI_LIGHTING_GLOBAL, sizeX, sliderSizeY, .85, 1/.85, () => "#000000", () => "#FFF0FF"));
        brightnessConditionalContainer.addElement(new TextBackground(this.window, sizeX, br, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""));

        brightnessConditionalContainer.addElement(new TextFunctionalBackground(this.window, sizeX, h2, offsetX, () => "flat lighting", () => getActiveClimate().getUIColorInactiveCustom(0.58)));
        brightnessConditionalContainer.addElement(new SliderGradientBackground(this.window, UI_LIGHTING_DISABLED_BRIGHTNESS, sizeX, sliderSizeY, -3, 3, () => "#000000", () => "#FFF0FF"));
        brightnessConditionalContainer.addElement(new TextBackground(this.window, sizeX, br, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""));

        brightnessConditionalContainer.addElement(new TextFunctionalBackground(this.window, sizeX, h2, offsetX, () => "cloud darkening", () => getActiveClimate().getUIColorInactiveCustom(0.53)));
        brightnessConditionalContainer.addElement(new SliderGradientBackground(this.window, UI_LIGHTING_CLOUDCOVER_OPACITY, sizeX, sliderSizeY, .01, 1, () => "#000000", () => "#FFF0FF"));
        brightnessConditionalContainer.addElement(new TextBackground(this.window, sizeX, br, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""));

        decayConditionalContainer.addElement(new TextFunctionalBackground(this.window, sizeX, h2, offsetX, () => "global", () => getActiveClimate().getUIColorInactiveCustom(0.64)));
        decayConditionalContainer.addElement(new SliderGradientBackground(this.window, UI_LIGHTING_DECAY, sizeX, sliderSizeY, 0, 20, () => "#000000", () => "#FFF0FF"));
        decayConditionalContainer.addElement(new TextBackground(this.window, sizeX, br, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""));

        decayConditionalContainer.addElement(new TextFunctionalBackground(this.window, sizeX, h2, offsetX, () => "water", () => getActiveClimate().getUIColorInactiveCustom(0.66)));
        decayConditionalContainer.addElement(new SliderGradientBackground(this.window, UI_LIGHTING_WATER, sizeX, sliderSizeY, -4, 2, getWaterColorDark, getWaterColor));
        decayConditionalContainer.addElement(new TextBackground(this.window, sizeX, br, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""));

        decayConditionalContainer.addElement(new TextFunctionalBackground(this.window, sizeX, h2, offsetX, () => "rock", () => getActiveClimate().getUIColorInactiveCustom(0.63)));
        decayConditionalContainer.addElement(new SliderGradientBackground(this.window, UI_LIGHTING_ROCK, sizeX, sliderSizeY, -4, 4, getRockColorDark, getRockColor));
        decayConditionalContainer.addElement(new TextBackground(this.window, sizeX, br, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""));

        decayConditionalContainer.addElement(new TextFunctionalBackground(this.window, sizeX, h2, offsetX, () => "plant", () => getActiveClimate().getUIColorInactiveCustom(0.58)));
        decayConditionalContainer.addElement(new SliderGradientBackground(this.window, UI_LIGHTING_PLANT, sizeX, sliderSizeY, -2, 2, getPlantColorDark, getPlantColor));

        plantConditionalContainer.addElement(new TextFunctionalBackground(this.window, sizeX, h2, offsetX, () => "grass", () => getActiveClimate().getUIColorInactiveCustom(0.58)));
        plantConditionalContainer.addElement(new SliderGradientBackground(this.window, UI_LIGHTING_PLANT_GRASS, sizeX, sliderSizeY, -2, 2, getPlantColorDark, getPlantColor));
        plantConditionalContainer.addElement(new TextBackground(this.window, sizeX, br, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""));

        plantConditionalContainer.addElement(new TextFunctionalBackground(this.window, sizeX, h2, offsetX, () => "tree", () => getActiveClimate().getUIColorInactiveCustom(0.58)));
        plantConditionalContainer.addElement(new SliderGradientBackground(this.window, UI_LIGHTING_PLANT_TREE, sizeX, sliderSizeY, -2, 2, getTreeColorDark, getTreeColor));

        waterConditionalContainer.addElement(new TextFunctionalBackground(this.window, sizeX, h2, offsetX, () => "water opacity", () => getActiveClimate().getUIColorInactiveCustom(0.55)));
        waterConditionalContainer.addElement(new SliderGradientBackground(this.window, UI_LIGHTING_WATER_OPACITY, sizeX, sliderSizeY, 0, 1, () => getWaterColorTransformed(NULL, 0, .5, .5), () => getWaterColorTransformed(NULL, NULL, NULL, 1), true));
        waterConditionalContainer.addElement(new TextBackground(this.window, sizeX, br, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""));

        waterConditionalContainer.addElement(new TextFunctionalBackground(this.window, sizeX, h2, offsetX, () => "water value", () => getActiveClimate().getUIColorInactiveCustom(0.62)));
        waterConditionalContainer.addElement(new SliderGradientBackground(this.window, UI_LIGHTING_WATER_VALUE, sizeX, sliderSizeY, 0.0, 1, () => getWaterColorTransformed(NULL, NULL, 0, NULL), () => getWaterColorTransformed(NULL, NULL, 1, NULL), true));
        waterConditionalContainer.addElement(new TextBackground(this.window, sizeX, br, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""));

        waterConditionalContainer.addElement(new TextFunctionalBackground(this.window, sizeX, h2, offsetX, () => "water satuation", () => getActiveClimate().getUIColorInactiveCustom(0.58)));
        waterConditionalContainer.addElement(new SliderGradientBackground(this.window, UI_LIGHTING_WATER_SATURATION, sizeX, sliderSizeY, 0.0, 1, () => getWaterColorTransformed(NULL, 0, NULL, NULL), () => getWaterColorTransformed(NULL, 1, NULL, NULL), true));
        waterConditionalContainer.addElement(new TextBackground(this.window, sizeX, br, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""));

        waterConditionalContainer.addElement(new TextFunctionalBackground(this.window, sizeX, h2, offsetX, () => "water hue", () => getActiveClimate().getUIColorInactiveCustom(0.53)));
        waterConditionalContainer.addElement(new SliderGradientBackgroundWaterHue(this.window, UI_LIGHTING_WATER_HUE, sizeX, sliderSizeY, -.5, .5));

            }
    render() {
        if (loadUI(UI_UI_PHONEMODE)) {
            if (this.phoneModeOffset == 0) {
                this.phoneModeOffset = getBaseUISize() * 3;
                this.window.posY += this.phoneModeOffset;
            }
        } else {
            if (this.phoneModeOffset != 0) {
                this.window.posY -= this.phoneModeOffset;
                this.phoneModeOffset = 0;
            }
        };
        super.render();
    }
}