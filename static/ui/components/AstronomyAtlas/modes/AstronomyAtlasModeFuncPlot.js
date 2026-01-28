import { getBaseUISize } from "../../../../canvas.js";
import { getActiveClimate } from "../../../../climate/climateManager.js";
import { COLOR_BLACK, COLOR_BLUE, COLOR_RED, COLOR_WHITE } from "../../../../colors.js";
import { ConditionalContainer } from "../../../ConditionalContainer.js";
import { Container } from "../../../Container.js";
import { ButtonFunctionalText } from "../../../elements/ButtonFunctionalText.js";
import { PlotStarScatter } from "../../../elements/plots/PlotStarScatter.js";
import { RadioToggleLabel } from "../../../elements/RadioToggleLabel.js";
import { SliderGradientBackground } from "../../../elements/SliderGradientBackground.js";
import { Text } from "../../../elements/Text.js";
import { Toggle } from "../../../elements/Toggle.js";
import { loadGD, saveGD, UI_AA_PLOT_CONFIGURE, UI_AA_PLOT_HEIGHT, UI_AA_PLOT_PARAMS, UI_AA_PLOT_POINTOPACITY, UI_AA_PLOT_POINTSIZE, UI_AA_PLOT_WIDTH, UI_AA_PLOT_XKEY, UI_AA_PLOT_YKEY, UI_AA_SELECTED_OPACITY, UI_CAMERA_OFFSET_VEC, UI_CAMERA_OFFSET_VEC_DT, UI_CENTER } from "../../../UIData.js";
import { getAstronomyAtlasComponent } from "../../../WindowManager.js";

export const resetViewportButtonOffset = getBaseUISize() * 2;

