import { getBaseUISize, zoomCanvasFillCircle } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { COLOR_BLACK } from "../../colors.js";
import { hueShiftColor, rgbToHex, UI_BIGDOTHOLLOW, UI_BIGDOTSOLID, UI_TINYDOT } from "../../common.js";
import { MAIN_CONTEXT } from "../../index.js";
import { Component } from "../Component.js";
import { ConditionalContainer } from "../ConditionalContainer.js";
import { Container } from "../Container.js";
import { Button } from "../elements/Button.js";
import { ButtonFunctionalText } from "../elements/ButtonFunctionalText.js";
import { RadioToggleLabel } from "../elements/RadioToggleLabel.js";
import { Slider } from "../elements/Slider.js";
import { SliderGradientBackground } from "../elements/SliderGradientBackground.js";
import { SoilPickerElement } from "../elements/SoilPicker.js";
import { SoilPickerDotElement } from "../elements/SoilPickerDotElement.js";
import { Text } from "../elements/Text.js";
import { TextBackground } from "../elements/TextBackground.js";
import { Toggle } from "../elements/Toggle.js";
import { loadGD, UI_PALETTE_SIZE, UI_PALETTE_STRENGTH, UI_CENTER, UI_PALETTE_SOILIDX, UI_PALETTE_ROCKIDX, UI_PALETTE_COMPOSITION, saveGD, UI_PALETTE_SHOWPICKER, UI_PALETTE_EYEDROPPER, UI_PALETTE_MIXER, UI_PALETTE_SELECT, UI_PALETTE_WATER, UI_PALETTE_AQUIFER, UI_PALETTE_SURFACE, addUIFunctionMap, UI_PALETTE_SOILROCK, UI_LIGHTING_SURFACE, UI_PALETTE_ERASE, UI_PALETTE_SURFACE_OFF, UI_PALETTE_MODE, UI_PALETTE_MODE_SOIL, UI_PALETTE_MODE_ROCK, UI_PALLETE_MODE_SPECIAL, UI_PALETTE_SPECIAL_SHOWINDICATOR, UI_PALETTE_AQUIFER_FLOWRATE, UI_SOIL_COMPOSITION, UI_UI_PHONEMODE, loadUI } from "../UIData.js";
import { getWaterColor, getWaterColorDark } from "./LightingComponent.js";


