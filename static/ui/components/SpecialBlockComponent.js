import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { RowedRadio } from "../elements/RowedRadio.js";
import { Slider } from "../elements/Slider.js";
import { Text } from "../elements/Text.js";
import { loadUI, UI_SPECIAL_WATER, UI_SPECIAL_AQUIFER, UI_SPECIAL_MIX, UI_SPECIAL_SURFACE, UI_SOIL_COMPOSITION, UI_SPECIAL_SELECT, UI_BB_SIZE, UI_BB_STRENGTH, UI_SM_SPECIAL, UI_CENTER } from "../UIData.js";


let padding = 10;
export class SpecialBlockComponent extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);

        var sizeX = getBaseUISize() * 12;
        let container = new Container(this.window, padding, 1);
        this.window.container = container;

        container.addElement(new RowedRadio(this.window, sizeX * 2, getBaseUISize() * 6, UI_CENTER, UI_SPECIAL_SELECT, 2, [
            UI_SPECIAL_WATER,
            UI_SPECIAL_AQUIFER,
            UI_SPECIAL_MIX,
            UI_SPECIAL_SURFACE,
        ],() => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorTransient()));

        let strengthSizeContainer = new Container(this.window, padding, 0);
        container.addElement(strengthSizeContainer);

        let sizeContainer = new Container(this.window, padding, 1);
        strengthSizeContainer.addElement(sizeContainer);

        sizeContainer.addElement(new Text(this.window, sizeX, getBaseUISize() * 1.5, UI_CENTER, "size"));
        sizeContainer.addElement(new Slider(this.window, UI_BB_SIZE, sizeX, getBaseUISize() * 3, 2, 14, () => getActiveClimate().getUIColorTransient()));

        let strengthContainer = new Container(this.window, padding, 1);
        strengthSizeContainer.addElement(strengthContainer);

        strengthContainer.addElement(new Text(this.window, sizeX, getBaseUISize() * 1.5, UI_CENTER, "strength"));
        strengthContainer.addElement(new Slider(this.window, UI_BB_STRENGTH, sizeX, getBaseUISize() * 3, 0, 1,  () => getActiveClimate().getUIColorTransient()));
    }
}