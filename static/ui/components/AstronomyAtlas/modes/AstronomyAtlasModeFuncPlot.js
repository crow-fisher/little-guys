import { getBaseUISize } from "../../../../canvas.js";
import { getActiveClimate } from "../../../../climate/climateManager.js";
import { Container } from "../../../Container.js";
import { ButtonFunctionalText } from "../../../elements/ButtonFunctionalText.js";
import { PlotStarScatter } from "../../../elements/plots/PlotStarScatter.js";
import { Text } from "../../../elements/Text.js";
import { loadGD, UI_CENTER } from "../../../UIData.js";
import { getAstronomyAtlasComponent } from "../../../WindowManager.js";

export const resetViewportButtonOffset = getBaseUISize() * 2;

export function AstronomyAtlasModeFuncPlot(_this, container, sizeX, sizeY) {
        _this.plotStarScatter = new PlotStarScatter(_this.window, sizeX, sizeY - resetViewportButtonOffset);
        container.addElement(_this.plotStarScatter)
        let row = new Container(_this.window, 0, 0);
        container.addElement(row);
        row.addElement(new Text(_this.window, getBaseUISize(), getBaseUISize() * 3, UI_CENTER, ""));
        row.addElement(new ButtonFunctionalText(
            _this.window, _this.sizeX / 3, getBaseUISize() * 3, UI_CENTER, () => getAstronomyAtlasComponent().plotStarScatter.vr = [0, 1, 0, 1], () => "reset viewport", 
            () => getActiveClimate().getPaletteRockColor(0.85)));
            
        container.addElement(new Text(_this.window, getBaseUISize() * 3, getBaseUISize(), UI_CENTER, ""));
}
