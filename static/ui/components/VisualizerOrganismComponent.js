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
import { HistoryGraph } from "../elements/visualizer/HistoryGraph.js";
import { LiteralGraph } from "../elements/visualizer/LiteralGraph.js";
import { NormalizedGraph } from "../elements/visualizer/NormalizedGraph.js";
import { loadGD, UI_PALETTE_SIZE, UI_PALETTE_STRENGTH, UI_CENTER, UI_PALETTE_SOILIDX, UI_PALETTE_ROCKIDX, UI_PALETTE_COMPOSITION, saveGD, UI_PALETTE_SHOWPICKER, UI_PALETTE_EYEDROPPER, UI_PALETTE_MIXER, UI_PALETTE_SELECT, UI_PALETTE_WATER, UI_PALETTE_AQUIFER, UI_PALETTE_SURFACE, UI_PALETTE_SOILROCK, UI_LIGHTING_SURFACE, UI_PALETTE_ERASE, UI_PALETTE_SURFACE_OFF, UI_PALETTE_MODE, UI_PALETTE_MODE_SOIL, UI_PALETTE_MODE_ROCK, UI_PALLETE_MODE_SPECIAL, UI_PALETTE_SPECIAL_SHOWINDICATOR, UI_PALETTE_AQUIFER_FLOWRATE, UI_UI_PHONEMODE, loadUI, UI_PALLETE_MODE_PASTE, UI_PALETTE_PASTE_MODE, UI_PALETTE_PASTE_MODE_FG, UI_PALETTE_PASTE_MODE_BG, UI_PALETTE_PHYSICS, UI_PALETTE_PHYSICS_RIGID, UI_PALETTE_PHYSICS_SAND, UI_PALETTE_PHYSICS_STATIC, UI_PALETTE_SPECIAL_CHURN, UI_PALETTE_SPECIAL_CHURN_WIDE, UI_PALETTE_SPECIAL_CHURN_STRENGTH, UI_PALETTE_SURFACE_MATCH, UI_PALETTE_VARIANCE, UI_VISUALIZER_MODE, UI_VISUALIZER_MODE_NORMALIZED, UI_VISUALIZER_MODE_HISTORY, UI_VISUALIZER_MODE_LITERAL, UI_EVOLUTION_ACTIVE_PARAM } from "../UIData.js";
import { getWaterColor, getWaterColorDark } from "./LightingComponent.js";

export class VisualizerOrganismComponent extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        let container = new Container(this.window, 0, 1);
        this.window.container = container;

        let sizeX = getBaseUISize() * 100;
        let half = sizeX / 2;
        let third = sizeX / 3;
        let quarter = sizeX / 4;
        let offsetX = getBaseUISize() * 0.8;

        let h1 = getBaseUISize() * 3;
        let h2 = getBaseUISize() * 2.5;
        let br = getBaseUISize() * .5;

        let graphHeight = getBaseUISize() * 50;
        container.addElement(new TextBackground(this.window, sizeX, h1, UI_CENTER, () => getActiveClimate().getUIColorInactive(0.65), 0.75, "organism visualizer"))
        container.addElement(new TextBackground(this.window, sizeX, br, UI_CENTER, () => getActiveClimate().getUIColorInactive(1), 0.75, ""));

        let indexSelectRow = new Container(this.window, 0, 0);


        let modeSelectRow = new Container(this.window, 0, 0);

        indexSelectRow.addElement(new TextBackground(this.window, third, h1, UI_CENTER, () => getActiveClimate().getUIColorInactive(0.65), 0.75, "active param"))
        indexSelectRow.addElement(new RadioToggleLabel(this.window, third, h1, offsetX, "0 (light)", UI_EVOLUTION_ACTIVE_PARAM, 0,() => getActiveClimate().getUIColorInactive(0.77), () => getActiveClimate().getUIColorActive(0.53)));
        indexSelectRow.addElement(new RadioToggleLabel(this.window, third, h1, offsetX, "1 (water)", UI_EVOLUTION_ACTIVE_PARAM, 1,() => getActiveClimate().getUIColorInactive(0.83), () => getActiveClimate().getUIColorActive(0.51)));
        

        container.addElement(indexSelectRow);
        container.addElement(new TextBackground(this.window, sizeX, br, UI_CENTER, () => getActiveClimate().getUIColorInactive(1), 0.75, ""));
        container.addElement(modeSelectRow);

        modeSelectRow.addElement(new RadioToggleLabel(this.window, third, h1, offsetX, "literal", UI_VISUALIZER_MODE, UI_VISUALIZER_MODE_LITERAL,() => getActiveClimate().getUIColorInactive(0.88), () => getActiveClimate().getUIColorActive(0.55)));
        modeSelectRow.addElement(new RadioToggleLabel(this.window, third, h1, offsetX, "normalized", UI_VISUALIZER_MODE, UI_VISUALIZER_MODE_NORMALIZED,() => getActiveClimate().getUIColorInactive(0.85), () => getActiveClimate().getUIColorActive(0.52)));
        modeSelectRow.addElement(new RadioToggleLabel(this.window, third, h1, offsetX, "history", UI_VISUALIZER_MODE, UI_VISUALIZER_MODE_HISTORY,() => getActiveClimate().getUIColorInactive(0.82), () => getActiveClimate().getUIColorActive(0.58)));
        
    //             let soilRockContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_PALETTE_MODE) == UI_PALETTE_MODE_SOIL || loadGD(UI_PALETTE_MODE) == UI_PALETTE_MODE_ROCK);
    //             let specialContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_PALETTE_MODE) == UI_PALLETE_MODE_SPECIAL);
    //             let pasteContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_PALETTE_MODE) == UI_PALLETE_MODE_PASTE);

        let literalConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_VISUALIZER_MODE) == UI_VISUALIZER_MODE_LITERAL); 
        container.addElement(literalConditionalContainer);
        literalConditionalContainer.addElement(new LiteralGraph(this.window, sizeX, graphHeight))

        let normalizedConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_VISUALIZER_MODE) == UI_VISUALIZER_MODE_NORMALIZED);
        container.addElement(normalizedConditionalContainer);
        normalizedConditionalContainer.addElement(new NormalizedGraph(this.window, sizeX, graphHeight))

        let historyConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_VISUALIZER_MODE) == UI_VISUALIZER_MODE_HISTORY);
        container.addElement(historyConditionalContainer);
        historyConditionalContainer.addElement(new HistoryGraph(this.window, sizeX, graphHeight))

        

    }

}