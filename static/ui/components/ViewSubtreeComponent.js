import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { Container } from "../Container.js";
import { RadioToggleLabel } from "../elements/RadioToggleLabel.js";
import { TextBackground } from "../elements/TextBackground.js";
import {
    UI_VIEWMODE_NORMAL,
    UI_VIEWMODE_ORG_LIGHTING, UI_VIEWMODE_WIND,
    UI_VIEWMODE_TEMPERATURE,
    UI_VIEWMODE_ORG_MOISTURE,
    UI_VIEWMODE_ORGANISMS, UI_VIEWMODE_SELECT,
    UI_CENTER,
    UI_VIEWMODE_BLOCK_WATERTICKRATE,
    UI_VIEWMODE_BLOCK_WATERMATRIC,
    UI_VIEWMODE_BLOCK_GROUP,
    UI_VIEWMODE_AIRTICKRATE,
    UI_VIEWMODE_DEV1,
    UI_VIEWMODE_DEV2,
    UI_VIEWMODE_EVOLUTION,
    UI_VIEWMODE_NUTRIENTS,
    UI_VIEWMODE_DEV3,
    UI_VIEWMODE_DEV4,
    UI_VIEWMODE_DEV5,
    UI_VIEWMODE_3D,
    UI_VIEWMODE_PROJECTION,
    UI_VIEWMODE_PROJECTION_2D,
    UI_VIEWMODE_PROJECTION_3D,
    UI_VIEWMODE_ORG_NORMAL,
    UI_VIEWMODE_BLOCK_SELECT,
    UI_VIEWMODE_BLOCK_MOISTURE,
    UI_VIEWMODE_ORG_SELECT
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

        let projRow = new Container(this.window, 0, 0);
        container.addElement(projRow)
        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.64), 0.75, "projection"));
        projRow.addElement(new RadioToggleLabel(this.window, sizeX / 2, getBaseUISize() * 3, textAlignOffsetX,"2D",  UI_VIEWMODE_PROJECTION, UI_VIEWMODE_PROJECTION_2D,() => getActiveClimate().getUIColorInactiveCustom(0.49), () => getActiveClimate().getUIColorActive()));
        projRow.addElement(new RadioToggleLabel(this.window, sizeX / 2, getBaseUISize() * 3, textAlignOffsetX,"3D",  UI_VIEWMODE_PROJECTION, UI_VIEWMODE_PROJECTION_3D,() => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive()));
        
        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.64), 0.75, "block viewmode"));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"tickrate",  UI_VIEWMODE_BLOCK_SELECT, UI_VIEWMODE_BLOCK_WATERTICKRATE,() => getActiveClimate().getUIColorInactiveCustom(0.585), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"pressure",  UI_VIEWMODE_BLOCK_SELECT, UI_VIEWMODE_BLOCK_WATERMATRIC,() => getActiveClimate().getUIColorInactiveCustom(0.54), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"moisture",  UI_VIEWMODE_BLOCK_SELECT, UI_VIEWMODE_BLOCK_MOISTURE,() => getActiveClimate().getUIColorInactiveCustom(0.58), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"group",  UI_VIEWMODE_BLOCK_SELECT, UI_VIEWMODE_BLOCK_GROUP,() => getActiveClimate().getUIColorInactiveCustom(0.54), () => getActiveClimate().getUIColorActive()));
        
        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.64), 0.75, "org viewmode"));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"normal",  UI_VIEWMODE_ORG_SELECT, UI_VIEWMODE_ORG_NORMAL,() => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"lighting",  UI_VIEWMODE_ORG_SELECT, UI_VIEWMODE_ORG_LIGHTING,() => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"moisture",  UI_VIEWMODE_ORG_SELECT, UI_VIEWMODE_ORG_MOISTURE,() => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive()));
        
    }
}