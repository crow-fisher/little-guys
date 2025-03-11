import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { RowedRadio } from "../elements/RowedRadio.js";
import { Text } from "../elements/Text.js";
import {
    UI_VIEWMODE_NORMAL,
    UI_VIEWMODE_LIGHTIHNG,
    UI_VIEWMODE_NITROGEN,
    UI_VIEWMODE_PHOSPHORUS,
    UI_VIEWMODE_WIND,
    UI_VIEWMODE_TEMPERATURE,
    UI_VIEWMODE_MOISTURE,
    UI_VIEWMODE_SURFACE,
    UI_VIEWMODE_ORGANISMS, UI_VIEWMODE_SELECT,
    UI_CENTER
} from "../UIData.js";
import { SubTreeComponent } from "./SubTreeComponent.js";
export class ViewModeComponent extends SubTreeComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        super(posXFunc, posYFunc, padding, dir, key);
        var sizeX = getBaseUISize() * 14;
        let container = new Container(this.window, padding, 1);
        this.window.container = container;
        let textAlignOffsetX = getBaseUISize() * 1.99;
        container.addElement(new RowedRadio(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 24, textAlignOffsetX, UI_VIEWMODE_SELECT, 9, [
            UI_VIEWMODE_NORMAL,
            UI_VIEWMODE_LIGHTIHNG,
            UI_VIEWMODE_NITROGEN,
            UI_VIEWMODE_PHOSPHORUS,
            UI_VIEWMODE_WIND,
            UI_VIEWMODE_TEMPERATURE,
            UI_VIEWMODE_MOISTURE,
            UI_VIEWMODE_SURFACE,
            UI_VIEWMODE_ORGANISMS
        ],() => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorTransient()));
    }
}