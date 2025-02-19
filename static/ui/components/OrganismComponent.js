import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { RowedRadio } from "../elements/RowedRadio.js";
import { Slider } from "../elements/Slider.js";
import { Text } from "../elements/Text.js";
import { loadUI, UI_SPECIAL_WATER, UI_SPECIAL_AQUIFER, UI_SPECIAL_MIX, UI_SPECIAL_SURFACE, UI_SOIL_COMPOSITION, UI_SPECIAL_SELECT, UI_BB_SIZE, UI_BB_STRENGTH, UI_SM_SPECIAL, UI_ORGANISM_SELECT, UI_ORGANISM_WHEAT } from "../UIData.js";

export class OrganismComponent extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        var sizeX = 100;
        let container = new Container(this.window, UI_SOIL_COMPOSITION, sizeX * 2, 100, padding, 1);
        this.window.addElement(container);
        container.addElement(new Text(this.window, sizeX * 2, 15, "plants"));
        container.addElement(new RowedRadio(this.window, sizeX * 2, 50, UI_ORGANISM_SELECT, 2, [
            UI_ORGANISM_WHEAT,
            UI_ORGANISM_WHEAT,
            UI_ORGANISM_WHEAT,
            UI_ORGANISM_WHEAT
        ]));

    }
}