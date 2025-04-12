import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { hideWorld, loadEmptyScene, loadSlot, saveCurGame, saveGame } from "../../saveAndLoad.js";
import { Container } from "../Container.js";
import { Button } from "../elements/Button.js";
import { Radio } from "../elements/Radio.js";
import { Text } from "../elements/Text.js";
import { Toggle } from "../elements/Toggle.js";
import { loadUI, UI_CENTER, UI_MAIN_NEWWORLD, UI_UI_CURWORLD, UI_UI_NEXTWORLD, UI_UI_SIZE, UI_UI_WORLDHIDDEN, UI_UI_WORLDNAME, UICONFIG } from "../UIData.js";
import { SubTreeComponent } from "./SubTreeComponent.js";


export class MainMenuComponent extends SubTreeComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        super(posXFunc, posYFunc, padding, dir, key);
        let subMenuContainer = new Container(this.window, padding, 1);
        this.window.container = subMenuContainer;   
        let sizeX = getBaseUISize() * 34;
        let textAlignOffsetX = getBaseUISize() * 0.91;
        subMenuContainer.addElement(new Button(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX, saveCurGame, "save game", () => getActiveClimate().getUIColorInactiveCustom(0.55)));
        subMenuContainer.addElement(new Toggle(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX, UI_MAIN_NEWWORLD, "new/edit world", () => getActiveClimate().getUIColorInactiveCustom(0.65), () => getActiveClimate().getUIColorActive()));
        subMenuContainer.addElement(new Button(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX, loadEmptyScene, "empty scene", () => getActiveClimate().getUIColorInactiveCustom(0.55)));
        subMenuContainer.addElement(new Text(this.window, sizeX, getBaseUISize() * 1, textAlignOffsetX, ""));
        for (let i = 0; i < loadUI(UI_UI_NEXTWORLD); i++) {
            if (loadUI(UI_UI_WORLDHIDDEN)[i]) {
                continue;
            }
            let row = new Container(this.window, 0, 0);
            subMenuContainer.addElement(row);
            let colorFunc1 = null;
            let colorFunc2 = null;
            if (loadUI(UI_UI_CURWORLD) == i) {
                row.addElement(new Button(this.window, sizeX, getBaseUISize() * 3, textAlignOffsetX, () => loadSlot(i), loadUI(UI_UI_WORLDNAME)[i], () => getActiveClimate().getUIColorActive()));
            } else {
                colorFunc1 = () => getActiveClimate().getUIColorInactiveCustom([0.65, 0.55, 0.62, 0.58, 0.61, 0.67][i % 6])
                colorFunc2 = () => getActiveClimate().getUIColorInactiveCustom(0.1 + [0.65, 0.55, 0.62, 0.58, 0.61, 0.67][i % 6])
                row.addElement(new Button(this.window, sizeX * (2/3), getBaseUISize() * 3, textAlignOffsetX, () => loadSlot(i), loadUI(UI_UI_WORLDNAME)[i], colorFunc1));
                row.addElement(new Button(this.window, sizeX * (1/3), getBaseUISize() * 3, textAlignOffsetX, () => hideWorld(i), "hide", colorFunc2));
            }
        }
        subMenuContainer.addElement(new Text(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, "ui scale"))
        subMenuContainer.addElement(new Radio(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, UICONFIG, UI_UI_SIZE, [8, 12, 16, 20], () => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorTransient()));
        subMenuContainer.addElement(new Radio(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, UICONFIG, UI_UI_SIZE, [24, 28, 32, 40], () => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorTransient()));
        
    }

    render() {
        super.render();
        
    }
}