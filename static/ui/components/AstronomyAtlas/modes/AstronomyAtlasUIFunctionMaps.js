import { getStarHandler } from "../../../../main.js";
import { UI_AA_LABEL_GRAPH, UI_AA_LABEL_STARS, addUIFunctionMap, UI_AA_PLOT_XKEY, UI_AA_PLOT_YKEY, UI_AA_SETUP_COLORMODE, UI_SH_BASESIZE, UI_STARMAP_STAR_MIN_SIZE, UI_AA_SETUP_MIN, UI_AA_SELECTED_OPACITY } from "../../../UIData.js";

import { UI_AA_SETUP_WINDOW_SIZE, UI_AA_SETUP_POW, UI_AA_SETUP_MULT, UI_AA_SETUP_SELECT_MULT, UI_AA_PLOT_LOCALITY_SELECTMODE, UI_AA_PLOT_SELECTRADIUS, UI_AA_PLOT_SELECT_NAMED_STARS } from "../../../UIData.js";
import { getAstronomyAtlasComponent } from "../../../WindowManager.js";

function resetStarStyle() {
    getStarHandler().stars.forEach((star) => star.recalculateAltColor());
    getStarHandler().resetStarLabels();
    resetGraphStyle();
}

function resetGraphStyle() {
    getAstronomyAtlasComponent().plotStarScatter.triggerRecalculateColor();
}

function resetGraphPoints() {
    getAstronomyAtlasComponent().plotStarScatter.flagRepreparePoints();
}

export function initAAUIFunctionMaps() {
    addUIFunctionMap(UI_AA_LABEL_STARS, () => getStarHandler().resetStarLabels());
    addUIFunctionMap(UI_AA_LABEL_GRAPH, () => getStarHandler().resetStarLabels());

    addUIFunctionMap(UI_SH_BASESIZE, resetGraphPoints);
    addUIFunctionMap(UI_STARMAP_STAR_MIN_SIZE, resetGraphPoints);

    addUIFunctionMap(UI_AA_SETUP_COLORMODE, resetStarStyle);
    addUIFunctionMap(UI_AA_PLOT_XKEY, resetStarStyle);
    addUIFunctionMap(UI_AA_PLOT_YKEY, resetStarStyle);

    addUIFunctionMap(UI_AA_SETUP_MIN, resetStarStyle);
    addUIFunctionMap(UI_AA_SETUP_WINDOW_SIZE, resetStarStyle);
    addUIFunctionMap(UI_AA_SETUP_POW, resetStarStyle);
    addUIFunctionMap(UI_AA_SETUP_MULT, resetStarStyle);
    addUIFunctionMap(UI_AA_SETUP_SELECT_MULT, resetStarStyle);
    
    addUIFunctionMap(UI_AA_PLOT_LOCALITY_SELECTMODE, resetGraphStyle);
    addUIFunctionMap(UI_AA_PLOT_SELECTRADIUS, resetGraphStyle);
    addUIFunctionMap(UI_AA_PLOT_SELECT_NAMED_STARS, resetGraphStyle);

    addUIFunctionMap(UI_AA_SELECTED_OPACITY, resetGraphStyle);

}