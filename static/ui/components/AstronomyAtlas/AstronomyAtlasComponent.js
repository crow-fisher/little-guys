import { getBaseUISize } from "../../../canvas.js";
import { getActiveClimate } from "../../../climate/climateManager.js";
import { gsh } from "../../../climate/time.js";
import { COLOR_BLACK, COLOR_BLUE, COLOR_OTHER_BLUE, COLOR_RED, COLOR_WHITE } from "../../../colors.js";
import { Component } from "../../Component.js";
import { ConditionalContainer } from "../../ConditionalContainer.js";
import { Container } from "../../Container.js";
import { Button } from "../../elements/Button.js";
import { ButtonFunctionalText } from "../../elements/ButtonFunctionalText.js";
import { PlotStarScatter } from "../../elements/plots/PlotStarScatter.js";
import { RadioToggleLabel } from "../../elements/RadioToggleLabel.js";
import { SliderGradientBackground } from "../../elements/SliderGradientBackground.js";
import { Text } from "../../elements/Text.js";
import { TextBackground } from "../../elements/TextBackground.js";
import { loadGD, UI_CENTER, saveGD, UI_PLOTCONTAINER_WIDTH, UI_PLOTCONTAINER_HEIGHT, UI_PLOTCONTAINER_FILTERMODE_STARS, UI_PLOTCONTAINER_IDSYSTEM_STARS, UI_PLOTCONTAINER_SELECTRADIUS, UI_PLOTCONTAINER_LOCALITY_SELECTMODE, UI_PLOTCONTAINER_FILTERMODE_GRAPH, UI_PLOTCONTAINER_IDSYSTEM_GRAPH, UI_PLOTCONTAINER_HIDECONTROLS, UI_PLOTCONTAINER_TOOLBOX_STAR_STYLE, UI_AA_MODE_SELECT, UI_AA_MODE_PLOT, UI_AA_MODE_SETUP, UI_AA_MODE_STYLE } from "../../UIData.js";
import { getPlotContainerComponent } from "../../WindowManager.js";
import { AstronomyAtlasModeFuncPlot } from "./modes/AstronomyAtlasModeFuncPlot.js";
import { AstronomyAtlasModeFuncSetup } from "./modes/AstronomyAtlasModeFuncSetup.js";
import { AstronomyAtlasModeFuncStyle } from "./modes/AstronomyAtlasModeFuncStyle.js";
import { addPlotStarStyleToContainer } from "./PlotStarStyle.js";

