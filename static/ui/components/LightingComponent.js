import { Component } from "../Component.js";
import { ConditionalContainer } from "../ConditionalContainer.js";
import { Container } from "../Container.js";
import { Radio } from "../elements/Radio.js";
import { Slider } from "../elements/Slider.js";
import { SoilPickerElement } from "../elements/SoilPicker.js";
import { Text } from "../elements/Text.js";
import { loadUI, UI_BB_MODE, UI_BB_SIZE, UI_BB_STRENGTH, UI_MODE_ROCK, UI_MODE_SOIL, UI_ROCK_COMPOSITION, UI_SM_BB, UI_SM_LIGHTING, UI_SOIL_COMPOSITION, UI_TOOL_BLUR, UI_TOOL_ERASE, UI_TOOL_MIX, UI_TOOL_MODE_LEFT } from "../UIData.js";


let padding = 10;
export class LightingComponent extends Component {
    constructor() {
        super();

        var sizeX = 100;

        let leftContainer = new Container(this.window, UI_SOIL_COMPOSITION, sizeX, 100, padding, 1);
        let rightContainer = new Container(this.window, UI_SOIL_COMPOSITION, sizeX, 100, padding, 1);


        this.window.addElement(leftContainer);
        this.window.addElement(rightContainer);


        leftContainer.addElement(new Text(this.window, sizeX,  15, "sun"));
        leftContainer.addElement(new Slider(this.window, UI_BB_SIZE, sizeX,  35, 2, 10));

        rightContainer.addElement(new Text(this.window, sizeX,  15, "moon"));
        rightContainer.addElement(new Slider(this.window, UI_BB_SIZE, sizeX,  35, 2, 10));

        leftContainer.addElement(new Text(this.window, sizeX,  15, "water"));
        leftContainer.addElement(new Slider(this.window, UI_BB_STRENGTH, sizeX,  35, 0, 1));

        rightContainer.addElement(new Text(this.window, sizeX,  15, "rock"));
        rightContainer.addElement(new Slider(this.window, UI_BB_STRENGTH, sizeX,  35, 0, 1));

        leftContainer.addElement(new Text(this.window, sizeX,  15, "plant"));
        leftContainer.addElement(new Slider(this.window, UI_BB_SIZE, sizeX,  35, 2, 10));

        rightContainer.addElement(new Text(this.window, sizeX,  15, "decay"));
        rightContainer.addElement(new Slider(this.window, UI_BB_SIZE, sizeX,  35, 2, 10));

    }

    render() {
        if (!loadUI(UI_SM_LIGHTING)) {
            return;
        }
        super.render();
    }
    
    update() {
        if (!loadUI(UI_SM_LIGHTING)) {
            return;
        }
        super.update();
    }
}