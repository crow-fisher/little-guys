
import { getBaseUISize } from "../../../../canvas.js";
import { getActiveClimate } from "../../../../climate/climateManager.js";
import { gsh } from "../../../../climate/time.js";
import { COLOR_BLACK, COLOR_WHITE } from "../../../../colors.js";
import { Container } from "../../../Container.js";
import { RadioToggleLabel } from "../../../elements/RadioToggleLabel.js";
import { SliderGradientBackground } from "../../../elements/SliderGradientBackground.js";
import { StarSpecializedValuePicker } from "../../../elements/StarSpecializedValuePicker.js";
import { Text } from "../../../elements/Text.js";
import { addUIFunctionMap, UI_AA_SETUP_COLORMODE, UI_AA_SETUP_WINDOW_SIZE, UI_AA_SETUP_MIN, UI_AA_SETUP_POW, UI_CENTER, UI_STARMAP_STAR_CONTROL_TOGGLE_MODE, UI_STARMAP_STAR_MAX_SIZE } from "../../../UIData.js";

export const astronomyAtlasSetupChoices = [
        [["default", "Temperature"], ["magnitude", "Rel. Mag"], ["magnitude_absolute", "Abs. Mag"]], 
        [["p_feH", "Metallicity"], ["parallax", "Parallax"], ["parsecs", "Parsecs"]]
    ];

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
    
    container.addElement(new SliderGradientBackground(window, UI_AA_SETUP_MIN, sizeX, textHeight, 0, 1, () => COLOR_BLACK, () => COLOR_WHITE));
    container.addElement(new SliderGradientBackground(window, UI_AA_SETUP_WINDOW_SIZE, sizeX, textHeight, 0, 1, () => COLOR_BLACK, () => COLOR_WHITE));
    container.addElement(new SliderGradientBackground(window, UI_AA_SETUP_POW, sizeX, textHeight, -5, 5, () => COLOR_BLACK, () => COLOR_WHITE));
} 

addUIFunctionMap(UI_AA_SETUP_COLORMODE, () => gsh().stars.forEach((star) => star.recalculateScreenFlag = true));
addUIFunctionMap(UI_AA_SETUP_MIN, () => gsh().stars.forEach((star) => star.recalculateScreenFlag = true));
addUIFunctionMap(UI_AA_SETUP_WINDOW_SIZE, () => gsh().stars.forEach((star) => star.recalculateScreenFlag = true));
addUIFunctionMap(UI_AA_SETUP_POW, () => gsh().stars.forEach((star) => star.recalculateScreenFlag = true));