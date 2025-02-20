import { getBaseSize } from "../../canvas.js";
import { Component } from "../Component.js";
import { ConditionalContainer } from "../ConditionalContainer.js";
import { Container } from "../Container.js";
import { Radio } from "../elements/Radio.js";
import { Slider } from "../elements/Slider.js";
import { SoilPickerElement } from "../elements/SoilPicker.js";
import { Text } from "../elements/Text.js";
import { loadUI, UI_BB_MODE, UI_BB_SIZE, UI_BB_STRENGTH, UI_MODE_ROCK, UI_MODE_SOIL, UI_ROCK_COMPOSITION, UI_SOIL_COMPOSITION } from "../UIData.js";

let padding = 10;
export class BlockBuildingComponent extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        let halfSizeX = getBaseSize() * 16;

        let container = new Container(this.window, UI_SOIL_COMPOSITION, halfSizeX * 2, halfSizeX, padding, 1);
        this.window.addElement(container);
        container.addElement(new Radio(this.window, halfSizeX * 2, getBaseSize() * 3, UI_BB_MODE, [UI_MODE_SOIL, UI_MODE_ROCK]));

        let leftSideConditionalContainer = new ConditionalContainer(this.window, UI_BB_MODE, halfSizeX, halfSizeX, padding, 1);
        container.addElement(leftSideConditionalContainer);

        leftSideConditionalContainer.addElement(UI_MODE_SOIL, new SoilPickerElement(this.window, UI_SOIL_COMPOSITION, halfSizeX * 2, halfSizeX));
        leftSideConditionalContainer.addElement(UI_MODE_ROCK, new SoilPickerElement(this.window, UI_ROCK_COMPOSITION, halfSizeX * 2, halfSizeX));

        let strengthSizeContainer = new Container(this.window, UI_SOIL_COMPOSITION, halfSizeX, halfSizeX, padding, 0);
        container.addElement(strengthSizeContainer);
        let sizeContainer = new Container(this.window, UI_SOIL_COMPOSITION, halfSizeX, halfSizeX, padding, 1);
        strengthSizeContainer.addElement(sizeContainer);

        sizeContainer.addElement(new Text(this.window, halfSizeX, getBaseSize() * 1.5, "size"));
        sizeContainer.addElement(new Slider(this.window, UI_BB_SIZE, halfSizeX, getBaseSize() * 3, 2, 10));

        let strengthContainer = new Container(this.window, UI_SOIL_COMPOSITION, halfSizeX, halfSizeX, padding, 1);
        strengthSizeContainer.addElement(strengthContainer);

        strengthContainer.addElement(new Text(this.window, halfSizeX, getBaseSize() * 1.5, "strength"));
        strengthContainer.addElement(new Slider(this.window, UI_BB_STRENGTH, halfSizeX, getBaseSize() * 3, 0, 1));
    }
}