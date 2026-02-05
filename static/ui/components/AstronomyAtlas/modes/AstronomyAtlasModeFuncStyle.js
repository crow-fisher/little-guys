import { getBaseUISize } from "../../../../canvas.js";
import { getActiveClimate } from "../../../../climate/climateManager.js";
import { COLOR_BLACK, COLOR_GREEN, COLOR_WHITE } from "../../../../colors.js";
import { processRangeToOne } from "../../../../common.js";
import { ConditionalContainer } from "../../../ConditionalContainer.js";
import { Container } from "../../../Container.js";
import { Button } from "../../../elements/Button.js";
import { RadioToggleLabel } from "../../../elements/RadioToggleLabel.js";
import { SliderGradientBackground } from "../../../elements/SliderGradientBackground.js";
import { StarSpecializedValuePicker } from "../../../elements/StarSpecializedValuePicker.js";
import { Text } from "../../../elements/Text.js";
import { Toggle } from "../../../elements/Toggle.js";
import { ToggleFunctionalText } from "../../../elements/ToggleFunctionalText.js";
import { UI_CENTER, UI_SH_MAXLUMINENCE, UI_SH_MINLUMINENCE, UI_STARMAP_STAR_CONTROL_TOGGLE_MODE, UI_SH_MINSIZE, UI_STARMAP_STAR_MIN_SIZE, UI_SH_DISTPOWERMULT, UI_SH_MAXSIZE, UI_SH_STYLE_BRIGHTNESS_C, UI_SH_STYLE_SIZE_C, UI_SH_MINMODE, loadGD, UI_SH_TARGETNUMSTARS, UI_AA_SETUP_DISPLAYTYPE_MIN, UI_SH_STYLE, UI_SH_STYLE_PRESETS } from "../../../UIData.js";
import { getCurStarParams } from "./_AstronomyAtlasStyleSerialization.js";
import { resetStarStyle } from "./AstronomyAtlasUIFunctionMaps.js";

let curPresetText = getCurStarParams();

export function AstronomyAtlasModeFuncStyle(window, container, sizeX, sizeY) {
    let half = sizeX / 2;
    let textHeight = getBaseUISize() * 3;

    let accentHeight = getBaseUISize() * 1;

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

    let f1 = .35;
    let f2 = .70;

    modeNumberStarsConditionalContainer.addElement(new Text(window, sizeX * f1, textHeight, UI_CENTER, "number of stars"));
    modeNumberStarsConditionalContainer.addElement(new SliderGradientBackground(window, UI_SH_TARGETNUMSTARS, sizeX * (f2 - f1), textHeight, 0, 20000, () => COLOR_BLACK, () => COLOR_WHITE));
    modeNumberStarsConditionalContainer.addElement(new ToggleFunctionalText(window, sizeX * (1 - f2), textHeight, UI_CENTER, null,
        () => loadGD(UI_SH_TARGETNUMSTARS).toFixed(0), () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorInactiveCustom(0.55)));
            
    modeMinLuminenceConditionalContainer.addElement(new Text(window, sizeX * f1, textHeight, UI_CENTER, "minimum lumens"));
    modeMinLuminenceConditionalContainer.addElement(new SliderGradientBackground(window, UI_SH_MINLUMINENCE, sizeX * (f2 - f1), textHeight, 0, 5, () => COLOR_BLACK, () => COLOR_WHITE, false, null, true));
    modeMinLuminenceConditionalContainer.addElement(new ToggleFunctionalText(window, sizeX * (1 - f2), textHeight, UI_CENTER, null,
        () => processRangeToOne(-1 * 10 ** (5 - loadGD(UI_SH_MINLUMINENCE))).toFixed(5) + " lumens", () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorInactiveCustom(0.55)));
    
        container.addElement(new SliderGradientBackground(window, UI_SH_MINLUMINENCE, sizeX, accentHeight, 0, 5, () => COLOR_BLACK, () => COLOR_WHITE, false, null, true));
    

    container.addElement(new Text(window, sizeX, textHeight, UI_CENTER, "max luminence"))
    container.addElement(new SliderGradientBackground(window, UI_SH_MAXLUMINENCE, sizeX, textHeight, -100, 5, () => COLOR_BLACK, () => COLOR_WHITE, false, resetStarStyle));
    container.addElement(new Text(window, sizeX, textHeight, UI_CENTER, "min size"))
    container.addElement(new SliderGradientBackground(window, UI_SH_MINSIZE, sizeX, textHeight, 0, 1, () => COLOR_BLACK, () => COLOR_WHITE, false, resetStarStyle));
    container.addElement(new Text(window, sizeX, textHeight, UI_CENTER, "star size"))
    container.addElement(new SliderGradientBackground(window, UI_SH_MAXSIZE, sizeX, textHeight, 0, 30, () => COLOR_BLACK, () => COLOR_WHITE, false, resetStarStyle));
    container.addElement(new Text(window, sizeX, textHeight, UI_CENTER, "distance pow"))
    container.addElement(new SliderGradientBackground(window, UI_SH_DISTPOWERMULT, sizeX, textHeight, 1, 4, () => COLOR_BLACK, () => COLOR_WHITE, false, resetStarStyle));
    

    container.addElement(new Toggle(window, sizeX, textHeight, UI_CENTER, UI_SH_STYLE_PRESETS, "presets",
    () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive(0.55)));


    // let stylePresetSelectModeRow = new Container(window, 0, 0);
    // container.addElement(stylePresetSelectModeRow);
    

    let stylePresetConditionalContainer = new ConditionalContainer(window, 0, 1, () => loadGD(UI_SH_STYLE_PRESETS));
    container.addElement(stylePresetConditionalContainer);


    stylePresetConditionalContainer.addElement(new Text(window, sizeX, textHeight, UI_CENTER, curPresetText));
    stylePresetConditionalContainer.addElement(new Button(window, sizeX, textHeight, UI_CENTER, () => curPresetText = getCurStarParams(), 
            "save current params", () => COLOR_GREEN));
        




}

