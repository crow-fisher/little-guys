import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { purgeCanvasFrameLimit } from "../../globalOperations.js";
import { hideWorld, loadEmptyScene, loadSlot, saveCurGame } from "../../saveAndLoad.js";
import { Container } from "../Container.js";
import { Button } from "../elements/Button.js";
import { RadioToggle } from "../elements/RadioToggle.js";
import { Text } from "../elements/Text.js";
import { TextFunctionalBackground } from "../elements/TextFunctionalBackground.js";
import { Toggle } from "../elements/Toggle.js";
import { loadGD, loadUI, saveGD, saveUI, UI_CENTER, UI_MAIN_NEWWORLD, UI_MAIN_SHOWHIDDEN, UI_UI_WORLDPAGE, UI_UI_CURWORLD, UI_UI_NEXTWORLD, UI_UI_SIZE, UI_UI_WORLDHIDDEN, UI_UI_WORLDNAME, UICONFIG } from "../UIData.js";
import { SubTreeComponent } from "./SubTreeComponent.js";


export class MainMenuComponent extends SubTreeComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        super(posXFunc, posYFunc, padding, dir, key);
        let subMenuContainer = new Container(this.window, padding, 1);
        this.window.container = subMenuContainer;   
        this.sizeX = getBaseUISize() * 36;
        this.textAlignOffsetX = getBaseUISize() * 0.91;
        subMenuContainer.addElement(new Button(this.window, this.sizeX, getBaseUISize() * 3, this.textAlignOffsetX, saveCurGame, "save game", () => getActiveClimate().getUIColorInactiveCustom(0.55)));
        subMenuContainer.addElement(new Toggle(this.window, this.sizeX, getBaseUISize() * 3, this.textAlignOffsetX, UI_MAIN_NEWWORLD, "new/edit world", () => getActiveClimate().getUIColorInactiveCustom(0.65), () => getActiveClimate().getUIColorActive(), 0.75, false));
        subMenuContainer.addElement(new Text(this.window, this.sizeX, getBaseUISize() * .5, this.textAlignOffsetX, ""));
        subMenuContainer.addElement(new Text(this.window, this.sizeX, getBaseUISize() * 2.5, UI_CENTER, "your worlds"))
        subMenuContainer.addElement(new Text(this.window, this.sizeX, getBaseUISize() * .5, this.textAlignOffsetX, ""));

        this.worldsContainer = new Container(this.window, 0, 1);
        subMenuContainer.addElement(this.worldsContainer);
        this.reInitWorldsContainer();

        subMenuContainer.addElement(new Text(this.window, this.sizeX, getBaseUISize() * .5, this.textAlignOffsetX, ""));
        subMenuContainer.addElement(new Text(this.window, this.sizeX, getBaseUISize() * 2.5, UI_CENTER, "ui scale"))
        subMenuContainer.addElement(new Text(this.window, this.sizeX, getBaseUISize() * .5, this.textAlignOffsetX, ""));

        let uiScaleRow = new Container(this.window, 0, 0);
        subMenuContainer.addElement(uiScaleRow);

        let numUIScaleOptions = 6;
        uiScaleRow.addElement(new RadioToggle(this.window, this.sizeX / numUIScaleOptions, getBaseUISize() * 3, UI_CENTER, UI_UI_SIZE, 8, 
                () => getActiveClimate().getUIColorInactiveCustom(0.62), () => getActiveClimate().getUIColorActive(), 0.75, UICONFIG));
        uiScaleRow.addElement(new RadioToggle(this.window, this.sizeX / numUIScaleOptions, getBaseUISize() * 3, UI_CENTER, UI_UI_SIZE, 12, 
        () => getActiveClimate().getUIColorInactiveCustom(0.57), () => getActiveClimate().getUIColorActive(), 0.75, UICONFIG));
        uiScaleRow.addElement(new RadioToggle(this.window, this.sizeX / numUIScaleOptions, getBaseUISize() * 3, UI_CENTER, UI_UI_SIZE, 16, 
        () => getActiveClimate().getUIColorInactiveCustom(0.61), () => getActiveClimate().getUIColorActive(), 0.75, UICONFIG));
        uiScaleRow.addElement(new RadioToggle(this.window, this.sizeX / numUIScaleOptions, getBaseUISize() * 3, UI_CENTER, UI_UI_SIZE, 20, 
        () => getActiveClimate().getUIColorInactiveCustom(0.58), () => getActiveClimate().getUIColorActive(), 0.75, UICONFIG));
        uiScaleRow.addElement(new RadioToggle(this.window, this.sizeX / numUIScaleOptions, getBaseUISize() * 3, UI_CENTER, UI_UI_SIZE, 26, 
        () => getActiveClimate().getUIColorInactiveCustom(0.62), () => getActiveClimate().getUIColorActive(), 0.75, UICONFIG));
        uiScaleRow.addElement(new RadioToggle(this.window, this.sizeX / numUIScaleOptions, getBaseUISize() * 3, UI_CENTER, UI_UI_SIZE, 32, 
        () => getActiveClimate().getUIColorInactiveCustom(0.59), () => getActiveClimate().getUIColorActive(), 0.75, UICONFIG));
        
        subMenuContainer.addElement(new Text(this.window, this.sizeX, getBaseUISize() * .5, this.textAlignOffsetX, ""));
        subMenuContainer.addElement(new Text(this.window, this.sizeX, getBaseUISize() * 2.5, UI_CENTER, "more tools"))
        subMenuContainer.addElement(new Text(this.window, this.sizeX, getBaseUISize() * .5, this.textAlignOffsetX, ""));

        subMenuContainer.addElement(new Button(this.window, this.sizeX, getBaseUISize() * 3, this.textAlignOffsetX, loadEmptyScene, "empty scene", () => getActiveClimate().getUIColorInactiveCustom(0.55)));
        subMenuContainer.addElement( new Button(this.window, this.sizeX, getBaseUISize() * 3, this.textAlignOffsetX, purgeCanvasFrameLimit, "purge off-screen blocks", () => getActiveClimate().getUIColorInactiveCustom(0.55)));
        subMenuContainer.addElement( new Toggle(this.window, this.sizeX, getBaseUISize() * 3, this.textAlignOffsetX, UI_MAIN_SHOWHIDDEN, "show hidden worlds",  () => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorTransient()));
        subMenuContainer.addElement( new Button(this.window, this.sizeX, getBaseUISize() * 3, this.textAlignOffsetX, purgeCanvasFrameLimit, "delete hidden worlds", () => getActiveClimate().getUIColorInactiveCustom(0.55)));

    }

    reInitWorldsContainer() {
        this.worldsContainer.elements = new Array();
        let numWorlds = loadGD(UI_MAIN_SHOWHIDDEN) ? loadUI(UI_UI_NEXTWORLD) : (loadUI(UI_UI_NEXTWORLD) - Object.values(loadUI(UI_UI_WORLDHIDDEN)).map((v) => 1).reduce((a, v) => a + v, 0));
        let numWorldsPerPage = 10; 
        for (let i = 0; i < numWorldsPerPage; i++) {
            let idx = (numWorldsPerPage * loadUI(UI_UI_WORLDPAGE)) + i;
            if (!loadGD(UI_MAIN_SHOWHIDDEN) && loadUI(UI_UI_WORLDHIDDEN)[idx]) {
                // continue;
            }
            let row = new Container(this.window, 0, 0);
            this.worldsContainer.addElement(row);
            let colorFunc1 = null;
            let colorFunc2 = null;
            if (loadUI(UI_UI_CURWORLD) == i) {
                row.addElement(new Button(this.window, this.sizeX, getBaseUISize() * 3, this.textAlignOffsetX, () => null, loadUI(UI_UI_WORLDNAME)[idx], () => getActiveClimate().getUIColorActive()));
            } else {
                colorFunc1 = () => getActiveClimate().getUIColorInactiveCustom([0.65, 0.55, 0.62, 0.58, 0.61, 0.67][i % 6])
                colorFunc2 = () => getActiveClimate().getUIColorInactiveCustom(0.1 + [0.65, 0.55, 0.62, 0.58, 0.61, 0.67][i % 6])
                row.addElement(new Button(this.window, this.sizeX * (4/5), getBaseUISize() * 3, this.textAlignOffsetX, () => {saveCurGame(); loadSlot(i);}, loadUI(UI_UI_WORLDNAME)[idx], colorFunc1));
                row.addElement(new Button(this.window, this.sizeX * (1/5), getBaseUISize() * 3, this.textAlignOffsetX, () => hideWorld(i), "hide", colorFunc2));
            }
        }

        let numPages = Math.ceil(numWorlds / numWorldsPerPage);
        let pagesRow = new Container(this.window, 0, 0);
        this.worldsContainer.addElement(pagesRow);
        pagesRow.addElement(new Button(this.window, this.sizeX / 4, getBaseUISize() * 3, UI_CENTER, () => {this.reInitWorldsContainer(); saveUI(UI_UI_WORLDPAGE, Math.max(0, loadUI(UI_UI_WORLDPAGE) - 1))}, "-", () => getActiveClimate().getUIColorInactiveCustom(0.55)));
        pagesRow.addElement(new TextFunctionalBackground(this.window, this.sizeX / 2, getBaseUISize() * 3, UI_CENTER,
         () => "page " + (loadUI(UI_UI_WORLDPAGE) + 1) + " of " + (numPages + 1), getActiveClimate().getUIColorInactiveCustom(0.55), 0.75));
        pagesRow.addElement(new Button(this.window, this.sizeX / 4, getBaseUISize() * 3, UI_CENTER, () => {this.reInitWorldsContainer(); saveUI(UI_UI_WORLDPAGE, Math.min(numPages, loadUI(UI_UI_WORLDPAGE) + 1))}, "+", () => getActiveClimate().getUIColorInactiveCustom(0.55)));
    }

    render() {
        super.render();
        
    }
}