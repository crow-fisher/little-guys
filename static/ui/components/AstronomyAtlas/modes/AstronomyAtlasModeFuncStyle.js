import { getBaseUISize } from "../../../../canvas.js";
import { getActiveClimate } from "../../../../climate/climateManager.js";
import { COLOR_BLACK, COLOR_WHITE } from "../../../../colors.js";
import { Container } from "../../../Container.js";
import { RadioToggleLabel } from "../../../elements/RadioToggleLabel.js";
import { SliderGradientBackground } from "../../../elements/SliderGradientBackground.js";
import { StarSpecializedValuePicker } from "../../../elements/StarSpecializedValuePicker.js";
import { Text } from "../../../elements/Text.js";
import { UI_CENTER, UI_STARMAP_STAR_CONTROL_TOGGLE_MODE, UI_STARMAP_STAR_MAX_SIZE, UI_STARMAP_STAR_MIN_SIZE } from "../../../UIData.js";

export function AstronomyAtlasModeFuncStyle(window, container, sizeX, sizeY) {
    let half = sizeX / 2;
    let textHeight = getBaseUISize() * 3;
    container.addElement(new StarSpecializedValuePicker(window, sizeX, sizeY - (textHeight * 4)));
    let row = new Container(window, 0, 0);
    container.addElement(row);
    row.addElement(new RadioToggleLabel(window, half, textHeight, UI_CENTER, "size", UI_STARMAP_STAR_CONTROL_TOGGLE_MODE, 0,
    () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
    row.addElement(new RadioToggleLabel(window, half, textHeight, UI_CENTER, "color", UI_STARMAP_STAR_CONTROL_TOGGLE_MODE, 1,
         () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
    container.addElement(new Text(window, sizeX, textHeight, UI_CENTER, "base size"))
    container.addElement(new SliderGradientBackground(window, UI_STARMAP_STAR_MAX_SIZE, sizeX, textHeight, 1, 20, () => COLOR_BLACK, () => COLOR_WHITE));
    container.addElement(new Text(window, sizeX, textHeight, UI_CENTER, "min size"))
    container.addElement(new SliderGradientBackground(window, UI_STARMAP_STAR_MIN_SIZE, sizeX, textHeight, -3, 3, () => COLOR_BLACK, () => COLOR_WHITE));
}

