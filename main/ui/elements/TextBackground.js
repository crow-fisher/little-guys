import { COLOR_BLACK, COLOR_OTHER_BLUE, COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { loadGD, saveGD, UI_CENTER } from "../UIData.js";
import { WindowElement } from "../Window.js";

export class TextBackground extends WindowElement {
    constructor(window, sizeX, sizeY, offsetX, colorFunc, sizeMult, text, variant="") {
        super(window, sizeX, sizeY);
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.offsetX = offsetX;
        this.colorFunc = colorFunc;
        this.sizeMult = sizeMult;
        this.text = text;
        this.variant = variant;
    }

    render(startX, startY) {
        this.window.getContext().font = this.sizeY * this.sizeMult + "px courier" + this.variant;
        this.window.getContext().textBaseline = 'middle';
        this.window.getContext().fillStyle = this.colorFunc();
        this.window.getContext().fillRect(startX, startY, this.sizeX, this.sizeY);
        this.window.getContext().fillStyle = "#000000"
        this.window.getContext().strokeStyle = "#000000"
        if (this.offsetX == UI_CENTER) {
            this.window.getContext().textAlign = 'center';
            this.window.getContext().fillText(this.text, startX + this.sizeX / 2, startY + (this.sizeY / 2))
        } else {
            this.window.getContext().textAlign = 'left';
            this.window.getContext().fillText(this.text, startX + this.offsetX, startY + (this.sizeY / 2))
        }
        return [this.sizeX, this.sizeY];
    }
}