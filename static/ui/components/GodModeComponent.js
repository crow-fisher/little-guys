import { getBaseSize } from "../../canvas.js";
import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { RowedRadio } from "../elements/RowedRadio.js";
import { Slider } from "../elements/Slider.js";
import { Text } from "../elements/Text.js";
import {
    UI_GODMODE_SELECT,
    UI_GODMODE_WIND,
    UI_GODMODE_TEMPERATURE,
    UI_GODMODE_MOISTURE,
    UI_GODMODE_KILL,
    UI_BB_SIZE,
    UI_BB_STRENGTH
} from "../UIData.js";
export class GodModeComponent extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        let sizeX = getBaseSize() * 26;
        let halfSizeX = sizeX / 2;
        let container = new Container(this.window, padding, 1);
        this.window.container = container;

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

        container.addElement(new Text(this.window, sizeX, getBaseSize() * 1.5, "god tool select"));
        container.addElement(new RowedRadio(this.window, sizeX, getBaseSize() * 5, UI_GODMODE_SELECT, 2, [
            UI_GODMODE_WIND,
            UI_GODMODE_TEMPERATURE,
            UI_GODMODE_MOISTURE,
            UI_GODMODE_KILL
        ]));
    }
}