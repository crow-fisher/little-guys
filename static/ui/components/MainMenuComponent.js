import { getBaseSize } from "../../canvas.js";
import { loadEmptyScene, loadSlot, saveSlot } from "../../saveAndLoad.js";
import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { Button } from "../elements/Button.js";
import { Radio } from "../elements/Radio.js";
import { UI_DISPLAY_SIZEY } from "../UIData.js";


export class MainMenuComponent extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        let subMenuContainer = new Container(this.window, padding, 1);
        this.window.container = subMenuContainer;
        subMenuContainer.addElement(new Button(this.window, getBaseSize() * 16, getBaseSize() * 3, () => loadSlot("A"), "load slot A"));
        subMenuContainer.addElement(new Button(this.window, getBaseSize() * 16, getBaseSize() * 3, () => loadSlot("B"), "load slot B"));
        subMenuContainer.addElement(new Button(this.window, getBaseSize() * 16, getBaseSize() * 3, () => loadSlot("C"), "load slot C"));

        subMenuContainer.addElement(new Button(this.window, getBaseSize() * 16, getBaseSize() * 3, () => saveSlot("A"), "save slot A"));
        subMenuContainer.addElement(new Button(this.window, getBaseSize() * 16, getBaseSize() * 3, () => saveSlot("B"), "save slot B"));
        subMenuContainer.addElement(new Button(this.window, getBaseSize() * 16, getBaseSize() * 3, () => saveSlot("C"), "save slot C"));
        subMenuContainer.addElement(new Button(this.window, getBaseSize() * 16, getBaseSize() * 3, () => loadEmptyScene(), "empty scene"));
        subMenuContainer.addElement(new Radio(this.window, getBaseSize() * 16, getBaseSize() * 3, UI_DISPLAY_SIZEY, [80, 100, 120, 140]));

    }

}