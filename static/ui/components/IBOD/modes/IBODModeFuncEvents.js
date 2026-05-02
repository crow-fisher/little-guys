import { getBaseUISize } from "../../../../canvas.js";
import { getActiveClimate } from "../../../../climate/climateManager.js";
import { COLOR_BLACK, COLOR_BLUE, COLOR_RED, COLOR_WHITE } from "../../../../colors.js";
import { ConditionalContainer } from "../../../ConditionalContainer.js";
import { Container } from "../../../Container.js";
import { ButtonFunctionalText } from "../../../elements/ButtonFunctionalText.js";
import { IBODEventViewer } from "../../../elements/IBODEventViewer.js";
import { PlotStarScatter } from "../../../elements/plots/PlotStarScatter.js";
import { RadioToggleLabel } from "../../../elements/RadioToggleLabel.js";
import { SliderGradientBackground } from "../../../elements/SliderGradientBackground.js";
import { Text } from "../../../elements/Text.js";
import { Toggle } from "../../../elements/Toggle.js";
import { loadGD, saveGD, UI_AA_PLOT_CONFIGURE, UI_AA_PLOT_HEIGHT, UI_AA_PLOT_PARAMS, UI_AA_PLOT_POINTOPACITY, UI_AA_PLOT_POINTSIZE, UI_AA_PLOT_WIDTH, UI_AA_PLOT_XKEY, UI_AA_PLOT_YKEY, UI_AA_SELECTED_OPACITY, UI_CAMERA_OFFSET_VEC, UI_CAMERA_OFFSET_VEC_DT, UI_CENTER } from "../../../UIData.js";
import { getIBODComponent } from "../../../WindowManager.js";

export const resetViewportButtonOffset = getBaseUISize() * 2;

export function IBODModeFuncEvents(_this, container, sizeX, sizeY) {
    let row = new Container(_this.window, 0, 0);
    container.addElement(new IBODEventViewer(_this.window, sizeX, sizeY));

    
}
