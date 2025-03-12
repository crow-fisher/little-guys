import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { Radio } from "../elements/Radio.js";
import { RowedRadio } from "../elements/RowedRadio.js";
import { Text } from "../elements/Text.js";
import { Toggle } from "../elements/Toggle.js";
import { loadUI, UI_CENTER, UI_DISPLAY_SIZEY as UI_SIMULATION_HEIGHT, UI_LIGHTING_ENABLED, UI_LIGHTING_FASTLIGHTING, UI_LIGHTING_FASTUPDATERATE, UI_LIGHTING_SLOWUPDATERATE, UI_SIMULATION_CLOUDS, UI_SIMULATION_SIMPLESQUARE, UI_SM_BB, UI_SM_CLIMATE, UI_SM_GODMODE, UI_SM_LIGHTING, UI_SM_ORGANISM, UI_SM_SPECIAL } from "../UIData.js";
import { SubTreeComponent } from "./SubTreeComponent.js";


export class SimulationSubtree extends SubTreeComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        super(posXFunc, posYFunc, padding, dir, key);
        let subMenuContainer = new Container(this.window, 0, 1);
        this.window.container = subMenuContainer;
        let textAlignOffsetX = getBaseUISize() * 1.91;
        let sizeX = getBaseUISize() * 22;
        subMenuContainer.addElement(new Toggle(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, UI_LIGHTING_ENABLED, "enable lighting",() => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorActive()));
        subMenuContainer.addElement(new Toggle(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, UI_SIMULATION_CLOUDS, "enable clouds",() => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorActive()));
        subMenuContainer.addElement(new Toggle(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, UI_SIMULATION_SIMPLESQUARE, "simple physics",() => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorActive()));
    
        subMenuContainer.addElement(new Text(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, UI_CENTER, "size"))
        subMenuContainer.addElement(new RowedRadio(this.window, sizeX + textAlignOffsetX, getBaseUISize() * (3 * 4), UI_CENTER, UI_SIMULATION_HEIGHT, 4,
        [75, 100, 125,
                 150, 175, 200,
                 250, 300, 350,
                 400, 450, 500], () => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorActive()));
    }


}