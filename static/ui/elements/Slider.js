import { getBaseUISize } from "../../canvas.js";
import { COLOR_BLACK, COLOR_BLUE, COLOR_OTHER_BLUE, COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { MAIN_CONTEXT } from "../../index.js";
import { isLeftMouseClicked } from "../../mouse.js";
import { loadGD, saveGD } from "../UIData.js";
import { WindowElement } from "../Window.js";

export class Slider extends WindowElement {
    constructor(window, key, sizeX, sizeY, min, max, blockColorFunc, blockSize = getBaseUISize()) {
        super(window, sizeX, sizeY);
        this.key = key;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.min = min;
        this.max = max;
        this.blockColorFunc = blockColorFunc;
        this.blockSize = blockSize;
    }

    render(startX, startY) {
        let py = startY + this.sizeY / 2;
        let p1x = startX + this.blockSize; 
        let p2x = startX + this.sizeX - this.blockSize;

        MAIN_CONTEXT.beginPath();
        MAIN_CONTEXT.moveTo(p1x, py);
        MAIN_CONTEXT.lineTo(p2x, py);
        MAIN_CONTEXT.stroke();
        MAIN_CONTEXT.fillStyle = this.blockColorFunc();
        let p = (loadGD(this.key) - this.min) / (this.max - this.min);
        let x = p1x + p * (p2x - p1x)
        MAIN_CONTEXT.fillRect(x - this.blockSize / 2, py - this.blockSize / 2, this.blockSize, this.blockSize);
        return [this.sizeX, this.sizeY]
    }

    hover(posX, posY) {
        super.hover(posX, posY);
        if (!isLeftMouseClicked()) {
            return;
        }
        this.window.locked = true;
        let py = this.sizeY / 2;
        if (Math.abs(posY - py) > this.blockSize) {
            return;
        }
        let min = this.blockSize / 2;
        let max = this.sizeX - this.blockSize / 2;
        let p = (posX - min) / (max - min);
        p = Math.min(Math.max(0, p), 1)
        saveGD(this.key, this.min + p * (this.max - this.min));
    }

}