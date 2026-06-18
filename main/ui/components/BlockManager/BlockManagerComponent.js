import { HUE_CHARTREUSE, HUE_TANGOR } from "../../../color/hue.js";
import { Component } from "../../Component.js";
import { Container } from "../../Container.js";
import { RadioToggleLabel } from "../../elements/RadioToggleLabel.js";
import { SliderGradientBackground } from "../../elements/SliderGradientBackground.js";
import { StarSpecializedValuePicker } from "../../elements/StarSpecializedValuePicker.js";
import { TextBackground } from "../../elements/TextBackground.js";
import { UI_CENTER } from "../../UIData.js";

export class BlockManagerComponent extends Component {
    constructor(uiManager) {
        super(uiManager);
        this.name = "BlockManagerComponent";
        this.configInit();
        this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH1(), UI_CENTER, () => this.uiManager.getColorInactive(1.4), .75, "block manager"))

        // let blockTypeRow = new Container(0);
        // this.container.addElement(blockTypeRow);
        // blockTypeRow.addElement(new RadioToggleLabel(this.window, () => this.gcvdHalfX(), () => this.ggvdH1(), UI_CENTER, "soil",
        //     () => this.gcvModMode() == 1, () => this.scvModMode(1),
        //     () => this.uiManager.getColorInactive(1.4), () => this.uiManager.getColorActive(1.4)));
        // blockTypeRow.addElement(new RadioToggleLabel(this.window, () => this.gcvdHalfX(), () => this.ggvdH1(), UI_CENTER, "base",
        //     () => this.gcvModMode() == 2, () => this.scvModMode(2),
        //     () => this.uiManager.getColorInactive(1.4), () => this.uiManager.getColorActive(1.4)));
    }

    gcvActivePrimaryMaterial() {
        return this.config().active.primary.material;
    }
    gcvActivePrimaryBrush() {
        return this.config().active.primary.brush;
    }
    scvActivePrimaryMaterial(v) {
        this.config().active.primary.material = v;
    }
    scvActivePrimaryBrush(v) {
        this.config().active.primary.brush = v;
    }
    gcvActiveSecondaryMaterial() {
        return this.config().active.secondary.material;
    }
    gcvActiveSecondaryBrush() {
        return this.config().active.secondary.brush;
    }
    scvActiveSecondaryMaterial(v) {
        this.config().active.secondary.material = v;
    }
    scvActiveSecondaryBrush(v) {
        this.config().active.secondary.brush = v;
    }

    getDefaultConfig() {
        return {
            active: {
                primary: {
                    material: 0,
                    brush: 0
                },
                secondary: {
                    material: 1,
                    brush: 1
                }
            },
            offsetScale: {
                offsetX: this.ggvUISize() * 12,
                offsetY: this.ggvUISize() * 12,
                sizeX: this.ggvUISize() * 20,
                sizeY: this.ggvUISize() * 20
            }
        }
    }

}