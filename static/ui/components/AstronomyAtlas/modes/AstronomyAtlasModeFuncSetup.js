
import { getBaseUISize } from "../../../../canvas.js";
import { getActiveClimate } from "../../../../climate/climateManager.js";
import { gsh } from "../../../../climate/time.js";
import { COLOR_BLACK, COLOR_WHITE } from "../../../../colors.js";
import { lerp, processRangeToOne } from "../../../../common.js";
import { ConditionalContainer } from "../../../ConditionalContainer.js";
import { Container } from "../../../Container.js";
import { RadioToggleLabel } from "../../../elements/RadioToggleLabel.js";
import { SliderGradientBackground } from "../../../elements/SliderGradientBackground.js";
import { StarSpecializedValuePicker } from "../../../elements/StarSpecializedValuePicker.js";
import { Text } from "../../../elements/Text.js";
import { ToggleFunctionalText } from "../../../elements/ToggleFunctionalText.js";
import { addUIFunctionMap, UI_AA_SETUP_COLORMODE, UI_AA_SETUP_WINDOW_SIZE, UI_AA_SETUP_MIN, UI_AA_SETUP_POW, UI_CENTER, UI_STARMAP_STAR_CONTROL_TOGGLE_MODE, UI_STARMAP_STAR_MAX_SIZE, UI_AA_SETUP_DISPLAYTYPE_MAX, UI_AA_SETUP_DISPLAYTYPE_MIN, UI_AA_SETUP_DISPLAYTYPE_WINDOW, loadGD, UI_AA_SETUP_MULT, UI_AA_SETUP_DISPLAYTYPE_MULT, UI_AA_SETUP_DISPLAYTYPE_NAME_MULT, UI_AA_SETUP_NAME_MULT, UI_PLOTCONTAINER_LOCALITY_SELECTMODE, UI_PLOTCONTAINER_SELECTRADIUS, UI_PLOTCONTAINER_SELECT_NAMED_STARS } from "../../../UIData.js";
import { getAstronomyAtlasComponent } from "../../../WindowManager.js";

export const astronomyAtlasSetupChoices = [
    [["default", "Temperature"], ["magnitude", "Rel. Mag"], ["magnitude_absolute", "Abs. Mag"]],
    [["p_feH", "Metallicity"], ["parallax", "Parallax"], ["parsecs_log", "Parsecs (log)"]]
];

export const unitMap = new Map();
unitMap.set(astronomyAtlasSetupChoices[0][0][0], "kelvin")
unitMap.set(astronomyAtlasSetupChoices[0][1][0], "mag")
unitMap.set(astronomyAtlasSetupChoices[0][2][0], "mag")
unitMap.set(astronomyAtlasSetupChoices[1][0][0], "percent")
unitMap.set(astronomyAtlasSetupChoices[1][1][0], "")
unitMap.set(astronomyAtlasSetupChoices[1][2][0], "parsecs")

function getDisplayValueString(displayTypeKey, targetParam, key) {
    if (gsh()?.paramStatistics == null) {
        return;
    }
    let displayType = loadGD(displayTypeKey);
    let targetParamUnit = unitMap.get(targetParam);
    let st = gsh().paramStatistics.get(targetParam);
    let settingValue = loadGD(key);
    if (displayType) {
        return lerp(st[2], st[3], settingValue).toFixed(2) + " " + targetParamUnit
    }
    return (settingValue * 100).toFixed(2) + "%"
}

