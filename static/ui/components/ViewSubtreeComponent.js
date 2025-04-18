import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { RadioToggle } from "../elements/RadioToggle.js";
import { RadioToggleLabel } from "../elements/RadioToggleLabel.js";
import { RowedRadio } from "../elements/RowedRadio.js";
import { Text } from "../elements/Text.js";
import { Toggle } from "../elements/Toggle.js";
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
export class ViewSubtreeComponent extends SubTreeComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        super(posXFunc, posYFunc, padding, dir, key);
        let sizeX = getBaseUISize() * 18;
        let container = new Container(this.window, padding, 1);
        this.window.container = container;
        let textAlignOffsetX = getBaseUISize() * 0.8;

        container.addElement(new RadioToggleLabel(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX,"normal",  UI_VIEWMODE_SELECT, UI_VIEWMODE_NORMAL,() => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX,"lighting",  UI_VIEWMODE_SELECT, UI_VIEWMODE_LIGHTIHNG,() => getActiveClimate().getUIColorInactiveCustom(0.63), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX,"wind",  UI_VIEWMODE_SELECT, UI_VIEWMODE_WIND,() => getActiveClimate().getUIColorInactiveCustom(0.57), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX,"temperature",  UI_VIEWMODE_SELECT, UI_VIEWMODE_TEMPERATURE,() => getActiveClimate().getUIColorInactive(0.55), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX,"moisture",  UI_VIEWMODE_SELECT, UI_VIEWMODE_MOISTURE,() => getActiveClimate().getUIColorInactiveCustom(0.67), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX,"surface",  UI_VIEWMODE_SELECT, UI_VIEWMODE_SURFACE,() => getActiveClimate().getUIColorInactiveCustom(0.60), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX,"organisms",  UI_VIEWMODE_SELECT, UI_VIEWMODE_ORGANISMS,() => getActiveClimate().getUIColorInactiveCustom(0.66), () => getActiveClimate().getUIColorActive()));
    }
}