import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { Toggle } from "../elements/Toggle.js";
import { UI_SM_BB, UI_SM_CLIMATE, UI_SM_GODMODE, UI_SM_LIGHTING, UI_SM_ORGANISM, UI_PALETTE_ACTIVE, UI_CLIMATE_SELECT_CLOUDS } from "../UIData.js";
import { SubTreeComponent } from "./SubTreeComponent.js";


export class BlockSubtreeComponent extends SubTreeComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        super(posXFunc, posYFunc, padding, dir, key);
        let subMenuContainer = new Container(this.window, 0, 1);
        this.window.container = subMenuContainer;

        let textAlignOffsetX = getBaseUISize() * 0.58;

        subMenuContainer.addElement(new Toggle(this.window, getBaseUISize() * 13 + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, UI_PALETTE_ACTIVE, "blocks",() => getActiveClimate().getUIColorInactiveCustom(0.66), () => getActiveClimate().getUIColorActive()));
        subMenuContainer.addElement(new Toggle(this.window, getBaseUISize() * 13 + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, UI_SM_ORGANISM, "plants",() => getActiveClimate().getUIColorInactiveCustom(0.59), () => getActiveClimate().getUIColorActive()));
        subMenuContainer.addElement(new Toggle(this.window, getBaseUISize() * 13 + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, UI_CLIMATE_SELECT_CLOUDS, "clouds",() => getActiveClimate().getUIColorInactiveCustom(0.59), () => getActiveClimate().getUIColorActive()));
        
    }

}