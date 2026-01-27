import { getBaseUISize } from "../../../../canvas.js";
import { getActiveClimate } from "../../../../climate/climateManager.js";
import { Container } from "../../../Container.js";
import { ButtonFunctionalText } from "../../../elements/ButtonFunctionalText.js";
import { PlotStarScatter } from "../../../elements/plots/PlotStarScatter.js";
import { Text } from "../../../elements/Text.js";
import { loadGD, saveGD, UI_CAMERA_OFFSET_VEC, UI_CAMERA_OFFSET_VEC_DT, UI_CENTER } from "../../../UIData.js";
import { getAstronomyAtlasComponent } from "../../../WindowManager.js";

export const resetViewportButtonOffset = getBaseUISize() * 2;

export function AstronomyAtlasModeFuncPlot(_this, container, sizeX, sizeY) {
    _this.plotStarScatter = new PlotStarScatter(_this.window, sizeX, sizeY - resetViewportButtonOffset);
    container.addElement(_this.plotStarScatter)
    let row = new Container(_this.window, 0, 0);
    container.addElement(row);

    let buttonMargin = getBaseUISize();
    let buttonWidth = _this.sizeX / 3;
    let middleMargin = (1 - (((buttonMargin * 2) + (buttonWidth * 2)) / sizeX)) * sizeX;

    console.log(_this.sizeX, buttonMargin, buttonWidth, middleMargin);

    row.addElement(new Text(_this.window, buttonMargin, getBaseUISize() * 3, UI_CENTER, ""));

    row.addElement(new ButtonFunctionalText(
        _this.window, buttonWidth, getBaseUISize() * 3, UI_CENTER, () => getAstronomyAtlasComponent().plotStarScatter.vr = [0, 1, 0, 1], () => "reset viewport",
        () => getActiveClimate().getPaletteRockColor(0.85))); 
    row.addElement(new Text(_this.window, middleMargin, getBaseUISize() * 3, UI_CENTER, ""));
    row.addElement(new ButtonFunctionalText(
        _this.window, buttonWidth, getBaseUISize() * 3, UI_CENTER, () => {
            saveGD(UI_CAMERA_OFFSET_VEC, [0, 0, 0, 0]);
            saveGD(UI_CAMERA_OFFSET_VEC_DT, [0, 0, 0, 0]);
        }, () => "reset camera",
        () => getActiveClimate().getPaletteRockColor(0.85)));
    row.addElement(new Text(_this.window, buttonMargin , getBaseUISize() * 3, UI_CENTER, ""));


    container.addElement(new Text(_this.window, getBaseUISize() * 3, getBaseUISize(), UI_CENTER, ""));
}
