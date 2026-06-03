import { HUE_CHARTREUSE, HUE_TANGOR } from "../../../color/hue.js";
import { Component } from "../../Component.js";
import { Container } from "../../Container.js";
import { RadioToggleLabel } from "../../elements/RadioToggleLabel.js";
import { SliderGradientBackground } from "../../elements/SliderGradientBackground.js";
import { StarSpecializedValuePicker } from "../../elements/StarSpecializedValuePicker.js";
import { TextBackground } from "../../elements/TextBackground.js";
import { UI_CENTER } from "../../UIData.js";

export class AstronomyAtlasComponent extends Component {
    getDefaultConfig() {
        return {
    offsetScale: {
        offsetX: 87,
        offsetY: 73,
        sizeX: 485,
        sizeY: 594
    },
    submenuState: {
        plot: false,
        label: false,
        setup: false,
        style: false,
        select: false
    },
    plot: {},
    label: {},
    setup: {},
    style: {
        brightnessPosX: 0.088659793814433,
        brightnessPosY: 0.0625,
        brightnessC: 0.6701030927835051,
        opacityPosX: 0.6618556701030928,
        opacityPosY: 0.4479166666666667,
        opacityC: 0.27010309278350514,
        mode: 1,
        minSize: 0.40987124463519314,
        maxSize: 2.6180257510729614,
        minLuminance: 2.007782101167315,
        maxLuminance: -1.3814432989690708,
        distPowerMult: 1.31
    },
    select: {}
}
    }
    // see 'StarSpecializedValuePicker'
    gcvStBrightnessPosX() {
        return this.config().style.brightnessPosX;
    }
    scvStBrightnessPosX(v) {
        this.config().style.brightnessPosX = v;
    }
    gcvStBrightnessPosY() {
        return this.config().style.brightnessPosY;
    }
    scvStBrightnessPosY(v) {
        this.config().style.brightnessPosY = v;
    }
    gcvStBrightnessC() {
        return this.config().style.brightnessC;
    }
    scvStBrightnessC(v) {
        this.config().style.brightnessC = v;
    }
    gcvStOpacityPosX() {
        return this.config().style.opacityPosX;
    }
    scvStOpacityPosX(v) {
        this.config().style.opacityPosX = v;
    }
    gcvStOpacityPosY() {
        return this.config().style.opacityPosY;
    }
    scvStOpacityPosY(v) {
        this.config().style.opacityPosY = v;
    }
    // allows weighting of X and Y exponent parameters for above
    gcvStOpacityC() {
        return this.config().style.opacityC;
    }
    scvStOpacityC(v) {
        this.config().style.opacityC = v;
    }
    gcvStMode() {
        return this.config().style.mode;
    }
    scvStMode(v) {
        this.config().style.mode = v;
    }

    // basic star sizing
    gcvMinSize() {
        return this.config().style.minSize;
    }
    scvMinSize(v) {
        this.config().style.minSize = v;
    }
    gcvMaxSize() {
        return this.config().style.maxSize;
    }
    scvMaxSize(v) {
        this.config().style.maxSize = v;
    }

