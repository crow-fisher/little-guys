import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { Button } from "../elements/Button.js";
import { RowedRadio } from "../elements/RowedRadio.js";
import { Slider } from "../elements/Slider.js";
import { Text } from "../elements/Text.js";
import { Toggle } from "../elements/Toggle.js";
import {
    UI_GODMODE_SELECT,
    UI_GODMODE_WIND,
    UI_GODMODE_TEMPERATURE,
    UI_GODMODE_MOISTURE,
    UI_GODMODE_KILL,
    UI_BB_SIZE,
    UI_BB_STRENGTH,
    saveUI,
    loadUI,
    UI_GODMODE_FASTPLANT,
    UI_GODMODE_STRENGTH,
    UI_CENTER
} from "../UIData.js";
export class GodModeComponent extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        let sizeX = getBaseUISize() * 26;
        let halfSizeX = sizeX / 2;
        let container = new Container(this.window, padding, 1);
        this.window.container = container;

        let strengthSizeContainer = new Container(this.window, padding, 0);
        container.addElement(strengthSizeContainer);
        let sizeContainer = new Container(this.window, padding, 1);
        strengthSizeContainer.addElement(sizeContainer);

        sizeContainer.addElement(new Text(this.window, halfSizeX, getBaseUISize() * 1.5, "size"));
        sizeContainer.addElement(new Slider(this.window, UI_BB_SIZE, halfSizeX, getBaseUISize() * 3, 2, 50, () => getActiveClimate().getUIColorTransient()));

        let strengthContainer = new Container(this.window, padding, 1);
        strengthSizeContainer.addElement(strengthContainer);

        strengthContainer.addElement(new Text(this.window, halfSizeX, getBaseUISize() * 1.5, "strength"));
        strengthContainer.addElement(new Slider(this.window, UI_GODMODE_STRENGTH, halfSizeX, getBaseUISize() * 3, 0, 1, () => getActiveClimate().getUIColorTransient()));

        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 1.5, "god tool select"));
        container.addElement(new RowedRadio(this.window, sizeX, getBaseUISize() * 5,UI_CENTER,  UI_GODMODE_SELECT, 2, [
            UI_GODMODE_WIND,
            UI_GODMODE_TEMPERATURE,
            UI_GODMODE_MOISTURE,
            UI_GODMODE_KILL
        ], () => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorActive()));

        container.addElement(new Toggle(this.window, getBaseUISize() * 16, getBaseUISize() * 3, UI_GODMODE_FASTPLANT, "fast plant", () => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorTransient()));
        
    }
}