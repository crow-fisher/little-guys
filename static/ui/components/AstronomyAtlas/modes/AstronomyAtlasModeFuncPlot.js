import { getBaseUISize } from "../../../../canvas.js";
import { getActiveClimate } from "../../../../climate/climateManager.js";
import { ButtonFunctionalText } from "../../../elements/ButtonFunctionalText.js";
import { PlotStarScatter } from "../../../elements/plots/PlotStarScatter.js";
import { UI_CENTER } from "../../../UIData.js";
import { getAstronomyAtlasComponent } from "../../../WindowManager.js";

export function AstronomyAtlasModeFuncPlot(_this, container, sizeX, sizeY) {
        _this.plotStarScatter = new PlotStarScatter(_this.window, sizeX, sizeY);
        container.addElement(_this.plotStarScatter)
        container.addElement(new ButtonFunctionalText(
            _this.window, _this.sizeX / 3, getBaseUISize() * 3, UI_CENTER, () => getAstronomyAtlasComponent().plotStarScatter.vr = [0, 1, 0, 1], () => "reset viewport", 
            () => getActiveClimate().getPaletteRockColor(0.85)));
}
