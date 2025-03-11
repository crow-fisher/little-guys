import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { loadEmptyScene, loadSlot, saveSlot } from "../../saveAndLoad.js";
import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { Button } from "../elements/Button.js";
import { Radio } from "../elements/Radio.js";
import { RowedRadio } from "../elements/RowedRadio.js";
import { Text } from "../elements/Text.js";
import { loadUI, UI_CENTER, UI_DISPLAY_SIZEY, UI_LIGHTING_FASTUPDATERATE, UI_LIGHTING_SLOWUPDATERATE, UI_SIZE } from "../UIData.js";
import { SubTreeComponent } from "./SubTreeComponent.js";


export class MainMenuSubtreeComponent extends SubTreeComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        super(posXFunc, posYFunc, padding, dir, key);
        let subMenuContainer = new Container(this.window, padding, 1);
        this.window.container = subMenuContainer;   

        let sizeX = getBaseUISize() * 16;
        let offsetX = getBaseUISize() * 0.91;

        let sizeElementOffsetX = getBaseUISize() * 1;

        subMenuContainer.addElement(new Button(this.window, sizeX, getBaseUISize() * 3, offsetX, () => loadSlot("A"), "load slot A", () => getActiveClimate().getUIColorActive()));
        subMenuContainer.addElement(new Button(this.window, sizeX, getBaseUISize() * 3, offsetX, () => loadSlot("B"), "load slot B", () => getActiveClimate().getUIColorActive()));
        subMenuContainer.addElement(new Button(this.window, sizeX, getBaseUISize() * 3, offsetX, () => loadSlot("C"), "load slot C", () => getActiveClimate().getUIColorActive()));
        subMenuContainer.addElement(new Button(this.window, sizeX, getBaseUISize() * 3, offsetX, () => saveSlot("A"), "save slot A", () => getActiveClimate().getUIColorActive()));
        subMenuContainer.addElement(new Button(this.window, sizeX, getBaseUISize() * 3, offsetX, () => saveSlot("B"), "save slot B", () => getActiveClimate().getUIColorActive()));
        subMenuContainer.addElement(new Button(this.window, sizeX, getBaseUISize() * 3, offsetX, () => saveSlot("C"), "save slot C", () => getActiveClimate().getUIColorActive()));
        subMenuContainer.addElement(new Button(this.window, sizeX, getBaseUISize() * 3, offsetX, () => loadEmptyScene(), "empty scene", () => getActiveClimate().getUIColorActive()));
         
        subMenuContainer.addElement(new Text(this.window, sizeX, getBaseUISize() * 3, offsetX, "ui scale"))
        subMenuContainer.addElement(new Radio(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, UI_SIZE, [8, 12, 16, 20], () => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorTransient()));

        subMenuContainer.addElement(new Text(this.window, sizeX, getBaseUISize() * 3, offsetX, "size"))
        subMenuContainer.addElement(new RowedRadio(this.window, sizeX, getBaseUISize() * (3 * 4), UI_DISPLAY_SIZEY, 4,
        [75, 100, 125,
                 150, 175, 200,
                 250, 300, 350,
                 400, 450, 500], () => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorActive()));

        subMenuContainer.addElement(new Text(this.window, sizeX, getBaseUISize() * 3, offsetX, "fast speed"))
        subMenuContainer.addElement(new Radio(this.window, sizeX, getBaseUISize() * 3, UI_LIGHTING_FASTUPDATERATE, 
                [2, 5, 8, 10], () => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorTransient()));
            
        subMenuContainer.addElement(new Text(this.window, sizeX, getBaseUISize() * 3, offsetX, "slow speed"))
        subMenuContainer.addElement(new Radio(this.window, sizeX, getBaseUISize() * 3, UI_LIGHTING_SLOWUPDATERATE, 
            [10, 20, 40, 60], () => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorTransient()));
    }
}