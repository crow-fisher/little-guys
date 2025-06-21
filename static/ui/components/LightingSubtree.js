import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { _resetLighting, indexCanvasSize } from "../../index.js";
import { Container } from "../Container.js";
import { RadioToggle } from "../elements/RadioToggle.js";
import { RadioToggleLabel } from "../elements/RadioToggleLabel.js";
import { Text } from "../elements/Text.js";
import { Toggle } from "../elements/Toggle.js";
import { UI_CENTER, UI_LIGHTING_ENABLED, UI_LIGHTING_UPDATERATE, UI_LIGHTING_QUALITY, UI_SM_LIGHTING, addUIFunctionMap } from "../UIData.js";
import { SubTreeComponent } from "./SubTreeComponent.js";


export class LightingSubtree extends SubTreeComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        super(posXFunc, posYFunc, padding, dir, key);
        let subMenuContainer = new Container(this.window, 0, 1);
        this.window.container = subMenuContainer;

        let textAlignOffsetX = getBaseUISize() * 0.58;
        let sizeX = getBaseUISize() * 25;
        let radioSizeX = sizeX / 2;
        subMenuContainer.addElement(new Toggle(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, UI_LIGHTING_ENABLED, "enable lighting",() => getActiveClimate().getUIColorInactiveCustom(0.55), () =>    getActiveClimate().getUIColorActive()));
        subMenuContainer.addElement(new Toggle(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, UI_SM_LIGHTING, "lighting editor",() => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive()));

        let row0 =  new Container(this.window, 0, 0);
        let row1 =  new Container(this.window, 0, 0);
        let row2 =  new Container(this.window, 0, 0);

        subMenuContainer.addElement(new Text(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, UI_CENTER, "update speed"))

        subMenuContainer.addElement(row0);
        subMenuContainer.addElement(row1);
        subMenuContainer.addElement(row2);
        row0.addElement(new RadioToggleLabel(this.window, radioSizeX + (textAlignOffsetX / 2), getBaseUISize() * 3, UI_CENTER, "max", UI_LIGHTING_UPDATERATE, 5,
        () => getActiveClimate().getUIColorInactiveCustom(0.62), () => getActiveClimate().getUIColorActive()));
        row0.addElement(new RadioToggleLabel(this.window, radioSizeX + (textAlignOffsetX / 2), getBaseUISize() * 3, UI_CENTER, "extreme", UI_LIGHTING_UPDATERATE, 10,
        () => getActiveClimate().getUIColorInactiveCustom(0.53), () => getActiveClimate().getUIColorActive()));
        row1.addElement(new RadioToggleLabel(this.window, radioSizeX + (textAlignOffsetX / 2), getBaseUISize() * 3, UI_CENTER, "ultra", UI_LIGHTING_UPDATERATE, 15,
        () => getActiveClimate().getUIColorInactiveCustom(0.62), () => getActiveClimate().getUIColorActive()));
        row1.addElement(new RadioToggleLabel(this.window, radioSizeX + (textAlignOffsetX / 2), getBaseUISize() * 3, UI_CENTER, "high", UI_LIGHTING_UPDATERATE, 20,
        () => getActiveClimate().getUIColorInactiveCustom(0.53), () => getActiveClimate().getUIColorActive()));
        row2.addElement(new RadioToggleLabel(this.window, radioSizeX + (textAlignOffsetX / 2), getBaseUISize() * 3, UI_CENTER, "medium", UI_LIGHTING_UPDATERATE, 30,
        () => getActiveClimate().getUIColorInactiveCustom(0.60), () => getActiveClimate().getUIColorActive()));
        row2.addElement(new RadioToggleLabel(this.window, radioSizeX + (textAlignOffsetX / 2), getBaseUISize() * 3, UI_CENTER, "low", UI_LIGHTING_UPDATERATE,  40,
        () => getActiveClimate().getUIColorInactiveCustom(0.64), () => getActiveClimate().getUIColorActive()));
        
        subMenuContainer.addElement(new Text(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, UI_CENTER, "light quality"))
        let row3 = new Container(this.window, 0, 0);
        let row4 = new Container(this.window, 0, 0);
        subMenuContainer.addElement(row3);
        subMenuContainer.addElement(row4);

        row3.addElement(new RadioToggleLabel(this.window, radioSizeX + (textAlignOffsetX / 2), getBaseUISize() * 3, UI_CENTER, "ultra", UI_LIGHTING_QUALITY, 15,
        () => getActiveClimate().getUIColorInactiveCustom(0.62), () => getActiveClimate().getUIColorActive()));
        row3.addElement(new RadioToggleLabel(this.window, radioSizeX + (textAlignOffsetX / 2), getBaseUISize() * 3, UI_CENTER, "high", UI_LIGHTING_QUALITY, 7,
        () => getActiveClimate().getUIColorInactiveCustom(0.53), () => getActiveClimate().getUIColorActive()));
        row4.addElement(new RadioToggleLabel(this.window, radioSizeX + (textAlignOffsetX / 2), getBaseUISize() * 3, UI_CENTER, "medium", UI_LIGHTING_QUALITY, 5,
        () => getActiveClimate().getUIColorInactiveCustom(0.60), () => getActiveClimate().getUIColorActive()));
        row4.addElement(new RadioToggleLabel(this.window, radioSizeX + (textAlignOffsetX / 2), getBaseUISize() * 3, UI_CENTER, "low", UI_LIGHTING_QUALITY,  3,
        () => getActiveClimate().getUIColorInactiveCustom(0.64), () => getActiveClimate().getUIColorActive()));
        
    }

}

addUIFunctionMap(UI_LIGHTING_QUALITY, _resetLighting)
addUIFunctionMap(UI_LIGHTING_UPDATERATE, _resetLighting)