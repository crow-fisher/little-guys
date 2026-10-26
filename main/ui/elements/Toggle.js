import { hsvToHex } from "../../color/color.js";
import { UI_BIGDOTHOLLOW, UI_BIGDOTSOLID } from "../../common.js";
import { WindowElement } from "../WindowElement.js";

export class Toggle extends WindowElement {
    constructor(window, sizeXFunc, sizeYFunc, offsetX, getter, setter, label, colorInactiveFunc, colorActiveFunc, textSize = 0.75) {
        super(window, sizeXFunc, sizeYFunc);
        this.offsetX = offsetX;
        this.getter = getter;
        this.setter = setter;
        this.label = label;
        this.colorActiveFunc = colorActiveFunc;
        this.colorInactiveFunc = colorInactiveFunc;
        this.textSize = textSize;
    }

    render(startX, startY) {
        this.window.getContext().beginPath();
        this.window.getContext().font = this.sizeYFunc() * this.textSize + "px courier"
        this.window.getContext().textAlign = 'center';
        this.window.getContext().textBaseline = 'middle';
        let startChar = UI_BIGDOTHOLLOW;
        if (this.getter()) {
            this.window.getContext().fillStyle = this.colorActiveFunc();
            startChar = UI_BIGDOTSOLID;
        } else {
            this.window.getContext().fillStyle = this.colorInactiveFunc();
        }
        this.window.getContext().fillRect(startX, startY, this.sizeXFunc(), this.sizeYFunc());
        
        this.window.getContext().beginPath();
        this.window.getContext().fillStyle = hsvToHex(0, 0, 0);
        this.window.getContext().fillText(startChar + this.label, startX + (this.sizeXFunc() / 2), startY + (this.sizeYFunc() / 2))
        return [this.sizeXFunc(), this.sizeYFunc()];
    }

    interact(posX, posY) {
        if (!this.window.component.uiManager.isFrameButtonPressed(0)) {
            return;
        }
        this.setter(!this.getter());
    }

}