
import { getBaseUISize } from "../../../../canvas.js";
import { getActiveClimate } from "../../../../climate/climateManager.js";
import { gsh } from "../../../../climate/time.js";
import { COLOR_BLACK, COLOR_WHITE } from "../../../../colors.js";
import { lerp } from "../../../../common.js";
import { ConditionalContainer } from "../../../ConditionalContainer.js";
import { Container } from "../../../Container.js";
import { RadioToggleLabel } from "../../../elements/RadioToggleLabel.js";
import { SliderGradientBackground } from "../../../elements/SliderGradientBackground.js";
import { StarSpecializedValuePicker } from "../../../elements/StarSpecializedValuePicker.js";
import { Text } from "../../../elements/Text.js";
import { ToggleFunctionalText } from "../../../elements/ToggleFunctionalText.js";
import { addUIFunctionMap, UI_AA_SETUP_COLORMODE, UI_AA_SETUP_WINDOW_SIZE, UI_AA_SETUP_MIN, UI_AA_SETUP_POW, UI_CENTER, UI_STARMAP_STAR_CONTROL_TOGGLE_MODE, UI_STARMAP_STAR_MAX_SIZE, UI_AA_SETUP_DISPLAYTYPE_MAX, UI_AA_SETUP_DISPLAYTYPE_MIN, UI_AA_SETUP_DISPLAYTYPE_WINDOW, loadGD } from "../../../UIData.js";

export const astronomyAtlasSetupChoices = [
    [["default", "Temperature"], ["magnitude", "Rel. Mag"], ["magnitude_absolute", "Abs. Mag"]],
    [["p_feH", "Metallicity"], ["parallax", "Parallax"], ["parsecs", "Parsecs"]]
];

export const unitMap = new Map();
unitMap.set(astronomyAtlasSetupChoices[0][0][0], "kelvin")
unitMap.set(astronomyAtlasSetupChoices[0][1][0], "mag")
unitMap.set(astronomyAtlasSetupChoices[0][2][0], "mag")
unitMap.set(astronomyAtlasSetupChoices[1][0][0], "percent")
unitMap.set(astronomyAtlasSetupChoices[1][1][0], "")
unitMap.set(astronomyAtlasSetupChoices[1][2][0], "parsecs")

function getDisplayValueString(displayTypeKey, targetParam, key) {
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

    let f1 = .25
    let f2 = 2 / 3;

    let specialModeControlConditionalContainer = new ConditionalContainer(window, 0, 1, () => loadGD(UI_AA_SETUP_COLORMODE) != "default");
    container.addElement(specialModeControlConditionalContainer);
    specialModeControlConditionalContainer.addElement(minRow);
    specialModeControlConditionalContainer.addElement(windowRow);
    specialModeControlConditionalContainer.addElement(powRow);

    minRow.addElement(new Text(window, sizeX * f1, textHeight, UI_CENTER, "minimum value"));
    minRow.addElement(new SliderGradientBackground(window, UI_AA_SETUP_MIN, sizeX * (f2 - f1), textHeight, 0, 1, () => COLOR_BLACK, () => COLOR_WHITE));
    minRow.addElement(new ToggleFunctionalText(window, sizeX * (1 - f2), textHeight, UI_CENTER, UI_AA_SETUP_DISPLAYTYPE_MIN,
        () => getDisplayValueString(UI_AA_SETUP_DISPLAYTYPE_MIN, loadGD(UI_AA_SETUP_COLORMODE), UI_AA_SETUP_MIN), () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));

    windowRow.addElement(new Text(window, sizeX * f1, textHeight, UI_CENTER, "window"));
    windowRow.addElement(new SliderGradientBackground(window, UI_AA_SETUP_WINDOW_SIZE, sizeX * (f2 - f1), textHeight, 0, 1, () => COLOR_BLACK, () => COLOR_WHITE));
    windowRow.addElement(new ToggleFunctionalText(window, sizeX * (1 - f2), textHeight, UI_CENTER, UI_AA_SETUP_DISPLAYTYPE_WINDOW,
        () => (loadGD(UI_AA_SETUP_WINDOW_SIZE) * 100).toFixed(2) + "%", () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));

    powRow.addElement(new Text(window, sizeX * f1, textHeight, UI_CENTER, "power"));
    powRow.addElement(new SliderGradientBackground(window, UI_AA_SETUP_POW, sizeX * (f2 - f1), textHeight, -1, 1, () => COLOR_BLACK, () => COLOR_WHITE));
    powRow.addElement(new ToggleFunctionalText(window, sizeX * (1 - f2), textHeight, UI_CENTER, UI_AA_SETUP_DISPLAYTYPE_MAX,
        () =>(loadGD(UI_AA_SETUP_POW)).toFixed(2) + "", () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
}

addUIFunctionMap(UI_AA_SETUP_COLORMODE, () => gsh().stars.forEach((star) => star.recalculateScreenFlag = true));
addUIFunctionMap(UI_AA_SETUP_MIN, () => gsh().stars.forEach((star) => star.recalculateScreenFlag = true));
addUIFunctionMap(UI_AA_SETUP_WINDOW_SIZE, () => gsh().stars.forEach((star) => star.recalculateScreenFlag = true));
addUIFunctionMap(UI_AA_SETUP_POW, () => gsh().stars.forEach((star) => star.recalculateScreenFlag = true));