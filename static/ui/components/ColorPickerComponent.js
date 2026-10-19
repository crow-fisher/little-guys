import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { clamp, hsvaToRgba } from "../../common.js";
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
        let sizeX = getBaseUISize() * 40;

        let container = new Container(this.window, 0, 1);
        this.window.container = container;


        let h1 = getBaseUISize() * 2;
        this.initColorConfig();
        /// color

        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactive(0.75), 0.75, " "))
        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 3.8, UI_CENTER, () => getActiveClimate().getUIColorInactive(0.55), 0.66315, "color picker"))
        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactive(0.85), 0.75, ""));

        // color picker
        container.addElement(new ColorHueSliderWheel(this.window, sizeX, sizeX));
        container.addElement(new ColorSaturationValueArea(this.window, sizeX, sizeX));
        container.addElement(new ColorInputTarget(this.window, sizeX, sizeX));

        // opacity slider
        container.addElement(new SliderGradientBackgroundGetterSetter(this.window,
            () => loadGD(UI_COLORPICKER_CONFIG).a,
            (v) => {
                let cc = loadGD(UI_COLORPICKER_CONFIG);
                cc.a = clamp(v);
                cc.rgbaArr = hsvaToRgba(cc.h, cc.s, cc.v, cc.a);
                console.log(cc);
            }, sizeX, h1,
            0, 1,
            () => "rgba(" + loadGD(UI_COLORPICKER_CONFIG).rgbaArr.slice(0, 3).reduce((a, b) => a + (a == "" ? "" : ",") + b, "") + ",0)",
            () => "rgba(" + loadGD(UI_COLORPICKER_CONFIG).rgbaArr.slice(0, 3).reduce((a, b) => a + (a == "" ? "" : ",") + b, "") + ",1)",
            true));


        /// * brush section
        container.addElement(new TextBackground(this.window, sizeX, h1, UI_CENTER, () => getActiveClimate().getUIColorInactive(0.55), 0.75, "min brush"))

        container.addElement(new SliderGradientBackgroundGetterSetter(this.window,
            () => loadGD(UI_COLORPICKER_CONFIG).brushMin,
            (v) => loadGD(UI_COLORPICKER_CONFIG).brushMin = clamp(v, 10 ** -8, 10 ** 8),
            sizeX, h1, 0, 10,
            () => "rgba(" + loadGD(UI_COLORPICKER_CONFIG).rgbaArr.slice(0, 3).reduce((a, b) => a + (a == "" ? "" : ",") + b, "") + ",0)",
            () => "rgba(" + loadGD(UI_COLORPICKER_CONFIG).rgbaArr.slice(0, 3).reduce((a, b) => a + (a == "" ? "" : ",") + b, "") + ",1)",
            true));

        container.addElement(new TextBackground(this.window, sizeX, h1, UI_CENTER, () => getActiveClimate().getUIColorInactive(0.55), 0.75, "max brush"))

        container.addElement(new SliderGradientBackgroundGetterSetter(this.window,
            () => loadGD(UI_COLORPICKER_CONFIG).brushMax,
            (v) => loadGD(UI_COLORPICKER_CONFIG).brushMax = clamp(v, 10 ** -8, 10 ** 8),
            sizeX, h1, 1, 1000,
            () => "rgba(" + loadGD(UI_COLORPICKER_CONFIG).rgbaArr.slice(0, 3).reduce((a, b) => a + (a == "" ? "" : ",") + b, "") + ",0)",
            () => "rgba(" + loadGD(UI_COLORPICKER_CONFIG).rgbaArr.slice(0, 3).reduce((a, b) => a + (a == "" ? "" : ",") + b, "") + ",1)",
            true));

        container.addElement(new TextBackground(this.window, sizeX, h1, UI_CENTER, () => getActiveClimate().getUIColorInactive(0.55), 0.75, "brush pow"))

        container.addElement(new SliderGradientBackgroundGetterSetter(this.window,
            () => loadGD(UI_COLORPICKER_CONFIG).brushPow,
            (v) => loadGD(UI_COLORPICKER_CONFIG).brushPow = v,
            sizeX, h1, -3, 3,
            () => "rgba(" + loadGD(UI_COLORPICKER_CONFIG).rgbaArr.slice(0, 3).reduce((a, b) => a + (a == "" ? "" : ",") + b, "") + ",0)",
            () => "rgba(" + loadGD(UI_COLORPICKER_CONFIG).rgbaArr.slice(0, 3).reduce((a, b) => a + (a == "" ? "" : ",") + b, "") + ",1)",
            true));

        container.addElement(new TextBackground(this.window, sizeX, h1, UI_CENTER, () => getActiveClimate().getUIColorInactive(0.55), 0.75, "brush strength"))

        container.addElement(new SliderGradientBackgroundGetterSetter(this.window,
            () => loadGD(UI_COLORPICKER_CONFIG).brushStrength,
            (v) => loadGD(UI_COLORPICKER_CONFIG).brushStrength = v,
            sizeX, h1, -(10 ** .3), 10 ** .3,
            () => "rgba(" + loadGD(UI_COLORPICKER_CONFIG).rgbaArr.slice(0, 3).reduce((a, b) => a + (a == "" ? "" : ",") + b, "") + ",0)",
            () => "rgba(" + loadGD(UI_COLORPICKER_CONFIG).rgbaArr.slice(0, 3).reduce((a, b) => a + (a == "" ? "" : ",") + b, "") + ",1)",
            true));


    }

    initColorConfig() {
        if (loadGD(UI_COLORPICKER_CONFIG))
            return;
        saveGD(UI_COLORPICKER_CONFIG,
            {
                "h": -82.12072184503498,
                "s": 0.8044871794871795,
                "v": 0.8493589743589743,
                "colorHistory": [],
                "rgbArr": [
                    127,
                    127,
                    127
                ],
                "rgbaArr": [
                    152.94500050306812,
                    42.51150558842866,
                    217.43589743589743,
                    1
                ],
                "a": 1,
                "brushMin": 1e-8,
                "brushMax": 101.49112426035502,
                "brushPow": 1.191885038038885,
                "brushStrength": -1.6022816561457613
            }
        );
    }

}