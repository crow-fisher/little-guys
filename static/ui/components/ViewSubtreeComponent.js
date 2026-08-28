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
    UI_VIEWMODE_CANDIDATE,
    UI_VIEWMODE_TARGET,
    UI_VIEWMODE_EVOLUTION,
    UI_VIEWMODE_NUTRIENTS,
    UI_VIEWMODE_BLOCK_HEALTH,
    UI_VIEWMODE_BLOCK_SPEED,
    UI_VIEWMODE_PATH_HISTORY,
    UI_VIEWMODE_ORGANISM_SUIT_LIGHT,
    UI_VIEWMODE_ORGANISM_SUIT_WATER,
    UI_VIEWMODE_ORGANISM_SUIT_NET
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

        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"normal",  UI_VIEWMODE_SELECT, UI_VIEWMODE_NORMAL,() => getActiveClimate().getUIColorInactive(0.49), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"lighting",  UI_VIEWMODE_SELECT, UI_VIEWMODE_LIGHTING,() => getActiveClimate().getUIColorInactive(0.55), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"organisms",  UI_VIEWMODE_SELECT, UI_VIEWMODE_ORGANISMS,() => getActiveClimate().getUIColorInactive(0.51), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"evolution",  UI_VIEWMODE_SELECT, UI_VIEWMODE_EVOLUTION,() => getActiveClimate().getUIColorInactive(0.55), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"light suit.",  UI_VIEWMODE_SELECT, UI_VIEWMODE_ORGANISM_SUIT_LIGHT,() => getActiveClimate().getUIColorInactive(0.50), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"water suit.",  UI_VIEWMODE_SELECT, UI_VIEWMODE_ORGANISM_SUIT_WATER,() => getActiveClimate().getUIColorInactive(0.56), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"net suit.",  UI_VIEWMODE_SELECT, UI_VIEWMODE_ORGANISM_SUIT_NET,() => getActiveClimate().getUIColorInactive(0.52), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"evolution",  UI_VIEWMODE_SELECT, UI_VIEWMODE_EVOLUTION,() => getActiveClimate().getUIColorInactive(0.55), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"nutrients",  UI_VIEWMODE_SELECT, UI_VIEWMODE_NUTRIENTS,() => getActiveClimate().getUIColorInactive(0.53), () => getActiveClimate().getUIColorActive()));
        container.addElement(new TextBackground(this.window, sizeX, br, UI_CENTER, () => getActiveClimate().getUIColorInactive(0.64), 0.75, ""));
        
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"wind",  UI_VIEWMODE_SELECT, UI_VIEWMODE_WIND,() => getActiveClimate().getUIColorInactive(0.565), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"temperature",  UI_VIEWMODE_SELECT, UI_VIEWMODE_TEMPERATURE,() => getActiveClimate().getUIColorInactive(0.51), () => getActiveClimate().getUIColorActive()));
        
        container.addElement(new TextBackground(this.window, sizeX, br, UI_CENTER, () => getActiveClimate().getUIColorInactive(0.66), 0.75, ""));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"moisture",  UI_VIEWMODE_SELECT, UI_VIEWMODE_MOISTURE,() => getActiveClimate().getUIColorInactive(0.58), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"pressure",  UI_VIEWMODE_SELECT, UI_VIEWMODE_WATERMATRIC,() => getActiveClimate().getUIColorInactive(0.54), () => getActiveClimate().getUIColorActive()));
        
        container.addElement(new TextBackground(this.window, sizeX, br, UI_CENTER, () => getActiveClimate().getUIColorInactive(0.68), 0.75, ""));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"tickrate",  UI_VIEWMODE_SELECT, UI_VIEWMODE_WATERTICKRATE,() => getActiveClimate().getUIColorInactive(0.585), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"air tickrate",  UI_VIEWMODE_SELECT, UI_VIEWMODE_AIRTICKRATE,() => getActiveClimate().getUIColorInactive(0.53), () => getActiveClimate().getUIColorActive()));
        
        container.addElement(new TextBackground(this.window, sizeX, br, UI_CENTER, () => getActiveClimate().getUIColorInactive(0.70), 0.75, ""));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"group",  UI_VIEWMODE_SELECT, UI_VIEWMODE_GROUP,() => getActiveClimate().getUIColorInactive(0.54), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"candidate",  UI_VIEWMODE_SELECT, UI_VIEWMODE_CANDIDATE,() => getActiveClimate().getUIColorInactive(0.60), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"target",  UI_VIEWMODE_SELECT, UI_VIEWMODE_TARGET,() => getActiveClimate().getUIColorInactive(0.56), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"block health",  UI_VIEWMODE_SELECT, UI_VIEWMODE_BLOCK_HEALTH,() => getActiveClimate().getUIColorInactive(0.56), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"block speed",  UI_VIEWMODE_SELECT, UI_VIEWMODE_BLOCK_SPEED,() => getActiveClimate().getUIColorInactive(0.56), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"path history",  UI_VIEWMODE_SELECT, UI_VIEWMODE_PATH_HISTORY,() => getActiveClimate().getUIColorInactive(0.56), () => getActiveClimate().getUIColorActive()));
        
    }
}