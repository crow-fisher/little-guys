import { getCanvasSquaresX, getCanvasSquaresY } from "../canvas.js";

export class LightingThreadHandler {
    constructor() {
        this.initBuffers();
        this.dsize = 8;
    }
    initBuffers() {
        this.costBuff = new SharedArrayBuffer(this.getBuffMemoryIdx(getCanvasSquaresX(), getCanvasSquaresY()));
        this.brightBuff = new SharedArrayBuffer(this.getBuffMemoryIdx(getCanvasSquaresX(), getCanvasSquaresY()));
    }

    getBuffMemoryIdx(x, y) {
        return this.dsize * (getCanvasSquaresX() * y + x);
    }
    setBuffValue(buff, x, y, val) {
        buff[this.getBuffMemoryIdx(x, y)] = val;
    }
    addBuffValue(buff, x, y, val) {
        buff[this.getBuffMemoryIdx(x, y)] += val;
    }
    getBuffValue(buff, x, y) {
        return buff[this.getBuffMemoryIdx(x, y)];
    }

    resetCostBuffer() {
        for (let x = 0; x < getCanvasSquaresX(); x++) {
            for (let y = 0; y < getCanvasSquaresY(); y++) {
                this.setBuffValue(this.costBuff, x, y, 0);
            }
        }
    }
    addToCostBuffer(x, y, val) {
        this.addBuffValue(this.costBuff, x, y, val)
    }

    
}