import { hsv2rgb } from "../../common.js";
import { multiplyVectorByScalar } from "../../util/vector.js";
import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { Button } from "../elements/Button.js";
import { ColorActiveColor } from "../elements/color/ColorActiveColor.js";
import { ColorColorHistory } from "../elements/color/ColorColorHistory.js";
import { ColorHueSliderWheel } from "../elements/color/ColorHueSliderWheel.js";
import { ColorInputTarget } from "../elements/color/ColorInputTarget.js";
import { ColorSaturationValueArea } from "../elements/color/ColorSaturationValueArea.js";
import { SliderGradientBackground } from "../elements/SliderGradientBackground.js";
import { TextBackground } from "../elements/TextBackground.js";
import { Toggle } from "../elements/Toggle.js";
import { UI_CENTER } from "../UIData.js";

export class BlockAttributeComponent extends Component {

    constructor(uiManager, activeFunc) {
        super(uiManager, activeFunc);
        this.name = "BlockAttributeComponent";
        this.configInit();

        this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH1(), UI_CENTER, () => this.uiManager.getColorInactive(1.4), .75, "block attribute editor"))

        let r1 = new Container(0);
        let r1e1 = new Container(1);
        let r1e2 = new Container(1);

        this.container.addElement(r1);
        r1.addElement(r1e1);
        r1.addElement(r1e2);

        r1e1.addElement(new ColorHueSliderWheel(this.window, () => this.gcvdHalfX(), () => this.gcvdHalfX()));
        r1e1.addElement(new ColorSaturationValueArea(this.window, () => this.gcvdHalfX(), () => this.gcvdHalfX()));
        r1e1.addElement(new ColorInputTarget(this.window, () => this.gcvdHalfX(), () => this.gcvdHalfX()));

        r1e2.addElement(new TextBackground(this.window, () => this.gcvdHalfX(), () => this.ggvdH1(), UI_CENTER, () => this.uiManager.getColorInactive(1.4), .75, "active"))
        r1e2.addElement(new ColorActiveColor(this.window, () => this.gcvdHalfX(), () => this.ggvdH1()));

        this.colorHistory = new ColorColorHistory(this.window, () => this.gcvdHalfX(), () => this.gcvdHalfX() - this.ggvdH1());

        r1e2.addElement(this.colorHistory);
        r1e2.addElement(new Button(this.window, () => this.gcvdHalfX(), () => this.ggvdH1(), () => this.colorHistory.initColorHistory(), "shuffle colors", () => "#FFFFFF"));

        let r2 = new Container(0);
        this.container.addElement(r2);
        r2.addElement(new Toggle(this.window, () => this.gcvdThirdX(), () => this.ggvdH1(), UI_CENTER,
            () => this.gcoTransparency().active, (v) => this.gcoTransparency().active = v,
            "transparency", () => "#863c3c", () => "#FFFFFF"));
        r2.addElement(new SliderGradientBackground(this.window, () => this.gcvdThirdX() * 2, () => this.ggvdH1(), () => this.gcoTransparency().value, (v) => this.gcoTransparency().value = v))

        this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH1(), UI_CENTER, () => this.uiManager.getColorInactive(1.4), .75, "size"))

        let r3 = new Container(0);
        this.container.addElement(r3);
        r3.addElement(new Toggle(this.window, () => this.gcvdFourthX(), () => this.ggvdH1(), UI_CENTER,
            () => this.gcoSize().active, (v) => this.gcoSize().active = v,
            "full on", () => "#863c3c", () => "#FFFFFF"));
        r3.addElement(new SliderGradientBackground(this.window, () => this.gcvdFourthX(), () => this.ggvdH1(), () => this.gcoSize().x, (value) => this.gcoSize().x = value))
        r3.addElement(new SliderGradientBackground(this.window, () => this.gcvdFourthX(), () => this.ggvdH1(), () => this.gcoSize().y, (value) => this.gcoSize().y = value))
        r3.addElement(new SliderGradientBackground(this.window, () => this.gcvdFourthX(), () => this.ggvdH1(), () => this.gcoSize().z, (value) => this.gcoSize().z = value))

        this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH1(), UI_CENTER, () => this.uiManager.getColorInactive(1.4), .75, "offset"))

        let r4 = new Container(0);
        this.container.addElement(r4);
        r4.addElement(new Toggle(this.window, () => this.gcvdFourthX() / 2, () => this.ggvdH1(), UI_CENTER,
            () => this.gcoOffset().active, (v) => this.gcoOffset().active = v,
            "full on", () => "#863c3c", () => "#FFFFFF")); 

        r4.addElement(new Button(this.window, () => this.gcvdFourthX() / 2, () => this.ggvdH1(), () => {this.gcoOffset().x = 0; this.gcoOffset().y = 0; this.gcoOffset().z = 0;}, 
            "reset", () => "#863c3c"));
        r4.addElement(new SliderGradientBackground(this.window, () => this.gcvdFourthX(), () => this.ggvdH1(), () => this.gcoOffset().x, (value) => this.gcoOffset().x = value, -1, 1))
        r4.addElement(new SliderGradientBackground(this.window, () => this.gcvdFourthX(), () => this.ggvdH1(), () => this.gcoOffset().y, (value) => this.gcoOffset().y = value, -1, 1))
        r4.addElement(new SliderGradientBackground(this.window, () => this.gcvdFourthX(), () => this.ggvdH1(), () => this.gcoOffset().z, (value) => this.gcoOffset().z = value, -1, 1))

        this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH1(), UI_CENTER, () => this.uiManager.getColorInactive(1.4), .75, "lighting"))
        let r5 = new Container(0);
        this.container.addElement(r5);
        r5.addElement(new Toggle(this.window, () => this.gcvdFourthX() / 2, () => this.ggvdH1(), UI_CENTER,
            () => this.gcoLighting().active, (v) => this.gcoLighting().active = v,
            "toggle on", () => "#863c3c", () => "#FFFFFF")); 
        r5.addElement(new SliderGradientBackground(this.window, () => this.gcvdFourthX(), () => this.ggvdH1(), () => this.gcoLighting().brightness, (value) => this.gcoLighting().brightness = value, -10, 10))

    }
    gcoTransparency() {
        return this.config().transparency;
    }
    gcoSize() {
        return this.config().size;
    }
    gcoOffset() {
        return this.config().offset;
    }
    gcoLighting() {
        return this.config().lighting;
    }

    colorUpdate(unshift=false) {
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
            transparency: {
                active: 0,
                value: 0.5
            }, 
            size: {
                active: 0,
                x: 1,
                y: 1,
                z: 1
            },
            offset: {
                active: 0,
                x: 0,
                y: 0, 
                z: 0
            },
            lighting: {
                active: 0,
                brightness: 1
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