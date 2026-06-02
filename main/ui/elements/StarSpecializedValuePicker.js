import { COLOR_GREEN } from "../../colors.js";
import { WindowElement } from "../WindowElement.js";

export class StarSpecializedValuePicker extends WindowElement {
    constructor(window, sizeXFunc, sizeYFunc, component) {
        super(window, sizeXFunc, sizeYFunc, component);
        this.sizeXFunc = sizeXFunc;
        this.sizeYFunc = sizeYFunc;

        this.pointSize = 6;

        this.colors = [COLOR_GREEN, "#6d9e6d"]
        this.clicked = [false, false];
    }

    render(startX, startY) {
        this.pX0 = this.component.gcvStBrightnessPosX();
        this.pY0 = this.component.gcvStBrightnessPosY();
        this.window.getContext().beginPath();
        this.window.getContext().fillStyle = this.colors[this.component.gcvStMode()];
        this.window.getContext().arc(startX + this.pX0 * this.sizeXFunc(), startY + this.pY0 * this.sizeYFunc(), this.pointSize, 0, 2 * Math.PI, false);
        this.window.getContext().fill();

        this.pX1 = this.component.gcvStOpacityPosX();
        this.pY1 = this.component.gcvStOpacityPosY();

        this.window.getContext().beginPath();
        this.window.getContext().fillStyle = this.colors[1 - this.component.gcvStMode()];
        this.window.getContext().arc(startX + this.pX1 * this.sizeXFunc(), startY + this.pY1 * this.sizeYFunc(), this.pointSize, 0, 2 * Math.PI, false);
        this.window.getContext().fill();
        this.window.getContext().beginPath();
    }

    hover(posX, posY) {
        super.hover(posX, posY);
        this.window.locked = true;
        let pX = invlerp(0, this.sizeXFunc, posX);
        let pY = invlerp(0, this.sizeY, posY);
        let idx = loadGD(UI_STARMAP_STAR_CONTROL_TOGGLE_MODE);
        saveGD(this.keys[idx][0], lerp(...this.valueRanges[idx][0], pX));
        saveGD(this.keys[idx][1], lerp(...this.valueRanges[idx][1], pY));
        resetStarStyle();
        getStarManager().resetStarLabels();
    }

}