export function AstronomyAtlasModeFuncSetup(window, container, sizeX, sizeY) {
    let half = sizeX / 2;
    let textHeight = getBaseUISize() * 3;
    container.addElement(new Text(window, sizeX, textHeight, UI_CENTER, "star coloring"))

    for (let i = 0; i < astronomyAtlasSetupChoices.length; i++) {
        let row = astronomyAtlasSetupChoices[i];
        let rowElement = new Container(window, 0, 0);
        container.addElement(rowElement);
        for (let j = 0; j < row.length; j++) {
            let pair = row[j];
            rowElement.addElement(new RadioToggleLabel(window, sizeX / row.length, textHeight, UI_CENTER, pair[1], UI_AA_SETUP_COLORMODE, pair[0],
                () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
        }
    }

    let minRow = new Container(window, 0, 0);
    let windowRow = new Container(window, 0, 0);
    let powRow = new Container(window, 0, 0);
    let multRow = new Container(window, 0, 0);
    let nameMultRow = new Container(window, 0, 0);

    let f1 = .45;
    let f2 = .70;

    let specialModeControlConditionalContainer = new ConditionalContainer(window, 0, 1, () => loadGD(UI_AA_SETUP_COLORMODE) != "default");
    
    container.addElement(specialModeControlConditionalContainer);
    container.addElement(nameMultRow);

    specialModeControlConditionalContainer.addElement(minRow);
    specialModeControlConditionalContainer.addElement(windowRow);
    specialModeControlConditionalContainer.addElement(powRow);
    specialModeControlConditionalContainer.addElement(multRow);


    minRow.addElement(new Text(window, sizeX * f1, textHeight, UI_CENTER, "minimum value"));
    minRow.addElement(new SliderGradientBackground(window, UI_AA_SETUP_MIN, sizeX * (f2 - f1), textHeight, 0, 1, () => COLOR_BLACK, () => COLOR_WHITE));
    minRow.addElement(new ToggleFunctionalText(window, sizeX * (1 - f2), textHeight, UI_CENTER, UI_AA_SETUP_DISPLAYTYPE_MIN,
        () => getDisplayValueString(UI_AA_SETUP_DISPLAYTYPE_MIN, loadGD(UI_AA_SETUP_COLORMODE), UI_AA_SETUP_MIN), () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));

    windowRow.addElement(new Text(window, sizeX * f1, textHeight, UI_CENTER, "window"));
    windowRow.addElement(new SliderGradientBackground(window, UI_AA_SETUP_WINDOW_SIZE, sizeX * (f2 - f1), textHeight, 0, 1, () => COLOR_BLACK, () => COLOR_WHITE));
    windowRow.addElement(new ToggleFunctionalText(window, sizeX * (1 - f2), textHeight, UI_CENTER, UI_AA_SETUP_DISPLAYTYPE_WINDOW,
        () => (loadGD(UI_AA_SETUP_WINDOW_SIZE) * 100).toFixed(2) + "%", () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));

    powRow.addElement(new Text(window, sizeX * f1, textHeight, UI_CENTER, "power"));
    powRow.addElement(new SliderGradientBackground(window, UI_AA_SETUP_POW, sizeX * (f2 - f1), textHeight, -1, 5, () => COLOR_BLACK, () => COLOR_WHITE));
    powRow.addElement(new ToggleFunctionalText(window, sizeX * (1 - f2), textHeight, UI_CENTER, UI_AA_SETUP_DISPLAYTYPE_MAX,
        () =>(loadGD(UI_AA_SETUP_POW)).toFixed(2) + "", () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));

    multRow.addElement(new Text(window, sizeX * f1, textHeight, UI_CENTER, "point brightness"));
    multRow.addElement(new SliderGradientBackground(window, UI_AA_SETUP_MULT, sizeX * (f2 - f1), textHeight, -3, 10, () => COLOR_BLACK, () => COLOR_WHITE));
    multRow.addElement(new ToggleFunctionalText(window, sizeX * (1 - f2), textHeight, UI_CENTER, UI_AA_SETUP_DISPLAYTYPE_MULT,
        () => 
            (loadGD(UI_AA_SETUP_DISPLAYTYPE_MULT) ? (Math.exp(loadGD(UI_AA_SETUP_MULT))) : loadGD(UI_AA_SETUP_MULT)).toFixed(2) + "",
         () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));

    nameMultRow.addElement(new Text(window, sizeX * f1, textHeight, UI_CENTER, "named stars"));
    nameMultRow.addElement(new SliderGradientBackground(window, UI_AA_SETUP_NAME_MULT, sizeX * (f2 - f1), textHeight, 0, 10, () => COLOR_BLACK, () => COLOR_WHITE));
    nameMultRow.addElement(new ToggleFunctionalText(window, sizeX * (1 - f2), textHeight, UI_CENTER, UI_AA_SETUP_DISPLAYTYPE_NAME_MULT,
        () => 
            (loadGD(UI_AA_SETUP_DISPLAYTYPE_NAME_MULT) ? 1 + Math.exp(loadGD(UI_AA_SETUP_NAME_MULT)) : loadGD(UI_AA_SETUP_NAME_MULT)).toFixed(2) + "",
         () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
}

export function triggerStarColorRecalculation() {
    gsh().stars.forEach((star) => {star.recalculateAltColor(); star.recalculateColorFlag = true});
    getAstronomyAtlasComponent().plotStarScatter._shouldRecalculateColor = true;
    gsh().resetStarLabels();
}

addUIFunctionMap(UI_AA_SETUP_COLORMODE, triggerStarColorRecalculation);
addUIFunctionMap(UI_AA_SETUP_MIN, triggerStarColorRecalculation);
addUIFunctionMap(UI_AA_SETUP_WINDOW_SIZE, triggerStarColorRecalculation);
addUIFunctionMap(UI_AA_SETUP_POW, triggerStarColorRecalculation);
addUIFunctionMap(UI_AA_SETUP_MULT, triggerStarColorRecalculation);
addUIFunctionMap(UI_AA_SETUP_NAME_MULT, triggerStarColorRecalculation);
addUIFunctionMap(UI_PLOTCONTAINER_LOCALITY_SELECTMODE, triggerStarColorRecalculation);
addUIFunctionMap(UI_PLOTCONTAINER_SELECTRADIUS, triggerStarColorRecalculation);
addUIFunctionMap(UI_PLOTCONTAINER_SELECT_NAMED_STARS, triggerStarColorRecalculation)