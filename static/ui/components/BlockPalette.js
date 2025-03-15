import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { Component } from "../Component.js";
import { ConditionalContainer } from "../ConditionalContainer.js";
import { Container } from "../Container.js";
import { Button } from "../elements/Button.js";
import { PageButton } from "../elements/PageButton.js";
import { RadioToggle } from "../elements/RadioToggle.js";
import { RowedRadio } from "../elements/RowedRadio.js";
import { Slider } from "../elements/Slider.js";
import { SoilPickerElement } from "../elements/SoilPicker.js";
import { Text } from "../elements/Text.js";
import { TextBackground } from "../elements/TextBackground.js";
import { Toggle } from "../elements/Toggle.js";
import { ToggleFunctional } from "../elements/ToggleFunctional.js";
import { loadUI, UI_SPECIAL_WATER, UI_SPECIAL_AQUIFER, UI_SPECIAL_MIX, UI_SPECIAL_SURFACE, UI_SOIL_COMPOSITION, UI_PALETTE_SELECT, UI_BB_SIZE, UI_BB_STRENGTH, UI_SM_SPECIAL, UI_CENTER, UI_PALETTE_SOILIDX, UI_PALETTE_ROCKMODE, UI_BOOLEAN, UI_PALETTE_ROCKIDX, UI_PALETTE_COMPOSITION, saveUI, UI_PALETTE_SHOWSELECT, UI_PALETTE_SELECTEDSOIL, UI_PALETTE_SELECTEDROCK, UI_PALETTE_SHOWPICKER } from "../UIData.js";

