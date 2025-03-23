import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { Container } from "../Container.js";
import { LockedComponent } from "../LockedComponent.js";
import { UI_CENTER } from "../UIData.js";
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

export class CloudControlComponent extends LockedComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        super(posXFunc, posYFunc, padding, dir, key);

        var sizeX = getBaseUISize() * 32;   
        let halfSizeX = sizeX / 2;
        let container = new Container(this.window, padding, 1);
        this.window.container = container;
        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 2, UI_CENTER, "climate brushes"));
        let brushLabelRow = new Container(this.window, padding, 0);
        let brushControlRow = new Container(this.window, padding, 0);

        container.addElement(new RowedRadio(this.window, sizeX, getBaseUISize() * 5, UI_CENTER, UI_CLIMATE_WEATHER_TOOL_SELECT, 2, [
            UI_CLIMATE_WEATHER_TOOL_DRYAIR,
            UI_CLIMATE_WEATHER_TOOL_MATCHEDAIR,
            UI_CLIMATE_WEATHER_TOOL_LIGHTCLOUD,
            UI_CLIMATE_WEATHER_TOOL_HEAVYCLOUD
        ], () => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorTransient()));

        brushControlRow.addElement(new Slider(this.window, UI_PALETTE_SIZE, halfSizeX, getBaseUISize() * 3, 5, 100, () => getActiveClimate().getUIColorTransient()));
        brushControlRow.addElement(new Slider(this.window, UI_CLIMATE_WEATHER_TOOL_STRENGTH, halfSizeX, getBaseUISize() * 3, 0.01, 0.1, () => getActiveClimate().getUIColorTransient()));
        
        brushLabelRow.addElement(new Text(this.window, halfSizeX, getBaseUISize() * 2, UI_CENTER, "brush size"));
        brushLabelRow.addElement(new Text(this.window, halfSizeX, getBaseUISize() * 2, UI_CENTER, "brush strength"));

        container.addElement(brushLabelRow);
        container.addElement(brushControlRow);

    }
}