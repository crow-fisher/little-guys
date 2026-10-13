import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { loadEmptyScene } from "../../saveAndLoad.js";
import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { ColorHueSliderWheel } from "../elements/color/ColorHueSliderWheel.js";
import { ColorSaturationValueArea } from "../elements/color/ColorSaturationValueArea.js";
import { TextBackground } from "../elements/TextBackground.js";
import { loadGD, saveGD, UI_CENTER, UI_COLORPICKER_CONFIG } from "../UIData.js";


export class ColorPickerComponent extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        let sizeX = getBaseUISize() * 39;

        this.gcvSizeX = () => sizeX;
        this.ggvdH1 = () => getBaseUISize() * 3;

        let container = new Container(this.window, 0, 1);
        this.window.container = container;

        this.initColorConfig();

        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactive(0.75), 0.75, " "))
        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 3.8, UI_CENTER, () => getActiveClimate().getUIColorInactive(0.55), 0.66315, "color picker"))
        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactive(0.85), 0.75, ""));

        container.addElement(new ColorHueSliderWheel(this.window, sizeX, sizeX));
        // container.addElement(new ColorSaturationValueArea(this.window, () => this.gcvSizeX(), () => this.gcvSizeX()));
        // this.container.addElement(new ColorInputTarget(this.window, () => this.gcvSizeX(), () => this.gcvSizeX()));
        // this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH1(), UI_CENTER, () => this.uiManager.getColorInactive(1.4), .75, "active"))
        // this.container.addElement(new ColorActiveColor(this.window, () => this.gcvSizeX(), () => this.ggvdH1()));
    }

    initColorConfig() {
        if (loadGD(UI_COLORPICKER_CONFIG))
            return;
        saveGD(UI_COLORPICKER_CONFIG,
            {
                h: 0,
                s: 0.5,
                v: 0.5,
                colorHistory: [],
                rgbArr: [127, 127, 127]
            }
        );
    }

}