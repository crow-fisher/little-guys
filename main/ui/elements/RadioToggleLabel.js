import { COLOR_BLACK } from "../../colors.js";
import { UI_BIGDOTHOLLOW, UI_BIGDOTSOLID } from "../../common.js";
import { UI_CENTER } from "../UIData.js";
import { WindowElement } from "../WindowElement.js";

export class RadioToggleLabel extends WindowElement {
    constructor(window, sizeXFunc, sizeYFunc, offsetX, label, getter, setter, colorInactiveFunc, colorActiveFunc, textSizeMult = 0.75, startChars = [UI_BIGDOTHOLLOW, UI_BIGDOTSOLID]) {
        super(window, sizeXFunc, sizeYFunc);
        this.sizeXFunc = sizeXFunc;
        this.sizeYFunc = sizeYFunc;
        this.offsetX = offsetX;
        this.label = label;
        this.getter = getter;
        this.setter = setter;
        this.colorActiveFunc = colorActiveFunc;
        this.colorInactiveFunc = colorInactiveFunc;
        this.textSizeMult = textSizeMult;
        this.startChars = startChars;
    }

    render(startX, startY) {
        this.window.getContext().font = this.sizeYFunc() * this.textSizeMult + "px courier"
        this.window.getContext().textAlign = 'center';
        this.window.getContext().textBaseline = 'middle';
        let startChar = this.startChars[0];
        if (this.getter()) {
            this.window.getContext().fillStyle = this.colorActiveFunc();
            startChar = this.startChars[1];
        } else {
            this.window.getContext().fillStyle = this.colorInactiveFunc();
        }
        this.window.getContext().fillRect(startX, startY, this.sizeXFunc(), this.sizeYFunc());
        this.window.getContext().fillStyle = COLOR_BLACK;

        if (this.offsetX == UI_CENTER) {
            this.window.getContext().textAlign = 'center';
            this.window.getContext().fillText(startChar + this.label, startX + this.sizeXFunc() / 2, startY + (this.sizeYFunc() / 2))
        } else {
            this.window.getContext().textAlign = 'left';
            this.window.getContext().fillText(startChar + this.label, startX + this.offsetX, startY + (this.sizeYFunc() / 2))
        }
        return [this.sizeXFunc(), this.sizeYFunc()];
    }

    interact(posX, posY) {
        this.setter();
    }

}