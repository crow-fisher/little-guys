import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { Radio } from "../elements/Radio.js";
import { UI_BB_MODE_LEFT, UI_BB_MODE_RIGHT, UI_MODE_ROCK, UI_MODE_SOIL, UI_MODE_TOOL, UI_SOIL_COMPOSITION, UI_SOIL_INITALWATER } from "../UIData.js";


let padding = 10;
export class BlockBuildingComponent extends Component {
    constructor() {
        super();

        let leftSideContainer = new Container(this.window, UI_SOIL_COMPOSITION, 100, 100, padding, 1);
        this.window.addElement(leftSideContainer);

        let rightSideContainer = new Container(this.window, UI_SOIL_COMPOSITION, 100, 100, padding, 1);
        this.window.addElement(rightSideContainer);

        leftSideContainer.addElement(new Radio(window, 200, 35, UI_BB_MODE_LEFT, [UI_MODE_SOIL, UI_MODE_ROCK, UI_MODE_TOOL]));
        rightSideContainer.addElement(new Radio(window, 200, 35, UI_BB_MODE_RIGHT, [UI_MODE_SOIL, UI_MODE_ROCK, UI_MODE_TOOL]));

        // this.window.addElement(new SoilPickerElement(window, UI_SOIL _COMPOSITION, 200, 100));
        // this.window.addElement(new SoilPickerElement(window, UI_ROCK_COMPOSITION, 200, 100));
        // this.window.addElement(new Radio(window, 200, 35, UI_SOIL_VIEWMODE, ["🎨", "💦", "⚡"]));
        // this.window.addElement(new Slider(window, 200, 35, UI_SOIL_INITALWATER, -15, -2));
    }

}