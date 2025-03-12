import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { Radio } from "../elements/Radio.js";
import { Text } from "../elements/Text.js";
import { Toggle } from "../elements/Toggle.js";
import { loadUI, UI_CENTER, UI_LIGHTING_ENABLED, UI_LIGHTING_FASTLIGHTING, UI_LIGHTING_FASTUPDATERATE, UI_LIGHTING_SLOWUPDATERATE, UI_SM_BB, UI_SM_CLIMATE, UI_SM_GODMODE, UI_SM_LIGHTING, UI_SM_ORGANISM, UI_SM_SPECIAL } from "../UIData.js";
import { SubTreeComponent } from "./SubTreeComponent.js";


export class LightingSubtree extends SubTreeComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        super(posXFunc, posYFunc, padding, dir, key);
        let subMenuContainer = new Container(this.window, 0, 1);
        this.window.container = subMenuContainer;

        let textAlignOffsetX = getBaseUISize() * 1.91;
        let sizeX = getBaseUISize() * 22;

        subMenuContainer.addElement(new Toggle(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, UI_LIGHTING_ENABLED, "enable lighting",() => getActiveClimate().getUIColorInactiveCustom(0.55), () =>    getActiveClimate().getUIColorActive()));
        subMenuContainer.addElement(new Toggle(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, UI_LIGHTING_FASTLIGHTING, "fast lighting",() => getActiveClimate().getUIColorInactiveCustom(0.62), () => getActiveClimate().getUIColorActive()));
        subMenuContainer.addElement(new Toggle(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, UI_SM_LIGHTING, "lighting editor",() => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive()));

        subMenuContainer.addElement(new Text(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, UI_CENTER, "fast speed"))
        subMenuContainer.addElement(new Radio(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, UI_CENTER, UI_LIGHTING_FASTUPDATERATE, 
                [2, 5, 8, 10], () => getActiveClimate().getUIColorInactive(), () => (loadUI(UI_LIGHTING_FASTLIGHTING) ? getActiveClimate().getUIColorActive() : getActiveClimate().getUIColorTransient())));
            
        subMenuContainer.addElement(new Text(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, UI_CENTER, "slow speed"))
        subMenuContainer.addElement(new Radio(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, UI_CENTER, UI_LIGHTING_SLOWUPDATERATE, 
            [10, 20, 40, 60], () => getActiveClimate().getUIColorInactive(), () => (loadUI(UI_LIGHTING_FASTLIGHTING) ? getActiveClimate().getUIColorTransient() : getActiveClimate().getUIColorActive())));
    }

}