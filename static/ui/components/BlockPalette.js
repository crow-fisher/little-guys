import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { hexToRgb, hueShiftColor, rgbToHex } from "../../common.js";
import { Component } from "../Component.js";
import { ConditionalContainer } from "../ConditionalContainer.js";
import { Container } from "../Container.js";
import { Button } from "../elements/Button.js";
import { RadioToggle } from "../elements/RadioToggle.js";
import { RadioToggleFunctionalText } from "../elements/RadioToggleFunctionalText.js";
import { RadioToggleLabel } from "../elements/RadioToggleLabel.js";
import { Slider } from "../elements/Slider.js";
import { SoilPickerElement } from "../elements/SoilPicker.js";
import { Text } from "../elements/Text.js";
import { TextBackground } from "../elements/TextBackground.js";
import { Toggle } from "../elements/Toggle.js";
import { ToggleFunctional } from "../elements/ToggleFunctional.js";
import { ToggleFunctionalText } from "../elements/ToggleFunctionalText.js";
import { loadGD, UI_PALETTE_SIZE, UI_PALETTE_STRENGTH, UI_CENTER, UI_PALETTE_SOILIDX, UI_PALETTE_ROCKMODE, UI_PALETTE_ROCKIDX, UI_PALETTE_COMPOSITION, saveGD, UI_PALETTE_SHOWPICKER, UI_PALETTE_EYEDROPPER, UI_PALETTE_MIXER, UI_PALETTE_SELECT, UI_PALETTE_WATER, UI_PALETTE_AQUIFER, UI_PALETTE_SURFACE, addUIFunctionMap, UI_PALETTE_SOILROCK, UI_LIGHTING_SURFACE, UI_PALETTE_ERASE, UI_PALETTE_SURFACE_OFF, UI_PALETTE_MODE, UI_PALETTE_MODE_SOIL, UI_PALETTE_MODE_ROCK, UI_PALLETE_MODE_SPECIAL, UI_PALETTE_SPECIAL_SHOWINDICATOR } from "../UIData.js";


// const specialHueShift = -35;
const specialHueShift = -295;
function getSpecialColor(value=0.55) {
    let hueShifted = hueShiftColor(getActiveClimate().getUIColorInactiveCustom(value), specialHueShift, -.1, 0);
    return rgbToHex(hueShifted.r, hueShifted.g, hueShifted.b);
}

function getSpecialColorDark() {
    let hueShifted = hueShiftColor(getActiveClimate().getUIColorInactiveCustom(.25), specialHueShift, -.1, 0);
    return rgbToHex(hueShifted.r, hueShifted.g, hueShifted.b);
}

