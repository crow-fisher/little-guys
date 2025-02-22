import { getBaseSize } from "../../canvas.js";
import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { RowedRadio } from "../elements/RowedRadio.js";
import { Text } from "../elements/Text.js";
import {
    UI_GODMODE_SELECT,
    UI_GODMODE_WIND,
    UI_GODMODE_TEMPERATURE,
    UI_GODMODE_MOISTURE,
    UI_GODMODE_KILL
} from "../UIData.js";
export class GodModeComponent extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        var sizeX = getBaseSize() * 22;
        let container = new Container(this.window, padding, 1);
        this.window.container = container;
        container.addElement(new Text(this.window, sizeX * 2, getBaseSize() * 1.5, "god tool select"));
        container.addElement(new RowedRadio(this.window, sizeX * 2, getBaseSize() * 6, UI_GODMODE_SELECT, 2, [
            UI_GODMODE_WIND,
            UI_GODMODE_TEMPERATURE,
            UI_GODMODE_MOISTURE,
            UI_GODMODE_KILL
        ]));
    }
}