import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { hueShiftColor, rgbToHex, rgbToHexObj, UI_BIGDOTHOLLOW, UI_BIGDOTSOLID } from "../../common.js";
import { Component } from "../Component.js";
import { ConditionalContainer } from "../ConditionalContainer.js";
import { Container } from "../Container.js";
import { ButtonFunctionalText } from "../elements/ButtonFunctionalText.js";
import { RadioToggleLabel } from "../elements/RadioToggleLabel.js";
import { Slider } from "../elements/Slider.js";
import { SliderGradientBackground } from "../elements/SliderGradientBackground.js";
import { SoilPickerElement } from "../elements/SoilPicker.js";
import { SoilPickerDotElement } from "../elements/SoilPickerDotElement.js";
import { Text } from "../elements/Text.js";
import { TextBackground } from "../elements/TextBackground.js";
import { TextFunctionalBackground } from "../elements/TextFunctionalBackground.js";
import { Toggle } from "../elements/Toggle.js";
import { Graph2DLined } from "../elements/visualizer/ZGraph2DLined.js";
import { loadGD, UI_PALETTE_SIZE, UI_PALETTE_STRENGTH, UI_CENTER, UI_PALETTE_SOILIDX, UI_PALETTE_ROCKIDX, UI_PALETTE_COMPOSITION, saveGD, UI_PALETTE_SHOWPICKER, UI_PALETTE_EYEDROPPER, UI_PALETTE_MIXER, UI_PALETTE_SELECT, UI_PALETTE_WATER, UI_PALETTE_AQUIFER, UI_PALETTE_SURFACE, UI_PALETTE_SOILROCK, UI_LIGHTING_SURFACE, UI_PALETTE_ERASE, UI_PALETTE_SURFACE_OFF, UI_PALETTE_MODE, UI_PALETTE_MODE_SOIL, UI_PALETTE_MODE_ROCK, UI_PALLETE_MODE_SPECIAL, UI_PALETTE_SPECIAL_SHOWINDICATOR, UI_PALETTE_AQUIFER_FLOWRATE, UI_UI_PHONEMODE, loadUI, UI_PALLETE_MODE_PASTE, UI_PALETTE_PASTE_MODE, UI_PALETTE_PASTE_MODE_FG, UI_PALETTE_PASTE_MODE_BG, UI_PALETTE_PHYSICS, UI_PALETTE_PHYSICS_RIGID, UI_PALETTE_PHYSICS_SAND, UI_PALETTE_PHYSICS_STATIC, UI_PALETTE_SPECIAL_CHURN, UI_PALETTE_SPECIAL_CHURN_WIDE, UI_PALETTE_SPECIAL_CHURN_STRENGTH, UI_PALETTE_SURFACE_MATCH, UI_PALETTE_VARIANCE } from "../UIData.js";
import { getWaterColor, getWaterColorDark } from "./LightingComponent.js";

export class VisualizerOrganismComponent extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        let container = new Container(this.window, 0, 1);
        this.window.container = container;

        let sizeX = getBaseUISize() * 50;
        let half = sizeX / 2;
        let third = sizeX / 3;
        let quarter = sizeX / 4;
        let offsetX = getBaseUISize() * 0.8;

        let h1 = getBaseUISize() * 3;
        let h2 = getBaseUISize() * 2.5;
        let br = getBaseUISize() * .5;

        let graphHeight = getBaseUISize() * 50;

        container.addElement(new TextBackground(this.window, sizeX, h1, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.65), 0.75, "organism visualizer"))
        container.addElement(new Graph2DLined(this.window, sizeX, graphHeight))
    }

}