import { Component } from "../../Component.js";
import { Container } from "../../Container.js";
import { TextBackground } from "../../elements/TextBackground.js";
import { Toggle } from "../../elements/Toggle.js";
import { UI_CENTER } from "../../UIData.js";

import { ColorActiveColor } from "../../elements/color/ColorActiveColor.js";
import { ColorHueSliderWheel } from "../../elements/color/ColorHueSliderWheel.js";
import { ColorInputTarget } from "../../elements/color/ColorInputTarget.js";
import { ColorSaturationValueArea } from "../../elements/color/ColorSaturationValueArea.js";
import { hsv2rgba } from "../../../common.js";
import { multiplyVectorByScalar } from "../../../util/vector.js";
import { SliderGradientBackground } from "../../elements/SliderGradientBackground.js";
import { clamp } from "../../../util/func.js";
import { ConditionalContainer } from "../../ConditionalContainer.js"

export class LightingComponent extends Component {
    constructor(uiManager, activeFunc) {
        super(uiManager, activeFunc);
        this.name = "LightingComponent";
        this.configInit();

        this.container.addElement(new ColorHueSliderWheel(this.window, () => this.gcvSizeX(), () => this.gcvSizeX()));
        this.container.addElement(new ColorSaturationValueArea(this.window, () => this.gcvSizeX(), () => this.gcvSizeX()));
        this.container.addElement(new ColorInputTarget(this.window, () => this.gcvSizeX(), () => this.gcvSizeX()));
        this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH1(), UI_CENTER, () => this.uiManager.getColorInactive(1.4), .75, "active"))
        this.container.addElement(new ColorActiveColor(this.window, () => this.gcvSizeX(), () => this.ggvdH1()));
        this.container.addElement(new SliderGradientBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH3(), () => this.gcoColorConfig().a, (a) => this.setOpacity(clamp(a)),
            -.1, 1.1, 150, 0.2));
    }

    gcoPlane() {
        return this.config().plane;
    }

    gcoBrush() {
        return this.config().brush;
    }
    gcoColorConfig() {
        return this.config().colorConfig;
    }
    gcoLive() {
        return this.config().static;
    }
    gcoLive() {
        return this.config().live;
    }

    setOpacity(a) {
        this.gcoColorConfig().a = a;
        this.colorUpdate();
    }

    colorUpdate() {
        this.gcoColorConfig().rgbaArr = hsv2rgba(this.gcoColorConfig().h, this.gcoColorConfig().s, this.gcoColorConfig().v, this.gcoColorConfig().a); // creates a new array
        multiplyVectorByScalar(this.gcoColorConfig().rgbaArr, 255)
    }

    getDefaultConfig() {
        return {"colorConfig":{"h":0,"s":0.5,"v":0.5,"a":1,"colorHistory":[],"rgbaArr":[127,127,127,1]},"brush":{"brushSize":20,"brushStrength":-20},"static":{},"live":{"materialConfig":{"type":1,"sand":0.33,"silt":0.33,"clay":0.34,"offsetHue":0,"offsetSaturation":0,"offsetValue":0}},"plane":{"active":1,"staticIdx":0,"liveIdx":0},"default":{},"offsetScale":{"offsetX":43,"offsetY":56,"sizeX":385,"sizeY":349}}
    }
}