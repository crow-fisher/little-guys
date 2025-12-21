import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { doTimeSkipToDate, doTimeSkipToNow } from "../../climate/time.js";
import { COLOR_BLACK, COLOR_BLUE, COLOR_RED, COLOR_WHITE } from "../../colors.js";
import { Container } from "../Container.js";
import { Button } from "../elements/Button.js";
import { SliderGradientBackground } from "../elements/SliderGradientBackground.js";
import { Text } from "../elements/Text.js";
import { TimeSkipElement } from "../elements/TimeSkipElement.js";
import { Toggle } from "../elements/Toggle.js";
import { LockedComponent } from "../LockedComponent.js";
import { saveGD, UI_CAMERA_FOV, UI_CENTER, UI_STARMAP_CONSTELATION_BRIGHTNESS, UI_STARMAP_NORMAL_BRIGTNESS, UI_STARMAP_ROTATION_VEC, UI_STARMAP_SHOW_CONSTELLATION_NAMES, UI_STARMAP_STAR_SIZE_FACTOR, UI_STARMAP_STAR_OPACITY_FACTOR, UI_STARMAP_STAR_MAX_SIZE, UI_STARMAP_STAR_MIN_SIZE, UI_STARMAP_ZOOM, UI_STARMAP_MAX_BRIGHTNESS, UI_STARMAP_BRIGHTNESS_SHIFT, UI_STARMAP_STAR_OPACITY_SHIFT } from "../UIData.js";

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
        // getBaseUISize(), () => COLOR_BLACK, () => getActiveClimate().getUIColorInactiveCustom(0.70)));

        container.addElement(new Button(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, () => doTimeSkipToNow(), "now",() => getActiveClimate().getUIColorInactiveCustom(0.52)));
       
        let row1 =  new Container(this.window, 0, 0);
        let row2 =  new Container(this.window, 0, 0);
        row1.addElement(new Button(this.window, sizeX / 2, getBaseUISize() * 3, UI_CENTER, () => doTimeSkipToDate("spring"),
        "spring",() => getActiveClimate().getUIColorInactiveCustom(0.62)));
        row1.addElement(new Button(this.window, sizeX / 2, getBaseUISize() * 3, UI_CENTER, () => doTimeSkipToDate("summer"),
        "summer",() => getActiveClimate().getUIColorInactiveCustom(0.58)));
        row2.addElement(new Button(this.window, sizeX / 2, getBaseUISize() * 3, UI_CENTER, () => doTimeSkipToDate("fall"),
        "fall",() => getActiveClimate().getUIColorInactiveCustom(0.55)));
        row2.addElement(new Button(this.window, sizeX / 2, getBaseUISize() * 3, UI_CENTER, () => doTimeSkipToDate("winter"),
        "winter",() => getActiveClimate().getUIColorInactiveCustom(0.66)));

        container.addElement(row1);
        container.addElement(row2);
        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, "camera FOV"))
        container.addElement(new SliderGradientBackground(this.window, UI_CAMERA_FOV, sizeX, getBaseUISize() * 3, 20, 160, () => COLOR_WHITE, () => COLOR_BLACK));
        
        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, "star scale"))
        container.addElement(new SliderGradientBackground(this.window, UI_STARMAP_ZOOM, sizeX, getBaseUISize() * 3, -2, 15, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, "constellation stars"))
        container.addElement(new SliderGradientBackground(this.window, UI_STARMAP_CONSTELATION_BRIGHTNESS, sizeX, getBaseUISize() * 3, 0, 8, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, "star minimum size"))
        container.addElement(new SliderGradientBackground(this.window, UI_STARMAP_STAR_MIN_SIZE, sizeX, getBaseUISize() * 3, 0, 8, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, "star size"))
        container.addElement(new SliderGradientBackground(this.window, UI_STARMAP_STAR_MAX_SIZE, sizeX, getBaseUISize() * 3, 1, 20, () => COLOR_WHITE, () => COLOR_BLACK));
        
        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, "UI_STARMAP_STAR_SIZE_FACTOR"))
        container.addElement(new SliderGradientBackground(this.window, UI_STARMAP_STAR_SIZE_FACTOR, sizeX, getBaseUISize() * 3, -.25, .25, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, "sUI_STARMAP_STAR_OPACITY_FACTOR"))
        container.addElement(new SliderGradientBackground(this.window, UI_STARMAP_STAR_OPACITY_FACTOR, sizeX, getBaseUISize() * 3, -.55, 1.5, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, "UI_STARMAP_STAR_OPACITY_SHIFT"))
        container.addElement(new SliderGradientBackground(this.window, UI_STARMAP_STAR_OPACITY_SHIFT, sizeX, getBaseUISize() * 3, 1, 3, () => COLOR_WHITE, () => COLOR_BLACK));


        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, "UI_STARMAP_BRIGHTNESS_SHIFT"))
        container.addElement(new SliderGradientBackground(this.window, UI_STARMAP_BRIGHTNESS_SHIFT, sizeX, getBaseUISize() * 3, -20, 20, () => COLOR_WHITE, () => COLOR_BLACK));


        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, "star scale"))
        container.addElement(new Toggle(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, UI_STARMAP_SHOW_CONSTELLATION_NAMES, "show constellation names", () => COLOR_RED, () => COLOR_BLUE));

        
    }

    render() {
        super.render();

    }
}
