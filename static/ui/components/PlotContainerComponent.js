import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { gsh } from "../../climate/time.js";
import { COLOR_BLACK, COLOR_BLUE, COLOR_OTHER_BLUE, COLOR_RED, COLOR_WHITE } from "../../colors.js";
import { UI_BIGDOTHOLLOW, UI_BIGDOTSOLID } from "../../common.js";
import { Component } from "../Component.js";
import { ConditionalContainer } from "../ConditionalContainer.js";
import { Container } from "../Container.js";
import { Button } from "../elements/Button.js";
import { ButtonFunctionalText } from "../elements/ButtonFunctionalText.js";
import { CilpGallery } from "../elements/ClipGallery.js";
import { EditableText } from "../elements/EditableText.js";
import { PlotStarScatter } from "../elements/plots/PlotStarScatter.js";
import { RadioToggleLabel } from "../elements/RadioToggleLabel.js";
import { SliderGradientBackground } from "../elements/SliderGradientBackground.js";
import { Text } from "../elements/Text.js";
import { TextBackground } from "../elements/TextBackground.js";
import { loadGD, UI_CENTER, loadUI, UI_PALETTE_CLIPS_WAYPOINT_NAME, UI_PALETTE_CLIPS_WAYPOINT_DATAMAP, UI_UI_CURWORLD, UI_PALETTE_CLIPS_WAYPOINT_SELECT, saveGD, UI_PLOTCONTAINER_WIDTH, UI_PLOTCONTAINER_HEIGHT, UI_PLOTCONTAINER_FILTERMODE, UI_PLOTCONTAINER_IDSYSTEM, UI_PLOTCONTAINER_MAXZ } from "../UIData.js";


export class PlotContainerComponent extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        let container = new Container(this.window, 0, 1);
        this.window.container = container;

        this.plotSizeX = loadGD(UI_PLOTCONTAINER_WIDTH);
        this.plotSizeY = loadGD(UI_PLOTCONTAINER_HEIGHT);

        let addSpacing = () => container.addElement(new Text(this.window, this.plotSizeX, getBaseUISize() * 1, UI_CENTER, ""));
        
        this.plotStarScatter = new PlotStarScatter(this.window, this.plotSizeX, this.plotSizeY);

        container.addElement(new TextBackground(this.window, this.plotSizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.75), 0.75, " "))
        container.addElement(new TextBackground(this.window, this.plotSizeX, getBaseUISize() * 3.8, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.66315, "plot container"))
        container.addElement(new TextBackground(this.window, this.plotSizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""));

        container.addElement( this.plotStarScatter)

        let row1 = new Container(this.window, 0, 0);
        let row2 = new Container(this.window, 0, 0);

        
        let row3 = new Container(this.window, 0, 0);
        let row4 = new Container(this.window, 0, 0);

        container.addElement(row1);
        container.addElement(row2);

        row1.addElement(new RadioToggleLabel(this.window, this.plotSizeX / 2, getBaseUISize() * 3, UI_CENTER, "show all", UI_PLOTCONTAINER_FILTERMODE, 0, () => COLOR_BLUE, () => COLOR_RED));
        row1.addElement(new RadioToggleLabel(this.window, this.plotSizeX / 2, getBaseUISize() * 3, UI_CENTER, "filter graph to stars", UI_PLOTCONTAINER_FILTERMODE, 1, () => COLOR_BLUE, () => COLOR_RED));
        row2.addElement(new RadioToggleLabel(this.window, this.plotSizeX / 2, getBaseUISize() * 3, UI_CENTER, "filter stars to graph", UI_PLOTCONTAINER_FILTERMODE, 2, () => COLOR_BLUE, () => COLOR_RED));
        row2.addElement(new RadioToggleLabel(this.window, this.plotSizeX / 2, getBaseUISize() * 3, UI_CENTER, "filter stars to selected", UI_PLOTCONTAINER_FILTERMODE, 3, () => COLOR_BLUE, () => COLOR_RED));

        addSpacing();
        container.addElement(new Text(this.window, this.plotSizeX, getBaseUISize() * 3, UI_CENTER, "ID number type"))
        container.addElement(row3);
        row3.addElement(new RadioToggleLabel(this.window, this.plotSizeX / 2, getBaseUISize() * 3, UI_CENTER, "hipparcos", UI_PLOTCONTAINER_IDSYSTEM, 0, () => COLOR_BLUE, () => COLOR_RED));
        row3.addElement(new RadioToggleLabel(this.window, this.plotSizeX / 2, getBaseUISize() * 3, UI_CENTER, "henry draper", UI_PLOTCONTAINER_IDSYSTEM, 1, () => COLOR_BLUE, () => COLOR_RED));
        addSpacing();
        container.addElement(row4);
        row4.addElement(new Button(this.window, this.plotSizeX / 2, getBaseUISize() * 3, UI_CENTER, () => gsh().stars.forEach((star) => star.selected = false), "clear selection", () => COLOR_OTHER_BLUE))
        row4.addElement(new Button(this.window, this.plotSizeX / 2, getBaseUISize() * 3, UI_CENTER, () => gsh().stars.forEach((star) => star.selected = star.graphVisible), "select visible", () => COLOR_OTHER_BLUE));
        container.addElement(new Text(this.window, this.plotSizeX, getBaseUISize() * 3, UI_CENTER, "Max camera view dist"));
        container.addElement(new SliderGradientBackground(this.window, UI_PLOTCONTAINER_MAXZ, this.plotSizeX, getBaseUISize() * 3, 0, 10, () => COLOR_WHITE, () => COLOR_BLACK));
    }

    updateSizeX(sizeX) {
        let mult = sizeX / this.plotSizeX;
        this.plotSizeX = sizeX;
        this.plotStarScatter.updateSizeX(sizeX);
        this.window.container.elements.forEach((el) => el.updateSizeXByMult(mult));
    }
    
    updatePlotContainers() {
        this.plotStarScatter.update();
    }
}
