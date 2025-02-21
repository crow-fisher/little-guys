import { loadEmptyScene, loadSlot, saveSlot } from "../../saveAndLoad.js";
import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { Button } from "../elements/Button.js";
import { Toggle } from "../elements/Toggle.js";
import { UI_NULL, UI_SM_BB, UI_SM_LIGHTING, UI_SM_ORGANISM, UI_SM_SPECIAL, UI_SM_VIEWMODE, UI_SOIL_COMPOSITION } from "../UIData.js";


export class MainMenuComponent extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        let subMenuContainer = new Container(this.window, UI_NULL, 150, 100, padding, 1);
        this.window.container = subMenuContainer;
        // subMenuContainer.addElement(new Button(this.window, 150, 25, () => loadSlot("A"), "save slot A"));
        // subMenuContainer.addElement(new Button(this.window, 150, 25, () => saveSlot("A"), "save slot A"));
        // subMenuContainer.addElement(new Button(this.window, 150, 25, () => loadSlot("B"), "save slot B"));
        // subMenuContainer.addElement(new Button(this.window, 150, 25, () => saveSlot("B"), "save slot B"));
        // subMenuContainer.addElement(new Button(this.window, 150, 25, () => loadSlot("C"), "save slot C"));
        // subMenuContainer.addElement(new Button(this.window, 150, 25, () => saveSlot("C"), "save slot C"));
        subMenuContainer.addElement(new Button(this.window, 150, 25, () => loadEmptyScene(), "empty scene"));
    }

}