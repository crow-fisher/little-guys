import { getBaseUISize } from "../../canvas.js";
import { loadEmptyScene, loadSlot, saveSlot } from "../../saveAndLoad.js";
import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { Button } from "../elements/Button.js";
import { Radio } from "../elements/Radio.js";
import { RowedRadio } from "../elements/RowedRadio.js";
import { Text } from "../elements/Text.js";
import { UI_DISPLAY_SIZEY, UI_SIZE } from "../UIData.js";


export class MainMenuComponent extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        let subMenuContainer = new Container(this.window, padding, 1);
        this.window.container = subMenuContainer;
        subMenuContainer.addElement(new Button(this.window, getBaseUISize() * 16, getBaseUISize() * 3, () => loadSlot("A"), "load slot A"));
        subMenuContainer.addElement(new Button(this.window, getBaseUISize() * 16, getBaseUISize() * 3, () => loadSlot("B"), "load slot B"));
        subMenuContainer.addElement(new Button(this.window, getBaseUISize() * 16, getBaseUISize() * 3, () => loadSlot("C"), "load slot C"));

        subMenuContainer.addElement(new Button(this.window, getBaseUISize() * 16, getBaseUISize() * 3, () => saveSlot("A"), "save slot A"));
        subMenuContainer.addElement(new Button(this.window, getBaseUISize() * 16, getBaseUISize() * 3, () => saveSlot("B"), "save slot B"));
        subMenuContainer.addElement(new Button(this.window, getBaseUISize() * 16, getBaseUISize() * 3, () => saveSlot("C"), "save slot C"));
        subMenuContainer.addElement(new Button(this.window, getBaseUISize() * 16, getBaseUISize() * 3, () => loadEmptyScene(), "empty scene"));
         
        subMenuContainer.addElement(new Text(this.window, getBaseUISize() * 16, getBaseUISize() * 3, "ui scale"))
        subMenuContainer.addElement(new Radio(this.window, getBaseUISize() * 16, getBaseUISize() * 3, UI_SIZE, [8, 12, 16, 20]));

        subMenuContainer.addElement(new Text(this.window, getBaseUISize() * 16, getBaseUISize() * 3, "size"))
        subMenuContainer.addElement(new RowedRadio(this.window, getBaseUISize() * 16, getBaseUISize() * (3 * 6), UI_DISPLAY_SIZEY, 6,
        [75, 100, 125,
                 150, 175, 200,
                 250, 300, 350,
                 400, 450, 500,
                 550, 600, 650,
                 700, 750, 800]));

    }
}