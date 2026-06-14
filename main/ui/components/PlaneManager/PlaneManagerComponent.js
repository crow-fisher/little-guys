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

        let zModeRow = new Container(0);
        this.container.addElement(zModeRow);
        zModeRow.addElement(new RadioToggleLabel(this.window, () => this.gcvdHalfX(), () => this.ggvdH1(), UI_CENTER, "follow",
            () => this.gcvZMode() == 0, () => this.scvZMode(0),
            () => this.uiManager.getColorInactive(1.4), () => this.uiManager.getColorActive(1.4)));
        zModeRow.addElement(new RadioToggleLabel(this.window, () => this.gcvdHalfX(), () => this.ggvdH1(), UI_CENTER, "lock",
            () => this.gcvZMode() == 1, () => this.scvZMode(1),
            () => this.uiManager.getColorInactive(1.4), () => this.uiManager.getColorActive(1.4)));

        let newDeleteRow = new Container(0);
        this.container.addElement(newDeleteRow);
        newDeleteRow.addElement(new RadioToggleLabel(this.window, () => this.gcvdHalfX(), () => this.ggvdH1(), UI_CENTER, "new",
            () => this.gcvModMode() == 1, () => this.scvModMode(1),
            () => this.uiManager.getColorInactive(1.4), () => this.uiManager.getColorActive(1.4)));
        newDeleteRow.addElement(new RadioToggleLabel(this.window, () => this.gcvdHalfX(), () => this.ggvdH1(), UI_CENTER, "delete",
            () => this.gcvModMode() == 2, () => this.scvModMode(2),
            () => this.uiManager.getColorInactive(1.4), () => this.uiManager.getColorActive(1.4)));

        this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH1(), UI_CENTER, () => this.uiManager.getColorInactive(1.4), .75, "new plane"))

        this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH1(), UI_CENTER, () => this.uiManager.getColorInactive(1.4), .75, "step"))
        this.container.addElement(new SliderGradientBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH1(),
            () => this.gcvPlaneStep(), (v) => this.scvPlaneStep(v), 1, 5, 0, 0));
        this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH1(), UI_CENTER, () => this.uiManager.getColorInactive(1.4), .75, "size x"))
        this.container.addElement(new SliderGradientBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH1(),
            () => this.gcvPlaneSizeX(), (v) => this.scvPlaneSizeX(v), 1, 5, 0, 0));
        this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH1(), UI_CENTER, () => this.uiManager.getColorInactive(1.4), .75, "size y"))
        this.container.addElement(new SliderGradientBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH1(),
            () => this.gcvPlaneSizeY(), (v) => this.scvPlaneSizeY(v), 1, 5, 0, 0));
        this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH1(), UI_CENTER, () => this.uiManager.getColorInactive(1.4), .75, "pitch"))
        this.container.addElement(new SliderGradientBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH1(),
            () => this.gcvPlanePitch(), (v) => this.scvPlanePitch(v), 1, 5, 0, 0));
            this.container.addElement(new TextBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH1(), UI_CENTER, () => this.uiManager.getColorInactive(1.4), .75, "yaw"))
        this.container.addElement(new SliderGradientBackground(this.window, () => this.gcvSizeX(), () => this.ggvdH1(),
            () => this.gcvPlaneYaw(), (v) => this.scvPlaneYaw(v), 1, 5, 0, 0));

        this.container.addElement(new RadioToggleLabel(this.window, () => this.gcvSizeX(), () => this.ggvdH1(), UI_CENTER, "submit",
            () => this.gcvPlaneSubmit(), () => this.scvPlaneSubmit(true),
            () => this.uiManager.getColorInactive(1.4), () => this.uiManager.getColorActive(1.4)));

            
    }


    getDefaultConfig() {
        return {
            z: {
                mode: 1
            },
            mod: {
                mode: 0,
                dist: 100,
            },
            plane: {
                step: 4,
                sizeX: 10,
                sizeY: 10,
                pitch: 0,
                yaw: 0,
                submit: false
            },
            offsetScale: {
                offsetX: 56,
                offsetY: 67,
                sizeX: 508,
                sizeY: 700
            },
        }
    }

    // 'z'
    gcvZMode() {
        return this.config().z.mode;
    }
    scvZMode(v) {
        this.config().z.mode = v;
    }
    // 'mod'
    gcvModMode() {
        return this.config().mod.mode;
    }
    scvModMode(v) {
        this.config().mod.mode = v;
    }
    gcvModDist() {
        return this.config().mod.dist;
    }
    scvModDist(v) {
        this.config().mod.dist = v;
    }
    // 'plane'
    gcvPlaneStep() {
        return this.config().plane.step;
    }
    scvPlaneStep(v) {
        this.config().plane.step = v;
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
    gcvPlaneSubmit() {
        return this.config().plane.submit;
    }
    scvPlaneSubmit(v) {
        this.config().plane.submit = v;
    }


}