export class BlockPalette extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        this.numSoilRows = 3;
        this.initPallate();

        var sizeX = getBaseUISize() * 24;
        var half = sizeX / 2;
        var third = sizeX / 3;
        var quarter = sizeX / 4;

        let container = new Container(this.window, 0, 1);
        this.window.container = container;

        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 0.5, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.65), 0.75," "))
        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 2.8, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.9, "block palette"))
        let toolRow = new Container(this.window, 0, 0);
        container.addElement(toolRow);

        let buttonHeight = getBaseUISize() * 3;
        toolRow.addElement(new ToggleFunctional(this.window, half, buttonHeight, UI_CENTER, UI_PALETTE_ROCKMODE, () => loadUI(UI_PALETTE_ROCKMODE) ? "soil" : "rock",
            () => getActiveClimate().getPaletteRockColor(), () => getActiveClimate().getPaletteSoilColor()), 0.5);
        toolRow.addElement(new PageButton(this.window, half, buttonHeight, UI_CENTER, 
            () => loadUI(UI_PALETTE_ROCKMODE) ? UI_PALETTE_ROCKIDX : UI_PALETTE_SOILIDX, 
            () => getActiveClimate().getBaseActiveToolBrightness(loadUI(UI_PALETTE_COMPOSITION), 1)));

        for (let i = 0; i < this.numSoilRows; i++) {
            let row = new Container(this.window, 0, 0);
            container.addElement(row);
            for (let j = 0; j < this.palette[i].length; j++) {
                row.addElement(new Button(this.window, sizeX / this.palette[i].length, buttonHeight, 0, () => saveUI(UI_PALETTE_COMPOSITION, this.palette[i][j]), 
                "", () => getActiveClimate().getBaseActiveToolBrightness(this.palette[i][j], 1)))
            }
        }

        
        let palleteSelectAdvancedRow = new Container(this.window, 0, 0);
        container.addElement(palleteSelectAdvancedRow);

        palleteSelectAdvancedRow.addElement(new Toggle(this.window, half, buttonHeight, UI_CENTER, UI_PALETTE_SHOWSELECT, "select", () => getActiveClimate().getBaseActiveToolBrightness(loadUI(UI_PALETTE_COMPOSITION), 1),() => getActiveClimate().getBaseActiveToolBrightness(loadUI(UI_PALETTE_COMPOSITION), 0.5)));
        palleteSelectAdvancedRow.addElement(new Toggle(this.window, half, buttonHeight, UI_CENTER, UI_PALETTE_SHOWPICKER, "picker", () => getActiveClimate().getBaseActiveToolBrightness(loadUI(UI_PALETTE_COMPOSITION), 1),() => getActiveClimate().getBaseActiveToolBrightness(loadUI(UI_PALETTE_COMPOSITION), 0.5)));
        let palleteSelectConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadUI(UI_PALETTE_SHOWSELECT));
        let palletePickerConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadUI(UI_PALETTE_SHOWPICKER));

        container.addElement(palleteSelectConditionalContainer);
        container.addElement(palletePickerConditionalContainer);
        for (let i = 0; i < getActiveClimate().soilColors.length; i++) {
            palleteSelectConditionalContainer.addElement(new Button(this.window, sizeX, buttonHeight, 0, 
                () => {
                    let key = loadUI(UI_PALETTE_ROCKMODE) ? UI_PALETTE_SELECTEDROCK : UI_PALETTE_SELECTEDSOIL;
                    loadUI(key)[i] = !loadUI(key)[i];
                },
                "", () => getActiveClimate().getBaseActiveToolBrightnessIdx(i, [.4, .4, .2], 1)));
        }
        palletePickerConditionalContainer.addElement(new Text(this.window, sizeX, getBaseUISize() * 2, 0, ""));
        let palletePickerRow = new Container(this.window, 0, 0);
        palletePickerConditionalContainer.addElement(palletePickerRow);

        palletePickerRow.addElement(new Text(this.window, sizeX / 8, getBaseUISize() * 2, 0, ""));
        palletePickerRow.addElement(new SoilPickerElement(this.window, UI_PALETTE_COMPOSITION, sizeX * 0.75, sizeX))
        palletePickerRow.addElement(new Text(this.window, sizeX / 8, getBaseUISize() * 2, 0, ""));

        let strengthSizeContainer = new Container(this.window, padding, 0);
        container.addElement(strengthSizeContainer);

        let sizeContainer = new Container(this.window, padding, 1);
        strengthSizeContainer.addElement(sizeContainer);

        sizeContainer.addElement(new Text(this.window, sizeX / 2, getBaseUISize() * 1.5, UI_CENTER, "size"));
        sizeContainer.addElement(new Slider(this.window, UI_BB_SIZE, sizeX / 2, getBaseUISize() * 3, 2, 14, () => getActiveClimate().getUIColorTransient()));

        let strengthContainer = new Container(this.window, padding, 1);
        strengthSizeContainer.addElement(strengthContainer);    

        strengthContainer.addElement(new Text(this.window, sizeX / 2, getBaseUISize() * 1.5, UI_CENTER, "strength"));
        strengthContainer.addElement(new Slider(this.window, UI_BB_STRENGTH, sizeX / 2, getBaseUISize() * 3, 0, 1,  () => getActiveClimate().getUIColorTransient()));
    
        // let waterRow = new Container(this.window, 0, 0);
        // container.addElement(waterRow);
        // waterRow.addElement(new RadioToggle(this.window, third, buttonHeight, UI_CENTER, UI_PALETTE_SELECT, UI_SPECIAL_WATER
        // , () => getActiveClimate().getWaterColor(), () => getActiveClimate().getWaterColor(), 0.5));
        // waterRow.addElement(new RadioToggle(this.window, third, buttonHeight, UI_CENTER, UI_PALETTE_SELECT, UI_SPECIAL_AQUIFER,
        //  () => getActiveClimate().getWaterColorDark(), () => getActiveClimate().getWaterColor(), 0.5));
        // waterRow.addElement(new RadioToggle(this.window, third, buttonHeight, UI_CENTER, UI_PALETTE_SELECT, UI_SPECIAL_SURFACE,
        //  () => getActiveClimate().getSurfaceOnColor(), () => getActiveClimate().getWaterColor(), 0.5));
    }

    initPallate() {
        this.palette = new Map();
        this.palette[0] = [[.60, .20, .20], [.40, .20, .40], [.40, .40, .20],  [.40, .40, .20]];
        this.palette[1] = [[.75, .15, .10], [.40, .10, .50], [.30, .60, .10],  [.40, .50, .10]];
        this.palette[2] = [[.60, .20, .20], [.40, .20, .40], [.15, .65, .20],  [.10, .85, .05]];
    }
}