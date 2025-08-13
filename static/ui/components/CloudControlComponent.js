import { getBaseUISize, getCanvasSquaresY } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { Container } from "../Container.js";
import { loadGD, loadUI, UI_CENTER, UI_CLIMATE_RAINFALL_DENSITY, UI_CLIMATE_TOOL_SIZE, UI_CLIMATE_WEATHER_RAIN_TOGGLE, UI_CLIMATE_WEATHER_TOOL_CLOUD_HUMIDITY, UI_SIMULATION_HEIGHT, UI_UI_PHONEMODE } from "../UIData.js";
import { Slider } from "../elements/Slider.js";
import {
    UI_CLIMATE_WEATHER_TOOL_DRYAIR,
    UI_CLIMATE_WEATHER_TOOL_MATCHEDAIR,
    UI_CLIMATE_WEATHER_TOOL_CLOUD, UI_CLIMATE_WEATHER_TOOL_SELECT, UI_CLIMATE_WEATHER_TOOL_STRENGTH
} from "../UIData.js";
import { Text } from "../elements/Text.js";
import { RadioToggle } from "../elements/RadioToggle.js";
import { Component } from "../Component.js";
import { SliderGradientBackground } from "../elements/SliderGradientBackground.js";
import { TextBackground } from "../elements/TextBackground.js";
import { TextFunctionalBackground } from "../elements/TextFunctionalBackground.js";
import { getWaterColorTransformed, NULL } from "./LightingComponent.js";
import { RadioToggleLabel } from "../elements/RadioToggleLabel.js";

export class CloudControlComponent extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        this.phoneModeOffset = 0;
        let sizeX = getBaseUISize() * 32;
        let halfSizeX = sizeX / 2;
        let container = new Container(this.window, padding, 1);
        this.window.container = container;
        let brushLabelRow = new Container(this.window, padding, 0);
        let brushControlRow = new Container(this.window, padding, 0);
        let h1 = getBaseUISize() * 3;
        let h2 = getBaseUISize() * 2.5;
        let br = getBaseUISize() * .5;
        let offsetX = getBaseUISize() * 0.8;


        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.75), 0.75, " "))
        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 3.8, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.66315, "cloud painter"))
        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""));

        let row1 = new Container(this.window, 0, 0);
        let row2 = new Container(this.window, 0, 0);

        container.addElement(row1);
        container.addElement(row2);


        row1.addElement(new RadioToggle(this.window, halfSizeX, getBaseUISize() * 3, UI_CENTER, UI_CLIMATE_WEATHER_TOOL_SELECT, UI_CLIMATE_WEATHER_TOOL_DRYAIR,
            () => getActiveClimate().getUIColorInactiveCustom(0.62), () => getActiveClimate().getUIColorActive()));
        row1.addElement(new RadioToggle(this.window, halfSizeX, getBaseUISize() * 3, UI_CENTER, UI_CLIMATE_WEATHER_TOOL_SELECT, UI_CLIMATE_WEATHER_TOOL_CLOUD,
            () => getActiveClimate().getUIColorInactiveCustom(0.53), () => getActiveClimate().getUIColorActive()));
        row2.addElement(new RadioToggleLabel(this.window, halfSizeX, getBaseUISize() * 3, UI_CENTER, "rain off", UI_CLIMATE_WEATHER_RAIN_TOGGLE, 
        true, () => getActiveClimate().getUIColorInactiveCustom(0.53), () => getActiveClimate().getUIColorActive()));
        row2.addElement(new RadioToggleLabel(this.window, halfSizeX, getBaseUISize() * 3, UI_CENTER, "rain on", UI_CLIMATE_WEATHER_RAIN_TOGGLE, 
        false, () => getActiveClimate().getUIColorInactiveCustom(0.58), () => getActiveClimate().getUIColorActive(0.65)));

        container.addElement(new Text(this.window, sizeX, h2, UI_CENTER, "cloud humidity"));
        container.addElement(new SliderGradientBackground(this.window, UI_CLIMATE_WEATHER_TOOL_CLOUD_HUMIDITY, sizeX, getBaseUISize() * 3, 1.001, 1.05, () => "#000000", () => "#FFF0FF"));

        container.addElement(new Text(this.window, sizeX, h2, UI_CENTER, "cloud puffiness"));
        container.addElement(new SliderGradientBackground(this.window, UI_CLIMATE_WEATHER_TOOL_STRENGTH, sizeX, getBaseUISize() * 3, 0.01, 11.5, () => "#000000", () => "#FFF0FF"));
        container.addElement(new Text(this.window, sizeX, h2, UI_CENTER, "cloud size"));
        container.addElement(new SliderGradientBackground(this.window, UI_CLIMATE_TOOL_SIZE, sizeX, getBaseUISize() * 3, 1, getCanvasSquaresY(), () => "#000000", () => "#FFF0FF"));


        container.addElement(brushLabelRow);
        container.addElement(brushControlRow);
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