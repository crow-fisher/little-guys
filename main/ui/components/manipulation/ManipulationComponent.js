import { Component } from "../../Component.js";
import { Container } from "../../Container.js";
import { TextBackground } from "../../elements/TextBackground.js";
import { Toggle } from "../../elements/Toggle.js";
import { UI_CENTER } from "../../UIData.js";

import { ColorActiveColor } from "../../elements/color/ColorActiveColor.js";
import { ColorHueSliderWheel } from "../../elements/color/ColorHueSliderWheel.js";
import { ColorInputTarget } from "../../elements/color/ColorInputTarget.js";
import { ColorSaturationValueArea } from "../../elements/color/ColorSaturationValueArea.js";
import { hsv2rgb } from "../../../common.js";
import { multiplyVectorByScalar } from "../../../util/vector.js";
import { SliderGradientBackground } from "../../elements/SliderGradientBackground.js";

export class ManipulationComponent extends Component {
    constructor(uiManager, activeFunc) {
        super(uiManager, activeFunc);
        this.name = "ManipulationComponent";
        this.configInit();
        // this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdBr(), UI_CENTER, () => this.uiManager.getColorInactive(.5)))  
        this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH1(), UI_CENTER, () => this.uiManager.getColorInactive(1.4), .75, "manipulation"))
        let r1 = new Container(0);
        this.container.addElement(r1);
        r1.addElement(new Toggle(this.window, () => this.gcvdHalfX(), () => this.ggvdH1(), UI_CENTER,
            () => this.gcoDefault().active, (v) => this.gcoDefault().active = v,
            "transparency", () => "#863c3c", () => "#FFFFFF"));

        this.container.addElement(new ColorHueSliderWheel(this.window, () => this.gcvSizeX(), () => this.gcvSizeX()));
        this.container.addElement(new ColorSaturationValueArea(this.window, () => this.gcvSizeX(), () => this.gcvSizeX()));
        this.container.addElement(new ColorInputTarget(this.window, () => this.gcvSizeX(), () => this.gcvSizeX()));
        this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH1(), UI_CENTER, () => this.uiManager.getColorInactive(1.4), .75, "active"))
        this.container.addElement(new ColorActiveColor(this.window, () => this.gcvSizeX(), () => this.ggvdH1()));


        this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH3(), UI_CENTER, () => this.uiManager.getColorInactive(1.4), .75, "brush size"))
        this.container.addElement(new SliderGradientBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH3(), () => this.gcoBrush().brushSize, (v) => this.gcoBrush().brushSize = v,
            0, 12, 150, 0.2));

        this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH3(), UI_CENTER, () => this.uiManager.getColorInactive(1.4), .75, "block size"))
        this.container.addElement(new SliderGradientBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH3(), () => this.gcoBrush().blockSize, (v) => this.gcoBrush().blockSize = Math.round(v),
            1, 24, 150, 0.2));

    }

    gcoDefault() {
        return this.config().default;
    }

    gcoBrush() {
        return this.config().brush;
    }

    colorUpdate(unshift = false) {
        if (unshift && this.mouseManager.isFrameButtonPressed(0))
            this.config().colorConfig.colorHistory.unshift([this.config().colorConfig.h, this.config().colorConfig.s, this.config().colorConfig.v]);
        this.config().colorConfig.rgbArr = hsv2rgb(this.config().colorConfig.h, this.config().colorConfig.s, this.config().colorConfig.v); // creates a new array
        multiplyVectorByScalar(this.config().colorConfig.rgbArr, 255)
    }

    getDefaultConfig() {
        return {
            colorConfig: {
                h: 0,
                s: 0.5,
                v: 0.5,
                colorHistory: [],
                rgbArr: [127, 127, 127]
            },
            brush: {
                blockSize: 8,
                brushSize: 8
            },
            default: {},
            offsetScale: {
                offsetX: this.ggvUISize() * 12,
                offsetY: this.ggvUISize() * 12,
                sizeX: this.ggvUISize() * 80,
                sizeY: this.ggvUISize() * 128
            }
        }
    }
}