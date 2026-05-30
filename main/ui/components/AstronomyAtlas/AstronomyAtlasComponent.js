import { Component } from "../../Component.js";
import { TextBackground } from "../../elements/TextBackground.js";
import { UI_CENTER } from "../../UIData.js";

export class AstronomyAtlasComponent extends Component {
    constructor(uiManager) {
        super(uiManager);
        this.name = "AstronomyAtlasComponent";
        this.loadOffsetScaleSizing();

        container.addElement(new TextBackground(this.window, this.sizeX, this.uiManager.getBaseUISize() * 0.35, UI_CENTER, () => this.uiManager.getColorInactive(), 0.75, " "))
        container.addElement(new TextBackground(this.window, this.sizeX, h1, UI_CENTER, () => this.uiManager.getColorInactive(), .75, "astronomy atlas"))
        container.addElement(new TextBackground(this.window, this.sizeX, this.uiManager.getBaseUISize() * 0.35, UI_CENTER, () => this.uiManager.getColorInactive(), 0.75, ""));
 
        // let modeSelectRow = new Container(this.window, 0);
        // container.addElement(modeSelectRow);

        // modeSelectRow.addElement(new Toggle(this.window, this.fifth, h2, UI_CENTER, UI_AA_MODE_PLOT, "plot", () => this.uiManager.getColorInactive(0.55), () => this.uiManager.getColorActive(0.55)));
        // modeSelectRow.addElement(new Toggle(this.window, this.fifth, h2, UI_CENTER, UI_AA_MODE_LABEL, "label", () => this.uiManager.getColorInactive(0.55), () => this.uiManager.getColorActive(0.55)));
        // modeSelectRow.addElement(new Toggle(this.window, this.fifth, h2, UI_CENTER, UI_AA_MODE_SETUP, "setup", () => this.uiManager.getColorInactive(0.55), () => this.uiManager.getColorActive(0.55)));
        // modeSelectRow.addElement(new Toggle(this.window, this.fifth, h2, UI_CENTER, UI_AA_MODE_STYLE, "style", () => this.uiManager.getColorInactive(0.55), () => this.uiManager.getColorActive(0.55)));
        // modeSelectRow.addElement(new Toggle(this.window, this.fifth, h2, UI_CENTER, UI_AA_MODE_SELECT, "select", () => this.uiManager.getColorInactive(0.55), () => this.uiManager.getColorActive(0.55)));

        // let addSpacing = () => container.addElement(new Text(this.window, this.sizeX, br, UI_CENTER, ""));

        // let plotConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_AA_MODE_PLOT));
        // let labelConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_AA_MODE_LABEL));
        // let setupConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_AA_MODE_SETUP));
        // let styleConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_AA_MODE_STYLE));
        // let selectConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_AA_MODE_SELECT));

        // container.addElement(plotConditionalContainer);
        // container.addElement(labelConditionalContainer);
        // container.addElement(setupConditionalContainer);
        // container.addElement(styleConditionalContainer);
        // container.addElement(selectConditionalContainer);

        // AstronomyAtlasModeFuncPlot(this, plotConditionalContainer, this.sizeX, this.window.sizeY);
        // AstronomyAtlasModeFuncLabel(this.window, labelConditionalContainer, this.sizeX, this.window.sizeY);
        // AstronomyAtlasModeFuncSetup(this.window, setupConditionalContainer, this.sizeX, this.window.sizeY);
        // AstronomyAtlasModeFuncStyle(this.window, styleConditionalContainer, this.sizeX, this.window.sizeY);
        // AstronomyAtlasModeFuncSelect(this.window, selectConditionalContainer, this.sizeX, this.window.sizeY);

        // initAAUIFunctionMaps();

        // row0.addElement(new ButtonFunctionalText(this.window, this.sizeX / 3, this.uiManager.getBaseUISize() * 3, UI_CENTER, () => saveGD(UI_AA_PLOT_HIDECONTROLS, (loadGD(UI_AA_PLOT_HIDECONTROLS) + 1) % 2),
        //     () => ["hide", "show"][loadGD(UI_AA_PLOT_HIDECONTROLS)] + " controls", () => [COLOR_RED, COLOR_BLUE][loadGD(UI_AA_PLOT_HIDECONTROLS)]));
        // row0.addElement(new ButtonFunctionalText(this.window, this.sizeX / 3, this.uiManager.getBaseUISize() * 3, UI_CENTER, () => saveGD(UI_AA_PLOT_TOOLBOX_STAR_STYLE, (loadGD(UI_AA_PLOT_TOOLBOX_STAR_STYLE) + 1) % 2),
        //     () => ["star style", "close style"][loadGD(UI_AA_PLOT_TOOLBOX_STAR_STYLE)], () => [COLOR_RED, COLOR_BLUE][loadGD(UI_AA_PLOT_TOOLBOX_STAR_STYLE)]));

        // let plotContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_AA_PLOT_TOOLBOX_STAR_STYLE) == 0);
        // let styleContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_AA_PLOT_TOOLBOX_STAR_STYLE) == 1);

        // container.addElement(styleContainer);
        // container.addElement(plotContainer);
        // this.plotStarScatter = new PlotStarScatter(this.window,this.window.sizeX, this.window.sizeY);
        // plotContainer.addElement(this.plotStarScatter)
        // plotContainer.addElement(new ButtonFunctionalText(
        //     this.window, this.sizeX / 3, this.uiManager.getBaseUISize() * 3, UI_CENTER, () => getAstronomyAtlasComponent().plotStarScatter.vr = [0, 1, 0, 1], "reset viewport", 
        //     () => getActiveClimate().getPaletteRockColor(0.85)));

        // addPlotStarStyleToContainer(this.window, styleContainer, this.sizeX, this.this.window.sizeY);

        // let controlsContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_AA_PLOT_HIDECONTROLS) == 0);
        // container.addElement(controlsContainer);

        // let row1 = new Container(this.window, 0, 0);
        // let row2 = new Container(this.window, 0, 0);
        // let row3 = new Container(this.window, 0, 0);
        // let row4 = new Container(this.window, 0, 0);
        // let row5 = new Container(this.window, 0, 0);
        // let row6 = new Container(this.window, 0, 0);

        // controlsContainer.addElement(new Text(this.window, this.sizeX, this.uiManager.getBaseUISize() * 3, UI_CENTER, "filter graph to"))
        // controlsContainer.addElement(row1);
        // row1.addElement(new RadioToggleLabel(this.window, this.sizeX / 3, this.uiManager.getBaseUISize() * 3, UI_CENTER, "(no filter)", UI_AA_SELECT_FILTERMODE_GRAPH, 0, () => COLOR_BLUE, () => COLOR_RED));
        // row1.addElement(new RadioToggleLabel(this.window, this.sizeX / 3, this.uiManager.getBaseUISize() * 3, UI_CENTER, "visible stars", UI_AA_SELECT_FILTERMODE_GRAPH, 1, () => COLOR_BLUE, () => COLOR_RED));
        // row1.addElement(new RadioToggleLabel(this.window, this.sizeX / 3, this.uiManager.getBaseUISize() * 3, UI_CENTER, "selected stars", UI_AA_SELECT_FILTERMODE_GRAPH, 2, () => COLOR_BLUE, () => COLOR_RED));


        // controlsContainer.addElement(new Text(this.window, this.sizeX, this.uiManager.getBaseUISize() * 3, UI_CENTER, "filter stars to"))
        // controlsContainer.addElement(row2);
        // row2.addElement(new RadioToggleLabel(this.window, this.sizeX / 3, this.uiManager.getBaseUISize() * 3, UI_CENTER, "(no filter)", UI_AA_SELECT_FILTERMODE_STARS, 0, () => COLOR_BLUE, () => COLOR_RED));
        // row2.addElement(new RadioToggleLabel(this.window, this.sizeX / 3, this.uiManager.getBaseUISize() * 3, UI_CENTER, "graphed stars", UI_AA_SELECT_FILTERMODE_STARS, 1, () => COLOR_BLUE, () => COLOR_RED));
        // row2.addElement(new RadioToggleLabel(this.window, this.sizeX / 3, this.uiManager.getBaseUISize() * 3, UI_CENTER, "selected stars", UI_AA_SELECT_FILTERMODE_STARS, 2, () => COLOR_BLUE, () => COLOR_RED));

        // addSpacing();
        // controlsContainer.addElement(new Text(this.window, this.sizeX, this.uiManager.getBaseUISize() * 3, UI_CENTER, "id numbering system (stars)"))
        // controlsContainer.addElement(row3);
        // row3.addElement(new RadioToggleLabel(this.window, this.sizeX / 3, this.uiManager.getBaseUISize() * 3, UI_CENTER, "none", UI_AA_LABEL_STARS, 0, () => COLOR_BLUE, () => COLOR_RED));
        // row3.addElement(new RadioToggleLabel(this.window, this.sizeX / 3, this.uiManager.getBaseUISize() * 3, UI_CENTER, "hipparcos", UI_AA_LABEL_STARS, 1, () => COLOR_BLUE, () => COLOR_RED));
        // row3.addElement(new RadioToggleLabel(this.window, this.sizeX / 3, this.uiManager.getBaseUISize() * 3, UI_CENTER, "henry draper", UI_AA_LABEL_STARS, 2, () => COLOR_BLUE, () => COLOR_RED));

        // addSpacing();
        // controlsContainer.addElement(new Text(this.window, this.sizeX, this.uiManager.getBaseUISize() * 3, UI_CENTER, "id numbering system (graph)"))
        // row4.addElement(new RadioToggleLabel(this.window, this.sizeX / 3, this.uiManager.getBaseUISize() * 3, UI_CENTER, "none", UI_AA_LABEL_GRAPH, 0, () => COLOR_BLUE, () => COLOR_RED));
        // row4.addElement(new RadioToggleLabel(this.window, this.sizeX / 3, this.uiManager.getBaseUISize() * 3, UI_CENTER, "hipparcos", UI_AA_LABEL_GRAPH, 1, () => COLOR_BLUE, () => COLOR_RED));
        // row4.addElement(new RadioToggleLabel(this.window, this.sizeX / 3, this.uiManager.getBaseUISize() * 3, UI_CENTER, "henry draper", UI_AA_LABEL_GRAPH, 2, () => COLOR_BLUE, () => COLOR_RED));
        // addSpacing();
        // controlsContainer.addElement(row4);
        // row5.addElement(new Button(this.window, this.sizeX / 2, this.uiManager.getBaseUISize() * 3, UI_CENTER, () => gsh().stars.forEach((star) => star.selected = false), "clear selection", () => COLOR_OTHER_BLUE))
        // row5.addElement(new Button(this.window, this.sizeX / 2, this.uiManager.getBaseUISize() * 3, UI_CENTER, () => gsh().stars.forEach((star) => star.selected = star.graphVisible), "select visible", () => COLOR_OTHER_BLUE));

        // addSpacing();
        // controlsContainer.addElement(new Text(this.window, this.sizeX, this.uiManager.getBaseUISize() * 3, UI_CENTER, "locality select mode"));
        // controlsContainer.addElement(row5);
        // controlsContainer.addElement(row6);
        // row6.addElement(new RadioToggleLabel(this.window, this.sizeX / 3, this.uiManager.getBaseUISize() * 3, UI_CENTER, "none", UI_AA_PLOT_LOCALITY_SELECTMODE, 0, () => COLOR_BLUE, () => COLOR_RED));
        // row6.addElement(new RadioToggleLabel(this.window, this.sizeX / 3, this.uiManager.getBaseUISize() * 3, UI_CENTER, "local", UI_AA_PLOT_LOCALITY_SELECTMODE, 1, () => COLOR_BLUE, () => COLOR_RED));
        // row6.addElement(new RadioToggleLabel(this.window, this.sizeX / 3, this.uiManager.getBaseUISize() * 3, UI_CENTER, "persist", UI_AA_PLOT_LOCALITY_SELECTMODE, 2, () => COLOR_BLUE, () => COLOR_RED));

        // controlsContainer.addElement(new Text(this.window, this.sizeX, this.uiManager.getBaseUISize() * 3, UI_CENTER, "locality select range"));
        // controlsContainer.addElement(new SliderGradientBackground(this.window, UI_AA_PLOT_SELECTRADIUS, this.sizeX, this.uiManager.getBaseUISize() * 3, 0, 10, () => COLOR_WHITE, () => COLOR_BLACK));
    }

    updateSizeX(sizeX) {
        sizeX *= this.uiManager.getBaseUISize();
        let mult = sizeX / this.sizeX;
        this.sizeX = sizeX;
        this.plotStarScatter.updateSizeX(sizeX);
        this.window.container.elements.forEach((el) => el.updateSizeXByMult(mult));
    }
    updateSizeY(sizeY) {
        sizeY *= this.uiManager.getBaseUISize();
        this.plotStarScatter.updateSizeY(sizeY);
    }

    updatePlotContainers() {
        this.plotStarScatter.update();
    }
}
