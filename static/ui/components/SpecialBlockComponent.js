import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { RowedRadio } from "../elements/RowedRadio.js";
import { Slider } from "../elements/Slider.js";
import { Text } from "../elements/Text.js";
import { loadUI, UI_SPECIAL_WATER, UI_SPECIAL_AQUIFER, UI_SPECIAL_MIX, UI_SPECIAL_BLUR, UI_SOIL_COMPOSITION, UI_SPECIAL_SELECT, UI_BB_SIZE, UI_BB_STRENGTH, UI_SM_SPECIAL } from "../UIData.js";


let padding = 10;
export class SpecialBlockComponent extends Component {
    constructor() {
        super();

        var sizeX = 100;
        let container = new Container(this.window, UI_SOIL_COMPOSITION, sizeX, 100, padding, 1);
        this.window.addElement(container);

        container.addElement(new Text(this.window, 200, 15, "oh hi mark"));
        container.addElement(new RowedRadio(this.window, 200, 50, UI_SPECIAL_SELECT, 2, [
            UI_SPECIAL_WATER,
            UI_SPECIAL_AQUIFER,
            UI_SPECIAL_MIX,
            UI_SPECIAL_BLUR
        ]));

        container.addElement(new Text(this.window, 200, 15, "brush size"));
        container.addElement(new Slider(this.window, UI_BB_SIZE, 200, 35, 2, 10));
        container.addElement(new Text(this.window, 200, 15, "brush strength"));
        container.addElement(new Slider(this.window, UI_BB_STRENGTH, 200, 35, 0, 1));;
    }

    render() {
        if (!loadUI(UI_SM_SPECIAL)) {
            return;
        }
        super.render();
    }

    update() {
        if (!loadUI(UI_SM_SPECIAL)) {
            return;
        }
        super.update();
    }
}