export function AstronomyAtlasModeFuncPlot(_this, container, sizeX, sizeY) {
    _this.plotStarScatter = new PlotStarScatter(_this.window, sizeX, sizeY - resetViewportButtonOffset);
    container.addElement(_this.plotStarScatter)
    let row = new Container(_this.window, 0, 0);
    container.addElement(row);

    let textHeight = getBaseUISize() * 3;
    let buttonMargin = getBaseUISize();
    let buttonWidth = _this.sizeX / 2;
    let middleMargin = (1 - (((buttonMargin * 2) + (buttonWidth * 2)) / sizeX)) * sizeX;

    row.addElement(new ButtonFunctionalText(
        _this.window, buttonWidth, getBaseUISize() * 3, UI_CENTER, () => getAstronomyAtlasComponent().plotStarScatter.resetValueRange(),
        () => "reset viewport", () => getActiveClimate().getPaletteRockColor(0.85)));

    row.addElement(new ButtonFunctionalText(
        _this.window, buttonWidth, getBaseUISize() * 3, UI_CENTER, () => {
            saveGD(UI_CAMERA_OFFSET_VEC, [0, 0, 0, 0]);
            saveGD(UI_CAMERA_OFFSET_VEC_DT, [0, 0, 0, 0]);
            getAstronomyAtlasComponent().plotStarScatter.flagRepreparePoints();
        }, () => "reset camera",
        () => getActiveClimate().getPaletteRockColor(0.85)));

    container.addElement(new Text(_this.window, getBaseUISize() * 3, getBaseUISize(), UI_CENTER, ""));


    let plotConfigureToggleRow = new Container(_this.window, 0, 0);
    container.addElement(plotConfigureToggleRow);

    plotConfigureToggleRow.addElement(new Toggle(_this.window, sizeX / 2, getBaseUISize() * 3, UI_CENTER, UI_AA_PLOT_CONFIGURE, "plot style",
        () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
    plotConfigureToggleRow.addElement(new Toggle(_this.window, sizeX / 2, getBaseUISize() * 3, UI_CENTER, UI_AA_PLOT_PARAMS, "set parameters",
        () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));

    let configurePlotConditionalContanier = new ConditionalContainer(_this.window, 0, 1, () => loadGD(UI_AA_PLOT_CONFIGURE));
    let configureParamsConditionalContainer = new ConditionalContainer(_this.window, 0, 1, () => loadGD(UI_AA_PLOT_PARAMS));

    container.addElement(configurePlotConditionalContanier);
    container.addElement(configureParamsConditionalContainer);

    configurePlotConditionalContanier.addElement(new Text(_this.window, sizeX, textHeight, UI_CENTER, "graph x-size"))
    configurePlotConditionalContanier.addElement(new SliderGradientBackground(_this.window, UI_AA_PLOT_WIDTH, sizeX, textHeight, 10, 100, () => COLOR_WHITE, () => COLOR_BLACK));

    configurePlotConditionalContanier.addElement(new Text(_this.window, sizeX, textHeight, UI_CENTER, "graph y-size"))
    configurePlotConditionalContanier.addElement(new SliderGradientBackground(_this.window, UI_AA_PLOT_HEIGHT, sizeX, textHeight, 10, 100, () => COLOR_WHITE, () => COLOR_BLACK));

    configurePlotConditionalContanier.addElement(new Text(_this.window, sizeX, textHeight, UI_CENTER, "point size"))
    configurePlotConditionalContanier.addElement(new SliderGradientBackground(_this.window, UI_AA_PLOT_POINTSIZE, sizeX, textHeight, -2, 2, () => COLOR_WHITE, () => COLOR_BLACK));

    configurePlotConditionalContanier.addElement(new Text(_this.window, sizeX, textHeight, UI_CENTER, "point opacity"))
    configurePlotConditionalContanier.addElement(new SliderGradientBackground(_this.window, UI_AA_PLOT_POINTOPACITY, sizeX, textHeight, -.0008, .00001, () => COLOR_WHITE, () => COLOR_BLACK));

    configurePlotConditionalContanier.addElement(new Text(_this.window, sizeX, textHeight, UI_CENTER, "selected points"))
    configurePlotConditionalContanier.addElement(new SliderGradientBackground(_this.window, UI_AA_SELECTED_OPACITY, sizeX, textHeight, -5, 5, () => COLOR_WHITE, () => COLOR_BLACK));


    let idGraphAxisChoices = [
        ["id", "HIP"],
        ["hd_number", "H-D"]
    ];

    let posGraphAxisChoices = [
        ["asc", "asc"],
        ["dec", "dec"],
        ["parsecs_log", "dist"]
    ]

    let magGraphAxisChoices = [
        ["magnitude", "rel. mag"],
        ["magnitude_absolute", "abs. mag"],
        ["_brightness", "cur. brightness"]
    ]

    let compGraphAxisChoices = [
        ["p_feH", "metalllicity"]
    ]
    
    let f = (cpl) => cpl.forEach((arr) => configureParamsConditionalContainer.addElement(createLabel(arr, _this.window, sizeX / idGraphAxisChoices.length)));
    
    f(idGraphAxisChoices);
    f(posGraphAxisChoices);
    f(magGraphAxisChoices);
    f(compGraphAxisChoices);
}


function createLabel(choiceArr, window, sizeX) {
    let ref = choiceArr[0];
    let label = choiceArr[1];

    let f1 = 0.7;
    let f2 = 0.85;

    let subContainer = new Container(window, 0, 0);
    subContainer.addElement(new Text(window, sizeX * f1, getBaseUISize() * 3, UI_CENTER, label));

    let xButton = new RadioToggleLabel(window, sizeX * (f2 - f1), getBaseUISize() * 3, UI_CENTER, "X", UI_AA_PLOT_XKEY, ref, () => COLOR_RED, () => COLOR_BLUE);
    let yButton = new RadioToggleLabel(window, sizeX * (1 - f2), getBaseUISize() * 3, UI_CENTER, "Y", UI_AA_PLOT_YKEY, ref, () => COLOR_RED, () => COLOR_BLUE);

    subContainer.addElement(xButton);
    subContainer.addElement(yButton);

    return subContainer;

}
