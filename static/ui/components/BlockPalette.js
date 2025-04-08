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
import { loadGD, UI_PALETTE_SIZE, UI_PALETTE_STRENGTH, UI_CENTER, UI_PALETTE_SOILIDX, UI_PALETTE_ROCKMODE, UI_PALETTE_ROCKIDX, UI_PALETTE_COMPOSITION, saveGD, UI_PALETTE_SHOWPICKER, UI_PALETTE_EYEDROPPER, UI_PALETTE_MIXER, UI_PALETTE_SELECT, UI_PALETTE_WATER, UI_PALETTE_AQUIFER, UI_PALETTE_SURFACE, addUIFunctionMap, UI_PALETTE_SOILROCK, UI_LIGHTING_SURFACE, UI_PALETTE_ERASE, UI_PALETTE_SURFACE_OFF } from "../UIData.js";

export class BlockPalette extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        this.numSoilRows = 5;
        this.initPallate();

        let sizeX = getBaseUISize() * 24;
        let half = sizeX / 2;
        let third = sizeX / 3;
        let quarter = sizeX / 4;

        let container = new Container(this.window, 0, 1);
        this.window.container = container;

        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 0.5, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.65), 0.75," "))
        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 2.8, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.9, "block palette"))
        
        let buttonHeight = getBaseUISize() * 3;

        let toolRow = new Container(this.window, 0, 0);

        container.addElement(new Text(this.window, sizeX / 8, buttonHeight / 4, 0, ""));
        container.addElement(toolRow); 

        toolRow.addElement(new ToggleFunctional(this.window, half, buttonHeight, UI_CENTER, UI_PALETTE_ROCKMODE, () => ("" + (loadGD(UI_PALETTE_ROCKMODE) ? "soil ●" : "● rock")),
            () => getActiveClimate().getPaletteRockColor(), () => getActiveClimate().getPaletteSoilColor(), 0.5));

        for (let i = 0; i < getActiveClimate().soilColors.length; i++) {
            toolRow.addElement(new Button(this.window, half / getActiveClimate().soilColors.length, buttonHeight, 0, 
                () => {
                    let key = loadGD(UI_PALETTE_ROCKMODE) ? UI_PALETTE_ROCKIDX : UI_PALETTE_SOILIDX;
                    saveGD(key, i)
                },
                "", () => getActiveClimate().getBaseActiveToolBrightnessIdx(i, [.4, .4, .2], 1)));
        }
        container.addElement(new Text(this.window, sizeX / 8, buttonHeight / 4, 0, ""));
        for (let i = 0; i <= this.numSoilRows; i++) {
            let row = new Container(this.window, 0, 0);
            container.addElement(row);
            for (let j = 0; j < this.palette[i].length; j++) {
                row.addElement(new Button(this.window, sizeX / this.palette[i].length, buttonHeight / 2, 0, () => saveGD(UI_PALETTE_COMPOSITION, this.palette[i][j]), 
                "", () => getActiveClimate().getBaseActiveToolBrightness(this.palette[i][j], 1)))
            }   
        }
        
        let palleteSelectAdvancedRow = new Container(this.window, 0, 0);
        container.addElement(new Text(this.window, sizeX / 8, buttonHeight / 4, 0, ""));
        container.addElement(palleteSelectAdvancedRow);

        container.addElement(new Text(this.window, sizeX / 8, buttonHeight / 4, 0, ""));

        palleteSelectAdvancedRow.addElement(new ToggleFunctionalText(this.window, half, buttonHeight, UI_CENTER, UI_PALETTE_SHOWPICKER, 
            () => (loadGD(UI_PALETTE_SHOWPICKER) ? "hide" : "show") + " picker", () => getActiveClimate().getBaseActiveToolBrightness(loadGD(UI_PALETTE_COMPOSITION), 1),
            () => getActiveClimate().getBaseActiveToolBrightness(loadGD(UI_PALETTE_COMPOSITION), 1), 0.5));
        palleteSelectAdvancedRow.addElement(new RadioToggleFunctionalText(this.window, half, buttonHeight, UI_CENTER, UI_PALETTE_SELECT, UI_PALETTE_ERASE,
            () => ((loadGD(UI_PALETTE_SELECT) == UI_PALETTE_ERASE) ? "▶ " : "") +"erase", () => getActiveClimate().getSurfaceOnColor(), () => getActiveClimate().getSufaceOffColor(), 0.4));
        
        let palletePickerConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_PALETTE_SHOWPICKER));
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
            
        let row1 = new Container(this.window, 0, 0);
        let row2 = new Container(this.window, 0, 0);

        container.addElement(row1);
        container.addElement(row2);
        
        row1.addElement(new RadioToggleFunctionalText(this.window, half, buttonHeight, UI_CENTER, UI_PALETTE_SELECT, UI_PALETTE_WATER
        , () => ((loadGD(UI_PALETTE_SELECT) == UI_PALETTE_WATER) ? "▶ " : "") +"water", () => getActiveClimate().getWaterColor(), () => getActiveClimate().getWaterColor(), 0.4));
        row1.addElement(new RadioToggleFunctionalText(this.window, half, buttonHeight, UI_CENTER, UI_PALETTE_SELECT, UI_PALETTE_AQUIFER,
        () => ((loadGD (UI_PALETTE_SELECT) == UI_PALETTE_AQUIFER) ? "▶ " : "") +"aquifer", () => getActiveClimate().getWaterColorDark(), () => getActiveClimate().getWaterColor(), 0.4));
        row2.addElement(new RadioToggleFunctionalText(this.window, half, buttonHeight, UI_CENTER, UI_PALETTE_SELECT, UI_PALETTE_SURFACE,
         () => ((loadGD(UI_PALETTE_SELECT) == UI_PALETTE_SURFACE) ? "▶ " : "") +"surface", () => getActiveClimate().getSurfaceOnColor(), () => getActiveClimate().getSufaceOffColor(), 0.4));
        row2.addElement(new RadioToggleFunctionalText(this.window, half, buttonHeight, UI_CENTER, UI_PALETTE_SELECT, UI_PALETTE_SURFACE_OFF,
            () => ((loadGD(UI_PALETTE_SELECT) == UI_PALETTE_SURFACE_OFF) ? "▶ " : "") +"surface off", () => getActiveClimate().getSurfaceOnColor(), () => getActiveClimate().getSufaceOffColor(), 0.4));

        container.addElement(new Text(this.window, sizeX,  getBaseUISize() * 1.5, UI_CENTER, "surface"));
        container.addElement(new Slider(this.window, UI_LIGHTING_SURFACE, sizeX,  35, 0.0, 1, () => getActiveClimate().getUIColorTransient()));
    
    
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
        saveGD(UI_PALETTE_COMPOSITION, [sand, silt, clay]);
    }

    getSquareComposition(xp, clayPercent) {
        let siltPercent = (1 - clayPercent) * xp;
        let sandPercent = (1 - clayPercent) - siltPercent;
        return [sandPercent, siltPercent, clayPercent];
    }
}

addUIFunctionMap(UI_PALETTE_COMPOSITION, () => saveGD(UI_PALETTE_SELECT, UI_PALETTE_SOILROCK));
addUIFunctionMap(UI_PALETTE_EYEDROPPER, () => saveGD(UI_PALETTE_SELECT, UI_PALETTE_SOILROCK));
addUIFunctionMap(UI_PALETTE_MIXER, () => saveGD(UI_PALETTE_SELECT, UI_PALETTE_SOILROCK));
addUIFunctionMap(UI_PALETTE_SOILROCK, () => saveGD(UI_PALETTE_SELECT, UI_PALETTE_SOILROCK));
addUIFunctionMap(UI_PALETTE_ROCKMODE, () => saveGD(UI_PALETTE_SELECT, UI_PALETTE_SOILROCK));
addUIFunctionMap(UI_PALETTE_SOILIDX, () => saveGD(UI_PALETTE_SELECT, UI_PALETTE_SOILROCK));
addUIFunctionMap(UI_PALETTE_ROCKIDX, () => saveGD(UI_PALETTE_SELECT, UI_PALETTE_SOILROCK));