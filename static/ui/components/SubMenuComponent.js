import { Component } from "../Component.js";
import { ConditionalContainer } from "../ConditionalContainer.js";
import { Container } from "../Container.js";
import { Radio } from "../elements/Radio.js";
import { Slider } from "../elements/Slider.js";
import { SoilPickerElement } from "../elements/SoilPicker.js";
import { Text } from "../elements/Text.js";
import { Toggle } from "../elements/Toggle.js";
import { UI_BB_MODE, UI_BB_SIZE, UI_BB_STRENGTH, UI_MODE_ROCK, UI_MODE_SOIL, UI_ROCK_COMPOSITION, UI_SM_BB, UI_SOIL_COMPOSITION, UI_TOOL_BLUR, UI_TOOL_ERASE, UI_TOOL_MIX, UI_TOOL_MODE_LEFT } from "../UIData.js";


let padding = 10;
export class SubMenuComponent extends Component {
    constructor() {
        super();

        let subMenuContainer = new Container(this.window, UI_SOIL_COMPOSITION, 100, 100, padding, 1);
        this.window.addElement(subMenuContainer);

        subMenuContainer.addElement(new Toggle(this.window, 75, 25, UI_SM_BB, "blocks"));
        
    }

}