import { CanvasManager } from "./rendering/canvasManager.js"

export class MainManager {
    constructor() {
        this.canvasManager = new CanvasManager("main");
    }

    // Canvas Callbacks
    mousemove() {}
    mousedown() {}
    mouseup() {}
    touchstart() {}
    touchend() {}
    touchmove() {}

    // Window Callbacks
    onresize() {}
    oncontextmenu() {}
    onload() {}
}