import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { RadioToggle } from "../elements/RadioToggle.js";
import { RadioToggleLabel } from "../elements/RadioToggleLabel.js";
import { RowedRadio } from "../elements/RowedRadio.js";
import { Text } from "../elements/Text.js";
import { TextBackground } from "../elements/TextBackground.js";
import { Toggle } from "../elements/Toggle.js";
import {
    UI_VIEWMODE_NORMAL,
    UI_VIEWMODE_LIGHTING,
    UI_VIEWMODE_NITROGEN,
    UI_VIEWMODE_PHOSPHORUS,
    UI_VIEWMODE_WIND,
    UI_VIEWMODE_TEMPERATURE,
    UI_VIEWMODE_MOISTURE,
    UI_VIEWMODE_ORGANISMS, UI_VIEWMODE_SELECT,
    UI_CENTER,
    UI_VIEWMODE_WATERTICKRATE,
    UI_VIEWMODE_WATERMATRIC,
    UI_VIEWMODE_GROUP,
    UI_VIEWMODE_AIRTICKRATE,
    UI_VIEWMODE_DEV1,
    UI_VIEWMODE_DEV2,
    UI_VIEWMODE_EVOLUTION,
    UI_VIEWMODE_NUTRIENTS,
    UI_VIEWMODE_DEV3
} from "../UIData.js";
import { SubTreeComponent } from "./SubTreeComponent.js";
export class ViewSubtreeComponent extends SubTreeComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        super(posXFunc, posYFunc, padding, dir, key);
        let sizeX = getBaseUISize() * 20;
        let container = new Container(this.window, padding, 1);
        this.window.container = container;
        let textAlignOffsetX = getBaseUISize() * 0.58;
        let br = getBaseUISize() * .5;


        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"normal",  UI_VIEWMODE_SELECT, UI_VIEWMODE_NORMAL,() => getActiveClimate().getUIColorInactiveCustom(0.49), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"lighting",  UI_VIEWMODE_SELECT, UI_VIEWMODE_LIGHTING,() => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"organisms",  UI_VIEWMODE_SELECT, UI_VIEWMODE_ORGANISMS,() => getActiveClimate().getUIColorInactiveCustom(0.51), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"evolution",  UI_VIEWMODE_SELECT, UI_VIEWMODE_EVOLUTION,() => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"nutrients",  UI_VIEWMODE_SELECT, UI_VIEWMODE_NUTRIENTS,() => getActiveClimate().getUIColorInactiveCustom(0.53), () => getActiveClimate().getUIColorActive()));
        container.addElement(new TextBackground(this.window, sizeX, br, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.64), 0.75, ""));
        
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"wind",  UI_VIEWMODE_SELECT, UI_VIEWMODE_WIND,() => getActiveClimate().getUIColorInactiveCustom(0.565), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"temperature",  UI_VIEWMODE_SELECT, UI_VIEWMODE_TEMPERATURE,() => getActiveClimate().getUIColorInactive(0.51), () => getActiveClimate().getUIColorActive()));
        
        container.addElement(new TextBackground(this.window, sizeX, br, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.66), 0.75, ""));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"moisture",  UI_VIEWMODE_SELECT, UI_VIEWMODE_MOISTURE,() => getActiveClimate().getUIColorInactiveCustom(0.58), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"pressure",  UI_VIEWMODE_SELECT, UI_VIEWMODE_WATERMATRIC,() => getActiveClimate().getUIColorInactiveCustom(0.54), () => getActiveClimate().getUIColorActive()));
        
        container.addElement(new TextBackground(this.window, sizeX, br, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.68), 0.75, ""));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"tickrate",  UI_VIEWMODE_SELECT, UI_VIEWMODE_WATERTICKRATE,() => getActiveClimate().getUIColorInactiveCustom(0.585), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"air tickrate",  UI_VIEWMODE_SELECT, UI_VIEWMODE_AIRTICKRATE,() => getActiveClimate().getUIColorInactiveCustom(0.53), () => getActiveClimate().getUIColorActive()));
        
        container.addElement(new TextBackground(this.window, sizeX, br, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.70), 0.75, ""));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"group",  UI_VIEWMODE_SELECT, UI_VIEWMODE_GROUP,() => getActiveClimate().getUIColorInactiveCustom(0.54), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"candidate",  UI_VIEWMODE_SELECT, UI_VIEWMODE_DEV1,() => getActiveClimate().getUIColorInactiveCustom(0.60), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"target",  UI_VIEWMODE_SELECT, UI_VIEWMODE_DEV2,() => getActiveClimate().getUIColorInactiveCustom(0.56), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"block health",  UI_VIEWMODE_SELECT, UI_VIEWMODE_DEV3,() => getActiveClimate().getUIColorInactiveCustom(0.56), () => getActiveClimate().getUIColorActive()));
    
        
    }
}