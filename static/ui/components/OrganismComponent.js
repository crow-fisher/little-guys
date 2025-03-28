import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { Button } from "../elements/Button.js";
import { RadioToggle } from "../elements/RadioToggle.js";
import { RadioToggleLabel } from "../elements/RadioToggleLabel.js";
import { RowedRadio } from "../elements/RowedRadio.js";
import { Text } from "../elements/Text.js";
import { UI_ORGANISM_SELECT, UI_ORGANISM_WHEAT, UI_ORGANISM_GRASS, UI_ORGANISM_CATTAIL, UI_CENTER, UI_ORGANISM_MUSHROOM, saveGD } from "../UIData.js";

export class OrganismComponent extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        let sizeX = getBaseUISize() * 24;
        let buttonHeight = getBaseUISize() * 2; 
        
        let container = new Container(this.window, padding, 1);
        this.window.container = container;
        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 2, UI_CENTER, "midwest"));
        container.addElement(new RowedRadio(this.window, sizeX, getBaseUISize() * 4, UI_CENTER, UI_ORGANISM_SELECT, 2, [
            UI_ORGANISM_WHEAT,
            UI_ORGANISM_GRASS,
            UI_ORGANISM_CATTAIL,
            UI_ORGANISM_MUSHROOM
        ], () => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorActive()));


        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 2, UI_CENTER, "fantasy"));
        
        let row1 = new Container(this.window, 0, 0);
        let row2 = new Container(this.window, 0, 0);

        container.addElement(row1);
        container.addElement(row2);

        row1.addElement(new RadioToggleLabel(this.window, sizeX / 2, buttonHeight, UI_CENTER, "random mush", UI_ORGANISM_SELECT, "mushroom1", () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive()));
        row1.addElement(new RadioToggleLabel(this.window, sizeX / 2, buttonHeight, UI_CENTER, "flipped mush", UI_ORGANISM_SELECT, "mushroom2", () => getActiveClimate().getUIColorInactiveCustom(0.65), () => getActiveClimate().getUIColorActive()));
        row2.addElement(new RadioToggleLabel(this.window, sizeX / 2, buttonHeight, UI_CENTER, "short mush", UI_ORGANISM_SELECT, "mushroom3", () => getActiveClimate().getUIColorInactiveCustom(0.58), () => getActiveClimate().getUIColorActive()));
        row2.addElement(new RadioToggleLabel(this.window, sizeX / 2, buttonHeight, UI_CENTER, "tall mush", UI_ORGANISM_SELECT, "mushroom4", () => getActiveClimate().getUIColorInactiveCustom(0.62), () => getActiveClimate().getUIColorActive()));




    }
}