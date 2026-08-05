import { WindowElement } from "../WindowElement.js";

export class Button extends WindowElement {
    constructor(window, sizeXFunc, sizeYFunc, func, label, colorFunc, textSizeMult = 0.75) {
        super(window, sizeXFunc, sizeYFunc);
        this.sizeXFunc = sizeXFunc;
        this.sizeYFunc = sizeYFunc;
        this.func = func;
        this.label = label;
        this.colorFunc = colorFunc;
        this.textSizeMult = textSizeMult;

        this.lastClicked = Date.now();
    }

    size() {
        return [this.sizeXFunc(), this.sizeYFunc()];
    }

    render(startX, startY) {
        this.window.getContext().font = this.sizeYFunc() * this.textSizeMult + "px courier"
        this.window.getContext().textBaseline = 'middle';
        this.window.getContext().fillStyle = this.colorFunc();
        this.window.getContext().fillRect(startX, startY, this.sizeXFunc(), this.sizeYFunc());
        this.window.getContext().fillStyle = "#000000";

        this.window.getContext().textAlign = 'center';
        this.window.getContext().fillText(this.label, startX + this.sizeXFunc() / 2, startY + this.sizeYFunc() / 2);
        return [this.sizeXFunc(), this.sizeYFunc()];
    }

    interactClick(posX, posY) {
        this.func();
    }

}