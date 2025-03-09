import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { Component } from "../Component.js";
import { ConditionalContainer } from "../ConditionalContainer.js";
import { Container } from "../Container.js";
import { Radio } from "../elements/Radio.js";
import { Slider } from "../elements/Slider.js";
import { SoilPickerElement } from "../elements/SoilPicker.js";
import { Text } from "../elements/Text.js";
import { Toggle } from "../elements/Toggle.js";
import { loadUI, saveUI, UI_BB_EYEDROPPER, UI_BB_MIXER, UI_BB_MODE, UI_BB_SIZE, UI_BB_STRENGTH, UI_MODE_ROCK, UI_MODE_SOIL, UI_ROCK_COMPOSITION, UI_SOIL_COMPOSITION } from "../UIData.js";

export const BB_SIZE_MIN = 1;
export const BB_SIZE_MAX = 14;

export class BlockBuildingComponent extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        let sizeX = getBaseUISize() * 32;
        let halfSizeX = sizeX / 2;
        let container = new Container(this.window, padding, 1);
        this.window.container = container;

        this.soilPickerElement = new SoilPickerElement(this.window, UI_SOIL_COMPOSITION, sizeX, halfSizeX);
        this.rockPickerElement = new SoilPickerElement(this.window, UI_ROCK_COMPOSITION, sizeX, halfSizeX);
        
        container.addElement(new Radio(this.window, sizeX, getBaseUISize() * 3, UI_BB_MODE, [UI_MODE_SOIL, UI_MODE_ROCK],() => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorActive()));
        let soilConditionalContainer = new ConditionalContainer(this.window, padding, 1, () => loadUI(UI_BB_MODE) == UI_MODE_SOIL);
        soilConditionalContainer.addElement(this.soilPickerElement);
        let rockConditionalContainer = new ConditionalContainer(this.window, padding, 1, () => loadUI(UI_BB_MODE) == UI_MODE_ROCK);
        rockConditionalContainer.addElement(this.rockPickerElement);

        container.addElement(soilConditionalContainer);
        container.addElement(rockConditionalContainer);

        let strengthSizeContainer = new Container(this.window, padding, 0);
        container.addElement(strengthSizeContainer);
        let sizeContainer = new Container(this.window, padding, 1);
        strengthSizeContainer.addElement(sizeContainer);

        sizeContainer.addElement(new Text(this.window, halfSizeX, getBaseUISize() * 1.5, "size"));
        sizeContainer.addElement(new Slider(this.window, UI_BB_SIZE, halfSizeX, getBaseUISize() * 3, BB_SIZE_MIN, BB_SIZE_MAX, () => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorTransient()));

        let strengthContainer = new Container(this.window, padding, 1);
        strengthSizeContainer.addElement(strengthContainer);

        strengthContainer.addElement(new Text(this.window, halfSizeX, getBaseUISize() * 1.5, "strength"));
        strengthContainer.addElement(new Slider(this.window, UI_BB_STRENGTH, halfSizeX, getBaseUISize() * 3, 0, 1, () => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorTransient()));
        let specialToolContainer = new Container(this.window, padding, 0);
        container.addElement(specialToolContainer);
        specialToolContainer.addElement(new Toggle(this.window,sizeX / 2, getBaseUISize() * 2.5, UI_BB_EYEDROPPER , "q | eyedropper", () => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorTransient()));
        specialToolContainer.addElement(new Toggle(this.window,sizeX / 2, getBaseUISize() * 2.5, UI_BB_MIXER , "w | mixer", () => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorTransient()));
    }

    setHover(sand, silt, clay) {
        if (loadUI(UI_BB_MODE) == UI_MODE_SOIL) {
            this.soilPickerElement.setHover(sand, silt, clay);
        }
        if (loadUI(UI_BB_MODE) == UI_MODE_ROCK) {
            this.rockPickerElement.setHover(sand, silt, clay);
        }
    }
    setClick(sand, silt, clay) {
        if (loadUI(UI_BB_MODE) == UI_MODE_SOIL) {
            this.soilPickerElement.setClick(sand, silt, clay);
        }
        if (loadUI(UI_BB_MODE) == UI_MODE_ROCK) {
            this.rockPickerElement.setClick(sand, silt, clay);
        }
        saveUI(UI_BB_EYEDROPPER, false);
    }
}