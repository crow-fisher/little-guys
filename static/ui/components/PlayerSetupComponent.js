import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { UI_BIGDOTHOLLOW, UI_BIGDOTSOLID } from "../../common.js";
import { Component } from "../Component.js";
import { ConditionalContainer } from "../ConditionalContainer.js";
import { Container } from "../Container.js";
import { Button } from "../elements/Button.js";
import { ButtonFunctionalText } from "../elements/ButtonFunctionalText.js";
import { EditableText } from "../elements/EditableText.js";
import { Text } from "../elements/Text.js";
import { TextBackground } from "../elements/TextBackground.js";
import { loadGD, UI_CENTER, loadUI, UI_PLAYER_SETUP_WAYPOINT_NAME, UI_PLAYER_SETUP_WAYPOINT_DATAMAP, UI_UI_CURWORLD, UI_PLAYER_SETUP_WAYPOINT_SELECT, saveGD } from "../UIData.js";


export class PlayerSetupComponent extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        let sizeX = getBaseUISize() * 32;
        let halfSizeX = sizeX / 2;
        let container = new Container(this.window, padding, 1);
        this.window.container = container;

        this.numWaypoints = 5;

        let h1 = getBaseUISize() * 3;
        let h2 = getBaseUISize() * 2.5;
        let br = getBaseUISize() * .5;
        let textAlignOffsetX = getBaseUISize() * 0.91;

        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.75), 0.75, " "))
        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 3.8, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.66315, "player editor"))
        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""));
        let waypointArr = this.getIterWaypoints();
        for (let _i = 0; _i < this.numWaypoints; _i++) {
            let iCopy = _i;
            let slotEmptyConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => waypointArr.length <= iCopy);
            slotEmptyConditionalContainer.addElement(new TextBackground(this.window, sizeX, h2, UI_CENTER, () => "#999999", 0.75, " - slot empty - "));
            container.addElement(slotEmptyConditionalContainer);

            let slotFilledConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => waypointArr.length > iCopy);
            container.addElement(slotFilledConditionalContainer);

            let row = new Container(this.window, 0, 0);
            slotFilledConditionalContainer.addElement(row);

            let colorFunc1 = () => loadGD(UI_PLAYER_SETUP_WAYPOINT_SELECT) == iCopy ? getActiveClimate().getUIColorActive() : getActiveClimate().getUIColorInactiveCustom([0.65, 0.55, 0.62, 0.58, 0.61, 0.67][_i % 6]);
            let colorFunc2 = () => getActiveClimate().getUIColorInactiveCustom(0.1 + [0.65, 0.55, 0.62, 0.58, 0.61, 0.67][_i % 6]);

            row.addElement(new ButtonFunctionalText(this.window, sizeX * (4 / 5), getBaseUISize() * 3, textAlignOffsetX, () => saveGD(UI_PLAYER_SETUP_WAYPOINT_SELECT, iCopy),
                () => waypointArr[iCopy].label, colorFunc1));
            row.addElement(new ButtonFunctionalText(this.window, sizeX * (1 / 5), getBaseUISize() * 3, textAlignOffsetX,
                () => waypointArr[loadGD(UI_PLAYER_SETUP_WAYPOINT_SELECT)].target = iCopy,
                () => waypointArr[loadGD(UI_PLAYER_SETUP_WAYPOINT_SELECT)].target == iCopy ? UI_BIGDOTSOLID : UI_BIGDOTHOLLOW, colorFunc2));
        }

        container.addElement(new Button(this.window, sizeX, h1, UI_CENTER, () => {
            this.createNewWaypoint();
            saveGD(UI_PLAYER_SETUP_WAYPOINT_SELECT, waypointArr.length - 1);
        }, "add waypoint",
            () => getActiveClimate().getUIColorInactiveCustom(0.75)));
        container.addElement(new EditableText(this.window, sizeX, h1, UI_CENTER, UI_PLAYER_SETUP_WAYPOINT_NAME))
    }

    getIterWaypoints() {
        if (loadGD(UI_PLAYER_SETUP_WAYPOINT_DATAMAP)[loadUI(UI_UI_CURWORLD)] == null) {
            loadGD(UI_PLAYER_SETUP_WAYPOINT_DATAMAP)[loadUI(UI_UI_CURWORLD)] = [];
        }
        return loadGD(UI_PLAYER_SETUP_WAYPOINT_DATAMAP)[loadUI(UI_UI_CURWORLD)];
    }

    createNewWaypoint() {
        let arr = this.getIterWaypoints();
        arr.push(new Waypoint());

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