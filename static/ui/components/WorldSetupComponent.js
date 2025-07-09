import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { createNewWorld, editCurrentWorld } from "../../saveAndLoad.js";
import { Container } from "../Container.js";
import { Button } from "../elements/Button.js";
import { EditableText } from "../elements/EditableText.js";
import { RadioToggle } from "../elements/RadioToggle.js";
import { RadioToggleLabel } from "../elements/RadioToggleLabel.js";
import { SliderGradientBackground } from "../elements/SliderGradientBackground.js";
import { Text } from "../elements/Text.js";
import { TextFunctionalBackground } from "../elements/TextFunctionalBackground.js";
import { PopupComponent } from "../PopupComponent.js";
import { UI_CENTER, UI_MAIN_NEWWORLD_TYPE_CLOUDS, UI_MAIN_NEWWORLD_TYPE_BLOCKS, UI_MAIN_NEWWORLD_TYPE_PLANTS, UI_MAIN_NEWWORLD_TYPE_SELECT, UI_MAIN_NEWWORLD_NAME, UI_MAIN_NEWWORLD_SIMHEIGHT, addUIFunctionMap, loadGD, saveGD, UI_MAIN_NEWWORLD_LATITUDE, UI_MAIN_NEWWORLD_LONGITUDE, UI_MAIN_NEWWORLD, UI_CLIMATE_RAINFALL_DENSITY } from "../UIData.js";
import { getWaterColorTransformed, NULL } from "./LightingComponent.js";
export class WorldSetupComponent extends PopupComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        super(posXFunc, posYFunc, padding, dir, key);
        let sizeX = getBaseUISize() * 39;
        let half = sizeX / 2;
        let third = sizeX / 3;
        let container = new Container(this.window, padding, 1);
        this.window.container = container; 

        let row1 = new Container(this.window, padding, 0);
        let row2 = new Container(this.window, padding, 0);
        let row3 = new Container(this.window, padding, 0);

        let h1 = getBaseUISize() * 3.5;
        let h2 = getBaseUISize() * 3;
        let h3 = getBaseUISize() * 2;
        let br = getBaseUISize() * .5;

        container.addElement(new EditableText(this.window, sizeX, h1, UI_CENTER, UI_MAIN_NEWWORLD_NAME));
        container.addElement(new Text(this.window, sizeX, br, UI_CENTER, ""));

        container.addElement(new Text(this.window, sizeX, h2, UI_CENTER, "world height"));
            
        let sizeRow1 =  new Container(this.window, 0, 0);
        let sizeRow2 =  new Container(this.window, 0, 0);
        let sizeRow3 =  new Container(this.window, 0, 0);
        let sizeRow4 =  new Container(this.window, 0, 0);
        let sizeRow5 =  new Container(this.window, 0, 0);

        sizeRow1.addElement(new RadioToggle(this.window, third, h2, UI_CENTER, UI_MAIN_NEWWORLD_SIMHEIGHT, 75,() => getActiveClimate().getUIColorInactiveCustom(0.62), () => getActiveClimate().getUIColorActive()));
        sizeRow1.addElement(new RadioToggle(this.window, third, h2, UI_CENTER, UI_MAIN_NEWWORLD_SIMHEIGHT, 100,() => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive()));
        sizeRow1.addElement(new RadioToggle(this.window, third, h2, UI_CENTER, UI_MAIN_NEWWORLD_SIMHEIGHT, 125,() => getActiveClimate().getUIColorInactiveCustom(0.60), () => getActiveClimate().getUIColorActive()));
        sizeRow2.addElement(new RadioToggle(this.window, third, h2, UI_CENTER, UI_MAIN_NEWWORLD_SIMHEIGHT, 150,() => getActiveClimate().getUIColorInactiveCustom(0.58), () => getActiveClimate().getUIColorActive()));
        sizeRow2.addElement(new RadioToggle(this.window, third, h2, UI_CENTER, UI_MAIN_NEWWORLD_SIMHEIGHT, 175,() => getActiveClimate().getUIColorInactiveCustom(0.62), () => getActiveClimate().getUIColorActive()));
        sizeRow2.addElement(new RadioToggle(this.window, third, h2, UI_CENTER, UI_MAIN_NEWWORLD_SIMHEIGHT, 200,() => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive()));
        sizeRow3.addElement(new RadioToggle(this.window, third, h2, UI_CENTER, UI_MAIN_NEWWORLD_SIMHEIGHT, 225,() => getActiveClimate().getUIColorInactiveCustom(0.63), () => getActiveClimate().getUIColorActive()));
        sizeRow3.addElement(new RadioToggle(this.window, third, h2, UI_CENTER, UI_MAIN_NEWWORLD_SIMHEIGHT, 250,() => getActiveClimate().getUIColorInactiveCustom(0.59), () => getActiveClimate().getUIColorActive()));
        sizeRow3.addElement(new RadioToggle(this.window, third, h2, UI_CENTER, UI_MAIN_NEWWORLD_SIMHEIGHT, 275,() => getActiveClimate().getUIColorInactiveCustom(0.64), () => getActiveClimate().getUIColorActive()));
        sizeRow4.addElement(new RadioToggle(this.window, third, h2, UI_CENTER, UI_MAIN_NEWWORLD_SIMHEIGHT, 300,() => getActiveClimate().getUIColorInactiveCustom(0.60), () => getActiveClimate().getUIColorActive()));
        sizeRow4.addElement(new RadioToggle(this.window, third, h2, UI_CENTER, UI_MAIN_NEWWORLD_SIMHEIGHT, 350,() => getActiveClimate().getUIColorInactiveCustom(0.56), () => getActiveClimate().getUIColorActive()));
        sizeRow4.addElement(new RadioToggle(this.window, third, h2, UI_CENTER, UI_MAIN_NEWWORLD_SIMHEIGHT, 400,() => getActiveClimate().getUIColorInactiveCustom(0.62), () => getActiveClimate().getUIColorActive()));
        sizeRow5.addElement(new RadioToggle(this.window, third, h2, UI_CENTER, UI_MAIN_NEWWORLD_SIMHEIGHT, 450,() => getActiveClimate().getUIColorInactiveCustom(0.57), () => getActiveClimate().getUIColorActive()));
        sizeRow5.addElement(new RadioToggle(this.window, third, h2, UI_CENTER, UI_MAIN_NEWWORLD_SIMHEIGHT, 500,() => getActiveClimate().getUIColorInactiveCustom(0.61), () => getActiveClimate().getUIColorActive()));
        sizeRow5.addElement(new RadioToggle(this.window, third, h2, UI_CENTER, UI_MAIN_NEWWORLD_SIMHEIGHT, 550,() => getActiveClimate().getUIColorInactiveCustom(0.58), () => getActiveClimate().getUIColorActive()));
        
        container.addElement(sizeRow1);
        container.addElement(sizeRow2);
        container.addElement(sizeRow3);
        container.addElement(sizeRow4);
        container.addElement(sizeRow5);

        container.addElement(new Text(this.window, sizeX, h2, UI_CENTER, "world location"));
        container.addElement(new Text(this.window, sizeX, br, UI_CENTER, ""));

        let locRow1 = new Container(this.window, padding, 0);
        let locRow2 = new Container(this.window, padding, 0);
        container.addElement(locRow1);
        container.addElement(locRow2);

        locRow1.addElement(new Text(this.window, half, h2, UI_CENTER, "latitude", 0.75, "#AAAAAA"));
        locRow1.addElement(new Text(this.window, half, h2, UI_CENTER, "longitude", 0.75, "#AAAAAA"));
        locRow2.addElement(new EditableText(this.window, half, h2, UI_CENTER, UI_MAIN_NEWWORLD_LATITUDE));
        locRow2.addElement(new EditableText(this.window, half, h2, UI_CENTER, UI_MAIN_NEWWORLD_LONGITUDE));

        let newEditRow = new Container(this.window, padding, 0);
        let newEditRow2 = new Container(this.window, padding, 0);
        newEditRow.addElement(new Button(this.window, half, h1, UI_CENTER, () => saveGD(UI_MAIN_NEWWORLD, false), "close", () => getActiveClimate().getUIColorInactiveCustom(0.62), 0.65));
        newEditRow.addElement(new Button(this.window, half, h1, UI_CENTER, () => editCurrentWorld(), "edit current", () => getActiveClimate().getUIColorInactiveCustom(0.65), 0.65));
        newEditRow2.addElement(new Button(this.window, sizeX, h1, UI_CENTER, () => createNewWorld(), "create new", () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.65));
        container.addElement(newEditRow);
        container.addElement(newEditRow2);
    }
}

addUIFunctionMap(UI_MAIN_NEWWORLD_TYPE_SELECT, () => {
    switch (loadGD(UI_MAIN_NEWWORLD_TYPE_SELECT)) {
        case UI_MAIN_NEWWORLD_TYPE_PLANTS:
            saveGD(UI_MAIN_NEWWORLD_SIMHEIGHT, 125);
            return;
        case UI_MAIN_NEWWORLD_TYPE_BLOCKS:
            saveGD(UI_MAIN_NEWWORLD_SIMHEIGHT, 300);
            return;
        case UI_MAIN_NEWWORLD_TYPE_CLOUDS:
        default:
            saveGD(UI_MAIN_NEWWORLD_SIMHEIGHT, 300);
            return;
    }
})