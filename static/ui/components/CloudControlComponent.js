import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { Container } from "../Container.js";
import { loadUI, UI_CENTER, UI_CLIMATE_TOOL_SIZE, UI_CLIMATE_WEATHER_TOOL_CLOUD_HUMIDITY, UI_UI_PHONEMODE } from "../UIData.js";
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

        let row1 = new Container(this.window, 0, 0);
        let row2 = new Container(this.window, 0, 0);

        container.addElement(row1);
        container.addElement(row2);

        row1.addElement(new RadioToggle(this.window, halfSizeX, getBaseUISize() * 3, UI_CENTER, UI_CLIMATE_WEATHER_TOOL_SELECT, UI_CLIMATE_WEATHER_TOOL_DRYAIR,
            () => getActiveClimate().getUIColorInactiveCustom(0.62), () => getActiveClimate().getUIColorActive()));
        row1.addElement(new RadioToggle(this.window, halfSizeX, getBaseUISize() * 3, UI_CENTER, UI_CLIMATE_WEATHER_TOOL_SELECT, UI_CLIMATE_WEATHER_TOOL_MATCHEDAIR,
            () => getActiveClimate().getUIColorInactiveCustom(0.53), () => getActiveClimate().getUIColorActive()));
        row2.addElement(new RadioToggle(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, UI_CLIMATE_WEATHER_TOOL_SELECT, UI_CLIMATE_WEATHER_TOOL_CLOUD,
            () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive()));
 
        container.addElement(new SliderGradientBackground(this.window, UI_CLIMATE_WEATHER_TOOL_CLOUD_HUMIDITY, sizeX, getBaseUISize() * 3, 1.001, 1.05, () => "#000000", () => "#FFF0FF"));

        brushControlRow.addElement(new Slider(this.window, UI_CLIMATE_TOOL_SIZE, halfSizeX, getBaseUISize() * 3, 10, 400, () => getActiveClimate().getUIColorTransient()));
        brushControlRow.addElement(new Slider(this.window, UI_CLIMATE_WEATHER_TOOL_STRENGTH, halfSizeX, getBaseUISize() * 3, 0.01, 4, () => getActiveClimate().getUIColorTransient()));

        brushLabelRow.addElement(new Text(this.window, halfSizeX, getBaseUISize() * 2, UI_CENTER, "brush size"));
        brushLabelRow.addElement(new Text(this.window, halfSizeX, getBaseUISize() * 2, UI_CENTER, "brush strength"));

        container.addElement(brushLabelRow);
        container.addElement(brushControlRow);
    }
    render() {
        if (loadUI(UI_UI_PHONEMODE)) {
            if (this.phoneModeOffset == 0) {
                this.phoneModeOffset = getBaseUISize() * 6;
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