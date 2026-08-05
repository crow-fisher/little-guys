import { Component } from "../Component.js";
import { ColorActiveColor } from "../elements/color/ColorActiveColor.js";
import { ColorHueSliderWheel } from "../elements/color/ColorHueSliderWheel.js";
import { ColorInputTarget } from "../elements/color/ColorInputTarget.js";
import { ColorSaturationValueArea } from "../elements/color/ColorSaturationValueArea.js";
import { TextBackground } from "../elements/TextBackground.js";
import { UI_CENTER } from "../UIData.js";


export class ColorPickerComponent extends Component {
    constructor(uiManager, activeFunc) {
        super(uiManager, activeFunc);
        this.name = "ColorPickerComponent";
        this.configInit();
        this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH1(), UI_CENTER, () => this.uiManager.getColorInactive(1.4), .75, "color picker"))

        // let n = 20;
        // for (let i = 2; i < n; i++) {
        //     this.container.addElement(new ColorHueSlider(this.window, () => this.gcvSizeX(), () => this.ggvdH1() * 20 / n, i));
        // }
        this.container.addElement(new ColorHueSliderWheel(this.window, () => this.gcvSizeX(), () => this.gcvSizeX()));
        this.container.addElement(new ColorSaturationValueArea(this.window, () => this.gcvSizeX(), () => this.gcvSizeX()));
        this.container.addElement(new ColorInputTarget(this.window, () => this.gcvSizeX(), () => this.gcvSizeX()));
        this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH1(), UI_CENTER, () => this.uiManager.getColorInactive(1.4), .75, "active"))
        this.container.addElement(new ColorActiveColor(this.window, () => this.gcvSizeX(), () => this.ggvdH1()));


    }

    getDefaultConfig() {
        return {
            active: {
                h: 0,
                s: 0,
                v: 0.5
            },
            offsetScale: {
                offsetX: this.ggvUISize() * 12,
                offsetY: this.ggvUISize() * 12,
                sizeX: this.ggvUISize() * 80,
                sizeY: this.ggvUISize() * 90
            }
        }
    }

}