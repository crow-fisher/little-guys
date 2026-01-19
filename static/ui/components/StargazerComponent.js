import { getBaseUISize } from "../../canvas.js";
import { COLOR_BLACK, COLOR_BLUE, COLOR_RED, COLOR_WHITE } from "../../colors.js";
import { Container } from "../Container.js";
import { RadioToggle } from "../elements/RadioToggle.js";
import { RadioToggleLabel } from "../elements/RadioToggleLabel.js";
import { SliderGradientBackground } from "../elements/SliderGradientBackground.js";
import { StarSpecializedValuePicker } from "../elements/StarSpecializedValuePicker.js";
import { Text } from "../elements/Text.js";
import { Toggle } from "../elements/Toggle.js";
import { LockedComponent } from "../LockedComponent.js";
import { UI_CAMERA_FOV, UI_CENTER, UI_STARMAP_CONSTELATION_BRIGHTNESS, UI_STARMAP_SHOW_CONSTELLATION_NAMES, UI_STARMAP_STAR_SIZE_FACTOR, UI_STARMAP_STAR_OPACITY_FACTOR, UI_STARMAP_STAR_MAX_SIZE, UI_STARMAP_ZOOM, UI_STARMAP_BRIGHTNESS_SHIFT, UI_STARMAP_STAR_OPACITY_SHIFT, UI_STARMAP_STAR_MIN_MAGNITUDE, UI_STARMAP_STAR_CONTROL_TOGGLE_MODE, UI_STARMAP_VIEWMODE, UI_STARMAP_FEH_POW, UI_STARMAP_FEH_WINDOW_SIZE, UI_STARMAP_FEH_MIN_VALUE, addUIFunctionMap, UI_PLOTCONTAINER_ACTIVE } from "../UIData.js";

export const R_COLORS = "🎨";
export const R_PERCOLATION_RATE = "💦";
export const R_NUTRIENTS = "⚡";

export class StargazerComponent extends LockedComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        super(posXFunc, posYFunc, padding, dir, key);
        let sizeX = getBaseUISize() * 20;
        let half = sizeX / 2;
        let third = sizeX / 3;
        let container = new Container(this.window, padding, 1);
        this.window.container = container;

        let textHeight = getBaseUISize() * 3;
        let sliderHeight = getBaseUISize() * 2;

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "field of view"))
        container.addElement(new SliderGradientBackground(this.window, UI_CAMERA_FOV, sizeX, sliderHeight, 20, 160, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "scale"))
        container.addElement(new SliderGradientBackground(this.window, UI_STARMAP_ZOOM, sizeX, sliderHeight, -2, 15, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "constellations"))
        container.addElement(new SliderGradientBackground(this.window, UI_STARMAP_CONSTELATION_BRIGHTNESS, sizeX, sliderHeight, 0, 8, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "filter magnitude"))
        container.addElement(new SliderGradientBackground(this.window, UI_STARMAP_STAR_MIN_MAGNITUDE, sizeX, sliderHeight, 1, 15, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "star size"))
        container.addElement(new SliderGradientBackground(this.window, UI_STARMAP_STAR_MAX_SIZE, sizeX, sliderHeight, 1, 20, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new StarSpecializedValuePicker(this.window, sizeX, getBaseUISize() * 12));
        let row = new Container(this.window, 0, 0);
        container.addElement(row);
        row.addElement(new RadioToggleLabel(this.window, half, textHeight, UI_CENTER, "size", UI_STARMAP_STAR_CONTROL_TOGGLE_MODE, 0, () => COLOR_RED, () => COLOR_BLUE));
        row.addElement(new RadioToggleLabel(this.window, half, textHeight, UI_CENTER, "color", UI_STARMAP_STAR_CONTROL_TOGGLE_MODE, 1, () => COLOR_RED, () => COLOR_BLUE));

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "FeH min value"))
        container.addElement(new SliderGradientBackground(this.window, UI_STARMAP_FEH_MIN_VALUE, sizeX, sliderHeight, -5, 1, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "FeH window size"))
        container.addElement(new SliderGradientBackground(this.window, UI_STARMAP_FEH_WINDOW_SIZE, sizeX, sliderHeight, 0,5, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "FeH power"))
        container.addElement(new SliderGradientBackground(this.window, UI_STARMAP_FEH_POW, sizeX, sliderHeight, -1, 1, () => COLOR_WHITE, () => COLOR_BLACK));
 
        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "viewmode"))
        let row2 = new Container(this.window, 0, 0);
        container.addElement(row2);
        row2.addElement(new RadioToggleLabel(this.window, third, textHeight, UI_CENTER, "temp", UI_STARMAP_VIEWMODE, 0, () => COLOR_RED, () => COLOR_BLUE));
        row2.addElement(new RadioToggleLabel(this.window, third, textHeight, UI_CENTER, "FeH", UI_STARMAP_VIEWMODE, 1, () => COLOR_RED, () => COLOR_BLUE));
        row2.addElement(new RadioToggleLabel(this.window, third, textHeight, UI_CENTER, "both", UI_STARMAP_VIEWMODE, 2, () => COLOR_RED, () => COLOR_BLUE));

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "star plot"))
        let row3 = new Container(this.window, 0, 0);
        container.addElement(row3);
        row3.addElement(new RadioToggleLabel(this.window, half, textHeight, UI_CENTER, "off", UI_PLOTCONTAINER_ACTIVE, 0, () => COLOR_RED, () => COLOR_BLUE));
        row3.addElement(new RadioToggleLabel(this.window, half, textHeight, UI_CENTER, "on", UI_PLOTCONTAINER_ACTIVE, 1, () => COLOR_RED, () => COLOR_BLUE));

    } 
    render() {
        super.render();

    }
}