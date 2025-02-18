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
        let sizeX = 100;
        let container = new Container(this.window, UI_SOIL_COMPOSITION, 100, 100, padding, 1);
        this.window.addElement(container);
        container.addElement(new Radio(this.window, 200, 25, UI_BB_MODE, [UI_MODE_SOIL, UI_MODE_ROCK]));

        let leftSideConditionalContainer = new ConditionalContainer(this.window, UI_BB_MODE, 100, 100, padding, 1);
        container.addElement(leftSideConditionalContainer);

        leftSideConditionalContainer.addElement(UI_MODE_SOIL, new SoilPickerElement(this.window, UI_SOIL_COMPOSITION, 200, 100));
        leftSideConditionalContainer.addElement(UI_MODE_ROCK, new SoilPickerElement(this.window, UI_ROCK_COMPOSITION, 200, 100));

        let strengthSizeContainer = new Container(this.window, UI_SOIL_COMPOSITION, sizeX * 2, 100, padding, 0);
        container.addElement(strengthSizeContainer);
        let sizeContainer = new Container(this.window, UI_SOIL_COMPOSITION, sizeX, 100, padding, 1);
        strengthSizeContainer.addElement(sizeContainer);

        sizeContainer.addElement(new Text(this.window, sizeX, 15, "size"));
        sizeContainer.addElement(new Slider(this.window, UI_BB_SIZE, sizeX, 35, 2, 10));

        let strengthContainer = new Container(this.window, UI_SOIL_COMPOSITION, sizeX, 100, padding, 1);
        strengthSizeContainer.addElement(strengthContainer);

        strengthContainer.addElement(new Text(this.window, sizeX, 15, "strength"));
        strengthContainer.addElement(new Slider(this.window, UI_BB_STRENGTH, sizeX, 35, 0, 1));
    }
}