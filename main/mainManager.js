import { MouseManager } from "./input/source/MouseManager.js";
import { CanvasManager } from "./rendering/canvasManager.js"
import { UIManager } from "./ui/UIManager.js";

export class MainManager {
    constructor() {
        this.canvasManager = new CanvasManager(this);
        this.mouseManager = new MouseManager(this);
        this.uiManager = new UIManager(this);
    }

    main() {
        this.frame();
        setTimeout(() => this.main(), 0)
    }

    frame() {
        this.update();
        this.render();
    }

    update() {
        this.uiManager.update();
        this.mouseManager.update();
    }

    render() {
        this.canvasManager.render();
        this.mouseManager.render();
        this.uiManager.render();
    }

    // Canvas Callbacks
    touchstart() { }
    touchend() { }
    touchmove() { }

    onkeydown() { }
    onkeyup() { }
    onwheel() { }

    // Canvas Event Listeners
    mousemove(e) { this.mouseManager.mousemove(e)}
    mousedown(e) { this.mouseManager.mousedown(e)}
    mouseup(e) { this.mouseManager.mouseup(e)}

    drop(e) { }

    // Window Callbacks
    onresize() { this.canvasManager.resize() }
    oncontextmenu() { return false ;}


}