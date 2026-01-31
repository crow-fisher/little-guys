import { getBaseUISize } from "../../canvas.js";
import { COLOR_BLACK, COLOR_BLUE, COLOR_RED, COLOR_WHITE } from "../../colors.js";
import { Container } from "../Container.js";
import { RadioToggleLabel } from "../elements/RadioToggleLabel.js";
import { SliderGradientBackground } from "../elements/SliderGradientBackground.js";
import { StarSpecializedValuePicker } from "../elements/StarSpecializedValuePicker.js";
import { Text } from "../elements/Text.js";
import { Toggle } from "../elements/Toggle.js";
import { LockedComponent } from "../LockedComponent.js";
import { UI_CAMERA_FOV, UI_CENTER, UI_STARMAP_CONSTELATION_BRIGHTNESS, UI_SH_MINSIZE, UI_STARMAP_ZOOM, UI_STARMAP_STAR_MIN_MAGNITUDE, UI_STARMAP_STAR_CONTROL_TOGGLE_MODE, UI_STARMAP_VIEWMODE, UI_STARMAP_FEH_POW, UI_STARMAP_FEH_WINDOW_SIZE, UI_STARMAP_FEH_MIN_VALUE, UI_AA_PLOT_ACTIVE, UI_AA_PLOT_MAXPOINTS, UI_AA_PLOT_XKEY, UI_AA_PLOT_YKEY, UI_AA_PLOT_WIDTH, UI_AA_PLOT_HEIGHT, UI_AA_PLOT_POINTSIZE, UI_AA_PLOT_POINTOPACITY, UI_AA_PLOT_ZOOM_Y, UI_AA_PLOT_ZOOM_X, UI_AA_PLOT_RENDERGRIDLINES, UI_AA_PLOT_AXISLABELS, UI_AA_PLOT_XPADDING, UI_AA_PLOT_YPADDING, UI_AA_PLOT_OFFSET_X, UI_AA_PLOT_OFFSET_Y, UI_STARGAZER_SETUP, UI_AA_PLOT_TOOLBOX_STAR_STYLE } from "../UIData.js";

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
        row3.addElement(new RadioToggleLabel(this.window, half, textHeight, UI_CENTER, "on", UI_AA_PLOT_ACTIVE, 1, () => COLOR_RED, () => COLOR_BLUE));
        row3.addElement(new RadioToggleLabel(this.window, half, textHeight, UI_CENTER, "off", UI_AA_PLOT_ACTIVE, 0, () => COLOR_RED, () => COLOR_BLUE));

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "number of graph points"))

        let row4 = new Container(this.window, 0, 0);
        container.addElement(row4);
        row4.addElement(new RadioToggleLabel(this.window, half, textHeight, UI_CENTER, "10k", UI_AA_PLOT_MAXPOINTS, 10000, () => COLOR_RED, () => COLOR_BLUE));
        row4.addElement(new RadioToggleLabel(this.window, half, textHeight, UI_CENTER, "25k", UI_AA_PLOT_MAXPOINTS, 25000, () => COLOR_RED, () => COLOR_BLUE));


        let row5 = new Container(this.window, 0, 0);
        container.addElement(row5);
        row5.addElement(new RadioToggleLabel(this.window, half, textHeight, UI_CENTER, "50k", UI_AA_PLOT_MAXPOINTS, 50000, () => COLOR_RED, () => COLOR_BLUE));
        row5.addElement(new RadioToggleLabel(this.window, half, textHeight, UI_CENTER, "all", UI_AA_PLOT_MAXPOINTS, 120000, () => COLOR_RED, () => COLOR_BLUE));

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
            "p_feH",
            "parsecs",
            "parsecs_log"
        ]

        graphAxisChoices.forEach((text) => {
            let row = new Container(this.window, 0, 0);
            container.addElement(row);
            row.addElement(new RadioToggleLabel(this.window, half, textHeight, UI_CENTER, text, UI_AA_PLOT_XKEY, text, () => COLOR_RED, () => COLOR_BLUE));
            row.addElement(new RadioToggleLabel(this.window, half, textHeight, UI_CENTER, text, UI_AA_PLOT_YKEY, text, () => COLOR_RED, () => COLOR_BLUE));
        });

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "graph x-size"))
        container.addElement(new SliderGradientBackground(this.window, UI_AA_PLOT_WIDTH, sizeX, sliderHeight, 10, 100, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "graph y-size"))
        container.addElement(new SliderGradientBackground(this.window, UI_AA_PLOT_HEIGHT, sizeX, sliderHeight, 10, 100, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "point size"))
        container.addElement(new SliderGradientBackground(this.window, UI_AA_PLOT_POINTSIZE, sizeX, sliderHeight, -10, 4, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "point opacity"))
        container.addElement(new SliderGradientBackground(this.window, UI_AA_PLOT_POINTOPACITY, sizeX, sliderHeight, -.0004, .00001, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "padding (X)"))
        container.addElement(new SliderGradientBackground(this.window, UI_AA_PLOT_XPADDING, sizeX, sliderHeight, 1, 50, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "padding (Y)"))
        container.addElement(new SliderGradientBackground(this.window, UI_AA_PLOT_YPADDING, sizeX, sliderHeight, 1, 50, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "graph zoom x"))
        container.addElement(new SliderGradientBackground(this.window, UI_AA_PLOT_ZOOM_X, sizeX, sliderHeight, -2, 5, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "graph zoom y"))
        container.addElement(new SliderGradientBackground(this.window, UI_AA_PLOT_ZOOM_Y, sizeX, sliderHeight, -2, 5, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "graph offset x"))
        container.addElement(new SliderGradientBackground(this.window, UI_AA_PLOT_OFFSET_X, sizeX, sliderHeight, -1, 1, () => COLOR_WHITE, () => COLOR_BLACK));

        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "graph offset y"))
        container.addElement(new SliderGradientBackground(this.window, UI_AA_PLOT_OFFSET_Y, sizeX, sliderHeight, -1, 1, () => COLOR_WHITE, () => COLOR_BLACK));


        container.addElement(new Text(this.window, sizeX, textHeight, UI_CENTER, "labels"))
        
        let row7 = new Container(this.window, 0, 0);
        container.addElement(row7);
        row7.addElement(new Toggle(this.window, half, textHeight, UI_CENTER, UI_AA_PLOT_RENDERGRIDLINES, "grid lines", () => COLOR_RED, () => COLOR_BLUE));
        row7.addElement(new Toggle(this.window, half, textHeight, UI_CENTER, UI_AA_PLOT_AXISLABELS, "axis labels", () => COLOR_RED, () => COLOR_BLUE));
    }
    render() {
        super.render();

    }
}