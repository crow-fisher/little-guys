import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { Component } from "../Component.js";
import { ConditionalContainer } from "../ConditionalContainer.js";
import { Container } from "../Container.js";
import { Button } from "../elements/Button.js";
import { RadioToggle } from "../elements/RadioToggle.js";
import { RadioToggleFunctionalText } from "../elements/RadioToggleFunctionalText.js";
import { Slider } from "../elements/Slider.js";
import { SoilPickerElement } from "../elements/SoilPicker.js";
import { Text } from "../elements/Text.js";
import { TextBackground } from "../elements/TextBackground.js";
import { Toggle } from "../elements/Toggle.js";
import { ToggleFunctional } from "../elements/ToggleFunctional.js";
import { ToggleFunctionalText } from "../elements/ToggleFunctionalText.js";
import { loadUI, UI_PALETTE_SIZE, UI_PALETTE_STRENGTH, UI_CENTER, UI_PALETTE_SOILIDX, UI_PALETTE_ROCKMODE, UI_PALETTE_ROCKIDX, UI_PALETTE_COMPOSITION, saveUI, UI_PALETTE_SHOWPICKER, UI_PALETTE_EYEDROPPER, UI_PALETTE_MIXER, UI_PALETTE_SELECT, UI_PALETTE_WATER, UI_PALETTE_AQUIFER, UI_PALETTE_SURFACE, addUIFunctionMap, UI_PALETTE_SOILROCK } from "../UIData.js";

