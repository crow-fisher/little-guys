import { getBaseUISize } from "../../canvas.js";
import { Container } from "../Container.js";
import { Text } from "../elements/Text.js";
import { TimeSkipElement } from "../elements/TimeSkipElement.js";
import { LockedComponent } from "../LockedComponent.js";
import { UI_CENTER } from "../UIData.js";

export const R_COLORS = "🎨";
export const R_PERCOLATION_RATE = "💦";
export const R_NUTRIENTS = "⚡";

export class TimeSkipComponent extends LockedComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        super(posXFunc, posYFunc, padding, dir, key);
        let sizeX = getBaseUISize() * 32;
        let halfSizeX = sizeX / 2;
        let container = new Container(this.window, padding, 1);
        this.window.container = container;
        container.addElement(new TimeSkipElement(this.window, halfSizeX, getBaseUISize() * 3));

    }
}
