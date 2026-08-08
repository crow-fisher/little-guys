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
         () => this.gcvTransparencyActive(), (v) => this.scvTransparencyActive(v), 
         "transparency", () => "#863c3c", () => "#FFFFFF"));
        r2.addElement(new SliderGradientBackground(this.window, () => this.gcvdThirdX() * 2, () => this.ggvdH1(), () => this.gcvTransparencyValue(), (value) => this.scvTransparencyValue(value)))
    }

    gcvTransparencyActive() {
        return this.config().transparency.active;
    }
    gcvTransparencyValue() {
        return this.config().transparency.value;
    }
    scvTransparencyActive(active) {
        this.config().transparency.active = active;
    }
    scvTransparencyValue(value) {
        this.config().transparency.value = value;
    }

    getDefaultConfig() {
        return {
            transparency: {
                active: 0,
                value: 0.5
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