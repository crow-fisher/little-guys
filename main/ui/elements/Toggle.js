import { COLOR_BLACK } from "../../colors.js";
import { UI_BIGDOTHOLLOW, UI_BIGDOTSOLID } from "../../common.js";
import { GAMEDATA, getMapEntry, saveMapEntry, UI_CENTER } from "../UIData.js";
import { WindowElement } from "../Window.js";

export class Toggle extends WindowElement {
    constructor(window, sizeXFunc, sizeYFunc, offsetX, key, label, colorInactiveFunc, colorActiveFunc, textSize = 0.75, showStartChar=true, map=GAMEDATA) {
        super(window, sizeXFunc, sizeYFunc);
        this.offsetX = offsetX;
        this.key = key;
        this.label = label;
        this.colorActiveFunc = colorActiveFunc;
        this.colorInactiveFunc = colorInactiveFunc;
        this.textSize = textSize;
        this.showStartChar = showStartChar;
        this.map = map;
    }

    render(startX, startY) {
        this.window.getContext().font = this.sizeYFunc() * this.textSize + "px courier"
        this.window.getContext().textAlign = 'center';
        this.window.getContext().textBaseline = 'middle';
        let startChar = UI_BIGDOTHOLLOW;
        if (getMapEntry(this.map, this.key)) {
            this.window.getContext().fillStyle = this.colorActiveFunc();
            startChar = UI_BIGDOTSOLID;
        } else {
            this.window.getContext().fillStyle = this.colorInactiveFunc();
        }
        this.window.getContext().fillRect(startX, startY, this.sizeXFunc(), this.sizeYFunc());
        this.window.getContext().fillStyle = COLOR_BLACK;

        if (!this.showStartChar) {
            startChar = "";
        }

        if (this.offsetX == UI_CENTER) {
            this.window.getContext().textAlign = 'center';
            this.window.getContext().fillText(startChar + this.label, startX + this.sizeX / 2, startY + (this.sizeYFunc() / 2))
        } else {
            this.window.getContext().textAlign = 'left';
            this.window.getContext().fillText(startChar + this.label, startX + this.offsetX(), startY + (this.sizeYFunc() / 2))
        }
        return [this.sizeX, this.sizeYFunc()];
    }

    interact(posX, posY) {
        super.interact(posX, posY);
        if (this.window.isFrameButtonPressed(0)) {
            saveMapEntry(this.map, this.key, !getMapEntry(this.map, this.key));
        }
    }

}