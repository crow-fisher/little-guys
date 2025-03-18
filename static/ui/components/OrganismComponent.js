import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { RowedRadio } from "../elements/RowedRadio.js";
import { Text } from "../elements/Text.js";
import { UI_ORGANISM_SELECT, UI_ORGANISM_WHEAT, UI_ORGANISM_GRASS, UI_ORGANISM_CATTAIL, UI_CENTER, UI_ORGANISM_MUSHROOM } from "../UIData.js";

export class OrganismComponent extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        var sizeX = getBaseUISize() * 24;
        
        let container = new Container(this.window, padding, 1);
        this.window.container = container;
        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 2, UI_CENTER, "midwest"));
        container.addElement(new RowedRadio(this.window, sizeX, getBaseUISize() * 4, UI_CENTER, UI_ORGANISM_SELECT, 2, [
            UI_ORGANISM_WHEAT,
            UI_ORGANISM_GRASS,
            UI_ORGANISM_CATTAIL,
            UI_ORGANISM_MUSHROOM
        ], () => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorActive()));

    }
}