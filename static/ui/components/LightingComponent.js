import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { getMoonlightColor, getMoonlightColorRgb } from "../../climate/time.js";
import { hexToRgb, hsv2rgb, rgb2hsv, rgbToHex, rgbToRgba } from "../../common.js";
import { WaterSquare } from "../../squares/WaterSquare.js";
import { Component } from "../Component.js";
import { ConditionalContainer } from "../ConditionalContainer.js";
import { Container } from "../Container.js";
import { RadioToggleLabel } from "../elements/RadioToggleLabel.js";
import { Slider } from "../elements/Slider.js";
import { SliderGradientBackground } from "../elements/SliderGradientBackground.js";
import { Text } from "../elements/Text.js";
import { TextBackground } from "../elements/TextBackground.js";
import { loadGD, UI_LIGHTING_SUN, UI_LIGHTING_MOON, UI_LIGHTING_WATER, UI_LIGHTING_ROCK, UI_LIGHTING_PLANT, UI_LIGHTING_DECAY, UI_SM_LIGHTING, UI_SOIL_COMPOSITION, UI_CENTER, UI_LIGHTING_SURFACE, UI_LIGHTING_WATER_OPACITY, UI_LIGHTING_WATER_SATURATION, UI_LIGHTING_WATER_VALUE, UI_LIGHTING_WATER_HUE, UI_LIGHTING_PLANT_GRASS, UI_LIGHTING_PLANT_TREE, UI_LIGHTING_SCENE_MODE, UI_LIGHTING_SCENE_MODE_SCENE, UI_LIGHTING_SCENE_MODE_WATER, UI_LIGHTING_SCENE_MODE_PLANT } from "../UIData.js";

function getWaterColor() {
    let s = new WaterSquare(-1, -1);
    let rgb = s.getColorBase();
    return rgbToHex(rgb.r, rgb.g, rgb.b);
}