// const specialHueShift = -35;
const specialHueShift = -295;
function getSpecialColor(value = 0.55) {
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
        this.phoneModeOffset = 0;

        let container = new Container(this.window, 0, 1);
        this.window.container = container;

        let sizeX = getBaseUISize() * 39;
        let half = sizeX / 2;
        let third = sizeX / 3;
        let quarter = sizeX / 4;
        let offsetX = getBaseUISize() * 0.8;

        let h1 = getBaseUISize() * 3;
        let h2 = getBaseUISize() * 2.5;
        let br = getBaseUISize() * .5;

        let textAlignOffsetX = getBaseUISize() * 0.64;

        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.75), 0.75, " "))
        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 3.8, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.66315, "block editor"))
        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""));


        let modeSelectRow1 = new Container(this.window, 0, 0);
        container.addElement(modeSelectRow1);

        modeSelectRow1.addElement(new RadioToggleLabel(this.window, third, h1, offsetX, "soil", UI_PALETTE_MODE, UI_PALETTE_MODE_SOIL, () => getActiveClimate().getPaletteSoilColor(0.9), () => getActiveClimate().getPaletteSoilColor(0.7)));
        modeSelectRow1.addElement(new RadioToggleLabel(this.window, third, h1, offsetX, "rock", UI_PALETTE_MODE, UI_PALETTE_MODE_ROCK, () => getActiveClimate().getPaletteRockColor(1.1), () => getActiveClimate().getPaletteRockColor(0.55)));
        modeSelectRow1.addElement(new RadioToggleLabel(this.window, third, h1, offsetX, "special", UI_PALETTE_MODE, UI_PALLETE_MODE_SPECIAL, getSpecialColor, getSpecialColorDark));

        let buttonHeight = h1;

        let soilRockContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_PALETTE_MODE) == UI_PALETTE_MODE_SOIL || loadGD(UI_PALETTE_MODE) == UI_PALETTE_MODE_ROCK);
        let specialContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_PALETTE_MODE) == UI_PALLETE_MODE_SPECIAL);

        container.addElement(soilRockContainer);
        container.addElement(specialContainer);

        for (let i = 0; i <= this.numSoilRows; i++) {
            let row = new Container(this.window, 0, 0);
            soilRockContainer.addElement(row);
            for (let j = 0; j < this.palette.get(i).length; j++) {
                let labelFunc = () => ""
                row.addElement(new ButtonFunctionalText(this.window, sizeX / this.palette.get(i).length, h2, UI_CENTER, () => {
                    saveGD(UI_PALETTE_COMPOSITION, this.palette.get(i).at(j));
                    saveGD(UI_PALETTE_SELECT, UI_PALETTE_SOILROCK)
                }, labelFunc, () => getActiveClimate().getBaseActiveToolBrightness(this.palette.get(i).at(j), 1), 1, getBaseUISize() * 0.15))
            }
        }
        soilRockContainer.addElement(new SoilPickerDotElement(this.window, sizeX, (this.numSoilRows + 1) * h2));
        let toolRow = new Container(this.window, 0, 0);

        soilRockContainer.addElement(new Text(this.window, sizeX, h2, UI_CENTER, "palette"));
        soilRockContainer.addElement(toolRow);

        for (let i = 0; i < getActiveClimate().soilColors.length; i++) {
            toolRow.addElement(new ButtonFunctionalText(this.window, sizeX / getActiveClimate().soilColors.length, buttonHeight, UI_CENTER,
                () => {
                    let key = loadGD(UI_PALETTE_MODE) == UI_PALETTE_MODE_ROCK ? UI_PALETTE_ROCKIDX : UI_PALETTE_SOILIDX;
                    saveGD(key, i)
                },
                () => {
                    let key = loadGD(UI_PALETTE_MODE) == UI_PALETTE_MODE_ROCK ? UI_PALETTE_ROCKIDX : UI_PALETTE_SOILIDX;
                    let curVal = loadGD(key);
                    if (curVal != i) {
                        return UI_BIGDOTHOLLOW;
                    } else {
                        return UI_BIGDOTSOLID;
                    }
                }, () => {
                    let arr = [.4, .4, .2];
                    if (loadGD(UI_PALETTE_MODE) == UI_PALETTE_MODE_ROCK) {
                        arr = [.2, .2, .6];
                    };
                    return getActiveClimate().getBaseActiveToolBrightnessIdx(i, arr, 1);
                }));
        }
        container.addElement(new Text(this.window, sizeX / 8, buttonHeight / 4, 0, ""));
        specialContainer.addElement(new Text(this.window, sizeX, h1, UI_CENTER, "surface"))
        let surfaceRow = new Container(this.window, 0, 0);
        specialContainer.addElement(surfaceRow);
        surfaceRow.addElement(new RadioToggleLabel(this.window, half, h1, UI_CENTER, "brush on", UI_PALETTE_SELECT, UI_PALETTE_SURFACE,
            () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive()));
        surfaceRow.addElement(new RadioToggleLabel(this.window, half, h1, UI_CENTER, "brush off", UI_PALETTE_SELECT, UI_PALETTE_SURFACE_OFF,
            () => getActiveClimate().getUIColorInactiveCustom(0.65), () => getActiveClimate().getUIColorActive()));
        specialContainer.addElement(new Toggle(this.window, sizeX, h1, UI_CENTER, UI_PALETTE_SPECIAL_SHOWINDICATOR,
            "show surface indicator", () => getActiveClimate().getUIColorInactiveCustom(0.60), () => getActiveClimate().getUIColorTransient()));
        specialContainer.addElement(new SliderGradientBackground(this.window, UI_LIGHTING_SURFACE, sizeX, 35, 0.0, 1, () => "rgba(0, 0, 0, 0)", () => "#FFFFFF",));
        // end surface

        // water
        specialContainer.addElement(new Text(this.window, sizeX, h1, UI_CENTER, "water"))
        let waterRow = new Container(this.window, 0, 0);
        specialContainer.addElement(waterRow);
        waterRow.addElement(new RadioToggleLabel(this.window, half, h1, UI_CENTER, "water", UI_PALETTE_SELECT, UI_PALETTE_WATER,
            () => getWaterColor(0.7), () => getWaterColor(1)));
        waterRow.addElement(new RadioToggleLabel(this.window, half, h1, UI_CENTER, "aquifer", UI_PALETTE_SELECT, UI_PALETTE_AQUIFER,
            () => getWaterColor(0.7), () => getWaterColor(1)));

        specialContainer.addElement(new Text(this.window, sizeX, h2, UI_CENTER, "aquifer flowrate"))
        specialContainer.addElement(new SliderGradientBackground(this.window, UI_PALETTE_AQUIFER_FLOWRATE, sizeX, 35, 0.0, 1, getWaterColorDark, getWaterColor,));

        let palleteSelectAdvancedRow = new Container(this.window, 0, 0);
        container.addElement(new Text(this.window, sizeX / 8, buttonHeight / 4, 0, ""));
        container.addElement(palleteSelectAdvancedRow);

        container.addElement(new Text(this.window, sizeX / 8, buttonHeight / 4, 0, ""));

        palleteSelectAdvancedRow.addElement(new RadioToggleLabel(this.window, sizeX, h1, UI_CENTER, "erase", UI_PALETTE_SELECT, UI_PALETTE_ERASE,
            () => getActiveClimate().getSurfaceOnColor(), () => getActiveClimate().getSufaceOffColor()));

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
        soilRockContainer.addElement(new Text(this.window, sizeX, h2, UI_CENTER, "picker tools"))
        soilRockContainer.addElement(eyedropperMixerButtonsRow);
        eyedropperMixerButtonsRow.addElement(new RadioToggleLabel(this.window, half, h1, UI_CENTER, "eyedropper", UI_PALETTE_SELECT, UI_PALETTE_EYEDROPPER, () => getActiveClimate().getUIColorStoneButton(0.7), () => getActiveClimate().getUIColorStoneButton(0.5)));
        eyedropperMixerButtonsRow.addElement(new RadioToggleLabel(this.window, half, h1, UI_CENTER, "mixer", UI_PALETTE_SELECT, UI_PALETTE_MIXER, () => getActiveClimate().getUIColorStoneButton(0.8), () => getActiveClimate().getUIColorStoneButton(0.57)));

        let strengthSizeContainer = new Container(this.window, padding, 0);
        container.addElement(strengthSizeContainer);

        let sizeContainer = new Container(this.window, padding, 1);
        strengthSizeContainer.addElement(sizeContainer);

        sizeContainer.addElement(new Text(this.window, sizeX / 2, buttonHeight * 0.6, UI_CENTER, "size"));
        sizeContainer.addElement(new Slider(this.window, UI_PALETTE_SIZE, sizeX / 2, h1, 2, 14, () => getActiveClimate().getUIColorTransient(), getBaseUISize() * 1));

        let strengthContainer = new Container(this.window, padding, 1);
        strengthSizeContainer.addElement(strengthContainer);

        strengthContainer.addElement(new Text(this.window, sizeX / 2, buttonHeight * 0.6, UI_CENTER, "strength"));
        strengthContainer.addElement(new Slider(this.window, UI_PALETTE_STRENGTH, sizeX / 2, h1, 0, 1, () => getActiveClimate().getUIColorTransient(), getBaseUISize() * 1));

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
            let arr = new Array();
            for (let j = 0; j <= cols; j++) {
                arr.push(this.getSquareComposition(start + step * j, curClay));
            }
            this.palette.set(i, arr);
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

    render() {
        if (loadUI(UI_UI_PHONEMODE)) {
            if (this.phoneModeOffset == 0) {
                this.phoneModeOffset = getBaseUISize() * 6;
                this.window.posY += this.phoneModeOffset;
            }
        } else {
            if (this.phoneModeOffset != 0) {
                this.window.posY -= this.phoneModeOffset;
                this.phoneModeOffset = 0;
            }
        };
        super.render();
    }
}