export class AstronomyAtlasComponent extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        let container = new Container(this.window, 0, 1);
        this.window.container = container;

        let plotSizeX = loadGD(UI_PLOTCONTAINER_WIDTH);
        let plotSizeY = loadGD(UI_PLOTCONTAINER_HEIGHT);

        let h1 = getBaseUISize() * 4;
        let h2 = getBaseUISize() * 3;
        let h3 = getBaseUISize() * 2.5;
        let br = getBaseUISize() * 1;

        this.sizeX = plotSizeX;
        let half = this.sizeX / 2;
        let third = this.sizeX / 3;
        let fourth = this.sizeX / 4;

        let addSpacing = () => container.addElement(new Text(this.window, this.sizeX, br, UI_CENTER, ""));

        container.addElement(new TextBackground(this.window, this.sizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.75), 0.75, " "))
        container.addElement(new TextBackground(this.window, this.sizeX, h1, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.55), .75, "astronomy atlas"))
        container.addElement(new TextBackground(this.window, this.sizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""));

        let modeSelectRow = new Container(this.window, 0, 0);
        container.addElement(modeSelectRow);
        modeSelectRow.addElement(new RadioToggleLabel(this.window, third, h2, UI_CENTER, "plot", UI_AA_MODE_SELECT, UI_AA_MODE_PLOT, () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
        modeSelectRow.addElement(new RadioToggleLabel(this.window, third, h2, UI_CENTER, "setup", UI_AA_MODE_SELECT, UI_AA_MODE_SETUP, () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
        modeSelectRow.addElement(new RadioToggleLabel(this.window, third, h2, UI_CENTER, "style", UI_AA_MODE_SELECT, UI_AA_MODE_STYLE, () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));

        let plotConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_AA_MODE_SELECT) == UI_AA_MODE_PLOT);
        let setupConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_AA_MODE_SELECT) == UI_AA_MODE_SETUP);
        let styleConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_AA_MODE_SELECT) == UI_AA_MODE_STYLE);

        container.addElement(plotConditionalContainer);
        container.addElement(setupConditionalContainer);
        container.addElement(styleConditionalContainer);

        AstronomyAtlasModeFuncStyle(this.window, styleConditionalContainer, this.sizeX, plotSizeY);
        AstronomyAtlasModeFuncSetup(this.window, setupConditionalContainer, this.sizeX, plotSizeY);
        AstronomyAtlasModeFuncPlot(this.window, plotConditionalContainer, this.sizeX, plotSizeY);

        // row0.addElement(new ButtonFunctionalText(this.window, this.sizeX / 3, getBaseUISize() * 3, UI_CENTER, () => saveGD(UI_PLOTCONTAINER_HIDECONTROLS, (loadGD(UI_PLOTCONTAINER_HIDECONTROLS) + 1) % 2),
        //     () => ["hide", "show"][loadGD(UI_PLOTCONTAINER_HIDECONTROLS)] + " controls", () => [COLOR_RED, COLOR_BLUE][loadGD(UI_PLOTCONTAINER_HIDECONTROLS)]));
        // row0.addElement(new ButtonFunctionalText(this.window, this.sizeX / 3, getBaseUISize() * 3, UI_CENTER, () => saveGD(UI_PLOTCONTAINER_TOOLBOX_STAR_STYLE, (loadGD(UI_PLOTCONTAINER_TOOLBOX_STAR_STYLE) + 1) % 2),
        //     () => ["star style", "close style"][loadGD(UI_PLOTCONTAINER_TOOLBOX_STAR_STYLE)], () => [COLOR_RED, COLOR_BLUE][loadGD(UI_PLOTCONTAINER_TOOLBOX_STAR_STYLE)]));

        // let plotContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_PLOTCONTAINER_TOOLBOX_STAR_STYLE) == 0);
        // let styleContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_PLOTCONTAINER_TOOLBOX_STAR_STYLE) == 1);

        // container.addElement(styleContainer);
        // container.addElement(plotContainer);
        // this.plotStarScatter = new PlotStarScatter(this.window,plotSizeX, plotSizeY);
        // plotContainer.addElement(this.plotStarScatter)
        // plotContainer.addElement(new ButtonFunctionalText(
        //     this.window, this.sizeX / 3, getBaseUISize() * 3, UI_CENTER, () => getPlotContainerComponent().plotStarScatter.vr = [0, 1, 0, 1], "reset viewport", 
        //     () => getActiveClimate().getPaletteRockColor(0.85)));

        // addPlotStarStyleToContainer(this.window, styleContainer, this.sizeX, this.plotSizeY);

        // let controlsContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_PLOTCONTAINER_HIDECONTROLS) == 0);
        // container.addElement(controlsContainer);

        // let row1 = new Container(this.window, 0, 0);
        // let row2 = new Container(this.window, 0, 0);
        // let row3 = new Container(this.window, 0, 0);
        // let row4 = new Container(this.window, 0, 0);
        // let row5 = new Container(this.window, 0, 0);
        // let row6 = new Container(this.window, 0, 0);

        // controlsContainer.addElement(new Text(this.window, this.sizeX, getBaseUISize() * 3, UI_CENTER, "filter graph to"))
        // controlsContainer.addElement(row1);
        // row1.addElement(new RadioToggleLabel(this.window, this.sizeX / 3, getBaseUISize() * 3, UI_CENTER, "(no filter)", UI_PLOTCONTAINER_FILTERMODE_GRAPH, 0, () => COLOR_BLUE, () => COLOR_RED));
        // row1.addElement(new RadioToggleLabel(this.window, this.sizeX / 3, getBaseUISize() * 3, UI_CENTER, "visible stars", UI_PLOTCONTAINER_FILTERMODE_GRAPH, 1, () => COLOR_BLUE, () => COLOR_RED));
        // row1.addElement(new RadioToggleLabel(this.window, this.sizeX / 3, getBaseUISize() * 3, UI_CENTER, "selected stars", UI_PLOTCONTAINER_FILTERMODE_GRAPH, 2, () => COLOR_BLUE, () => COLOR_RED));


        // controlsContainer.addElement(new Text(this.window, this.sizeX, getBaseUISize() * 3, UI_CENTER, "filter stars to"))
        // controlsContainer.addElement(row2);
        // row2.addElement(new RadioToggleLabel(this.window, this.sizeX / 3, getBaseUISize() * 3, UI_CENTER, "(no filter)", UI_PLOTCONTAINER_FILTERMODE_STARS, 0, () => COLOR_BLUE, () => COLOR_RED));
        // row2.addElement(new RadioToggleLabel(this.window, this.sizeX / 3, getBaseUISize() * 3, UI_CENTER, "graphed stars", UI_PLOTCONTAINER_FILTERMODE_STARS, 1, () => COLOR_BLUE, () => COLOR_RED));
        // row2.addElement(new RadioToggleLabel(this.window, this.sizeX / 3, getBaseUISize() * 3, UI_CENTER, "selected stars", UI_PLOTCONTAINER_FILTERMODE_STARS, 2, () => COLOR_BLUE, () => COLOR_RED));

        // addSpacing();
        // controlsContainer.addElement(new Text(this.window, this.sizeX, getBaseUISize() * 3, UI_CENTER, "id numbering system (stars)"))
        // controlsContainer.addElement(row3);
        // row3.addElement(new RadioToggleLabel(this.window, this.sizeX / 3, getBaseUISize() * 3, UI_CENTER, "none", UI_PLOTCONTAINER_IDSYSTEM_STARS, 0, () => COLOR_BLUE, () => COLOR_RED));
        // row3.addElement(new RadioToggleLabel(this.window, this.sizeX / 3, getBaseUISize() * 3, UI_CENTER, "hipparcos", UI_PLOTCONTAINER_IDSYSTEM_STARS, 1, () => COLOR_BLUE, () => COLOR_RED));
        // row3.addElement(new RadioToggleLabel(this.window, this.sizeX / 3, getBaseUISize() * 3, UI_CENTER, "henry draper", UI_PLOTCONTAINER_IDSYSTEM_STARS, 2, () => COLOR_BLUE, () => COLOR_RED));

        // addSpacing();
        // controlsContainer.addElement(new Text(this.window, this.sizeX, getBaseUISize() * 3, UI_CENTER, "id numbering system (graph)"))
        // row4.addElement(new RadioToggleLabel(this.window, this.sizeX / 3, getBaseUISize() * 3, UI_CENTER, "none", UI_PLOTCONTAINER_IDSYSTEM_GRAPH, 0, () => COLOR_BLUE, () => COLOR_RED));
        // row4.addElement(new RadioToggleLabel(this.window, this.sizeX / 3, getBaseUISize() * 3, UI_CENTER, "hipparcos", UI_PLOTCONTAINER_IDSYSTEM_GRAPH, 1, () => COLOR_BLUE, () => COLOR_RED));
        // row4.addElement(new RadioToggleLabel(this.window, this.sizeX / 3, getBaseUISize() * 3, UI_CENTER, "henry draper", UI_PLOTCONTAINER_IDSYSTEM_GRAPH, 2, () => COLOR_BLUE, () => COLOR_RED));
        // addSpacing();
        // controlsContainer.addElement(row4);
        // row5.addElement(new Button(this.window, this.sizeX / 2, getBaseUISize() * 3, UI_CENTER, () => gsh().stars.forEach((star) => star.selected = false), "clear selection", () => COLOR_OTHER_BLUE))
        // row5.addElement(new Button(this.window, this.sizeX / 2, getBaseUISize() * 3, UI_CENTER, () => gsh().stars.forEach((star) => star.selected = star.graphVisible), "select visible", () => COLOR_OTHER_BLUE));

        // addSpacing();
        // controlsContainer.addElement(new Text(this.window, this.sizeX, getBaseUISize() * 3, UI_CENTER, "locality select mode"));
        // controlsContainer.addElement(row5);
        // controlsContainer.addElement(row6);
        // row6.addElement(new RadioToggleLabel(this.window, this.sizeX / 3, getBaseUISize() * 3, UI_CENTER, "none", UI_PLOTCONTAINER_LOCALITY_SELECTMODE, 0, () => COLOR_BLUE, () => COLOR_RED));
        // row6.addElement(new RadioToggleLabel(this.window, this.sizeX / 3, getBaseUISize() * 3, UI_CENTER, "local", UI_PLOTCONTAINER_LOCALITY_SELECTMODE, 1, () => COLOR_BLUE, () => COLOR_RED));
        // row6.addElement(new RadioToggleLabel(this.window, this.sizeX / 3, getBaseUISize() * 3, UI_CENTER, "persist", UI_PLOTCONTAINER_LOCALITY_SELECTMODE, 2, () => COLOR_BLUE, () => COLOR_RED));

        // controlsContainer.addElement(new Text(this.window, this.sizeX, getBaseUISize() * 3, UI_CENTER, "locality select range"));
        // controlsContainer.addElement(new SliderGradientBackground(this.window, UI_PLOTCONTAINER_SELECTRADIUS, this.sizeX, getBaseUISize() * 3, 0, 10, () => COLOR_WHITE, () => COLOR_BLACK));

    }

    updateSizeX(sizeX) {
        let mult = sizeX / this.sizeX;
        this.sizeX = sizeX;
        this.plotStarScatter.updateSizeX(sizeX);
        this.window.container.elements.forEach((el) => el.updateSizeXByMult(mult));
    }

    updatePlotContainers() {
        this.plotStarScatter.update();
    }
}
