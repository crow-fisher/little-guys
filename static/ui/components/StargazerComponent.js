import { getBaseUISize } from "../../canvas.js";
import { COLOR_BLACK, COLOR_BLUE, COLOR_RED, COLOR_WHITE } from "../../colors.js";
import { Container } from "../Container.js";
import { RadioToggleLabel } from "../elements/RadioToggleLabel.js";
import { SliderGradientBackground } from "../elements/SliderGradientBackground.js";
import { StarSpecializedValuePicker } from "../elements/StarSpecializedValuePicker.js";
import { Text } from "../elements/Text.js";
import { Toggle } from "../elements/Toggle.js";
import { LockedComponent } from "../LockedComponent.js";
import { UI_CAMERA_FOV, UI_CENTER, UI_STARMAP_CONSTELATION_BRIGHTNESS, UI_STARMAP_STAR_MAX_SIZE, UI_STARMAP_ZOOM, UI_STARMAP_STAR_MIN_MAGNITUDE, UI_STARMAP_STAR_CONTROL_TOGGLE_MODE, UI_STARMAP_VIEWMODE, UI_STARMAP_FEH_POW, UI_STARMAP_FEH_WINDOW_SIZE, UI_STARMAP_FEH_MIN_VALUE, UI_PLOTCONTAINER_ACTIVE, UI_PLOTCONTAINER_MAXPOINTS, UI_PLOTCONTAINER_XKEY, UI_PLOTCONTAINER_YKEY, UI_PLOTCONTAINER_WIDTH, UI_PLOTCONTAINER_HEIGHT, UI_PLOTCONTAINER_POINTSIZE, UI_PLOTCONTAINER_POINTOPACITY, UI_PLOTCONTAINER_ZOOM_Y, UI_PLOTCONTAINER_ZOOM_X, UI_PLOTCONTAINER_RENDERGRIDLINES, UI_PLOTCONTAINER_AXISLABELS, UI_PLOTCONTAINER_XPADDING, UI_PLOTCONTAINER_YPADDING, UI_PLOTCONTAINER_OFFSET_X, UI_PLOTCONTAINER_OFFSET_Y, UI_STARGAZER_SETUP, UI_PLOTCONTAINER_TOOLBOX_STAR_STYLE } from "../UIData.js";

export const R_COLORS = "🎨";
export const R_PERCOLATION_RATE = "💦";
export const R_NUTRIENTS = "⚡";

