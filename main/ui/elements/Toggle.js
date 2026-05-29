import { getBaseUISize } from "../../canvas.js";
import { COLOR_BLACK, COLOR_OTHER_BLUE, COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { UI_BIGDOTHOLLOW, UI_BIGDOTSOLID } from "../../common.js";
import { GAMEDATA, getMapEntry, loadGD, saveGD, saveMapEntry, UI_CENTER } from "../UIData.js";
import { WindowElement } from "../Window.js";

export class Toggle extends WindowElement {
    constructor(window, sizeX, sizeY, offsetX, key, label, colorInactiveFunc, colorActiveFunc, textSize = 0.75, showStartChar=true, map=GAMEDATA) {
        super(window, sizeX, sizeY);
        this.sizeX = sizeX;
        this.sizeY = sizeY;
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
        this.window.getContext().font = this.sizeY * this.textSize + "px courier"
        this.window.getContext().textAlign = 'center';
        this.window.getContext().textBaseline = 'middle';
        let startChar = UI_BIGDOTHOLLOW;
        if (getMapEntry(this.map, this.key)) {
            this.window.getContext().fillStyle = this.colorActiveFunc();
            startChar = UI_BIGDOTSOLID;
        } else {
            this.window.getContext().fillStyle = this.colorInactiveFunc();
        }
        this.window.getContext().fillRect(startX, startY, this.sizeX, this.sizeY);
        this.window.getContext().fillStyle = COLOR_BLACK;

        if (!this.showStartChar) {
            startChar = "";
        }

        if (this.offsetX == UI_CENTER) {
            this.window.getContext().textAlign = 'center';
            this.window.getContext().fillText(startChar + this.label, startX + this.sizeX / 2, startY + (this.sizeY / 2))
        } else {
            this.window.getContext().textAlign = 'left';
            this.window.getContext().fillText(startChar + this.label, startX + this.offsetX, startY + (this.sizeY / 2))
        }
        return [this.sizeX, this.sizeY];
    }

    hover(posX, posY) {
        super.hover(posX, posY);
        if (this.window.isFrameButtonPressed(0)) {
            saveMapEntry(this.map, this.key, !getMapEntry(this.map, this.key));
        }
    }

}