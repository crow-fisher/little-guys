import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { Container } from "../Container.js";
import { Toggle } from "../elements/Toggle.js";
import { UI_CILMATE_SELECT_WEATHER, UI_CLIMATE_SELECT_CLOUDS, UI_CLIMATE_SELECT_MENU } from "../UIData.js";
import { SubTreeComponent } from "./SubTreeComponent.js";


export class ClimateSubtreeComponent extends SubTreeComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        super(posXFunc, posYFunc, padding, dir, key);
        let subMenuContainer = new Container(this.window, 0, 1);
        this.window.container = subMenuContainer;

        let textAlignOffsetX = getBaseUISize() * 1.91;
        subMenuContainer.addElement(new Toggle(this.window, getBaseUISize() * 25 + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, UI_CLIMATE_SELECT_MENU, "cilmate selection",() => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorActive()));
        subMenuContainer.addElement(new Toggle(this.window, getBaseUISize() * 25 + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, UI_CILMATE_SELECT_WEATHER, "weather control",() => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorActive()));
        subMenuContainer.addElement(new Toggle(this.window, getBaseUISize() * 25 + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, UI_CLIMATE_SELECT_CLOUDS, "cloud control",() => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorActive()));

        
    }

}