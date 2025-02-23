import { getBaseSize } from "../../canvas.js";
import { Component } from "../Component.js";
import { ConditionalContainer } from "../ConditionalContainer.js";
import { Container } from "../Container.js";
import { Radio } from "../elements/Radio.js";
import { Slider } from "../elements/Slider.js";
import { SoilPickerElement } from "../elements/SoilPicker.js";
import { Text } from "../elements/Text.js";
import { Toggle } from "../elements/Toggle.js";
import { loadUI, saveUI, UI_BB_EYEDROPPER, UI_BB_MODE, UI_BB_SIZE, UI_BB_STRENGTH, UI_MODE_ROCK, UI_MODE_SOIL, UI_ROCK_COMPOSITION, UI_SOIL_COMPOSITION } from "../UIData.js";

export class BlockBuildingComponent extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        let sizeX = getBaseSize() * 32;
        let halfSizeX = sizeX / 2;
        let container = new Container(this.window, padding, 1);
        this.window.container = container;

        this.soilPickerElement = new SoilPickerElement(this.window, UI_SOIL_COMPOSITION, sizeX, halfSizeX);
        this.rockPickerElement = new SoilPickerElement(this.window, UI_ROCK_COMPOSITION, sizeX, halfSizeX);
        
        container.addElement(new Radio(this.window, sizeX, getBaseSize() * 3, UI_BB_MODE, [UI_MODE_SOIL, UI_MODE_ROCK]));
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

        sizeContainer.addElement(new Text(this.window, halfSizeX, getBaseSize() * 1.5, "size"));
        sizeContainer.addElement(new Slider(this.window, UI_BB_SIZE, halfSizeX, getBaseSize() * 3, 2, 14));

        let strengthContainer = new Container(this.window, padding, 1);
        strengthSizeContainer.addElement(strengthContainer);

        strengthContainer.addElement(new Text(this.window, halfSizeX, getBaseSize() * 1.5, "strength"));
        strengthContainer.addElement(new Slider(this.window, UI_BB_STRENGTH, halfSizeX, getBaseSize() * 3, 0, 1));
        container.addElement(new Toggle(this.window,sizeX, getBaseSize() * 3, UI_BB_EYEDROPPER , "eyedropper"))
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