    // star brightness and such
    gcvMinLuminance() {
        return this.config().style.minLuminance;
    }
    scvMinLuminance(v) {
        this.config().style.minLuminance = v;
    }
    mcvMinLuminance(v) {
        this.config().style.minLuminance += v;
    }
    gcvMaxLuminance() {
        return this.config().style.maxLuminance;
    }
    scvMaxLuminance(v) {
        this.config().style.maxLuminance = v;
    }
    gcvDistPowerMult() {
        return this.config().style.distPowerMult;
    }
    scvDistPowerMult(v) {
        this.config().style.distPowerMult = v;
    }
    constructor(uiManager) {
        super(uiManager);
        this.name = "AstronomyAtlasComponent";
        this.configInit();

        // this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdBr(), UI_CENTER, () => this.uiManager.getColorInactive(.5)))  
        this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH1(), UI_CENTER, () => this.uiManager.getColorInactive(1.4), .75, "astronomy atlas"))
        this.container.addElement(new StarSpecializedValuePicker(this.window, () => this.gcvSizeX(), () => this.gcvSizeY() - (2 + 2 * this.ggvdH1() + 12 * this.ggvdH3()), this));

        let row = new Container(window, 0);
        this.container.addElement(row);

        row.addElement(new RadioToggleLabel(this.window, () => this.gcvdHalfX(), () => this.ggvdH1(), UI_CENTER, "size",
            () => this.gcvStMode() == 0, () => this.scvStMode(0),
            () => this.uiManager.getColorInactive(1.4), () => this.uiManager.getColorActive(1.4)));
        row.addElement(new RadioToggleLabel(this.window, () => this.gcvdHalfX(), () => this.ggvdH1(), UI_CENTER, "opacity",
            () => this.gcvStMode() == 1, () => this.scvStMode(1),
            () => this.uiManager.getColorInactive(1.4), () => this.uiManager.getColorActive(1.4)));

        this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH3(), UI_CENTER, () => this.uiManager.getColorInactive(1.4), .75, "brightness 'c'"))
        this.container.addElement(new SliderGradientBackground(this.window, () => this.gcvStBrightnessC(), (v) => this.scvStBrightnessC(v), () => this.gcvSizeX(), () => this.ggvdH3(),
            0, 1, 30, 0.2, false));

        this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH3(), UI_CENTER, () => this.uiManager.getColorInactive(1.4), .75, "opacity 'c'"))
        this.container.addElement(new SliderGradientBackground(this.window, () => this.gcvStOpacityC(), (v) => this.scvStOpacityC(v), () => this.gcvSizeX(), () => this.ggvdH3(),
            0, 1, 60, 0.2, false));

        this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH3(), UI_CENTER, () => this.uiManager.getColorInactive(1.4), .75, "min size"))
        this.container.addElement(new SliderGradientBackground(this.window, () => this.gcvMinSize(), (v) => this.scvMinSize(v), () => this.gcvSizeX(), () => this.ggvdH3(),
            0, 1, 90, 0.2, false));

        this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH3(), UI_CENTER, () => this.uiManager.getColorInactive(1.4), .75, "max size"))
        this.container.addElement(new SliderGradientBackground(this.window, () => this.gcvMaxSize(), (v) => this.scvMaxSize(v), () => this.gcvSizeX(), () => this.ggvdH3(),
            0, 10, 120, 0.2, false));

        this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH3(), UI_CENTER, () => this.uiManager.getColorInactive(1.4), .75, "min luminance"))
        this.container.addElement(new SliderGradientBackground(this.window, () => this.gcvMinLuminance(), (v) => this.scvMinLuminance(v), () => this.gcvSizeX(), () => this.ggvdH3(),
            0, 3, 150, 0.2, false));

        this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH3(), UI_CENTER, () => this.uiManager.getColorInactive(1.4), .75, "max luminance"))
        this.container.addElement(new SliderGradientBackground(this.window, () => this.gcvMaxLuminance(), (v) => this.scvMaxLuminance(v), () => this.gcvSizeX(), () => this.ggvdH3(),
            -10, 10, 180, 0.2, false));

        // this.container.addElement(new Text(window, sizeX, textHeight, UI_CENTER, "size 'c'"))
        // this.container.addElement(new SliderGradientBackground(window, UI_SH_STYLE_SIZE_C, sizeX, textHeight, 0, 1, () => COLOR_BLACK, () => COLOR_WHITE, false, resetStarStyle));


        // row.addElement(new RadioToggleLabel(window, half, textHeight, UI_CENTER, "color", UI_STARMAP_STAR_CONTROL_TOGGLE_MODE, 1,
        //         () => this.uiManager.getColorInactive(1.4), () => this.uiManager.getColorActive(1.4)));



        // this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdBr(), UI_CENTER, () => this.uiManager.getColorInactive(.8)))  
        // this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.gcvSizeY() - this.ggvdH1(), UI_CENTER, () => this.uiManager.getColorInactive(.8)));

        // this.container.addElement(new TextBackground(this.window, this.sizeX, this.uiManager.getBaseUISize() * 0.35, UI_CENTER, () => this.uiManager.getColorInactive(), 0.75, " "))
        // this.container.addElement(new TextBackground(this.window, this.sizeX, this.h1, UI_CENTER, () => this.uiManager.getColorInactive(), .75, "astronomy atlas"))
        // this.container.addElement(new TextBackground(this.window, this.sizeX, this.uiManager.getBaseUISize() * 0.35, UI_CENTER, () => this.uiManager.getColorInactive(), 0.75, ""));

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
