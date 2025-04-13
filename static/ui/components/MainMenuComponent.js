import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { purgeCanvasFrameLimit } from "../../globalOperations.js";
import { getLastMouseDown, isLeftMouseClicked } from "../../mouse.js";
import { deleteHiddenWorlds, hideWorld, loadEmptyScene, loadSlot, saveCurGame, unhideWorld } from "../../saveAndLoad.js";
import { Container } from "../Container.js";
import { Button } from "../elements/Button.js";
import { RadioToggle } from "../elements/RadioToggle.js";
import { Text } from "../elements/Text.js";
import { TextFunctionalBackground } from "../elements/TextFunctionalBackground.js";
import { Toggle } from "../elements/Toggle.js";
import { loadGD, loadUI, saveGD, saveUI, UI_CENTER, UI_MAIN_NEWWORLD, UI_UI_SHOWHIDDEN, UI_UI_WORLDPAGE, UI_UI_CURWORLD, UI_UI_NEXTWORLD, UI_UI_SIZE, UI_UI_WORLDHIDDEN, UI_UI_WORLDNAME, UICONFIG, addUIFunctionMap, UI_UI_WORLDDELETED } from "../UIData.js";
import { SubTreeComponent } from "./SubTreeComponent.js";


export class MainMenuComponent extends SubTreeComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        super(posXFunc, posYFunc, padding, dir, key);
        let subMenuContainer = new Container(this.window, padding, 1);
        this.window.container = subMenuContainer;   
        this.sizeX = getBaseUISize() * 48;
        this.textAlignOffsetX = getBaseUISize() * 0.91;
        this.numWorldsPerPage = 10;
        this.lastClick = Date.now();


        subMenuContainer.addElement(new Button(this.window, this.sizeX, getBaseUISize() * 3, this.textAlignOffsetX, saveCurGame, "save game", () => getActiveClimate().getUIColorInactiveCustom(0.55)));
        subMenuContainer.addElement(new Toggle(this.window, this.sizeX, getBaseUISize() * 3, this.textAlignOffsetX, UI_MAIN_NEWWORLD, "new/edit world", () => getActiveClimate().getUIColorInactiveCustom(0.65), () => getActiveClimate().getUIColorActive(), 0.75, false));
        subMenuContainer.addElement(new Text(this.window, this.sizeX, getBaseUISize() * .5, this.textAlignOffsetX, ""));
        subMenuContainer.addElement(new Text(this.window, this.sizeX, getBaseUISize() * 2.5, UI_CENTER, "your worlds"))
        subMenuContainer.addElement(new Text(this.window, this.sizeX, getBaseUISize() * .5, this.textAlignOffsetX, ""));

        this.worldsContainer = new Container(this.window, 0, 1);
        subMenuContainer.addElement(this.worldsContainer);
        this.reInitWorldsContainer();


        let numWorlds = loadGD(UI_UI_SHOWHIDDEN) ? loadUI(UI_UI_NEXTWORLD) : (loadUI(UI_UI_NEXTWORLD) - Object.values(loadUI(UI_UI_WORLDHIDDEN)).map((v) => v ? 1 : 0).reduce((a, v) => a + v, 0));
        let numPages = Math.min(1, Math.floor(numWorlds / this.numWorldsPerPage));
        let pagesRow = new Container(this.window, 0, 0);
        subMenuContainer.addElement(pagesRow);
        pagesRow.addElement(new Button(this.window, this.sizeX / 4, getBaseUISize() * 3, UI_CENTER, () => {this.reInitWorldsContainer(); saveUI(UI_UI_WORLDPAGE, Math.max(0, loadUI(UI_UI_WORLDPAGE) - 1))}, "-", () => getActiveClimate().getUIColorInactiveCustom(0.55)));
        pagesRow.addElement(new TextFunctionalBackground(this.window, this.sizeX / 2, getBaseUISize() * 3, UI_CENTER,
         () => "page " + (loadUI(UI_UI_WORLDPAGE) + 1) + " of " + (numPages + 1), getActiveClimate().getUIColorInactiveCustom(0.55), 0.75));
        pagesRow.addElement(new Button(this.window, this.sizeX / 4, getBaseUISize() * 3, UI_CENTER, () => {this.reInitWorldsContainer(); saveUI(UI_UI_WORLDPAGE, Math.min(numPages, loadUI(UI_UI_WORLDPAGE) + 1))}, "+", () => getActiveClimate().getUIColorInactiveCustom(0.55)));
    

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
        subMenuContainer.addElement( new Toggle(this.window, this.sizeX, getBaseUISize() * 3, this.textAlignOffsetX, UI_UI_SHOWHIDDEN, "show hidden worlds",  () => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorTransient()));
        subMenuContainer.addElement( new Button(this.window, this.sizeX, getBaseUISize() * 3, this.textAlignOffsetX, deleteHiddenWorlds, "delete hidden worlds", () => getActiveClimate().getUIColorInactiveCustom(0.55)));

    }

    reInitWorldsContainer() {
        this.worldsContainer.elements = new Array();
        let iterWorlds = new Array(); 
        for (let i = 0; i < loadUI(UI_UI_NEXTWORLD); i++) {
            if (loadUI(UI_UI_WORLDDELETED)[i]) {
                continue;
            }
            if (!loadGD(UI_UI_SHOWHIDDEN)) {
                if (loadUI(UI_UI_WORLDHIDDEN)[i]) {
                    continue;
                }
            }
            iterWorlds.push(i)
        }

        for (let i = 0; i < Math.min(iterWorlds.length, this.numWorldsPerPage); i++) {
            let iterWorldListIdx = (this.numWorldsPerPage * loadUI(UI_UI_WORLDPAGE)) + i;
            let worldIdx = iterWorlds[iterWorldListIdx];

            if (!loadGD(UI_UI_SHOWHIDDEN) && loadUI(UI_UI_WORLDHIDDEN)[worldIdx]) {
                continue;
            }
            let row = new Container(this.window, 0, 0);
            this.worldsContainer.addElement(row);
            let colorFunc1 = null;
            let colorFunc2 = null;

            if (loadUI(UI_UI_CURWORLD) == worldIdx) {
                row.addElement(new Button(this.window, this.sizeX, getBaseUISize() * 3, this.textAlignOffsetX, () => null, loadUI(UI_UI_WORLDNAME)[worldIdx], () => getActiveClimate().getUIColorActive()));
            } else {
                colorFunc1 = () => getActiveClimate().getUIColorInactiveCustom([0.65, 0.55, 0.62, 0.58, 0.61, 0.67][i % 6])
                colorFunc2 = () => getActiveClimate().getUIColorInactiveCustom(0.1 + [0.65, 0.55, 0.62, 0.58, 0.61, 0.67][i % 6])
                row.addElement(new Button(this.window, this.sizeX * (4/5), getBaseUISize() * 3, this.textAlignOffsetX, () => loadSlot(worldIdx), 
                    loadUI(UI_UI_WORLDNAME)[worldIdx], colorFunc1));

                if (!loadUI(UI_UI_WORLDHIDDEN)[worldIdx]) {
                    row.addElement(new Button(this.window, this.sizeX * (1/5), getBaseUISize() * 3, this.textAlignOffsetX, () => hideWorld(worldIdx), "hide", colorFunc2));
                } else {
                    row.addElement(new Button(this.window, this.sizeX * (1/5), getBaseUISize() * 3, this.textAlignOffsetX, () => unhideWorld(worldIdx), "unhide", colorFunc2));
                }
            }
        }
    }

    update() {
        if (!loadGD(this.key)) {
            return;
        }
        this.window.posX = this.posXFunc();
        this.window.posY = this.posYFunc();

        if (this.lastClick != getLastMouseDown()) {
            this.window.update();
            this.lastClick = getLastMouseDown();
        }
    }
}
