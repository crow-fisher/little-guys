import { getBaseUISize } from "../../../../canvas.js";
import { getActiveClimate } from "../../../../climate/climateManager.js";
import { COLOR_BLACK, COLOR_WHITE } from "../../../../colors.js";
import { Container } from "../../../Container.js";
import { RadioToggleLabel } from "../../../elements/RadioToggleLabel.js";
import { SliderGradientBackground } from "../../../elements/SliderGradientBackground.js";
import { StarSpecializedValuePicker } from "../../../elements/StarSpecializedValuePicker.js";
import { Text } from "../../../elements/Text.js";
import { UI_CENTER, UI_SH_MAXLUMINENCE, UI_SH_MINLUMINENCE, UI_STARMAP_STAR_CONTROL_TOGGLE_MODE, UI_SH_MINSIZE, UI_STARMAP_STAR_MIN_SIZE, UI_SH_DISTPOWERMULT, UI_SH_MAXSIZE } from "../../../UIData.js";
import { resetStarStyle } from "./AstronomyAtlasUIFunctionMaps.js";

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
        
    container.addElement(new Text(window, sizeX, textHeight, UI_CENTER, "min luminence"))
    container.addElement(new SliderGradientBackground(window, UI_SH_MINLUMINENCE, sizeX, textHeight, -20000, 550, () => COLOR_BLACK, () => COLOR_WHITE, false, resetStarStyle));
    container.addElement(new Text(window, sizeX, textHeight, UI_CENTER, "max luminence"))
    container.addElement(new SliderGradientBackground(window, UI_SH_MAXLUMINENCE, sizeX, textHeight, -300, 30, () => COLOR_BLACK, () => COLOR_WHITE, false, resetStarStyle));
    container.addElement(new Text(window, sizeX, textHeight, UI_CENTER, "min size"))
    container.addElement(new SliderGradientBackground(window, UI_SH_MINSIZE, sizeX, textHeight, -30, 30, () => COLOR_BLACK, () => COLOR_WHITE, false, resetStarStyle));
    container.addElement(new Text(window, sizeX, textHeight, UI_CENTER, "max size"))
    container.addElement(new SliderGradientBackground(window, UI_SH_MAXSIZE, sizeX, textHeight, -30, 30, () => COLOR_BLACK, () => COLOR_WHITE, false, resetStarStyle));
    container.addElement(new Text(window, sizeX, textHeight, UI_CENTER, "distance pow"))
    container.addElement(new SliderGradientBackground(window, UI_SH_DISTPOWERMULT, sizeX, textHeight, 1, 4, () => COLOR_BLACK, () => COLOR_WHITE, false, resetStarStyle));

}

