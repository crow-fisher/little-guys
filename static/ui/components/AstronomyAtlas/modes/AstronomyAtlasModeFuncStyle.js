import { getBaseUISize } from "../../../../canvas.js";
import { getActiveClimate } from "../../../../climate/climateManager.js";
import { COLOR_BLACK, COLOR_WHITE } from "../../../../colors.js";
import { ConditionalContainer } from "../../../ConditionalContainer.js";
import { Container } from "../../../Container.js";
import { RadioToggleLabel } from "../../../elements/RadioToggleLabel.js";
import { SliderGradientBackground } from "../../../elements/SliderGradientBackground.js";
import { StarSpecializedValuePicker } from "../../../elements/StarSpecializedValuePicker.js";
import { Text } from "../../../elements/Text.js";
import { Toggle } from "../../../elements/Toggle.js";
import { UI_CENTER, UI_SH_MAXLUMINENCE, UI_SH_MINLUMINENCE, UI_STARMAP_STAR_CONTROL_TOGGLE_MODE, UI_SH_MINSIZE, UI_STARMAP_STAR_MIN_SIZE, UI_SH_DISTPOWERMULT, UI_SH_MAXSIZE, UI_SH_STYLE_BRIGHTNESS_C, UI_SH_STYLE_SIZE_C, UI_SH_MINMODE, loadGD, UI_SH_TARGETNUMSTARS } from "../../../UIData.js";
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
    
    container.addElement(new Text(window, sizeX, textHeight, UI_CENTER, "brightness 'c'"))
    container.addElement(new SliderGradientBackground(window, UI_SH_STYLE_BRIGHTNESS_C, sizeX, textHeight, 0, 1, () => COLOR_BLACK, () => COLOR_WHITE, false, resetStarStyle));
    container.addElement(new Text(window, sizeX, textHeight, UI_CENTER, "size 'c'"))
    container.addElement(new SliderGradientBackground(window, UI_SH_STYLE_SIZE_C, sizeX, textHeight, 0, 1, () => COLOR_BLACK, () => COLOR_WHITE, false, resetStarStyle));


    container.addElement(new Text(window, sizeX, textHeight, UI_CENTER, "minimum luminence mode"))
    let minLuminanceModeRow = new Container(window, 0, 0);
    container.addElement(minLuminanceModeRow);
    minLuminanceModeRow.addElement(new RadioToggleLabel(window, half, textHeight, UI_CENTER, "by # stars", UI_SH_MINMODE, 0,
    () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
    minLuminanceModeRow.addElement(new RadioToggleLabel(window, half, textHeight, UI_CENTER, "direct", UI_SH_MINMODE, 1,
         () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));
    
    let modeNumberStarsConditionalContainer = new ConditionalContainer(window, 0, 0, () => loadGD(UI_SH_MINMODE) == 0);
    let modeMinLuminenceConditionalContainer = new ConditionalContainer(window, 0, 0, () => loadGD(UI_SH_MINMODE) == 1);

    container.addElement(modeNumberStarsConditionalContainer);
    container.addElement(modeMinLuminenceConditionalContainer);

    modeNumberStarsConditionalContainer.addElement(new SliderGradientBackground(window, UI_SH_TARGETNUMSTARS, sizeX, textHeight, 1000, 20000, () => COLOR_BLACK, () => COLOR_WHITE, false, resetStarStyle));
    modeMinLuminenceConditionalContainer.addElement(new SliderGradientBackground(window, UI_SH_MINLUMINENCE, sizeX, textHeight, 0, 5, () => COLOR_BLACK, () => COLOR_WHITE, false, resetStarStyle));

    container.addElement(new Text(window, sizeX, textHeight, UI_CENTER, "min luminence"))
    container.addElement(new SliderGradientBackground(window, UI_SH_MINLUMINENCE, sizeX, textHeight, 0, 5, () => COLOR_BLACK, () => COLOR_WHITE, false, resetStarStyle));
    
    container.addElement(new Text(window, sizeX, textHeight, UI_CENTER, "max luminence"))
    container.addElement(new SliderGradientBackground(window, UI_SH_MAXLUMINENCE, sizeX, textHeight, -100, 5, () => COLOR_BLACK, () => COLOR_WHITE, false, resetStarStyle));
    container.addElement(new Text(window, sizeX, textHeight, UI_CENTER, "min size"))
    container.addElement(new SliderGradientBackground(window, UI_SH_MINSIZE, sizeX, textHeight, 0, 1, () => COLOR_BLACK, () => COLOR_WHITE, false, resetStarStyle));
    container.addElement(new Text(window, sizeX, textHeight, UI_CENTER, "star size"))
    container.addElement(new SliderGradientBackground(window, UI_SH_MAXSIZE, sizeX, textHeight, 0, 30, () => COLOR_BLACK, () => COLOR_WHITE, false, resetStarStyle));
    container.addElement(new Text(window, sizeX, textHeight, UI_CENTER, "distance pow"))
    container.addElement(new SliderGradientBackground(window, UI_SH_DISTPOWERMULT, sizeX, textHeight, 1, 4, () => COLOR_BLACK, () => COLOR_WHITE, false, resetStarStyle));

}

