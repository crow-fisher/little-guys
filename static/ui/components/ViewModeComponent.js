import { getBaseSize } from "../../canvas.js";
import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { RowedRadio } from "../elements/RowedRadio.js";
import { Text } from "../elements/Text.js";
import {
    loadUI, UI_VIEWMODE_NORMAL,
    UI_VIEWMODE_LIGHTIHNG,
    UI_VIEWMODE_NITROGEN,
    UI_VIEWMODE_PHOSPHORUS,
    UI_VIEWMODE_WIND,
    UI_VIEWMODE_TEMPERATURE,
    UI_VIEWMODE_MOISTURE,
    UI_VIEWMODE_SURFACE,
    UI_VIEWMODE_ORGANISMS, UI_SPECIAL_SELECT, UI_NULL,
    UI_SM_VIEWMODE,
    UI_VIEWMODE_SELECT
} from "../UIData.js";
export class ViewModeComponent extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        var sizeX = getBaseSize() * 22;
        let container = new Container(this.window, padding, 1);
        this.window.container = container;

        container.addElement(new Text(this.window, sizeX * 2, getBaseSize() * 1.5, "view mode"));
        container.addElement(new RowedRadio(this.window, sizeX * 2, getBaseSize() * 6, UI_VIEWMODE_SELECT, 3, [
            UI_VIEWMODE_NORMAL,
            UI_VIEWMODE_LIGHTIHNG,
            UI_VIEWMODE_NITROGEN,
            UI_VIEWMODE_PHOSPHORUS,
            UI_VIEWMODE_WIND,
            UI_VIEWMODE_TEMPERATURE,
            UI_VIEWMODE_MOISTURE,
            UI_VIEWMODE_SURFACE,
            UI_VIEWMODE_ORGANISMS
        ]));
    }
}