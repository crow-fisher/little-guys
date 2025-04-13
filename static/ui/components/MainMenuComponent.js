import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { purgeCanvasFrameLimit } from "../../globalOperations.js";
import { getLastMouseDown } from "../../mouse.js";
import { deleteHiddenWorlds, hideWorld, loadEmptyScene, loadSlot, saveCurGame, unhideWorld } from "../../saveAndLoad.js";
import { ConditionalContainer } from "../ConditionalContainer.js";
import { Container } from "../Container.js";
import { Button } from "../elements/Button.js";
import { ButtonFunctionalText } from "../elements/ButtonFunctionalText.js";
import { RadioToggle } from "../elements/RadioToggle.js";
import { Text } from "../elements/Text.js";
import { TextFunctionalBackground } from "../elements/TextFunctionalBackground.js";
import { Toggle } from "../elements/Toggle.js";
import { loadGD, loadUI, saveUI, UI_CENTER, UI_MAIN_NEWWORLD, UI_UI_SHOWHIDDEN, UI_UI_WORLDPAGE, UI_UI_CURWORLD, UI_UI_NEXTWORLD, UI_UI_SIZE, UI_UI_WORLDHIDDEN, UI_UI_WORLDNAME, UICONFIG, UI_UI_WORLDDELETED } from "../UIData.js";
import { SubTreeComponent } from "./SubTreeComponent.js";


