import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { Component } from "../Component.js";
import { ConditionalContainer } from "../ConditionalContainer.js";
import { Container } from "../Container.js";
import { Button } from "../elements/Button.js";
import { RadioToggle } from "../elements/RadioToggle.js";
import { RadioToggleLabel } from "../elements/RadioToggleLabel.js";
import { RowedRadio } from "../elements/RowedRadio.js";
import { Text } from "../elements/Text.js";
import { TextBackground } from "../elements/TextBackground.js";
import { UI_ORGANISM_SELECT, UI_ORGANISM_WHEAT, UI_ORGANISM_GRASS, UI_ORGANISM_CATTAIL, UI_CENTER, UI_ORGANISM_MUSHROOM, saveGD, UI_ORGANISM_TYPE_SELECT, UI_ORGANISM_TYPE_MOSS, UI_ORGANISM_TYPE_GRASS, UI_ORGANISM_TYPE_FLOWER, UI_ORGANISM_TYPE_TREE, loadGD } from "../UIData.js";

export class OrganismComponent extends Component {
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

        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.75), 0.75, " "))
        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 3.8, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.66315, "plant editor"))
        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""));

        let modeSelectRow1 = new Container(this.window, 0, 0);
        let modeSelectRow2 = new Container(this.window, 0, 0);

        container.addElement(modeSelectRow1);
        container.addElement(modeSelectRow2);

        modeSelectRow1.addElement(new RadioToggleLabel(this.window, half, h1, offsetX, "mosses", UI_ORGANISM_TYPE_SELECT, UI_ORGANISM_TYPE_MOSS,
             () => getActiveClimate().getUIColorInactiveCustom(0.57), () => getActiveClimate().getUIColorInactiveCustom(0.50)));
        modeSelectRow1.addElement(new RadioToggleLabel(this.window, half, h1, offsetX, "grasses", UI_ORGANISM_TYPE_SELECT, UI_ORGANISM_TYPE_GRASS,
             () => getActiveClimate().getUIColorInactiveCustom(0.61), () => getActiveClimate().getUIColorInactiveCustom(0.50)));
        modeSelectRow2.addElement(new RadioToggleLabel(this.window, half, h1, offsetX, "flowers", UI_ORGANISM_TYPE_SELECT, UI_ORGANISM_TYPE_FLOWER,
             () => getActiveClimate().getUIColorInactiveCustom(0.64), () => getActiveClimate().getUIColorInactiveCustom(0.50)));
        modeSelectRow2.addElement(new RadioToggleLabel(this.window, half, h1, offsetX, "trees", UI_ORGANISM_TYPE_SELECT, UI_ORGANISM_TYPE_TREE,
             () => getActiveClimate().getUIColorInactiveCustom(0.59), () => getActiveClimate().getUIColorInactiveCustom(0.50)));

        let mossConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_ORGANISM_TYPE_SELECT) == UI_ORGANISM_TYPE_MOSS);
        let grassConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_ORGANISM_TYPE_SELECT) == UI_ORGANISM_TYPE_GRASS);
        let flowerConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_ORGANISM_TYPE_SELECT) == UI_ORGANISM_TYPE_FLOWER);
        let treeConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_ORGANISM_TYPE_SELECT) == UI_ORGANISM_TYPE_TREE);
        
        container.addElement(mossConditionalContainer);
        container.addElement(grassConditionalContainer);
        container.addElement(flowerConditionalContainer);
        container.addElement(treeConditionalContainer);

        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 2, UI_CENTER, "midwest"));
        container.addElement(new RowedRadio(this.window, sizeX, getBaseUISize() * 4, UI_CENTER, UI_ORGANISM_SELECT, 2, [
            UI_ORGANISM_GRASS,
            UI_ORGANISM_GRASS,
            UI_ORGANISM_GRASS,
            UI_ORGANISM_GRASS
        ], () => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorActive()));

        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 2, UI_CENTER, "palm tree"));
        
        let row1 = new Container(this.window, 0, 0);
        let row2 = new Container(this.window, 0, 0);

        container.addElement(row1);
        container.addElement(row2);

        row1.addElement(new RadioToggleLabel(this.window, sizeX / 2, h2, UI_CENTER, "random mush", UI_ORGANISM_SELECT, "mushroom1", () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive()));
        row1.addElement(new RadioToggleLabel(this.window, sizeX / 2, h2, UI_CENTER, "flipped mush", UI_ORGANISM_SELECT, "mushroom2", () => getActiveClimate().getUIColorInactiveCustom(0.65), () => getActiveClimate().getUIColorActive()));
        row2.addElement(new RadioToggleLabel(this.window, sizeX / 2, h2, UI_CENTER, "short mush", UI_ORGANISM_SELECT, "mushroom3", () => getActiveClimate().getUIColorInactiveCustom(0.58), () => getActiveClimate().getUIColorActive()));
        row2.addElement(new RadioToggleLabel(this.window, sizeX / 2, h2, UI_CENTER, "tall mush", UI_ORGANISM_SELECT, "mushroom4", () => getActiveClimate().getUIColorInactiveCustom(0.62), () => getActiveClimate().getUIColorActive()));

        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 2, UI_CENTER, "moss"));
        
        let row3 = new Container(this.window, 0, 0);
        let row4 = new Container(this.window, 0, 0);

        container.addElement(row3);
        container.addElement(row4);

        row3.addElement(new RadioToggleLabel(this.window, sizeX / 2, h2, UI_CENTER, "random mush", UI_ORGANISM_SELECT, "mushroom1", () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive()));
        row3.addElement(new RadioToggleLabel(this.window, sizeX / 2, h2, UI_CENTER, "flipped mush", UI_ORGANISM_SELECT, "mushroom2", () => getActiveClimate().getUIColorInactiveCustom(0.65), () => getActiveClimate().getUIColorActive()));
        row4.addElement(new RadioToggleLabel(this.window, sizeX / 2, h2, UI_CENTER, "short mush", UI_ORGANISM_SELECT, "mushroom3", () => getActiveClimate().getUIColorInactiveCustom(0.58), () => getActiveClimate().getUIColorActive()));
        row4.addElement(new RadioToggleLabel(this.window, sizeX / 2, h2, UI_CENTER, "tall mush", UI_ORGANISM_SELECT, "mushroom4", () => getActiveClimate().getUIColorInactiveCustom(0.62), () => getActiveClimate().getUIColorActive()));





    }
}