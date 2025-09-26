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
import { RadioToggleLabel } from "../elements/RadioToggleLabel.js";
import { Text } from "../elements/Text.js";
import { TextBackground } from "../elements/TextBackground.js";
import { loadGD, UI_CENTER, loadUI, UI_PALETTE_CLIPS_WAYPOINT_NAME, UI_PALETTE_CLIPS_WAYPOINT_DATAMAP, UI_UI_CURWORLD, UI_PALETTE_CLIPS_WAYPOINT_SELECT, saveGD } from "../UIData.js";


export class ClipComponent extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        let container = new Container(this.window, 0, 1);
        this.window.container = container;

        let sizeX = getBaseUISize() * 39;
        let half = sizeX / 2;
        let third = sizeX / 3;
        let quarter = sizeX / 4;
        let offsetX = getBaseUISize() * 0.8;

        let h1 = getBaseUISize() * 3;
        let h2 = getBaseUISize() * 2.5;
        let br = getBaseUISize() * .5;

        let textAlignOffsetX = getBaseUISize() * 0.64;

        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.75), 0.75, " "))
        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 3.8, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.66315, "clip editor"))
        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""));
        
        container.addElement(new CilpGallery(this.window, sizeX, getBaseUISize() * 32));
    }

    getWaypoints() {
        if (loadGD(UI_PALETTE_CLIPS_WAYPOINT_DATAMAP)[loadUI(UI_UI_CURWORLD)] == null) {
            loadGD(UI_PALETTE_CLIPS_WAYPOINT_DATAMAP)[loadUI(UI_UI_CURWORLD)] = [];
        }
        return loadGD(UI_PALETTE_CLIPS_WAYPOINT_DATAMAP)[loadUI(UI_UI_CURWORLD)];
    }

    setActiveWaypoint(i) {
        saveGD(UI_PALETTE_CLIPS_WAYPOINT_SELECT, i);
        saveGD(UI_PALETTE_CLIPS_WAYPOINT_NAME, this.getWaypoints().at(loadGD(UI_PALETTE_CLIPS_WAYPOINT_SELECT)).label);
    }

    handleTextInput() {
        let i = loadGD(UI_PALETTE_CLIPS_WAYPOINT_SELECT);
        if (i >= this.getWaypoints().length || i < 0) 
            return;
        let c = this.getWaypoints()[i];
        c.label = loadGD(UI_PALETTE_CLIPS_WAYPOINT_NAME);
    }
}

class Waypoint {
    constructor() {
        this.posX = -1;
        this.posY = -1;
        this.target = -1;
        this.label = "New waypoint";
    }

}