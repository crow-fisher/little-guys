import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { getCurTimeScaleVal } from "../../climate/time.js";
import { Container } from "../Container.js";
import { RadioToggle } from "../elements/RadioToggle.js";
import { RadioToggleLabel } from "../elements/RadioToggleLabel.js";
import { Text } from "../elements/Text.js";
import { Toggle } from "../elements/Toggle.js";
import { UI_CENTER, UI_DISPLAY_SIZEY as UI_SIMULATION_HEIGHT, UI_SIMULATION_CLOUDS, UI_SIMULATION_SIMPLESQUARE, UI_SIMULATION_GENS_PER_DAY } from "../UIData.js";
import { SubTreeComponent } from "./SubTreeComponent.js";


export class SimulationSubtree extends SubTreeComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        super(posXFunc, posYFunc, padding, dir, key);
        let subMenuContainer = new Container(this.window, 0, 1);
        this.window.container = subMenuContainer;
        let textAlignOffsetX = getBaseUISize() * 1.93;
        let sizeX = getBaseUISize() * 21;
        let radioSizeX = sizeX / 3;
        subMenuContainer.addElement(new Toggle(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, UI_SIMULATION_CLOUDS, "enable clouds",() => getActiveClimate().getUIColorInactiveCustom(0.56), () => getActiveClimate().getUIColorActive()));
        subMenuContainer.addElement(new Toggle(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, UI_SIMULATION_SIMPLESQUARE, "simple physics",() => getActiveClimate().getUIColorInactiveCustom(0.61), () => getActiveClimate().getUIColorActive()));
        subMenuContainer.addElement(new Text(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, UI_CENTER, "size"))

    
        let row1 =  new Container(this.window, 0, 0);
        let row2 =  new Container(this.window, 0, 0);
        let row3 =  new Container(this.window, 0, 0);
        let row4 =  new Container(this.window, 0, 0);
        let row5 =  new Container(this.window, 0, 0);

        row1.addElement(new RadioToggle(this.window, radioSizeX + (textAlignOffsetX / 3), getBaseUISize() * 3, UI_CENTER, UI_SIMULATION_HEIGHT, 75,() => getActiveClimate().getUIColorInactiveCustom(0.62), () => getActiveClimate().getUIColorActive()));
        row1.addElement(new RadioToggle(this.window, radioSizeX + (textAlignOffsetX / 3), getBaseUISize() * 3, UI_CENTER, UI_SIMULATION_HEIGHT, 100,() => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive()));
        row1.addElement(new RadioToggle(this.window, radioSizeX + (textAlignOffsetX / 3), getBaseUISize() * 3, UI_CENTER, UI_SIMULATION_HEIGHT, 125,() => getActiveClimate().getUIColorInactiveCustom(0.60), () => getActiveClimate().getUIColorActive()));
        row2.addElement(new RadioToggle(this.window, radioSizeX + (textAlignOffsetX / 3), getBaseUISize() * 3, UI_CENTER, UI_SIMULATION_HEIGHT, 150,() => getActiveClimate().getUIColorInactiveCustom(0.58), () => getActiveClimate().getUIColorActive()));
        row2.addElement(new RadioToggle(this.window, radioSizeX + (textAlignOffsetX / 3), getBaseUISize() * 3, UI_CENTER, UI_SIMULATION_HEIGHT, 175,() => getActiveClimate().getUIColorInactiveCustom(0.62), () => getActiveClimate().getUIColorActive()));
        row2.addElement(new RadioToggle(this.window, radioSizeX + (textAlignOffsetX / 3), getBaseUISize() * 3, UI_CENTER, UI_SIMULATION_HEIGHT, 200,() => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorActive()));
        row3.addElement(new RadioToggle(this.window, radioSizeX + (textAlignOffsetX / 3), getBaseUISize() * 3, UI_CENTER, UI_SIMULATION_HEIGHT, 225,() => getActiveClimate().getUIColorInactiveCustom(0.63), () => getActiveClimate().getUIColorActive()));
        row3.addElement(new RadioToggle(this.window, radioSizeX + (textAlignOffsetX / 3), getBaseUISize() * 3, UI_CENTER, UI_SIMULATION_HEIGHT, 250,() => getActiveClimate().getUIColorInactiveCustom(0.59), () => getActiveClimate().getUIColorActive()));
        row3.addElement(new RadioToggle(this.window, radioSizeX + (textAlignOffsetX / 3), getBaseUISize() * 3, UI_CENTER, UI_SIMULATION_HEIGHT, 275,() => getActiveClimate().getUIColorInactiveCustom(0.64), () => getActiveClimate().getUIColorActive()));
        row4.addElement(new RadioToggle(this.window, radioSizeX + (textAlignOffsetX / 3), getBaseUISize() * 3, UI_CENTER, UI_SIMULATION_HEIGHT, 300,() => getActiveClimate().getUIColorInactiveCustom(0.60), () => getActiveClimate().getUIColorActive()));
        row4.addElement(new RadioToggle(this.window, radioSizeX + (textAlignOffsetX / 3), getBaseUISize() * 3, UI_CENTER, UI_SIMULATION_HEIGHT, 350,() => getActiveClimate().getUIColorInactiveCustom(0.56), () => getActiveClimate().getUIColorActive()));
        row4.addElement(new RadioToggle(this.window, radioSizeX + (textAlignOffsetX / 3), getBaseUISize() * 3, UI_CENTER, UI_SIMULATION_HEIGHT, 400,() => getActiveClimate().getUIColorInactiveCustom(0.62), () => getActiveClimate().getUIColorActive()));
        row5.addElement(new RadioToggle(this.window, radioSizeX + (textAlignOffsetX / 3), getBaseUISize() * 3, UI_CENTER, UI_SIMULATION_HEIGHT, 450,() => getActiveClimate().getUIColorInactiveCustom(0.57), () => getActiveClimate().getUIColorActive()));
        row5.addElement(new RadioToggle(this.window, radioSizeX + (textAlignOffsetX / 3), getBaseUISize() * 3, UI_CENTER, UI_SIMULATION_HEIGHT, 500,() => getActiveClimate().getUIColorInactiveCustom(0.61), () => getActiveClimate().getUIColorActive()));
        row5.addElement(new RadioToggle(this.window, radioSizeX + (textAlignOffsetX / 3), getBaseUISize() * 3, UI_CENTER, UI_SIMULATION_HEIGHT, 550,() => getActiveClimate().getUIColorInactiveCustom(0.58), () => getActiveClimate().getUIColorActive()));
        

        subMenuContainer.addElement(row1);
        subMenuContainer.addElement(row2);
        subMenuContainer.addElement(row3);
        subMenuContainer.addElement(row4);
        subMenuContainer.addElement(row5);

        let row6 =  new Container(this.window, 0, 0);
        let row7 =  new Container(this.window, 0, 0);
        let row8 =  new Container(this.window, 0, 0);
        subMenuContainer.addElement(new Text(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 2, UI_CENTER, "generation cycle length"));
        subMenuContainer.addElement(row6);
        subMenuContainer.addElement(row7);
        subMenuContainer.addElement(row8);

        row6.addElement(new RadioToggleLabel(this.window, sizeX / 3 + (textAlignOffsetX / 3), getBaseUISize() * 3, UI_CENTER, "1", UI_SIMULATION_GENS_PER_DAY, getCurTimeScaleVal(1 + 1), () => getActiveClimate().getUIColorInactiveCustom(0.56), () => getActiveClimate().getUIColorActive()));
        row6.addElement(new RadioToggleLabel(this.window, sizeX / 3 + (textAlignOffsetX / 3), getBaseUISize() * 3, UI_CENTER, "2", UI_SIMULATION_GENS_PER_DAY, getCurTimeScaleVal(2 + 1), () => getActiveClimate().getUIColorInactiveCustom(0.62), () => getActiveClimate().getUIColorActive()));
        row6.addElement(new RadioToggleLabel(this.window, sizeX / 3 + (textAlignOffsetX / 3), getBaseUISize() * 3, UI_CENTER, "3", UI_SIMULATION_GENS_PER_DAY, getCurTimeScaleVal(3 + 1), () => getActiveClimate().getUIColorInactiveCustom(0.62), () => getActiveClimate().getUIColorActive()));
        row7.addElement(new RadioToggleLabel(this.window, sizeX / 3 + (textAlignOffsetX / 3), getBaseUISize() * 3, UI_CENTER, "4", UI_SIMULATION_GENS_PER_DAY, getCurTimeScaleVal(4 + 1), () => getActiveClimate().getUIColorInactiveCustom(0.62), () => getActiveClimate().getUIColorActive()));
        row7.addElement(new RadioToggleLabel(this.window, sizeX / 3 + (textAlignOffsetX / 3), getBaseUISize() * 3, UI_CENTER, "5", UI_SIMULATION_GENS_PER_DAY, getCurTimeScaleVal(5 + 1), () => getActiveClimate().getUIColorInactiveCustom(0.62), () => getActiveClimate().getUIColorActive()));
        row7.addElement(new RadioToggleLabel(this.window, sizeX / 3 + (textAlignOffsetX / 3), getBaseUISize() * 3, UI_CENTER, "6", UI_SIMULATION_GENS_PER_DAY, getCurTimeScaleVal(6 + 1), () => getActiveClimate().getUIColorInactiveCustom(0.62), () => getActiveClimate().getUIColorActive()));
        row8.addElement(new RadioToggleLabel(this.window, sizeX / 3 + (textAlignOffsetX / 3), getBaseUISize() * 3, UI_CENTER, "7", UI_SIMULATION_GENS_PER_DAY, getCurTimeScaleVal(7 + 1), () => getActiveClimate().getUIColorInactiveCustom(0.62), () => getActiveClimate().getUIColorActive()));
        row8.addElement(new RadioToggleLabel(this.window, sizeX / 3 + (textAlignOffsetX / 3), getBaseUISize() * 3, UI_CENTER, "8", UI_SIMULATION_GENS_PER_DAY, getCurTimeScaleVal(8 + 1), () => getActiveClimate().getUIColorInactiveCustom(0.62), () => getActiveClimate().getUIColorActive()));
        row8.addElement(new RadioToggleLabel(this.window, sizeX / 3 + (textAlignOffsetX / 3), getBaseUISize() * 3, UI_CENTER, "9", UI_SIMULATION_GENS_PER_DAY, getCurTimeScaleVal(9 + 1), () => getActiveClimate().getUIColorInactiveCustom(0.62), () => getActiveClimate().getUIColorActive()));
    }


}