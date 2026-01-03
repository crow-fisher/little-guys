import { getBaseUISize } from "../../canvas.js";
import { COLOR_BLACK, COLOR_BLUE, COLOR_RED, COLOR_WHITE } from "../../colors.js";
import { Container } from "../Container.js";
import { RadioToggle } from "../elements/RadioToggle.js";
import { RadioToggleLabel } from "../elements/RadioToggleLabel.js";
import { SliderGradientBackground } from "../elements/SliderGradientBackground.js";
import { StarSpecializedValuePicker } from "../elements/SliderGradientBackgroundGetterSetterGradeint.js";
import { Text } from "../elements/Text.js";
import { Toggle } from "../elements/Toggle.js";
import { LockedComponent } from "../LockedComponent.js";
import { UI_CAMERA_FOV, UI_CENTER, UI_STARMAP_CONSTELATION_BRIGHTNESS, UI_STARMAP_SHOW_CONSTELLATION_NAMES, UI_STARMAP_STAR_SIZE_FACTOR, UI_STARMAP_STAR_OPACITY_FACTOR, UI_STARMAP_STAR_MAX_SIZE, UI_STARMAP_ZOOM, UI_STARMAP_BRIGHTNESS_SHIFT, UI_STARMAP_STAR_OPACITY_SHIFT, UI_STARMAP_STAR_MIN_MAGNITUDE, UI_STARMAP_STAR_CONTROL_TOGGLE_MODE } from "../UIData.js";

export const R_COLORS = "🎨";
export const R_PERCOLATION_RATE = "💦";
export const R_NUTRIENTS = "⚡";

export class StargazerComponent extends LockedComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        super(posXFunc, posYFunc, padding, dir, key);
        let sizeX = getBaseUISize() * 20;
        let half = sizeX / 2;
        let container = new Container(this.window, padding, 1);
        this.window.container = container

        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, "camera FOV"))
        container.addElement(new SliderGradientBackground(this.window, UI_CAMERA_FOV, sizeX, getBaseUISize() * 3, 20, 160, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, "star scale"))
        container.addElement(new SliderGradientBackground(this.window, UI_STARMAP_ZOOM, sizeX, getBaseUISize() * 3, -2, 15, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, "constellation lines"))
        container.addElement(new SliderGradientBackground(this.window, UI_STARMAP_CONSTELATION_BRIGHTNESS, sizeX, getBaseUISize() * 3, 0, 8, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, "star size"))
        container.addElement(new SliderGradientBackground(this.window, UI_STARMAP_STAR_MAX_SIZE, sizeX, getBaseUISize() * 3, 1, 20, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, "size factor"))
        container.addElement(new SliderGradientBackground(this.window, UI_STARMAP_STAR_SIZE_FACTOR, sizeX, getBaseUISize() * 3, -.25, .25, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, "opacity factor"))
        container.addElement(new SliderGradientBackground(this.window, UI_STARMAP_STAR_OPACITY_FACTOR, sizeX, getBaseUISize() * 3, -.55, 1.5, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, "opacity shift"))
        container.addElement(new SliderGradientBackground(this.window, UI_STARMAP_STAR_OPACITY_SHIFT, sizeX, getBaseUISize() * 3, 1, 30, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, "brightness shift"))
        container.addElement(new SliderGradientBackground(this.window, UI_STARMAP_BRIGHTNESS_SHIFT, sizeX, getBaseUISize() * 3, -20, 20, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, "minimum magnitude"))
        container.addElement(new SliderGradientBackground(this.window, UI_STARMAP_STAR_MIN_MAGNITUDE, sizeX, getBaseUISize() * 3, 1, 15, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, "star scale"))
        container.addElement(new Toggle(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, UI_STARMAP_SHOW_CONSTELLATION_NAMES, "show constellation names", () => COLOR_RED, () => COLOR_BLUE));

        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, "opacity"))
        container.addElement(new StarSpecializedValuePicker(this.window, sizeX, getBaseUISize() * 12));

        let row = new Container(this.window, 0, 0);
        container.addElement(row);
        row.addElement(new RadioToggleLabel(this.window, half, getBaseUISize() * 3, UI_CENTER, "size", UI_STARMAP_STAR_CONTROL_TOGGLE_MODE, 0, () => COLOR_RED, () => COLOR_BLUE));
        row.addElement(new RadioToggleLabel(this.window, half, getBaseUISize() * 3, UI_CENTER, "color", UI_STARMAP_STAR_CONTROL_TOGGLE_MODE, 1, () => COLOR_RED, () => COLOR_BLUE));
    } 
    render() {
        super.render();

    }
}
