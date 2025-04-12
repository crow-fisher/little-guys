import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { Container } from "../Container.js";
import { LockedComponent } from "../LockedComponent.js";
import { UI_CENTER, UI_CLIMATE_TOOL_SIZE } from "../UIData.js";
import { RowedRadio } from "../elements/RowedRadio.js";
import { Slider } from "../elements/Slider.js";
import {
    UI_CLIMATE_WEATHER_TOOL_DRYAIR,
    UI_CLIMATE_WEATHER_TOOL_MATCHEDAIR,
    UI_CLIMATE_WEATHER_TOOL_LIGHTCLOUD,
    UI_CLIMATE_WEATHER_TOOL_HEAVYCLOUD,
    UI_CLIMATE_WEATHER_TOOL_SELECT,
    UI_PALETTE_SIZE,
    UI_CLIMATE_WEATHER_TOOL_STRENGTH
} from "../UIData.js";
import { Text } from "../elements/Text.js";
import { RadioToggleLabel } from "../elements/RadioToggleLabel.js";
import { RadioToggle } from "../elements/RadioToggle.js";

export class CloudControlComponent extends LockedComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        super(posXFunc, posYFunc, padding, dir, key);

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
        row1.addElement(new RadioToggle(this.window, halfSizeX, getBaseUISize() * 3, UI_CENTER,UI_CLIMATE_WEATHER_TOOL_SELECT, UI_CLIMATE_WEATHER_TOOL_MATCHEDAIR,
        () => getActiveClimate().getUIColorInactiveCustom(0.53), () => getActiveClimate().getUIColorActive()));
        row2.addElement(new RadioToggle(this.window, halfSizeX, getBaseUISize() * 3, UI_CENTER, UI_CLIMATE_WEATHER_TOOL_SELECT, UI_CLIMATE_WEATHER_TOOL_LIGHTCLOUD,
        () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive()));
        row2.addElement(new RadioToggle(this.window, halfSizeX, getBaseUISize() * 3, UI_CENTER, UI_CLIMATE_WEATHER_TOOL_SELECT, UI_CLIMATE_WEATHER_TOOL_HEAVYCLOUD, 
        () => getActiveClimate().getUIColorInactiveCustom(0.64), () => getActiveClimate().getUIColorActive()));

        brushControlRow.addElement(new Slider(this.window, UI_CLIMATE_TOOL_SIZE, halfSizeX, getBaseUISize() * 3, 10, 100, () => getActiveClimate().getUIColorTransient()));
        brushControlRow.addElement(new Slider(this.window, UI_CLIMATE_WEATHER_TOOL_STRENGTH, halfSizeX, getBaseUISize() * 3, 0.01, 0.1, () => getActiveClimate().getUIColorTransient()));
        
        brushLabelRow.addElement(new Text(this.window, halfSizeX, getBaseUISize() * 2, UI_CENTER, "brush size"));
        brushLabelRow.addElement(new Text(this.window, halfSizeX, getBaseUISize() * 2, UI_CENTER, "brush strength"));

        container.addElement(brushLabelRow);
        container.addElement(brushControlRow);

    }
}