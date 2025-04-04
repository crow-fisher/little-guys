import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { doTimeSkipToNow, seekDateLabel } from "../../climate/time.js";
import { Container } from "../Container.js";
import { Button } from "../elements/Button.js";
import { SubTreeComponent } from "./SubTreeComponent.js";


export class TimeSubtree extends SubTreeComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        super(posXFunc, posYFunc, padding, dir, key);
        let subMenuContainer = new Container(this.window, 0, 1);
        this.window.container = subMenuContainer;

        let textAlignOffsetX = getBaseUISize() * 1.91;
        let sizeX = getBaseUISize() * 11;
        subMenuContainer.addElement(new Button(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, () => doTimeSkipToNow(), "now",() => getActiveClimate().getUIColorInactiveCustom(0.61)));
        subMenuContainer.addElement(new Button(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, () => seekDateLabel("sunrise"), "sunrise",() => getActiveClimate().getUIColorInactiveCustom(0.60)));
        subMenuContainer.addElement(new Button(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, () => seekDateLabel("sunriseEnd"), "sunriseEnd",() => getActiveClimate().getUIColorInactiveCustom(0.56)));
        subMenuContainer.addElement(new Button(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, () => seekDateLabel("goldenHourEnd"), "goldenHourEnd",() => getActiveClimate().getUIColorInactiveCustom(0.58)));
        subMenuContainer.addElement(new Button(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, () => seekDateLabel("solarNoon"), "solarNoon",() => getActiveClimate().getUIColorInactiveCustom(0.61)));
        subMenuContainer.addElement(new Button(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, () => seekDateLabel("goldenHour"), "goldenHour",() => getActiveClimate().getUIColorInactiveCustom(0.61)));
        subMenuContainer.addElement(new Button(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, () => seekDateLabel("sunsetStart"), "sunsetStart",() => getActiveClimate().getUIColorInactiveCustom(0.61)));
        subMenuContainer.addElement(new Button(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, () => seekDateLabel("sunset"), "sunset",() => getActiveClimate().getUIColorInactiveCustom(0.61)));
        subMenuContainer.addElement(new Button(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, () => seekDateLabel("dusk"), "dusk",() => getActiveClimate().getUIColorInactiveCustom(0.61)));
        subMenuContainer.addElement(new Button(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, () => seekDateLabel("nauticalDusk"), "nauticalDusk",() => getActiveClimate().getUIColorInactiveCustom(0.61)));
        subMenuContainer.addElement(new Button(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, () => seekDateLabel("night"), "night",() => getActiveClimate().getUIColorInactiveCustom(0.61)));
        subMenuContainer.addElement(new Button(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, () => seekDateLabel("nadir"), "nadir",() => getActiveClimate().getUIColorInactiveCustom(0.61)));
        subMenuContainer.addElement(new Button(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, () => seekDateLabel("nightEnd"), "nightEnd",() => getActiveClimate().getUIColorInactiveCustom(0.61)));
        subMenuContainer.addElement(new Button(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, () => seekDateLabel("nauticalDawn"), "nauticalDawn",() => getActiveClimate().getUIColorInactiveCustom(0.61)));
        subMenuContainer.addElement(new Button(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, () => seekDateLabel("dawn"), "dawn",() => getActiveClimate().getUIColorInactiveCustom(0.61)));
    }

}
