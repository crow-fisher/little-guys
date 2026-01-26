import { getBaseUISize } from "../../canvas.js";
import { COLOR_BLACK, COLOR_BLUE, COLOR_RED, COLOR_WHITE } from "../../colors.js";
import { Container } from "../Container.js";
import { RadioToggleLabel } from "../elements/RadioToggleLabel.js";
import { SliderGradientBackground } from "../elements/SliderGradientBackground.js";
import { StarSpecializedValuePicker } from "../elements/StarSpecializedValuePicker.js";
import { Text } from "../elements/Text.js";
import { UI_CENTER, UI_STARMAP_STAR_MAX_SIZE, UI_STARMAP_STAR_CONTROL_TOGGLE_MODE } from "../UIData.js";


export function addPlotStarStyleToContainer(window, container, sizeX, sizeY) {
    let half = sizeX / 2;
    let textHeight = getBaseUISize() * 3;
    container.addElement(new Text(window, sizeX, textHeight, UI_CENTER, "floating controls"))
    container.addElement(new StarSpecializedValuePicker(window, sizeX, sizeY));
    let row = new Container(window, 0, 0);
    container.addElement(row);
    row.addElement(new RadioToggleLabel(window, half, textHeight, UI_CENTER, "size", UI_STARMAP_STAR_CONTROL_TOGGLE_MODE, 0, () => COLOR_RED, () => COLOR_BLUE));
    row.addElement(new RadioToggleLabel(window, half, textHeight, UI_CENTER, "color", UI_STARMAP_STAR_CONTROL_TOGGLE_MODE, 1, () => COLOR_RED, () => COLOR_BLUE));
    container.addElement(new Text(window, sizeX, textHeight, UI_CENTER, "base size"))
    container.addElement(new SliderGradientBackground(window, UI_STARMAP_STAR_MAX_SIZE, sizeX, getBaseUISize() * 3, 1, 20, () => COLOR_WHITE, () => COLOR_BLACK));
}