export class BlockPalette extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        this.numSoilRows = 5;
        this.initPallate();

        var sizeX = getBaseUISize() * 24;
        var half = sizeX / 2;
        var third = sizeX / 3;
        var quarter = sizeX / 4;

        let container = new Container(this.window, 0, 1);
        this.window.container = container;

        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 0.5, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.65), 0.75," "))
        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 2.8, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.9, "block palette"))
        
        let buttonHeight = getBaseUISize() * 3;

        let toolRow = new Container(this.window, 0, 0);

        container.addElement(new Text(this.window, sizeX / 8, buttonHeight / 4, 0, ""));
        container.addElement(toolRow); 

        toolRow.addElement(new ToggleFunctional(this.window, half, buttonHeight, UI_CENTER, UI_PALETTE_ROCKMODE, () => ("" + (loadUI(UI_PALETTE_ROCKMODE) ? "soil ●" : "● rock")),
            () => getActiveClimate().getPaletteRockColor(), () => getActiveClimate().getPaletteSoilColor(), 0.5));

        for (let i = 0; i < getActiveClimate().soilColors.length; i++) {
            toolRow.addElement(new Button(this.window, half / getActiveClimate().soilColors.length, buttonHeight, 0, 
                () => {
                    let key = loadUI(UI_PALETTE_ROCKMODE) ? UI_PALETTE_ROCKIDX : UI_PALETTE_SOILIDX;
                    saveUI(key, i)
                },
                "", () => getActiveClimate().getBaseActiveToolBrightnessIdx(i, [.4, .4, .2], 1)));
        }
        container.addElement(new Text(this.window, sizeX / 8, buttonHeight / 4, 0, ""));
        for (let i = 0; i <= this.numSoilRows; i++) {
            let row = new Container(this.window, 0, 0);
            container.addElement(row);
            for (let j = 0; j < this.palette[i].length; j++) {
                row.addElement(new Button(this.window, sizeX / this.palette[i].length, buttonHeight, 0, () => saveUI(UI_PALETTE_COMPOSITION, this.palette[i][j]), 
                "", () => getActiveClimate().getBaseActiveToolBrightness(this.palette[i][j], 1)))
            }
        }
        
        let palleteSelectAdvancedRow = new Container(this.window, 0, 0);
        container.addElement(new Text(this.window, sizeX / 8, buttonHeight / 4, 0, ""));
        container.addElement(palleteSelectAdvancedRow);

        container.addElement(new Text(this.window, sizeX / 8, buttonHeight / 4, 0, ""));

        palleteSelectAdvancedRow.addElement(new ToggleFunctionalText(this.window, sizeX, buttonHeight, UI_CENTER, UI_PALETTE_SHOWPICKER, 
            () => (loadUI(UI_PALETTE_SHOWPICKER) ? "hide" : "show") + " picker", () => getActiveClimate().getBaseActiveToolBrightness(loadUI(UI_PALETTE_COMPOSITION), 1),
            () => getActiveClimate().getBaseActiveToolBrightness(loadUI(UI_PALETTE_COMPOSITION), 1), 0.5));
        let palletePickerConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadUI(UI_PALETTE_SHOWPICKER));
        container.addElement(palletePickerConditionalContainer);
        palletePickerConditionalContainer.addElement(new Text(this.window, sizeX, getBaseUISize() * 2, 0, ""));
        let palletePickerRow = new Container(this.window, 0, 0);
        palletePickerConditionalContainer.addElement(palletePickerRow);

        palletePickerRow.addElement(new Text(this.window, sizeX / 8, getBaseUISize() * 2, 0, ""));
        this.soilPickerElement = new SoilPickerElement(this.window, UI_PALETTE_COMPOSITION, sizeX * 0.75, sizeX)
        palletePickerRow.addElement(this.soilPickerElement);
        palletePickerRow.addElement(new Text(this.window, sizeX / 8, getBaseUISize() * 2, 0, ""));

        
        let eyedropperMixerButtonsRow = new Container(this.window, 0, 0);
        container.addElement(eyedropperMixerButtonsRow);
        eyedropperMixerButtonsRow.addElement(new Toggle(this.window,half, buttonHeight, UI_CENTER,UI_PALETTE_EYEDROPPER , "eyedropper", () => getActiveClimate().getUIColorStoneButton(0.9), () => getActiveClimate().getUIColorStoneButton(0.5), 0.5));
        eyedropperMixerButtonsRow.addElement(new Toggle(this.window,half, buttonHeight, UI_CENTER,UI_PALETTE_MIXER , "mixer", () => getActiveClimate().getUIColorStoneButton(0.95), () => getActiveClimate().getUIColorStoneButton(0.57), 0.5));
    

        let strengthSizeContainer = new Container(this.window, padding, 0);
        container.addElement(strengthSizeContainer);

        let sizeContainer = new Container(this.window, padding, 1);
        strengthSizeContainer.addElement(sizeContainer);

        sizeContainer.addElement(new Text(this.window, sizeX / 2, buttonHeight * 0.6, UI_CENTER, "size"));
        sizeContainer.addElement(new Slider(this.window, UI_PALETTE_SIZE, sizeX / 2, getBaseUISize() * 3, 2, 14, () => getActiveClimate().getUIColorTransient(), getBaseUISize() * 1));

        let strengthContainer = new Container(this.window, padding, 1);
        strengthSizeContainer.addElement(strengthContainer);    

        strengthContainer.addElement(new Text(this.window, sizeX / 2, buttonHeight * 0.6, UI_CENTER, "strength"));
        strengthContainer.addElement(new Slider(this.window, UI_PALETTE_STRENGTH, sizeX / 2, getBaseUISize() * 3, 0, 1,  () => getActiveClimate().getUIColorTransient(), getBaseUISize() * 1));
            
        let waterRow = new Container(this.window, 0, 0);
        container.addElement(waterRow);
        waterRow.addElement(new RadioToggleFunctionalText(this.window, third, buttonHeight, UI_CENTER, UI_PALETTE_SELECT, UI_PALETTE_WATER
        , () => ((loadUI(UI_PALETTE_SELECT) == UI_PALETTE_WATER) ? "▶ " : "") +"water", () => getActiveClimate().getWaterColor(), () => getActiveClimate().getWaterColor(), 0.4));
        waterRow.addElement(new RadioToggleFunctionalText(this.window, third, buttonHeight, UI_CENTER, UI_PALETTE_SELECT, UI_PALETTE_AQUIFER,
        () => ((loadUI (UI_PALETTE_SELECT) == UI_PALETTE_AQUIFER) ? "▶ " : "") +"aquifer", () => getActiveClimate().getWaterColorDark(), () => getActiveClimate().getWaterColor(), 0.4));
        waterRow.addElement(new RadioToggleFunctionalText(this.window, third, buttonHeight, UI_CENTER, UI_PALETTE_SELECT, UI_PALETTE_SURFACE,
         () => ((loadUI(UI_PALETTE_SELECT) == UI_PALETTE_SURFACE) ? "▶ " : "") +"surface", () => getActiveClimate().getSurfaceOnColor(), () => getActiveClimate().getSufaceOffColor(), 0.4));
    }

    initPallate() {
        this.palette = new Map();
        let clayStep = 1 / (this.numSoilRows + 1);
        let curClay = clayStep / 2;
        for (let i = this.numSoilRows; i >= 0; i--) {
            let remaining = (1 - curClay);
            let remMid = remaining / 2;
            let start = 0.5 - remMid;
            let end = 0.5 + remMid;
            let steps = 5;
            let step = (end - start) / steps;
            let arr = [];
            for (let j = 0; j <= 5; j++) {
                arr.push(this.getSquareComposition(start + step * j, curClay));
            }
            this.palette[i] = arr;
            curClay += clayStep;
        }
    }
    setHover(sand, silt, clay) {
        this.soilPickerElement.setHover(sand, silt, clay);
    }
    setClick(sand, silt, clay) {
        saveUI(UI_PALETTE_COMPOSITION, [sand, silt, clay]);
    }

    getSquareComposition(xp, clayPercent) {
        var siltPercent = (1 - clayPercent) * xp;
        var sandPercent = (1 - clayPercent) - siltPercent;
        return [sandPercent, siltPercent, clayPercent];
    }
}

addUIFunctionMap(UI_PALETTE_COMPOSITION, () => saveUI(UI_PALETTE_SELECT, UI_PALETTE_SOILROCK));
addUIFunctionMap(UI_PALETTE_EYEDROPPER, () => saveUI(UI_PALETTE_SELECT, UI_PALETTE_SOILROCK));
addUIFunctionMap(UI_PALETTE_MIXER, () => saveUI(UI_PALETTE_SELECT, UI_PALETTE_SOILROCK));
addUIFunctionMap(UI_PALETTE_SOILROCK, () => saveUI(UI_PALETTE_SELECT, UI_PALETTE_SOILROCK));
addUIFunctionMap(UI_PALETTE_ROCKMODE, () => saveUI(UI_PALETTE_SELECT, UI_PALETTE_SOILROCK));
addUIFunctionMap(UI_PALETTE_SOILIDX, () => saveUI(UI_PALETTE_SELECT, UI_PALETTE_SOILROCK));
addUIFunctionMap(UI_PALETTE_ROCKIDX, () => saveUI(UI_PALETTE_SELECT, UI_PALETTE_SOILROCK));