export class StargazerComponent extends LockedComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        super(posXFunc, posYFunc, padding, dir, key);
        let sizeX = getBaseUISize() * 35;
        let half = sizeX / 2;
        let third = sizeX / 3;
        let container = new Container(this.window, padding, 1);
        this.window.container = container;

        let textHeight = getBaseUISize() * 3;
        let sliderHeight = getBaseUISize() * 2;

        container.addElement(new Toggle(this.window, sizeX, textHeight, UI_CENTER, UI_STARGAZER_SETUP, "star setup", () => COLOR_BLUE, () => COLOR_RED));
        container.addElement(new Toggle(this.window, sizeX, textHeight, UI_CENTER, UI_PLOTCONTAINER_TOOLBOX_STAR_STYLE, "star style", () => COLOR_BLUE, () => COLOR_RED));

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "field of view"))
        container.addElement(new SliderGradientBackground(this.window, UI_CAMERA_FOV, sizeX, sliderHeight, 20, 160, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "scale"))
        container.addElement(new SliderGradientBackground(this.window, UI_STARMAP_ZOOM, sizeX, sliderHeight, -2, 15, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "constellations"))
        container.addElement(new SliderGradientBackground(this.window, UI_STARMAP_CONSTELATION_BRIGHTNESS, sizeX, sliderHeight, 0, 8, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "filter magnitude"))
        container.addElement(new SliderGradientBackground(this.window, UI_STARMAP_STAR_MIN_MAGNITUDE, sizeX, sliderHeight, 1, 15, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "FeH min value"))
        container.addElement(new SliderGradientBackground(this.window, UI_STARMAP_FEH_MIN_VALUE, sizeX, sliderHeight, -5, 1, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "FeH window size"))
        container.addElement(new SliderGradientBackground(this.window, UI_STARMAP_FEH_WINDOW_SIZE, sizeX, sliderHeight, 0, 5, () => COLOR_WHITE, () => COLOR_BLACK));

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
        container.addElement(row3)
        row3.addElement(new RadioToggleLabel(this.window, half, textHeight, UI_CENTER, "on", UI_PLOTCONTAINER_ACTIVE, 1, () => COLOR_RED, () => COLOR_BLUE));
        row3.addElement(new RadioToggleLabel(this.window, half, textHeight, UI_CENTER, "off", UI_PLOTCONTAINER_ACTIVE, 0, () => COLOR_RED, () => COLOR_BLUE));

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "number of graph points"))

        let row4 = new Container(this.window, 0, 0);
        container.addElement(row4);
        row4.addElement(new RadioToggleLabel(this.window, half, textHeight, UI_CENTER, "10k", UI_PLOTCONTAINER_MAXPOINTS, 10000, () => COLOR_RED, () => COLOR_BLUE));
        row4.addElement(new RadioToggleLabel(this.window, half, textHeight, UI_CENTER, "25k", UI_PLOTCONTAINER_MAXPOINTS, 25000, () => COLOR_RED, () => COLOR_BLUE));


        let row5 = new Container(this.window, 0, 0);
        container.addElement(row5);
        row5.addElement(new RadioToggleLabel(this.window, half, textHeight, UI_CENTER, "50k", UI_PLOTCONTAINER_MAXPOINTS, 50000, () => COLOR_RED, () => COLOR_BLUE));
        row5.addElement(new RadioToggleLabel(this.window, half, textHeight, UI_CENTER, "all", UI_PLOTCONTAINER_MAXPOINTS, 120000, () => COLOR_RED, () => COLOR_BLUE));



        let row6 = new Container(this.window, 0, 0);
        container.addElement(row6);
        row6.addElement(new Text(this.window, half, textHeight, UI_CENTER, "X"));
        row6.addElement(new Text(this.window, half, textHeight, UI_CENTER, "Y"));

        let graphAxisChoices = [
            "id",
            "asc",
            "dec",
            "magnitude",
            "bv",
            "color",
            "parallax",
            "hd_number",
            "_size",
            "_opacity",
            "_brightness",
            "recalculateScreenFlag",
            "_distance",
            "magnitude_absolute",
            "p_feH"
        ]

        graphAxisChoices.forEach((text) => {
            let row = new Container(this.window, 0, 0);
            container.addElement(row);
            row.addElement(new RadioToggleLabel(this.window, half, textHeight, UI_CENTER, text, UI_PLOTCONTAINER_XKEY, text, () => COLOR_RED, () => COLOR_BLUE));
            row.addElement(new RadioToggleLabel(this.window, half, textHeight, UI_CENTER, text, UI_PLOTCONTAINER_YKEY, text, () => COLOR_RED, () => COLOR_BLUE));
        });

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "graph x-size"))
        container.addElement(new SliderGradientBackground(this.window, UI_PLOTCONTAINER_WIDTH, sizeX, sliderHeight, 250, 4000, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "graph y-size"))
        container.addElement(new SliderGradientBackground(this.window, UI_PLOTCONTAINER_HEIGHT, sizeX, sliderHeight, 250, 2000, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "point size"))
        container.addElement(new SliderGradientBackground(this.window, UI_PLOTCONTAINER_POINTSIZE, sizeX, sliderHeight, -10, 4, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "point opacity"))
        container.addElement(new SliderGradientBackground(this.window, UI_PLOTCONTAINER_POINTOPACITY, sizeX, sliderHeight, -.0004, .00001, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "padding (X)"))
        container.addElement(new SliderGradientBackground(this.window, UI_PLOTCONTAINER_XPADDING, sizeX, sliderHeight, 1, 50, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "padding (Y)"))
        container.addElement(new SliderGradientBackground(this.window, UI_PLOTCONTAINER_YPADDING, sizeX, sliderHeight, 1, 50, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "graph zoom x"))
        container.addElement(new SliderGradientBackground(this.window, UI_PLOTCONTAINER_ZOOM_X, sizeX, sliderHeight, -2, 5, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "graph zoom y"))
        container.addElement(new SliderGradientBackground(this.window, UI_PLOTCONTAINER_ZOOM_Y, sizeX, sliderHeight, -2, 5, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "graph offset x"))
        container.addElement(new SliderGradientBackground(this.window, UI_PLOTCONTAINER_OFFSET_X, sizeX, sliderHeight, -1, 1, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "graph offset y"))
        container.addElement(new SliderGradientBackground(this.window, UI_PLOTCONTAINER_OFFSET_Y, sizeX, sliderHeight, -1, 1, () => COLOR_WHITE, () => COLOR_BLACK));


        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "labels"))
        
        let row7 = new Container(this.window, 0, 0);
        container.addElement(row7);
        row7.addElement(new Toggle(this.window, half, textHeight, UI_CENTER, UI_PLOTCONTAINER_RENDERGRIDLINES, "grid lines", () => COLOR_RED, () => COLOR_BLUE));
        row7.addElement(new Toggle(this.window, half, textHeight, UI_CENTER, UI_PLOTCONTAINER_AXISLABELS, "axis labels", () => COLOR_RED, () => COLOR_BLUE));
    }
    render() {
        super.render();

    }
}