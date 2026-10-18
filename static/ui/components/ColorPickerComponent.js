import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { hsvaToRgba } from "../../common.js";
import { loadEmptyScene } from "../../saveAndLoad.js";
import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { ColorHueSliderWheel } from "../elements/color/ColorHueSliderWheel.js";
import { ColorInputTarget } from "../elements/color/ColorInputTarget.js";
import { ColorSaturationValueArea } from "../elements/color/ColorSaturationValueArea.js";
import { SliderGradientBackground } from "../elements/SliderGradientBackground.js";
import { SliderGradientBackgroundGetterSetter } from "../elements/SliderGradientBackgroundGetterSetter.js";
// import { ColorSaturationValueArea } from "../elements/color/ColorSaturationValueArea.js";
import { TextBackground } from "../elements/TextBackground.js";
import { loadGD, saveGD, UI_CENTER, UI_COLORPICKER_CONFIG } from "../UIData.js";

export class ColorPickerComponent extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        let sizeX = getBaseUISize() * 39;

        let container = new Container(this.window, 0, 1);
        this.window.container = container;

        this.initColorConfig();

        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactive(0.75), 0.75, " "))
        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 3.8, UI_CENTER, () => getActiveClimate().getUIColorInactive(0.55), 0.66315, "color picker"))
        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactive(0.85), 0.75, ""));

        container.addElement(new ColorHueSliderWheel(this.window, sizeX, sizeX));
        container.addElement(new ColorSaturationValueArea(this.window, sizeX, sizeX));
        container.addElement(new ColorInputTarget(this.window, sizeX, sizeX));
        container.addElement(new SliderGradientBackgroundGetterSetter(this.window, 
            () => loadGD(UI_COLORPICKER_CONFIG).a, 
            (v) => {
                let cc = loadGD(UI_COLORPICKER_CONFIG);
                cc.a = v;
                cc.rgbaArr = hsvaToRgba(cc.h, cc.s, cc.v, cc.a);
            }, sizeX, getBaseUISize() * 3, 
        0, 1, 
        () => "rgba(" + loadGD(UI_COLORPICKER_CONFIG).rgbaArr.slice(0, 3).reduce((a, b) => a + (a == "" ? "" : ",") + b, "") + ",0)",
        () => "rgba(" + loadGD(UI_COLORPICKER_CONFIG).rgbaArr.slice(0, 3).reduce((a, b) => a + (a == "" ? "" : ",") + b, "") + ",1)",
        true));
    }

    initColorConfig() {
        if (loadGD(UI_COLORPICKER_CONFIG))
            return;
        saveGD(UI_COLORPICKER_CONFIG,
            {
                h: 0,
                s: 0.5,
                v: 0.5,
                a: 1,
                colorHistory: [],
                rgbaArr: [127, 127, 127, 1],
            }
        );
    }

}