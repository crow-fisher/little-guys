import { getBaseUISize } from "../../canvas.js";
import { COLOR_BLACK, COLOR_BLUE, COLOR_OTHER_BLUE, COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { MAIN_CONTEXT } from "../../index.js";
import { isLeftMouseClicked } from "../../mouse.js";
import { loadUI, saveUI } from "../UIData.js";
import { WindowElement } from "../Window.js";

export class Slider extends WindowElement {
    constructor(window, key, sizeX, sizeY, min, max, blockColorFunc, blockSize = getBaseUISize()) {
        super(window, key, sizeX, sizeY);
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.min = min;
        this.max = max;
        this.blockColorFunc = blockColorFunc;
        this.blockSize = blockSize;
    }

    render(startX, startY) {
        var py = startY + this.sizeY / 2;
        var p1x = startX + this.blockSize; 
        var p2x = startX + this.sizeX - this.blockSize;

        MAIN_CONTEXT.beginPath();
        MAIN_CONTEXT.moveTo(p1x, py);
        MAIN_CONTEXT.lineTo(p2x, py);
        MAIN_CONTEXT.stroke();
        MAIN_CONTEXT.fillStyle = this.blockColorFunc();
        var p = (loadUI(this.key) - this.min) / (this.max - this.min);
        var x = p1x + p * (p2x - p1x)
        MAIN_CONTEXT.fillRect(x - this.blockSize / 2, py - this.blockSize / 2, this.blockSize, this.blockSize);
        return [this.sizeX, this.sizeY]
    }

    hover(posX, posY) {
        super.hover(posX, posY);
        if (!isLeftMouseClicked()) {
            return;
        }
        this.window.locked = true;
        var py = this.sizeY / 2;
        if (Math.abs(posY - py) > this.blockSize) {
            return;
        }
        let min = this.blockSize / 2;
        let max = this.sizeX - this.blockSize / 2;
        let p = (posX - min) / (max - min);
        saveUI(this.key, this.min + p * (this.max - this.min));
    }

}