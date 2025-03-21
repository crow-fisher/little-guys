import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { indexCanvasSize } from "../../index.js";
import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { Radio } from "../elements/Radio.js";
import { RadioToggle } from "../elements/RadioToggle.js";
import { Text } from "../elements/Text.js";
import { Toggle } from "../elements/Toggle.js";
import { loadUI, UI_CENTER, UI_LIGHTING_ENABLED, UI_LIGHTING_FASTLIGHTING, UI_LIGHTING_UPDATERATE, UI_LIGHTING_SUNNODES, UI_SM_BB, UI_SM_CLIMATE, UI_SM_GODMODE, UI_SM_LIGHTING, UI_SM_ORGANISM, UI_PALETTE_ACTIVE, addUIFunctionMap } from "../UIData.js";
import { SubTreeComponent } from "./SubTreeComponent.js";


export class LightingSubtree extends SubTreeComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        super(posXFunc, posYFunc, padding, dir, key);
        let subMenuContainer = new Container(this.window, 0, 1);
        this.window.container = subMenuContainer;

        let textAlignOffsetX = getBaseUISize() * 1.91;
        let sizeX = getBaseUISize() * 22;
        let radioSizeX = sizeX / 4;


        subMenuContainer.addElement(new Toggle(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, UI_LIGHTING_ENABLED, "enable lighting",() => getActiveClimate().getUIColorInactiveCustom(0.55), () =>    getActiveClimate().getUIColorActive()));
        subMenuContainer.addElement(new Toggle(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, UI_LIGHTING_FASTLIGHTING, "fast lighting",() => getActiveClimate().getUIColorInactiveCustom(0.62), () => getActiveClimate().getUIColorActive()));
        subMenuContainer.addElement(new Toggle(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, UI_SM_LIGHTING, "lighting editor",() => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive()));

        let row1 =  new Container(this.window, 0, 0);
        let row2 =  new Container(this.window, 0, 0);

        subMenuContainer.addElement(new Text(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, UI_CENTER, "update speed"))
        subMenuContainer.addElement(row1);
        subMenuContainer.addElement(new Text(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, UI_CENTER, "number of suns"))
        subMenuContainer.addElement(row2);

        row1.addElement(new RadioToggle(this.window, radioSizeX + (textAlignOffsetX / 4), getBaseUISize() * 3, UI_CENTER, UI_LIGHTING_UPDATERATE, 10,() => getActiveClimate().getUIColorInactiveCustom(0.62), () => getActiveClimate().getUIColorActive()));
        row1.addElement(new RadioToggle(this.window, radioSizeX + (textAlignOffsetX / 4), getBaseUISize() * 3, UI_CENTER, UI_LIGHTING_UPDATERATE, 15,() => getActiveClimate().getUIColorInactiveCustom(0.53), () => getActiveClimate().getUIColorActive()));
        row1.addElement(new RadioToggle(this.window, radioSizeX + (textAlignOffsetX / 4), getBaseUISize() * 3, UI_CENTER, UI_LIGHTING_UPDATERATE, 20,() => getActiveClimate().getUIColorInactiveCustom(0.60), () => getActiveClimate().getUIColorActive()));
        row1.addElement(new RadioToggle(this.window, radioSizeX + (textAlignOffsetX / 4), getBaseUISize() * 3, UI_CENTER, UI_LIGHTING_UPDATERATE, 30,() => getActiveClimate().getUIColorInactiveCustom(0.64), () => getActiveClimate().getUIColorActive()));
        
        row2.addElement(new RadioToggle(this.window, radioSizeX + (textAlignOffsetX / 4), getBaseUISize() * 3, UI_CENTER, UI_LIGHTING_SUNNODES, 2,() => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive()));
        row2.addElement(new RadioToggle(this.window, radioSizeX + (textAlignOffsetX / 4), getBaseUISize() * 3, UI_CENTER, UI_LIGHTING_SUNNODES, 3,() => getActiveClimate().getUIColorInactiveCustom(0.60), () => getActiveClimate().getUIColorActive()));
        row2.addElement(new RadioToggle(this.window, radioSizeX + (textAlignOffsetX / 4), getBaseUISize() * 3, UI_CENTER, UI_LIGHTING_SUNNODES, 5,() => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive()));
        row2.addElement(new RadioToggle(this.window, radioSizeX + (textAlignOffsetX / 4), getBaseUISize() * 3, UI_CENTER, UI_LIGHTING_SUNNODES, 7,() => getActiveClimate().getUIColorInactiveCustom(0.59), () => getActiveClimate().getUIColorActive()));
    }

}

addUIFunctionMap(UI_LIGHTING_SUNNODES, indexCanvasSize)