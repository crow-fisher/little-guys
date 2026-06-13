import { HUE_CHARTREUSE, HUE_TANGOR } from "../../../color/hue.js";
import { Component } from "../../Component.js";
import { Container } from "../../Container.js";
import { RadioToggleLabel } from "../../elements/RadioToggleLabel.js";
import { SliderGradientBackground } from "../../elements/SliderGradientBackground.js";
import { StarSpecializedValuePicker } from "../../elements/StarSpecializedValuePicker.js";
import { TextBackground } from "../../elements/TextBackground.js";
import { UI_CENTER } from "../../UIData.js";

export class PlaneManagerComponent extends Component {
    constructor(uiManager) {
        super(uiManager);
        this.name = "PlaneManagerComponent";
        this.configInit();
        this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH1(), UI_CENTER, () => this.uiManager.getColorInactive(1.4), .75, "plane manager"))
    }
}
