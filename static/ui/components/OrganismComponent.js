import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { Component } from "../Component.js";
import { ConditionalContainer } from "../ConditionalContainer.js";
import { Container } from "../Container.js";
import { Button } from "../elements/Button.js";
import { RadioToggle } from "../elements/RadioToggle.js";
import { RadioToggleLabel } from "../elements/RadioToggleLabel.js";
import { RowedRadio } from "../elements/RowedRadio.js";
import { SliderGradientBackgroundPlantConfigurator } from "../elements/SliderGradientBackgroundPlantConfigurator.js";
import { Text } from "../elements/Text.js";
import { TextBackground } from "../elements/TextBackground.js";
import { UI_ORGANISM_SELECT, UI_ORGANISM_GRASS_WHEAT, UI_ORGANISM_GRASS_KBLUE, UI_ORGANISM_GRASS_CATTAIL, UI_CENTER, UI_ORGANISM_TREE_PALM, saveGD, UI_ORGANISM_TYPE_SELECT, UI_ORGANISM_TYPE_MOSS, UI_ORGANISM_TYPE_GRASS, UI_ORGANISM_TYPE_FLOWER, UI_ORGANISM_TYPE_TREE, loadGD } from "../UIData.js";

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
          let br1 =  getBaseUISize() * .75;
          let br2 = getBaseUISize() * .5;
          let br3 = Math.round(getBaseUISize() * .25);

          container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.75), 0.75, " "))
          container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 3.8, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.66315, "plant editor"))
          container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""));

          let modeSelectRow1 = new Container(this.window, 0, 0);
          let modeSelectRow2 = new Container(this.window, 0, 0);

          container.addElement(modeSelectRow1);
          container.addElement(modeSelectRow2);
          container.addElement(new TextBackground(this.window, sizeX, br2, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""));

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
          // moss
          // grass 
          grassConditionalContainer.addElement(new RadioToggleLabel(this.window, sizeX, h1, offsetX, "wheat", UI_ORGANISM_SELECT, UI_ORGANISM_GRASS_WHEAT,
               () => getActiveClimate().getUIColorInactiveCustom(0.60), () => getActiveClimate().getUIColorInactiveCustom(0.52)));
          grassConditionalContainer.addElement(new RadioToggleLabel(this.window, sizeX, h1, offsetX, "kentucky bluegrass", UI_ORGANISM_SELECT, UI_ORGANISM_GRASS_KBLUE,
               () => getActiveClimate().getUIColorInactiveCustom(0.63), () => getActiveClimate().getUIColorInactiveCustom(0.53)));
          grassConditionalContainer.addElement(new RadioToggleLabel(this.window, sizeX, h1, offsetX, "cattail", UI_ORGANISM_SELECT, UI_ORGANISM_GRASS_CATTAIL,
               () => getActiveClimate().getUIColorInactiveCustom(0.68), () => getActiveClimate().getUIColorInactiveCustom(0.52)));
          grassConditionalContainer.addElement(new TextBackground(this.window, sizeX, br2, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""))

          let wheatConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_ORGANISM_SELECT) == UI_ORGANISM_GRASS_WHEAT);
          let kblueConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_ORGANISM_SELECT) == UI_ORGANISM_GRASS_KBLUE);
          let cattailConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_ORGANISM_SELECT) == UI_ORGANISM_GRASS_CATTAIL);

          grassConditionalContainer.addElement(wheatConditionalContainer);
          grassConditionalContainer.addElement(kblueConditionalContainer);
          grassConditionalContainer.addElement(cattailConditionalContainer);

          wheatConditionalContainer.addElement(new TextBackground(this.window, sizeX, h2, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.75, "wheat: the cereal central to life", "italic"))
          wheatConditionalContainer.addElement(new TextBackground(this.window, sizeX, br3, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""))
          wheatConditionalContainer.addElement(new TextBackground(this.window, sizeX, h2, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.50), 0.75, "drained soils, full sun"))
          wheatConditionalContainer.addElement(new TextBackground(this.window, sizeX, h2, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.75, "growing time: 2 cycles"))
          wheatConditionalContainer.addElement(new TextBackground(this.window, sizeX, h2, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.51), 0.75, "value: 10 coins"))

          kblueConditionalContainer.addElement(new TextBackground(this.window, sizeX, h2, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.75, "kentucky blue: a boring grass", "italic"))
          kblueConditionalContainer.addElement(new TextBackground(this.window, sizeX, br3, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""))
          kblueConditionalContainer.addElement(new TextBackground(this.window, sizeX, h2, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.50), 0.75, "drained soils, partial sun"))
          kblueConditionalContainer.addElement(new TextBackground(this.window, sizeX, h2, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.75, "growing time: 1 cycle"))
          kblueConditionalContainer.addElement(new TextBackground(this.window, sizeX, h2, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.51), 0.75, "value: 1 coin"))

          cattailConditionalContainer.addElement(new TextBackground(this.window, sizeX, h2, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.75, "cattails: the forbidden corndogs", "italic"))
          cattailConditionalContainer.addElement(new TextBackground(this.window, sizeX, br3, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""))
          cattailConditionalContainer.addElement(new TextBackground(this.window, sizeX, h2, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.50), 0.75, "wet soils, partial sun"))
          cattailConditionalContainer.addElement(new TextBackground(this.window, sizeX, h2, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.75, "growing time: 4 cycles"))
          cattailConditionalContainer.addElement(new TextBackground(this.window, sizeX, h2, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.51), 0.75, "value: 15 coins"))
          // flower 
          // tree
          // end
          
          container.addElement(new TextBackground(this.window, sizeX, br2, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""))
          container.addElement(new TextBackground(this.window, sizeX, h1, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.51), 0.75, "evolution parameters"))
          container.addElement(new TextBackground(this.window, sizeX, br3, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""))
          container.addElement(new TextBackground(this.window, sizeX, h2, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.58), 0.75, "target light level"))

          container.addElement(new SliderGradientBackgroundPlantConfigurator(this.window, sizeX, h1));
     }
}
