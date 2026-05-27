import { KeyboardManager } from "./source/KeyboardManager.js";
import { MouseManager } from "./source/MouseManager.js";

export class InputManager {
    constructor(mainManager) {
        this.mainManager = mainManager;
        this.mouseManager = new MouseManager(this);
        this.keyboardManager = new KeyboardManager(this);
    }
    update() {
        this.mouseManager.update();
        this.keyboardManager.update();
    }

    getContext() {
        return this.mainManager.canvasManager.context;
    }
    isPointerLocked() {
        return this.mainManager.canvasManager.pointerLock;
    }

    mousemove(e) { this.mouseManager.mousemove(e)}
    mousedown(e) { this.mouseManager.mousedown(e)}
    mouseup(e) { this.mouseManager.mouseup(e)};


    onkeydown() { }
    onkeyup() { }
}