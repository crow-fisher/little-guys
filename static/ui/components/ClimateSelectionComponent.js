import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { Container } from "../Container.js";
import { RadioToggleLabel } from "../elements/RadioToggleLabel.js";
import { Text } from "../elements/Text.js";
import { LockedComponent } from "../LockedComponent.js";
import {
    UI_CLIMATE_SELECT,
    UI_CLIMATE_MIDWEST, UI_CENTER,
    UI_CLIMATE_DESERT,
    UI_CLIMATE_FANTASY
} from "../UIData.js";
export class ClimateSelectionComponent extends LockedComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        super(posXFunc, posYFunc, padding, dir, key);
        let sizeX = getBaseUISize() * 20;
        let halfSizeX = sizeX / 2;
        let container = new Container(this.window, padding, 1);
        this.window.container = container; 
        let row = new Container(this.window, padding, 0);
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, "midwest", UI_CLIMATE_SELECT, UI_CLIMATE_MIDWEST, 
        () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, "desert", UI_CLIMATE_SELECT, UI_CLIMATE_DESERT, 
        () => getActiveClimate().getUIColorInactiveCustom(0.62), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, "fantasy", UI_CLIMATE_SELECT, UI_CLIMATE_FANTASY, 
        () => getActiveClimate().getUIColorInactiveCustom(0.58), () => getActiveClimate().getUIColorActive()));
    }
}