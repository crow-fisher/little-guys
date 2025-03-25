import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { loadEmptyScene, loadSlot, saveSlot } from "../../saveAndLoad.js";
import { Container } from "../Container.js";
import { Button } from "../elements/Button.js";
import { Radio } from "../elements/Radio.js";
import { Text } from "../elements/Text.js";
import { UI_CENTER, UI_SIZE, UICONFIG } from "../UIData.js";
import { SubTreeComponent } from "./SubTreeComponent.js";


export class MainMenuComponent extends SubTreeComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        super(posXFunc, posYFunc, padding, dir, key);
        let subMenuContainer = new Container(this.window, padding, 1);
        this.window.container = subMenuContainer;   

        let sizeX = getBaseUISize() * 16;

        let textAlignOffsetX = getBaseUISize() * 0.91;
        let indentedOffsetX = getBaseUISize() * 2.1;

        let sizeElementOffsetX = getBaseUISize() * 1;

        subMenuContainer.addElement(new Button(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX, () => loadSlot("A"), "load slot A", () => getActiveClimate().getUIColorActive()));
        subMenuContainer.addElement(new Button(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX, () => loadSlot("B"), "load slot B", () => getActiveClimate().getUIColorActive()));
        subMenuContainer.addElement(new Button(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX, () => loadSlot("C"), "load slot C", () => getActiveClimate().getUIColorActive()));
        subMenuContainer.addElement(new Button(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX, () => saveSlot("A"), "save slot A", () => getActiveClimate().getUIColorActive()));
        subMenuContainer.addElement(new Button(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX, () => saveSlot("B"), "save slot B", () => getActiveClimate().getUIColorActive()));
        subMenuContainer.addElement(new Button(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX, () => saveSlot("C"), "save slot C", () => getActiveClimate().getUIColorActive()));
        subMenuContainer.addElement(new Button(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX, () => loadEmptyScene(), "empty scene", () => getActiveClimate().getUIColorActive()));
         
        subMenuContainer.addElement(new Text(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, UI_CENTER, "ui scale"))
        subMenuContainer.addElement(new Radio(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, UI_CENTER, UICONFIG, UI_SIZE, [8, 12, 16, 20], () => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorTransient()));
    }

    render() {
        super.render();
        
    }
}