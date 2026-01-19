import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
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
import { Text } from "../elements/Text.js";
import { TextBackground } from "../elements/TextBackground.js";
import { loadGD, UI_CENTER, loadUI, UI_PALETTE_CLIPS_WAYPOINT_NAME, UI_PALETTE_CLIPS_WAYPOINT_DATAMAP, UI_UI_CURWORLD, UI_PALETTE_CLIPS_WAYPOINT_SELECT, saveGD, UI_PLOTCONTAINER_WIDTH, UI_PLOTCONTAINER_HEIGHT } from "../UIData.js";


export class PlotContainerComponent extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        let container = new Container(this.window, 0, 1);
        this.window.container = container;

        let sizeX = loadGD(UI_PLOTCONTAINER_WIDTH);
        let sizeY = loadGD(UI_PLOTCONTAINER_HEIGHT);
        
        this.plotStarScatter = new PlotStarScatter(this.window, sizeX, sizeY);

        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.75), 0.75, " "))
        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 3.8, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.66315, "plot container"))
        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""));

        container.addElement( this.plotStarScatter)
    }
}