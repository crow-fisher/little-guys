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
        /* 
        size x 
        size y
        
        pitch
        yaw

        then position to an offset of F=-100 unless one of the corners clicks to an existing corner

        add a button to move the current z plane to wherever you are in space 
        add button to toggle it on or off. it should stay at the same height but follow you around

        do plane rendering

        */
        this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH1(), UI_CENTER, () => this.uiManager.getColorInactive(1.4), .75, "z plane"))

        let row = new Container(window, 0);
        this.container.addElement(row);

        row.addElement(new RadioToggleLabel(this.window, () => this.gcvdHalfX(), () => this.ggvdH1(), UI_CENTER, "preview",
            () => this.gcvPlaneZMode() == 0, () => this.scvPlaneZMode(0),
            () => this.uiManager.getColorInactive(1.4), () => this.uiManager.getColorActive(1.4)));
        row.addElement(new RadioToggleLabel(this.window, () => this.gcvdHalfX(), () => this.ggvdH1(), UI_CENTER, "lock",
            () => this.gcvPlaneZMode() == 1, () => this.scvPlaneZMode(1),
            () => this.uiManager.getColorInactive(1.4), () => this.uiManager.getColorActive(1.4)));
    }

    gcvPlaneSizeX() {
        return this.config().plane.sizeX;
    }
    scvPlaneSizeX(v) {
        this.config().plane.sizeX = v;
    }
    gcvPlaneSizeY() {
        return this.config().plane.sizeY;
    }
    scvPlaneSizeY(v) {
        this.config().plane.sizeY = v;
    }
    gcvPlanePitch() {
        return this.config().plane.pitch;
    }
    scvPlanePitch(v) {
        this.config().plane.pitch = v;
    }
    gcvPlaneYaw() {
        return this.config().plane.yaw;
    }
    scvPlaneYaw(v) {
        this.config().plane.yaw = v;
    }
    gcvPlaneZMode() {
        return this.config().plane.zMode;
    }
    scvPlaneZMode(v) {
        this.config().plane.zMode = v;
    }
    gcvPlaneZPos() {
        return this.config().plane.zPos;
    }
    scvPlaneZPos(v) {
        this.config().plane.zPos = v;
    }
    
    getDefaultConfig() {
        return {
            plane: {
                sizeX: 100,
                sizeY: 100,
                pitch: 0,
                yaw: 0,
                zMode: 0,
                zPos: 0
            },
            offsetScale: {
                offsetX: 56,
                offsetY: 67,
                sizeX: 508,
                sizeY: 480
            }
        }
    }
}
