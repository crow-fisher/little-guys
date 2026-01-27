import { gsh } from "../../../../climate/time.js";
import { UI_AA_LABEL_GRAPH, UI_AA_LABEL_STARS, addUIFunctionMap, UI_AA_PLOT_XKEY, UI_AA_PLOT_YKEY, UI_AA_SETUP_COLORMODE, UI_STARMAP_STAR_MAX_SIZE, UI_STARMAP_STAR_MIN_SIZE, UI_AA_SETUP_MIN, UI_AA_SELECTED_OPACITY } from "../../../UIData.js";

import { UI_AA_SETUP_WINDOW_SIZE, UI_AA_SETUP_POW, UI_AA_SETUP_MULT, UI_AA_SETUP_SELECT_MULT, UI_AA_PLOT_LOCALITY_SELECTMODE, UI_AA_PLOT_SELECTRADIUS, UI_AA_PLOT_SELECT_NAMED_STARS } from "../../../UIData.js";
import { getAstronomyAtlasComponent } from "../../../WindowManager.js";

function resetGraphStyle() {
    getAstronomyAtlasComponent().plotStarScatter.triggerRecalculateColor();
}

function resetGraphPoints() {
    getAstronomyAtlasComponent().plotStarScatter.flagRepreparePoints();
}

export function initAAUIFunctionMaps() {
    addUIFunctionMap(UI_AA_LABEL_STARS, () => gsh().resetStarLabels());
    addUIFunctionMap(UI_AA_LABEL_GRAPH, () => gsh().resetStarLabels());
    addUIFunctionMap(UI_AA_PLOT_XKEY, () => gsh().resetStarLabels());
    addUIFunctionMap(UI_AA_PLOT_YKEY, () => gsh().resetStarLabels());
    addUIFunctionMap(UI_AA_SETUP_COLORMODE, () => gsh().resetStarLabels());


    addUIFunctionMap(UI_STARMAP_STAR_MAX_SIZE, resetGraphPoints);
    addUIFunctionMap(UI_STARMAP_STAR_MIN_SIZE, resetGraphPoints);

    addUIFunctionMap(UI_AA_SETUP_COLORMODE, resetGraphStyle);
    addUIFunctionMap(UI_AA_SETUP_MIN, resetGraphStyle);
    addUIFunctionMap(UI_AA_SETUP_WINDOW_SIZE, resetGraphStyle);
    addUIFunctionMap(UI_AA_SETUP_POW, resetGraphStyle);
    addUIFunctionMap(UI_AA_SETUP_MULT, resetGraphStyle);
    addUIFunctionMap(UI_AA_SETUP_SELECT_MULT, resetGraphStyle);
    addUIFunctionMap(UI_AA_PLOT_LOCALITY_SELECTMODE, resetGraphStyle);
    addUIFunctionMap(UI_AA_PLOT_SELECTRADIUS, resetGraphStyle);
    addUIFunctionMap(UI_AA_PLOT_SELECT_NAMED_STARS, resetGraphStyle);


    addUIFunctionMap(UI_AA_SELECTED_OPACITY, resetGraphStyle);
}