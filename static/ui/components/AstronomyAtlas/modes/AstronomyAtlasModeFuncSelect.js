import { getBaseUISize } from "../../../../canvas.js";
import { getActiveClimate } from "../../../../climate/climateManager.js";
import { COLOR_BLACK, COLOR_WHITE } from "../../../../colors.js";
import { Container } from "../../../Container.js";
import { RadioToggleLabel } from "../../../elements/RadioToggleLabel.js";
import { SliderGradientBackground } from "../../../elements/SliderGradientBackground.js";
import { StarSpecializedValuePicker } from "../../../elements/StarSpecializedValuePicker.js";
import { Text } from "../../../elements/Text.js";
import { Toggle } from "../../../elements/Toggle.js";
import { UI_CENTER, UI_AA_SELECT_FILTERMODE_GRAPH, UI_AA_SELECT_FILTERMODE_STARS, UI_AA_PLOT_LOCALITY_SELECTMODE, UI_AA_PLOT_SELECT_NAMED_STARS, UI_AA_PLOT_SELECTRADIUS, UI_STARMAP_STAR_CONTROL_TOGGLE_MODE, UI_SH_MINSIZE } from "../../../UIData.js";
import { resetStarStyle } from "./AstronomyAtlasUIFunctionMaps.js";

export function AstronomyAtlasModeFuncSelect(window, container, sizeX, sizeY) {
    let row1 = new Container(window, 0, 0);
    let row2 = new Container(window, 0, 0);
    let row3 = new Container(window, 0, 0);
    container.addElement(new Text(window, sizeX, getBaseUISize() * 3, UI_CENTER, "filter graph to"))
    container.addElement(row1);
    row1.addElement(new RadioToggleLabel(window, sizeX / 3, getBaseUISize() * 3, UI_CENTER, "(no filter)", UI_AA_SELECT_FILTERMODE_GRAPH, 0, () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
    row1.addElement(new RadioToggleLabel(window, sizeX / 3, getBaseUISize() * 3, UI_CENTER, "visible stars", UI_AA_SELECT_FILTERMODE_GRAPH, 1, () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
    row1.addElement(new RadioToggleLabel(window, sizeX / 3, getBaseUISize() * 3, UI_CENTER, "selected stars", UI_AA_SELECT_FILTERMODE_GRAPH, 2, () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
    container.addElement(new Text(window, sizeX, getBaseUISize() * 3, UI_CENTER, "filter stars to"))
    container.addElement(row2);
    row2.addElement(new RadioToggleLabel(window, sizeX / 3, getBaseUISize() * 3, UI_CENTER, "(no filter)", UI_AA_SELECT_FILTERMODE_STARS, 0, () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
    row2.addElement(new RadioToggleLabel(window, sizeX / 3, getBaseUISize() * 3, UI_CENTER, "graphed stars", UI_AA_SELECT_FILTERMODE_STARS, 1, () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
    row2.addElement(new RadioToggleLabel(window, sizeX / 3, getBaseUISize() * 3, UI_CENTER, "selected stars", UI_AA_SELECT_FILTERMODE_STARS, 2, () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
    container.addElement(new Text(window, sizeX, getBaseUISize() * 3, UI_CENTER, "locality select mode"));
    container.addElement(row3);
    row3.addElement(new RadioToggleLabel(window, sizeX / 3, getBaseUISize() * 3, UI_CENTER, "none", UI_AA_PLOT_LOCALITY_SELECTMODE, 0, () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
    row3.addElement(new RadioToggleLabel(window, sizeX / 3, getBaseUISize() * 3, UI_CENTER, "local", UI_AA_PLOT_LOCALITY_SELECTMODE, 1, () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
    row3.addElement(new RadioToggleLabel(window, sizeX / 3, getBaseUISize() * 3, UI_CENTER, "persist", UI_AA_PLOT_LOCALITY_SELECTMODE, 2, () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
    container.addElement(new Text(window, sizeX, getBaseUISize() * 3, UI_CENTER, "locality select range"));
    container.addElement(new SliderGradientBackground(window, UI_AA_PLOT_SELECTRADIUS, sizeX, getBaseUISize() * 3, 0, 20, () => COLOR_WHITE, () => COLOR_BLACK, false, resetStarStyle));
    container.addElement(new Toggle(window, sizeX, getBaseUISize() * 3, UI_CENTER, UI_AA_PLOT_SELECT_NAMED_STARS, "select all named stars", () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
}