import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { doTimeSkipToNow, seek } from "../../climate/time.js";
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

        subMenuContainer.addElement(new Button(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, () => seek(0), "midnight",() => getActiveClimate().getUIColorInactiveCustom(0.60)));
        subMenuContainer.addElement(new Button(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, () => seek(0.25), "dawn",() => getActiveClimate().getUIColorInactiveCustom(0.56)));
        subMenuContainer.addElement(new Button(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, () => seek(0.5), "noon",() => getActiveClimate().getUIColorInactiveCustom(0.58)));
        subMenuContainer.addElement(new Button(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, () => seek(0.75), "dusk",() => getActiveClimate().getUIColorInactiveCustom(0.61)));
        subMenuContainer.addElement(new Button(this.window, sizeX + textAlignOffsetX, getBaseUISize() * 3, textAlignOffsetX, () => doTimeSkipToNow(), "now",() => getActiveClimate().getUIColorInactiveCustom(0.61)));
    }

}