export class BlockPalette extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        this.numSoilRows = 5;
        this.initPallate();

        let container = new Container(this.window, 0, 1);
        this.window.container = container;

        let sizeX = getBaseUISize() * 39;
        let half = sizeX / 2;
        let third = sizeX / 3;
        let quarter = sizeX / 4;
        let offsetX = getBaseUISize() * 0.8;

        let h1 = getBaseUISize() * 3;
        let h2 = getBaseUISize() * 3;
        let br = getBaseUISize() * .5;

        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.75), 0.75, " "))
        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 3.8, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.66315, "block editor"))

        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""));


        let modeSelectRow1 = new Container(this.window, 0, 0);
        container.addElement(modeSelectRow1);

        modeSelectRow1.addElement(new RadioToggleLabel(this.window, third, getBaseUISize() * 3, offsetX, "soil", UI_PALETTE_MODE, UI_PALETTE_MODE_SOIL, () => getActiveClimate().getPaletteSoilColor(0.9), () => getActiveClimate().getPaletteSoilColor(0.7)));
        modeSelectRow1.addElement(new RadioToggleLabel(this.window, third, getBaseUISize() * 3, offsetX, "rock", UI_PALETTE_MODE, UI_PALETTE_MODE_ROCK, () => getActiveClimate().getPaletteRockColor(1.1), () => getActiveClimate().getPaletteRockColor(0.55)));
        modeSelectRow1.addElement(new RadioToggleLabel(this.window, third, getBaseUISize() * 3, offsetX, "special", UI_PALETTE_MODE, UI_PALLETE_MODE_SPECIAL, getSpecialColor, getSpecialColorDark));

        let buttonHeight = getBaseUISize() * 3;

        // let toolRow = new Container(this.window, 0, 0);

        // container.addElement(new Text(this.window, sizeX / 8, buttonHeight / 4, 0, ""));
        // container.addElement(toolRow); 

        // toolRow.addElement(new ToggleFunctional(this.window, half, buttonHeight, UI_CENTER, UI_PALETTE_ROCKMODE, () => ("" + (loadGD(UI_PALETTE_ROCKMODE) ? "soil ●" : "● rock")),
        //     () => getActiveClimate().getPaletteRockColor(), () => getActiveClimate().getPaletteSoilColor(), 0.5));

        // for (let i = 0; i < getActiveClimate().soilColors.length; i++) {
        //     toolRow.addElement(new Button(this.window, half / getActiveClimate().soilColors.length, buttonHeight, 0, 
        //         () => {
        //             let key = loadGD(UI_PALETTE_ROCKMODE) ? UI_PALETTE_ROCKIDX : UI_PALETTE_SOILIDX;
        //             saveGD(key, i)
        //         },
        //         "", () => getActiveClimate().getBaseActiveToolBrightnessIdx(i, [.4, .4, .2], 1)));
        // }
        // container.addElement(new Text(this.window, sizeX / 8, buttonHeight / 4, 0, ""));

        let soilRockContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_PALETTE_MODE) == UI_PALETTE_MODE_SOIL || loadGD(UI_PALETTE_MODE) == UI_PALETTE_MODE_ROCK);
        let specialContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_PALETTE_MODE) == UI_PALLETE_MODE_SPECIAL);

        container.addElement(soilRockContainer);
        container.addElement(specialContainer);

        for (let i = 0; i <= this.numSoilRows; i++) {
            let row = new Container(this.window, 0, 0);
            soilRockContainer.addElement(row);
            for (let j = 0; j < this.palette[i].length; j++) {
                row.addElement(new Button(this.window, sizeX / this.palette[i].length, buttonHeight / 2, 0, () => saveGD(UI_PALETTE_COMPOSITION, this.palette[i][j]),
                    "", () => getActiveClimate().getBaseActiveToolBrightness(this.palette[i][j], 1)))
            }
        }

        let specialRow1 = new Container(this.window, 0, 0); 
        let specialRow2 = new Container(this.window, 0, 0); 

        specialContainer.addElement(specialRow1);
        specialContainer.addElement(specialRow2);

        // let specialRow3 = new Container(this.window, 0, 0); 

        specialRow1.addElement(new RadioToggleLabel(this.window, half, getBaseUISize() * 6, UI_CENTER, "surface on", UI_PALETTE_SELECT, UI_PALETTE_SURFACE, () => getSpecialColor(0.55), () => getSpecialColor(0.35), 0.35));
        specialRow1.addElement(new RadioToggleLabel(this.window, half, getBaseUISize() * 6, UI_CENTER, "surface off", UI_PALETTE_SELECT, UI_PALETTE_SURFACE_OFF, () => getSpecialColor(0.55), () => getSpecialColor(0.35), 0.35));

        specialRow2.addElement(new Toggle(this.window, half, getBaseUISize() * 6, UI_CENTER, UI_PALETTE_SPECIAL_SHOWINDICATOR, "show surface indicator", () => getSpecialColor(0.55), () => getSpecialColor(0.35), 0.35));
        // specialRow2.addElement(new RadioToggleLabel(this.window, half, getBaseUISize() * 6, UI_CENTER, "surface off", UI_PALETTE_SELECT, UI_PALETTE_AQUIFER, () => getSpecialColor(0.55), () => getSpecialColor(0.35), 0.45));


        let palleteSelectAdvancedRow = new Container(this.window, 0, 0);
        container.addElement(new Text(this.window, sizeX / 8, buttonHeight / 4, 0, ""));
        container.addElement(palleteSelectAdvancedRow);

        container.addElement(new Text(this.window, sizeX / 8, buttonHeight / 4, 0, ""));

        palleteSelectAdvancedRow.addElement(new RadioToggleFunctionalText(this.window, half, buttonHeight, UI_CENTER, UI_PALETTE_SELECT, UI_PALETTE_ERASE,
            () => ((loadGD(UI_PALETTE_SELECT) == UI_PALETTE_ERASE) ? "▶ " : "") + "erase", () => getActiveClimate().getSurfaceOnColor(), () => getActiveClimate().getSufaceOffColor(), 0.4));

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
        eyedropperMixerButtonsRow.addElement(new Toggle(this.window, half, buttonHeight, UI_CENTER, UI_PALETTE_EYEDROPPER, "eyedropper", () => getActiveClimate().getUIColorStoneButton(0.9), () => getActiveClimate().getUIColorStoneButton(0.5), 0.5));
        eyedropperMixerButtonsRow.addElement(new Toggle(this.window, half, buttonHeight, UI_CENTER, UI_PALETTE_MIXER, "mixer", () => getActiveClimate().getUIColorStoneButton(0.95), () => getActiveClimate().getUIColorStoneButton(0.57), 0.5));


        let strengthSizeContainer = new Container(this.window, padding, 0);
        container.addElement(strengthSizeContainer);

        let sizeContainer = new Container(this.window, padding, 1);
        strengthSizeContainer.addElement(sizeContainer);

        sizeContainer.addElement(new Text(this.window, sizeX / 2, buttonHeight * 0.6, UI_CENTER, "size"));
        sizeContainer.addElement(new Slider(this.window, UI_PALETTE_SIZE, sizeX / 2, getBaseUISize() * 3, 2, 14, () => getActiveClimate().getUIColorTransient(), getBaseUISize() * 1));

        let strengthContainer = new Container(this.window, padding, 1);
        strengthSizeContainer.addElement(strengthContainer);

        strengthContainer.addElement(new Text(this.window, sizeX / 2, buttonHeight * 0.6, UI_CENTER, "strength"));
        strengthContainer.addElement(new Slider(this.window, UI_PALETTE_STRENGTH, sizeX / 2, getBaseUISize() * 3, 0, 1, () => getActiveClimate().getUIColorTransient(), getBaseUISize() * 1));

        let row1 = new Container(this.window, 0, 0);
        let row2 = new Container(this.window, 0, 0);

        container.addElement(row1);
        container.addElement(row2);

        row1.addElement(new RadioToggleFunctionalText(this.window, half, buttonHeight, UI_CENTER, UI_PALETTE_SELECT, UI_PALETTE_WATER
            , () => ((loadGD(UI_PALETTE_SELECT) == UI_PALETTE_WATER) ? "▶ " : "") + "water", () => getActiveClimate().getWaterColor(), () => getActiveClimate().getWaterColor(), 0.4));
        row1.addElement(new RadioToggleFunctionalText(this.window, half, buttonHeight, UI_CENTER, UI_PALETTE_SELECT, UI_PALETTE_AQUIFER,
            () => ((loadGD(UI_PALETTE_SELECT) == UI_PALETTE_AQUIFER) ? "▶ " : "") + "aquifer", () => getActiveClimate().getWaterColorDark(), () => getActiveClimate().getWaterColor(), 0.4));
        row2.addElement(new RadioToggleFunctionalText(this.window, half, buttonHeight, UI_CENTER, UI_PALETTE_SELECT, UI_PALETTE_SURFACE,
            () => ((loadGD(UI_PALETTE_SELECT) == UI_PALETTE_SURFACE) ? "▶ " : "") + "surface", () => getActiveClimate().getSurfaceOnColor(), () => getActiveClimate().getSufaceOffColor(), 0.4));
        row2.addElement(new RadioToggleFunctionalText(this.window, half, buttonHeight, UI_CENTER, UI_PALETTE_SELECT, UI_PALETTE_SURFACE_OFF,
            () => ((loadGD(UI_PALETTE_SELECT) == UI_PALETTE_SURFACE_OFF) ? "▶ " : "") + "surface off", () => getActiveClimate().getSurfaceOnColor(), () => getActiveClimate().getSufaceOffColor(), 0.4));
        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 1.5, UI_CENTER, "surface"));
        container.addElement(new Slider(this.window, UI_LIGHTING_SURFACE, sizeX, 35, 0.0, 1, () => getActiveClimate().getUIColorTransient()));
    }

    initPallate() {
        this.palette = new Map();
        let clayStep = 1 / (this.numSoilRows + 1);
        let curClay = clayStep / 2;
        let cols = 4;
        for (let i = this.numSoilRows; i >= 0; i--) {
            let remaining = (1 - curClay);
            let remMid = remaining / 2;
            let start = 0.5 - remMid;
            let end = 0.5 + remMid;
            let steps = cols;
            let step = (end - start) / steps;
            let arr = [];
            for (let j = 0; j <= cols; j++) {
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