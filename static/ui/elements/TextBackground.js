import { COLOR_BLACK, COLOR_OTHER_BLUE, COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { loadGD, saveGD, UI_CENTER } from "../UIData.js";
import { WindowElement } from "../WindowElement.js";

export class TextBackground extends WindowElement {
    constructor(window, sizeXFunc, sizeYFunc, textOffset, colorFunc, sizeMult, text, fontVariant = "") {
        super(window, sizeXFunc, sizeYFunc);
        this.sizeXFunc = sizeXFunc;
        this.sizeYFunc = sizeYFunc;
        this.textOffset = textOffset;
        this.colorFunc = colorFunc;
        this.sizeMult = sizeMult;
        this.text = text;
        this.variant = fontVariant;
    }

    render(startX, startY) {
        this.window.getContext().font = this.sizeYFunc() * this.sizeMult + "px courier" + this.variant;
        this.window.getContext().textBaseline = 'middle';
        this.window.getContext().fillStyle = this.colorFunc();
        this.window.getContext().fillRect(startX, startY, this.sizeXFunc(), this.sizeYFunc());
        if (this.text) {
            this.window.getContext().fillStyle = "#000000"
            if (this.textOffset == UI_CENTER) {
                this.window.getContext().textAlign = 'center';
                this.window.getContext().fillText(this.text, startX + this.sizeXFunc() / 2, startY + (this.sizeYFunc() / 2))
            } else {
                this.window.getContext().textAlign = 'left';
                this.window.getContext().fillText(this.text, startX + this.textOffset, startY + (this.sizeYFunc() / 2))
            }
        }
        return [this.sizeXFunc(), this.sizeYFunc()];
    }
}