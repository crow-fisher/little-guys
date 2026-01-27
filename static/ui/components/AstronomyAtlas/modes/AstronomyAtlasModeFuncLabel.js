import { getBaseUISize } from "../../../../canvas.js";
import { getActiveClimate } from "../../../../climate/climateManager.js";
import { gsh } from "../../../../climate/time.js";
import { COLOR_BLACK, COLOR_WHITE } from "../../../../colors.js";
import { Container } from "../../../Container.js";
import { RadioToggleLabel } from "../../../elements/RadioToggleLabel.js";
import { SliderGradientBackground } from "../../../elements/SliderGradientBackground.js";
import { StarSpecializedValuePicker } from "../../../elements/StarSpecializedValuePicker.js";
import { Text } from "../../../elements/Text.js";
import { UI_CENTER, UI_AA_LABEL_GRAPH, UI_AA_LABEL_STARS, UI_STARMAP_STAR_CONTROL_TOGGLE_MODE, UI_STARMAP_STAR_MAX_SIZE, addUIFunctionMap, UI_PLOTCONTAINER_XKEY, UI_PLOTCONTAINER_YKEY, UI_AA_SETUP_COLORMODE } from "../../../UIData.js";

export function AstronomyAtlasModeFuncLabel(window, container, sizeX, sizeY) {
    let row1 = new Container(window, 0, 0);
    let row2 = new Container(window, 0, 0);
    container.addElement(new Text(window, sizeX, getBaseUISize() * 3, UI_CENTER, "id numbering system (stars)"))
    container.addElement(row1);
    container.addElement(new Text(window, sizeX, getBaseUISize() * 3, UI_CENTER, "id numbering system (graph)"))
    container.addElement(row2);

    row1.addElement(new RadioToggleLabel(window, sizeX / 4, getBaseUISize() * 3, UI_CENTER, "none", UI_AA_LABEL_STARS, 0, () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
    row1.addElement(new RadioToggleLabel(window, sizeX / 4, getBaseUISize() * 3, UI_CENTER, "hipparcos", UI_AA_LABEL_STARS, 1, () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
    row1.addElement(new RadioToggleLabel(window, sizeX / 4, getBaseUISize() * 3, UI_CENTER, "henry draper", UI_AA_LABEL_STARS, 2, () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
    row1.addElement(new RadioToggleLabel(window, sizeX / (4 * 6), getBaseUISize() * 3, UI_CENTER, "x", UI_AA_LABEL_STARS, 3, () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
    row1.addElement(new RadioToggleLabel(window, sizeX / (4 * 6), getBaseUISize() * 3, UI_CENTER, "y", UI_AA_LABEL_STARS, 4, () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
    row1.addElement(new RadioToggleLabel(window, sizeX / (4 * 3), getBaseUISize() * 3, UI_CENTER, "color", UI_AA_LABEL_STARS, 5, () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
    row1.addElement(new RadioToggleLabel(window, sizeX / (4 * 3), getBaseUISize() * 3, UI_CENTER, "name", UI_AA_LABEL_STARS, 6, () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
    
    row2.addElement(new RadioToggleLabel(window, sizeX / 4, getBaseUISize() * 3, UI_CENTER, "none", UI_AA_LABEL_GRAPH, 0, () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
    row2.addElement(new RadioToggleLabel(window, sizeX / 4, getBaseUISize() * 3, UI_CENTER, "hipparcos", UI_AA_LABEL_GRAPH, 1, () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
    row2.addElement(new RadioToggleLabel(window, sizeX / 4, getBaseUISize() * 3, UI_CENTER, "henry draper", UI_AA_LABEL_GRAPH, 2, () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
    row2.addElement(new RadioToggleLabel(window, sizeX / (4 * 6), getBaseUISize() * 3, UI_CENTER, "x", UI_AA_LABEL_GRAPH, 3, () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
    row2.addElement(new RadioToggleLabel(window, sizeX / (4 * 6), getBaseUISize() * 3, UI_CENTER, "y", UI_AA_LABEL_GRAPH, 4, () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
    row2.addElement(new RadioToggleLabel(window, sizeX / (4 * 3), getBaseUISize() * 3, UI_CENTER, "color", UI_AA_LABEL_GRAPH, 5, () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
    row2.addElement(new RadioToggleLabel(window, sizeX / (4 * 3), getBaseUISize() * 3, UI_CENTER, "name", UI_AA_LABEL_GRAPH, 6, () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
}
addUIFunctionMap(UI_AA_LABEL_STARS, () => gsh().resetStarLabels());
addUIFunctionMap(UI_AA_LABEL_GRAPH, () => gsh().resetStarLabels());
addUIFunctionMap(UI_PLOTCONTAINER_XKEY, () => gsh().resetStarLabels());
addUIFunctionMap(UI_PLOTCONTAINER_YKEY, () => gsh().resetStarLabels());
addUIFunctionMap(UI_AA_SETUP_COLORMODE, () => gsh().resetStarLabels());
