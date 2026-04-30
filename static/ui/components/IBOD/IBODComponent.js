import { getBaseUISize } from "../../../canvas.js";
import { getActiveClimate } from "../../../climate/climateManager.js";
import { COLOR_BLACK, COLOR_BLUE, COLOR_OTHER_BLUE, COLOR_RED, COLOR_WHITE } from "../../../colors.js";
import { Component } from "../../Component.js";
import { ConditionalContainer } from "../../ConditionalContainer.js";
import { Container } from "../../Container.js";
import { Button } from "../../elements/Button.js";
import { ButtonFunctionalText } from "../../elements/ButtonFunctionalText.js";
import { PlotStarScatter } from "../../elements/plots/PlotStarScatter.js";
import { RadioToggle } from "../../elements/RadioToggle.js";
import { RadioToggleLabel } from "../../elements/RadioToggleLabel.js";
import { SliderGradientBackground } from "../../elements/SliderGradientBackground.js";
import { Text } from "../../elements/Text.js";
import { TextBackground } from "../../elements/TextBackground.js";
import { Toggle } from "../../elements/Toggle.js";
import { loadGD, UI_CENTER, saveGD, UI_IBOD_PLOT_WIDTH, UI_IBOD_PLOT_HEIGHT, UI_IBOD_SELECT_FILTERMODE_STARS, UI_IBOD_LABEL_STARS, UI_IBOD_PLOT_SELECTRADIUS, UI_IBOD_PLOT_LOCALITY_SELECTMODE, UI_IBOD_SELECT_FILTERMODE_GRAPH, UI_IBOD_LABEL_GRAPH, UI_IBOD_PLOT_HIDECONTROLS, UI_IBOD_PLOT_TOOLBOX_STAR_STYLE, UI_IBOD_MODE_SELECT, UI_IBOD_MODE_PLOT, UI_IBOD_MODE_SETUP, UI_IBOD_MODE_STYLE, UI_IBOD_MODE_LABEL } from "../../UIData.js";
import { getIBODComponent } from "../../WindowManager.js";
import { IBODModeFuncLabel } from "./modes/IBODModeFuncLabel.js";
import { IBODModeFuncPlot } from "./modes/IBODModeFuncPlot.js";
import { IBODModeFuncSelect } from "./modes/IBODModeFuncSelect.js";
import { IBODModeFuncSetup } from "./modes/IBODModeFuncSetup.js";
import { IBODModeFuncStyle } from "./modes/IBODModeFuncStyle.js";
import { initAAUIFunctionMaps } from "./modes/IBODUIFunctionMaps.js";
import { addPlotStarStyleToContainer } from "./PlotStarStyle.js";

export class IBODComponent extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        let container = new Container(this.window, 0, 1);
        this.window.container = container;

        let plotSizeX = getBaseUISize() * loadGD(UI_IBOD_PLOT_WIDTH);
        let plotSizeY = getBaseUISize() * loadGD(UI_IBOD_PLOT_HEIGHT);

        let h1 = getBaseUISize() * 4;
        let h2 = getBaseUISize() * 3;
        let h3 = getBaseUISize() * 2.5;
        let br = getBaseUISize() * 1;

        this.sizeX = plotSizeX;
        let half = this.sizeX / 2;
        let third = this.sizeX / 3;
        let fourth = this.sizeX / 4;
        let fifth = this.sizeX / 5;

        let addSpacing = () => container.addElement(new Text(this.window, this.sizeX, br, UI_CENTER, ""));

        container.addElement(new TextBackground(this.window, this.sizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.75), 0.75, " "))
        container.addElement(new TextBackground(this.window, this.sizeX, h1, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.55), .75, "the intergalactic bank of devin"))
        container.addElement(new TextBackground(this.window, this.sizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""));
 
        let modeSelectRow = new Container(this.window, 0, 0);
        container.addElement(modeSelectRow);

        modeSelectRow.addElement(new Toggle(this.window, fifth, h2, UI_CENTER, UI_IBOD_MODE_PLOT, "plot", () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
        modeSelectRow.addElement(new Toggle(this.window, fifth, h2, UI_CENTER, UI_IBOD_MODE_LABEL, "label", () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
        modeSelectRow.addElement(new Toggle(this.window, fifth, h2, UI_CENTER, UI_IBOD_MODE_SETUP, "setup", () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
        modeSelectRow.addElement(new Toggle(this.window, fifth, h2, UI_CENTER, UI_IBOD_MODE_STYLE, "style", () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
        modeSelectRow.addElement(new Toggle(this.window, fifth, h2, UI_CENTER, UI_IBOD_MODE_SELECT, "select", () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));

        let plotConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_IBOD_MODE_PLOT));
        let labelConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_IBOD_MODE_LABEL));
        let setupConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_IBOD_MODE_SETUP));
        let styleConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_IBOD_MODE_STYLE));
        let selectConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_IBOD_MODE_SELECT));

        container.addElement(plotConditionalContainer);
        container.addElement(labelConditionalContainer);
        container.addElement(setupConditionalContainer);
        container.addElement(styleConditionalContainer);
        container.addElement(selectConditionalContainer);

        IBODModeFuncPlot(this, plotConditionalContainer, this.sizeX, plotSizeY);
        IBODModeFuncLabel(this.window, labelConditionalContainer, this.sizeX, plotSizeY);
        IBODModeFuncSetup(this.window, setupConditionalContainer, this.sizeX, plotSizeY);
        IBODModeFuncStyle(this.window, styleConditionalContainer, this.sizeX, plotSizeY);
        IBODModeFuncSelect(this.window, selectConditionalContainer, this.sizeX, plotSizeY);

    }

    updateSizeX(sizeX) {
        sizeX *= getBaseUISize();
        let mult = sizeX / this.sizeX;
        this.sizeX = sizeX;
        this.plotStarScatter.updateSizeX(sizeX);
        this.window.container.elements.forEach((el) => el.updateSizeXByMult(mult));
    }
    updateSizeY(sizeY) {
        sizeY *= getBaseUISize();
        this.plotStarScatter.updateSizeY(sizeY);
    }

    updatePlotContainers() {
        this.plotStarScatter.update();
    }
}