export class MainMenuComponent extends SubTreeComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        super(posXFunc, posYFunc, padding, dir, key);
        let subMenuContainer = new Container(this.window, padding, 1);
        this.window.container = subMenuContainer;   
        this.sizeX = getBaseUISize() * 48;
        this.textAlignOffsetX = getBaseUISize() * 0.91;
        let numWorldsPerPage = 5;
        this.lastClick = Date.now();


        subMenuContainer.addElement(new Button(this.window, this.sizeX, getBaseUISize() * 3, this.textAlignOffsetX, saveCurGame, "save game", () => getActiveClimate().getUIColorInactiveCustom(0.55)));
        subMenuContainer.addElement(new Toggle(this.window, this.sizeX, getBaseUISize() * 3, this.textAlignOffsetX, UI_MAIN_NEWWORLD, "new/edit world", () => getActiveClimate().getUIColorInactiveCustom(0.65), () => getActiveClimate().getUIColorActive(), 0.75, false));
        subMenuContainer.addElement(new Text(this.window, this.sizeX, getBaseUISize() * .5, this.textAlignOffsetX, ""));
        subMenuContainer.addElement(new Text(this.window, this.sizeX, getBaseUISize() * 2.5, UI_CENTER, "your worlds"))
        subMenuContainer.addElement(new Text(this.window, this.sizeX, getBaseUISize() * 1, this.textAlignOffsetX, ""));

        this.worldsContainer = new Container(this.window, 0, 1);
        subMenuContainer.addElement(this.worldsContainer);

        function getIterWorlds() {
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
            return iterWorlds;
        }

        function getWorldFromI(i) {
            let iterWorlds = getIterWorlds();
            let iterWorldListIdx = (numWorldsPerPage * loadUI(UI_UI_WORLDPAGE)) + i;
            console.log(iterWorlds[iterWorldListIdx]);
            return iterWorlds[iterWorldListIdx];
        }
        
        function getNumPages() {
            let numPages = (Math.min(1, Math.floor(getIterWorlds().length / numWorldsPerPage)));
            if (loadUI(UI_UI_WORLDPAGE) > numPages) {
                saveUI(UI_UI_WORLDPAGE, numPages);
            }
            return numPages;
        }
        for (let i = 0; i < numWorldsPerPage; i++) {
            let iCopy = i;

            let slotFilledConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => getIterWorlds().length > loadUI(UI_UI_WORLDPAGE) * numWorldsPerPage + iCopy);
            let slotEmptyConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => getIterWorlds().length <= loadUI(UI_UI_WORLDPAGE) * numWorldsPerPage + iCopy);

            this.worldsContainer.addElement(slotFilledConditionalContainer);
            this.worldsContainer.addElement(slotEmptyConditionalContainer);
            slotEmptyConditionalContainer.addElement(new Text(this.window, this.sizeX, getBaseUISize() * 2.5, UI_CENTER, "slot empty"));

            let row = new Container(this.window, 0, 0);
            slotFilledConditionalContainer.addElement(row);

            let colorFunc1 = () => (loadUI(UI_UI_CURWORLD) == getWorldFromI(iCopy)) ? getActiveClimate().getUIColorActive() : getActiveClimate().getUIColorInactiveCustom([0.65, 0.55, 0.62, 0.58, 0.61, 0.67][i % 6]);
            let colorFunc2 = () => getActiveClimate().getUIColorInactiveCustom(0.1 + [0.65, 0.55, 0.62, 0.58, 0.61, 0.67][i % 6]);

            console.log(loadUI(UI_UI_WORLDNAME)[getWorldFromI(iCopy)]);
            console.log(iCopy)

            row.addElement(new ButtonFunctionalText(this.window, this.sizeX * (4/5), getBaseUISize() * 3, this.textAlignOffsetX, () => loadSlot( getWorldFromI(iCopy)), 
                () => loadUI(UI_UI_WORLDNAME)[getWorldFromI(iCopy)], colorFunc1));
            row.addElement(new ButtonFunctionalText(this.window, this.sizeX * (1/5), getBaseUISize() * 3, this.textAlignOffsetX, 
                () => (this.lastClick != getLastMouseDown() ? 
                    (loadUI(UI_UI_WORLDHIDDEN)[getWorldFromI(iCopy)] ? unhideWorld( getWorldFromI(iCopy)) : hideWorld( getWorldFromI(iCopy)))
                    : null),
            () => loadUI(UI_UI_WORLDHIDDEN)[getWorldFromI(iCopy)] ? "unhide" : "hide", colorFunc2));
        }

        let pagesRow = new Container(this.window, 0, 0);
        subMenuContainer.addElement(pagesRow);
        pagesRow.addElement(new Button(this.window, this.sizeX / 4, getBaseUISize() * 3, UI_CENTER, () => saveUI(UI_UI_WORLDPAGE, Math.max(0, loadUI(UI_UI_WORLDPAGE) - 1)), "-", () => getActiveClimate().getUIColorInactiveCustom(0.55)));
        pagesRow.addElement(new TextFunctionalBackground(this.window, this.sizeX / 2, getBaseUISize() * 3, UI_CENTER,
         () => "page " + (loadUI(UI_UI_WORLDPAGE) + 1) + " of " + (getNumPages() + 1), getActiveClimate().getUIColorInactiveCustom(0.55), 0.75));
        pagesRow.addElement(new Button(this.window, this.sizeX / 4, getBaseUISize() * 3, UI_CENTER, () => saveUI(UI_UI_WORLDPAGE, Math.min(getNumPages(), loadUI(UI_UI_WORLDPAGE) + 1)), "+", () => getActiveClimate().getUIColorInactiveCustom(0.55)));
    
        subMenuContainer.addElement(new Text(this.window, this.sizeX, getBaseUISize() * .5, this.textAlignOffsetX, ""));
        subMenuContainer.addElement(new Text(this.window, this.sizeX, getBaseUISize() * 2.5, UI_CENTER, "ui scale"))
        subMenuContainer.addElement(new Text(this.window, this.sizeX, getBaseUISize() * .5, this.textAlignOffsetX, ""));

        let uiScaleRow = new Container(this.window, 0, 0);
        subMenuContainer.addElement(uiScaleRow);

        let numUIScaleOptions = 6;
        uiScaleRow.addElement(new RadioToggle(this.window, this.sizeX / numUIScaleOptions, getBaseUISize() * 3, UI_CENTER, UI_UI_SIZE, 8, 
                () => getActiveClimate().getUIColorInactiveCustom(0.62), () => getActiveClimate().getUIColorActive(), 0.75, UICONFIG));
        uiScaleRow.addElement(new RadioToggle(this.window, this.sizeX / numUIScaleOptions, getBaseUISize() * 3, UI_CENTER, UI_UI_SIZE, 10, 
        () => getActiveClimate().getUIColorInactiveCustom(0.57), () => getActiveClimate().getUIColorActive(), 0.75, UICONFIG));
        uiScaleRow.addElement(new RadioToggle(this.window, this.sizeX / numUIScaleOptions, getBaseUISize() * 3, UI_CENTER, UI_UI_SIZE, 14, 
        () => getActiveClimate().getUIColorInactiveCustom(0.61), () => getActiveClimate().getUIColorActive(), 0.75, UICONFIG));
        uiScaleRow.addElement(new RadioToggle(this.window, this.sizeX / numUIScaleOptions, getBaseUISize() * 3, UI_CENTER, UI_UI_SIZE, 20, 
        () => getActiveClimate().getUIColorInactiveCustom(0.58), () => getActiveClimate().getUIColorActive(), 0.75, UICONFIG));
        uiScaleRow.addElement(new RadioToggle(this.window, this.sizeX / numUIScaleOptions, getBaseUISize() * 3, UI_CENTER, UI_UI_SIZE, 28, 
        () => getActiveClimate().getUIColorInactiveCustom(0.62), () => getActiveClimate().getUIColorActive(), 0.75, UICONFIG));
        uiScaleRow.addElement(new RadioToggle(this.window, this.sizeX / numUIScaleOptions, getBaseUISize() * 3, UI_CENTER, UI_UI_SIZE, 38, 
        () => getActiveClimate().getUIColorInactiveCustom(0.59), () => getActiveClimate().getUIColorActive(), 0.75, UICONFIG));
        
        subMenuContainer.addElement(new Text(this.window, this.sizeX, getBaseUISize() * .5, this.textAlignOffsetX, ""));
        subMenuContainer.addElement(new Text(this.window, this.sizeX, getBaseUISize() * 2.5, UI_CENTER, "more tools"))
        subMenuContainer.addElement(new Text(this.window, this.sizeX, getBaseUISize() * .5, this.textAlignOffsetX, ""));

        subMenuContainer.addElement(new Button(this.window, this.sizeX, getBaseUISize() * 3, this.textAlignOffsetX, loadEmptyScene, "empty scene", () => getActiveClimate().getUIColorInactiveCustom(0.55)));
        subMenuContainer.addElement( new Button(this.window, this.sizeX, getBaseUISize() * 3, this.textAlignOffsetX, purgeCanvasFrameLimit, "purge off-screen blocks", () => getActiveClimate().getUIColorInactiveCustom(0.55)));
        subMenuContainer.addElement( new Toggle(this.window, this.sizeX, getBaseUISize() * 3, this.textAlignOffsetX, UI_UI_SHOWHIDDEN, "show hidden worlds",  () => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorTransient()));
        subMenuContainer.addElement( new Button(this.window, this.sizeX, getBaseUISize() * 3, this.textAlignOffsetX, deleteHiddenWorlds, "delete hidden worlds", () => getActiveClimate().getUIColorInactiveCustom(0.55)));

    }

    update() {
        super.update();
        this.lastClick = getLastMouseDown();
    }
}
