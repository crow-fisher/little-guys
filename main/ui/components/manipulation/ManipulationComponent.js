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

export class ManipulationComponent extends Component {
    constructor(uiManager, activeFunc) {
        super(uiManager, activeFunc);
        this.name = "ManipulationComponent";
        this.configInit();
        // this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdBr(), UI_CENTER, () => this.uiManager.getColorInactive(.5)))  
        this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH1(), UI_CENTER, () => this.uiManager.getColorInactive(1.4), .75, "manipulation"))

        
        this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH3(), UI_CENTER, () => this.uiManager.getColorInactive(1.4), .75, "brush size"))
        this.container.addElement(new SliderGradientBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH3(), () => this.gcoBrush().brushSize, (v) => this.gcoBrush().brushSize = v,
            0, 120, 150, 0.2));

        this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH3(), UI_CENTER, () => this.uiManager.getColorInactive(1.4), .75, "brush strength"))
        this.container.addElement(new SliderGradientBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH3(), () => this.gcoBrush().brushStrength, (v) => this.gcoBrush().brushStrength = v,
            -1000, -10, 150, 0.2));
        let rowActivePlane = new Container(0);
        this.container.addElement(rowActivePlane);
        rowActivePlane.addElement(new Toggle(this.window, () => this.gcvdHalfX(), () => this.ggvdH1(), UI_CENTER,
            () => this.gcoPlane().active == 0, (v) => this.gcoPlane().active = 0,
            "static", () => "#863c3c", () => "#FFFFFF"));

        rowActivePlane.addElement(new Toggle(this.window, () => this.gcvdHalfX(), () => this.ggvdH1(), UI_CENTER,
            () => this.gcoPlane().active == 1, (v) => this.gcoPlane().active = 1,
            "live", () => "#863c3c", () => "#FFFFFF"));
        
        this.staticCC = new ConditionalContainer(1, () => this.gcoPlane().active == 0)
        this.liveCC = new ConditionalContainer(1, () => this.gcoPlane().active == 1)
        this.container.addElement(this.staticCC);
        this.container.addElement(this.liveCC);

        this.staticCC.addElement(new ColorHueSliderWheel(this.window, () => this.gcvSizeX(), () => this.gcvSizeX()));
        this.staticCC.addElement(new ColorSaturationValueArea(this.window, () => this.gcvSizeX(), () => this.gcvSizeX()));
        this.staticCC.addElement(new ColorInputTarget(this.window, () => this.gcvSizeX(), () => this.gcvSizeX()));
        this.staticCC.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH1(), UI_CENTER, () => this.uiManager.getColorInactive(1.4), .75, "active"))
        this.staticCC.addElement(new ColorActiveColor(this.window, () => this.gcvSizeX(), () => this.ggvdH1()));
        this.staticCC.addElement(new SliderGradientBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH3(), () => this.gcoColorConfig().a, (a) => this.setOpacity(clamp(a)),
            -.1, 1.1, 150, 0.2));

        let rowLiveMaterial = new Container(0);
        this.liveCC.addElement(rowLiveMaterial);
        rowLiveMaterial.addElement(new Toggle(this.window, () => this.gcvdHalfX(), () => this.ggvdH1(), UI_CENTER,
            () => this.gcoLive().materialConfig.type == 0, (v) => this.gcoLive().materialConfig.type = 0,
            "soil", () => "#744b22", () => "#9b6630"));

        rowLiveMaterial.addElement(new Toggle(this.window, () => this.gcvdHalfX(), () => this.ggvdH1(), UI_CENTER,
            () => this.gcoLive().materialConfig.type == 1, (v) => this.gcoLive().materialConfig.type = 1,
            "rock", () => "#5c5752", () => "#d3c7bb"));
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
        return {
            colorConfig: {
                h: 0,
                s: 0.5,
                v: 0.5,
                a: 1,
                colorHistory: [],
                rgbaArr: [127, 127, 127, 1]
            },
            brush: {
                brushSize: 20,
                brushStrength: -20
            },
            static: {},
            live: {
                materialConfig: {
                    type: 0,
                    sand: 0.33,
                    silt: 0.33,
                    clay: 0.34,
                    offsetHue: 0,
                    offsetSaturation: 0,
                    offsetValue: 0
                }
            },
            plane: {
                active: 0,
                staticIdx: 0,
                liveIdx: 0
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