function getWaterColorDark() {
    let s = new WaterSquare(-1, -1);
    let rgb = s.getColorBase();
    let waterHsv = rgb2hsv(rgb.r, rgb.g, rgb.b);
    waterHsv[2] *= 0.15;
    return rgbToHex(...hsv2rgb(...waterHsv));
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

export class LightingComponent extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        let container = new Container(this.window, 0, 1);
        this.window.container = container;

        let sizeX = getBaseUISize() * 36;
        let half = sizeX / 2;
        let third = sizeX / 3;
        let quarter = sizeX / 4;

        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 0.5, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.65), 0.75," "))
        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 2.8, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.9, "lighting editor"))

        let modeSelectRow = new Container(this.window, 0, 0);
        container.addElement(modeSelectRow);

        modeSelectRow.addElement(new RadioToggleLabel(this.window, third, getBaseUISize() * 3, UI_CENTER, "scene", UI_LIGHTING_SCENE_MODE, UI_LIGHTING_SCENE_MODE_SCENE, () => getActiveClimate().getUIColorInactiveCustom(0.66), () => getActiveClimate().getUIColorInactiveCustom(0.55)));
        modeSelectRow.addElement(new RadioToggleLabel(this.window, third, getBaseUISize() * 3, UI_CENTER, "water", UI_LIGHTING_SCENE_MODE, UI_LIGHTING_SCENE_MODE_WATER, () => getActiveClimate().getUIColorInactiveCustom(0.68), () => getActiveClimate().getUIColorInactiveCustom(0.59)));
        modeSelectRow.addElement(new RadioToggleLabel(this.window, third, getBaseUISize() * 3, UI_CENTER, "plant", UI_LIGHTING_SCENE_MODE, UI_LIGHTING_SCENE_MODE_PLANT, () => getActiveClimate().getUIColorInactiveCustom(0.64), () => getActiveClimate().getUIColorInactiveCustom(0.56)));

        let sceneConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_LIGHTING_SCENE_MODE) == UI_LIGHTING_SCENE_MODE_SCENE);
        let waterConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_LIGHTING_SCENE_MODE) == UI_LIGHTING_SCENE_MODE_WATER);
        let plantConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_LIGHTING_SCENE_MODE) == UI_LIGHTING_SCENE_MODE_PLANT);

        container.addElement(sceneConditionalContainer);
        container.addElement(waterConditionalContainer);
        container.addElement(plantConditionalContainer);

        let h1 = getBaseUISize() * 3;
        let h2 = getBaseUISize() * 2.5;
        let br = getBaseUISize() * .5;
        sceneConditionalContainer.addElement(new Text(this.window, sizeX,  br, UI_CENTER, ""));
        sceneConditionalContainer.addElement(new Text(this.window, sizeX,  h1, UI_CENTER, "source brightness"));
        sceneConditionalContainer.addElement(new Text(this.window, sizeX,  br, UI_CENTER, ""));

        sceneConditionalContainer.addElement(new Text(this.window, sizeX,  h2, UI_CENTER, "sun"));
        sceneConditionalContainer.addElement(new SliderGradientBackground(this.window, UI_LIGHTING_SUN, sizeX,  35, -4, 4, () => "#000000",() => "#FFF0FF"));

        sceneConditionalContainer.addElement(new Text(this.window, sizeX,  h2, UI_CENTER, "moon"));
        sceneConditionalContainer.addElement(new SliderGradientBackground(this.window, UI_LIGHTING_MOON, sizeX,  35, -3, 0, () => "#000000", () => getMoonlightColorRgb()));
        sceneConditionalContainer.addElement(new Text(this.window, sizeX,  br, UI_CENTER, ""));
        sceneConditionalContainer.addElement(new Text(this.window, sizeX,  h1, UI_CENTER, "decay settings"));
        sceneConditionalContainer.addElement(new Text(this.window, sizeX,  br, UI_CENTER, ""));
        
        sceneConditionalContainer.addElement(new Text(this.window, sizeX,  h2, UI_CENTER, "global"));
        sceneConditionalContainer.addElement(new SliderGradientBackground(this.window, UI_LIGHTING_DECAY, sizeX,  35, 3, 8, () => "#000000",() => "#FFF0FF"));

        sceneConditionalContainer.addElement(new Text(this.window, sizeX,  h2, UI_CENTER, "water"));
        sceneConditionalContainer.addElement(new SliderGradientBackground(this.window, UI_LIGHTING_WATER, sizeX,  35, -4, 2, getWaterColorDark, getWaterColor));

        sceneConditionalContainer.addElement(new Text(this.window, sizeX,  h2, UI_CENTER, "rock"));
        sceneConditionalContainer.addElement(new SliderGradientBackground(this.window, UI_LIGHTING_ROCK, sizeX,  35, -4, 4, getRockColorDark, getRockColor));

        sceneConditionalContainer.addElement(new Text(this.window, sizeX,  h2, UI_CENTER, "plant"));
        sceneConditionalContainer.addElement(new SliderGradientBackground(this.window, UI_LIGHTING_PLANT, sizeX,  35, -2, 2, getPlantColorDark, getPlantColor));

        plantConditionalContainer.addElement(new Text(this.window, sizeX,  h2, UI_CENTER, "grass"));
        plantConditionalContainer.addElement(new Slider(this.window, UI_LIGHTING_PLANT_GRASS, sizeX,  35, -2, 2, () => getActiveClimate().getUIColorTransient()));

        plantConditionalContainer.addElement(new Text(this.window, sizeX,  h2, UI_CENTER, "tree"));
        plantConditionalContainer.addElement(new Slider(this.window, UI_LIGHTING_PLANT_TREE, sizeX,  35, -2, 2, () => getActiveClimate().getUIColorTransient()));

        waterConditionalContainer.addElement(new Text(this.window, sizeX,  h2, UI_CENTER, "water opacity"));
        waterConditionalContainer.addElement(new Slider(this.window, UI_LIGHTING_WATER_OPACITY, sizeX,  35, 0.0, 1, () => getActiveClimate().getUIColorTransient()));

        waterConditionalContainer.addElement(new Text(this.window, sizeX,  h2, UI_CENTER, "water value"));
        waterConditionalContainer.addElement(new Slider(this.window, UI_LIGHTING_WATER_SATURATION, sizeX,  35, 0.0, 1, () => getActiveClimate().getUIColorTransient()));

        waterConditionalContainer.addElement(new Text(this.window, sizeX,  h2, UI_CENTER, "water satuation"));
        waterConditionalContainer.addElement(new Slider(this.window, UI_LIGHTING_WATER_VALUE, sizeX,  35, 0.0, 1, () => getActiveClimate().getUIColorTransient()));

        waterConditionalContainer.addElement(new Text(this.window, sizeX,  h2, UI_CENTER, "water hue"));
        waterConditionalContainer.addElement(new Slider(this.window, UI_LIGHTING_WATER_HUE, sizeX,  35, -.5, .5, () => getActiveClimate().getUIColorTransient()));

    }
}