import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { Radio } from "../elements/Radio.js";
import { Text } from "../elements/Text.js";
import { Toggle } from "../elements/Toggle.js";
import { loadUI, UI_CENTER, UI_LIGHTING_ENABLED, UI_LIGHTING_FASTLIGHTING, UI_LIGHTING_FASTUPDATERATE, UI_LIGHTING_SLOWUPDATERATE, UI_PERFORMANCE_CLOUDS, UI_PERFORMANCE_SIMPLESQUARE, UI_SM_BB, UI_SM_CLIMATE, UI_SM_GODMODE, UI_SM_LIGHTING, UI_SM_ORGANISM, UI_SM_SPECIAL } from "../UIData.js";
import { SubTreeComponent } from "./SubTreeComponent.js";


export class SimulationSubtree extends SubTreeComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        super(posXFunc, posYFunc, padding, dir, key);
        let subMenuContainer = new Container(this.window, 0, 1);
        this.window.container = subMenuContainer;
        let textAlignOffsetX = getBaseUISize() * 1.91;
        let sizeX = getBaseUISize() * 22;
        subMenuContainer.addElement(new Toggle(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, UI_LIGHTING_FASTLIGHTING, "fast lighting",() => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorActive()));
        subMenuContainer.addElement(new Toggle(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, UI_PERFORMANCE_CLOUDS, "enable clouds",() => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorActive()));
        subMenuContainer.addElement(new Toggle(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, UI_PERFORMANCE_SIMPLESQUARE, "simple physics",() => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorActive()));
    }

}