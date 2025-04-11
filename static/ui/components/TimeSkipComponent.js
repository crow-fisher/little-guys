import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { doTimeSkipToDate, doTimeSkipToNow } from "../../climate/time.js";
import { Container } from "../Container.js";
import { Button } from "../elements/Button.js";
import { RadioToggleLabel } from "../elements/RadioToggleLabel.js";
import { Text } from "../elements/Text.js";
import { TimeSkipElement } from "../elements/TimeSkipElement.js";
import { LockedComponent } from "../LockedComponent.js";
import { UI_CENTER, UI_CLIMATE_MIDWEST, UI_CLIMATE_SELECT } from "../UIData.js";

export const R_COLORS = "🎨";
export const R_PERCOLATION_RATE = "💦";
export const R_NUTRIENTS = "⚡";

export class TimeSkipComponent extends LockedComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        super(posXFunc, posYFunc, padding, dir, key);
        let sizeX = getBaseUISize() * (26.404296875  + 4);
        let halfSizeX = this.sizeX / 2;
        let container = new Container(this.window, padding, 1);
        this.window.container = container;
        this.timeSkipElement = new TimeSkipElement(this.window, halfSizeX, getBaseUISize() * 3);
        container.addElement(this.timeSkipElement);
        container.addElement(new Button(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, () => doTimeSkipToNow(), "now",() => getActiveClimate().getUIColorInactiveCustom(0.55)));
       
        let row1 =  new Container(this.window, 0, 0);
        let row2 =  new Container(this.window, 0, 0);
        row1.addElement(new Button(this.window, sizeX / 2, getBaseUISize() * 3, UI_CENTER, () => doTimeSkipToDate("winter"),
        "winter",() => getActiveClimate().getUIColorInactiveCustom(0.66)));
        row1.addElement(new Button(this.window, sizeX / 2, getBaseUISize() * 3, UI_CENTER, () => doTimeSkipToDate("spring"),
        "spring",() => getActiveClimate().getUIColorInactiveCustom(0.62)));
        row2.addElement(new Button(this.window, sizeX / 2, getBaseUISize() * 3, UI_CENTER, () => doTimeSkipToDate("summer"),
        "summer",() => getActiveClimate().getUIColorInactiveCustom(0.56)));
        row2.addElement(new Button(this.window, sizeX / 2, getBaseUISize() * 3, UI_CENTER, () => doTimeSkipToDate("fall"),
        "fall",() => getActiveClimate().getUIColorInactiveCustom(0.58)));

        container.addElement(row1);
        container.addElement(row2);
    }

    render() {
        super.render();

    }
}
