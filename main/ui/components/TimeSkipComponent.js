import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { doTimeSkipToDate, doTimeSkipToNow } from "../../climate/time.js";
import { Container } from "../Container.js";
import { Button } from "../elements/Button.js";
import { TimeSkipElement } from "../elements/TimeSkipElement.js";
import { LockedComponent } from "../LockedComponent.js";
import { UI_CENTER } from "../UIData.js";

export const R_COLORS = "🎨";
export const R_PERCOLATION_RATE = "💦";
export const R_NUTRIENTS = "⚡";

export class TimeSkipComponent extends LockedComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        super(posXFunc, posYFunc, padding, dir, key);
        let sizeX = getBaseUISize() * (26.404296875  + 4);
        let halfSizeX = this.sizeX / 2;
        let container = new Container(this.window, padding, 1);
        this.window.container = container

        this.timeSkipElement = new TimeSkipElement(this.window, halfSizeX, getBaseUISize() * 3);
        container.addElement(this.timeSkipElement);

        // container.addElement(new Slider(this.window, UI_CAMERA_EXPOSURE, sizeX, getBaseUISize() * 3, 1, 3, () => "#FEFEFE", 
        // getBaseUISize(), () => COLOR_BLACK, () => getActiveClimate().getUIColorInactive(0.70)));

        container.addElement(new Button(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, () => doTimeSkipToNow(), "now",() => getActiveClimate().getUIColorInactive(0.52)));
       
        let row1 =  new Container(this.window, 0, 0);
        let row2 =  new Container(this.window, 0, 0);
        row1.addElement(new Button(this.window, sizeX / 2, getBaseUISize() * 3, UI_CENTER, () => doTimeSkipToDate("spring"),
        "spring",() => getActiveClimate().getUIColorInactive(0.62)));
        row1.addElement(new Button(this.window, sizeX / 2, getBaseUISize() * 3, UI_CENTER, () => doTimeSkipToDate("summer"),
        "summer",() => getActiveClimate().getUIColorInactive(0.58)));
        row2.addElement(new Button(this.window, sizeX / 2, getBaseUISize() * 3, UI_CENTER, () => doTimeSkipToDate("fall"),
        "fall",() => getActiveClimate().getUIColorInactive(0.55)));
        row2.addElement(new Button(this.window, sizeX / 2, getBaseUISize() * 3, UI_CENTER, () => doTimeSkipToDate("winter"),
        "winter",() => getActiveClimate().getUIColorInactive(0.66)));

        container.addElement(row1);
        container.addElement(row2);
    }

    render() {
        super.render();

    }
}
