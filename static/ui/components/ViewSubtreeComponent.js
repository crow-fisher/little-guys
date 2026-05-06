import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { Container } from "../Container.js";
import { RadioToggleLabel } from "../elements/RadioToggleLabel.js";
import { Slider } from "../elements/Slider.js";
import { TextBackground } from "../elements/TextBackground.js";
import { Toggle } from "../elements/Toggle.js";
import {
    UI_VIEWMODE_ORG_LIGHTING, UI_VIEWMODE_ORG_MOISTURE, UI_CENTER,
    UI_VIEWMODE_BLOCK_WATERTICKRATE,
    UI_VIEWMODE_BLOCK_WATERMATRIC,
    UI_VIEWMODE_BLOCK_GROUP, UI_VIEWMODE_PROJECTION,
    UI_VIEWMODE_PROJECTION_2D,
    UI_VIEWMODE_PROJECTION_3D, UI_VIEWMODE_BLOCK_SELECT,
    UI_VIEWMODE_BLOCK_MOISTURE, UI_VIEWMODE_BLOCK_NORMAL,
    UI_VIEWMODE_ORG_DENSITY,
    UI_VIEWMODE_ORG_LIFETIME,
    UI_VIEWMODE_ORG_GROWTH
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
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"normal",  UI_VIEWMODE_BLOCK_SELECT, UI_VIEWMODE_BLOCK_NORMAL,() => getActiveClimate().getUIColorInactiveCustom(0.585), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"tickrate",  UI_VIEWMODE_BLOCK_SELECT, UI_VIEWMODE_BLOCK_WATERTICKRATE,() => getActiveClimate().getUIColorInactiveCustom(0.585), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"pressure",  UI_VIEWMODE_BLOCK_SELECT, UI_VIEWMODE_BLOCK_WATERMATRIC,() => getActiveClimate().getUIColorInactiveCustom(0.54), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"moisture",  UI_VIEWMODE_BLOCK_SELECT, UI_VIEWMODE_BLOCK_MOISTURE,() => getActiveClimate().getUIColorInactiveCustom(0.58), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX,"group",  UI_VIEWMODE_BLOCK_SELECT, UI_VIEWMODE_BLOCK_GROUP,() => getActiveClimate().getUIColorInactiveCustom(0.54), () => getActiveClimate().getUIColorActive()));
        
        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.64), 0.75, "organism blips"));
        container.addElement(new Toggle(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, UI_VIEWMODE_ORG_LIFETIME,"lifetime",  () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive()));
        container.addElement(new Toggle(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, UI_VIEWMODE_ORG_GROWTH,"growth",  () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive()));
        container.addElement(new Toggle(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, UI_VIEWMODE_ORG_LIGHTING,"lighting",  () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive()));
        container.addElement(new Toggle(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, UI_VIEWMODE_ORG_MOISTURE,"moisture",  () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive()));
        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.64), 0.75, "blip density"));
        container.addElement(new Slider(this.window, UI_VIEWMODE_ORG_DENSITY, sizeX, getBaseUISize() * 3, 0, 4, () => "#FEFEFE")); 
        
    }
}