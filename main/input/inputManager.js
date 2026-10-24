import { RuntimeComponent } from "../runtimeComponent.js";
import { KeyboardManager } from "./source/keyboardManager.js";
import { MouseManager } from "./source/mouseManager.js";

export class InputManager extends RuntimeComponent {
    constructor(mainManager) {
        super();
        this.mainManager = mainManager;
        this.mouseManager = new MouseManager(this);
        this.keyboardManager = new KeyboardManager(this);
    }

    update() {
        this.mouseManager.update();
        this.keyboardManager.update();
    }
    render() {
        this.mouseManager.render();
        this.keyboardManager.render();
    }

    getContext() {
        return this.mainManager.canvasManager.context;
    }
    isPointerLocked() {
        return this.mainManager.canvasManager.pointerLock;
    }
    isKeyPressed(key) {
        return this.keyboardManager.keyPressMap[key];
    }

    mousemove(e) { this.mouseManager.mousemove(e)}
    mousedown(e) { this.mouseManager.mousedown(e)}
    mouseup(e) { this.mouseManager.mouseup(e)};

    onkeydown(e) { this.keyboardManager.onkeydown(e) }
    onkeyup(e) { this.keyboardManager.onkeyup(e) }
    onwheel(e) { this.mouseManager.onwheel(e) }

}