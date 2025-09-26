import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { Toggle } from "../elements/Toggle.js";
import { UI_SM_BB, UI_SM_CLIMATE, UI_SM_GODMODE, UI_SM_LIGHTING, UI_PALETTE_PLANTS, UI_PALETTE_BLOCKS, UI_CLIMATE_SELECT_CLOUDS, UI_PALETTE_CLIPS } from "../UIData.js";
import { SubTreeComponent } from "./SubTreeComponent.js";

export class BlockSubtreeComponent extends SubTreeComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        super(posXFunc, posYFunc, padding, dir, key);
        let subMenuContainer = new Container(this.window, 0, 1);
        this.window.container = subMenuContainer;

        let textAlignOffsetX = getBaseUISize() * 0.58;

        subMenuContainer.addElement(new Toggle(this.window, getBaseUISize() * 13 + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, UI_PALETTE_BLOCKS, "blocks",() => getActiveClimate().getUIColorInactiveCustom(0.63), () => getActiveClimate().getUIColorActive()));
        subMenuContainer.addElement(new Toggle(this.window, getBaseUISize() * 13 + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, UI_PALETTE_PLANTS, "plants",() => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive()));
        subMenuContainer.addElement(new Toggle(this.window, getBaseUISize() * 13 + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, UI_PALETTE_CLIPS, "clips",() => getActiveClimate().getUIColorInactiveCustom(0.57), () => getActiveClimate().getUIColorActive()));
        subMenuContainer.addElement(new Toggle(this.window, getBaseUISize() * 13 + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, UI_CLIMATE_SELECT_CLOUDS, "clouds",() => getActiveClimate().getUIColorInactiveCustom(0.61), () => getActiveClimate().getUIColorActive()));
        
    }

}