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
        var sizeX = getBaseUISize() * 20;
        let halfSizeX = sizeX / 2;
        let container = new Container(this.window, padding, 1);
        this.window.container = container; 
        let row = new Container(this.window, padding, 0);
        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 2.5, UI_CENTER, "cilmate select"));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, "midwest", UI_CLIMATE_SELECT, UI_CLIMATE_MIDWEST, 
        () => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, "desert", UI_CLIMATE_SELECT, UI_CLIMATE_DESERT, 
        () => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorActive()));
        container.addElement(new RadioToggleLabel(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, "fantasy", UI_CLIMATE_SELECT, UI_CLIMATE_FANTASY, 
        () => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorActive()));
    }
}